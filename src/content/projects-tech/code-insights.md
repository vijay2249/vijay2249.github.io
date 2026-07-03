---
summary: How Code Insights is built — the two subsystems, the JaCoCo parser, the out-of-process sonar-java analyzer protocol, the lite fallback, storage/secrets, and error handling.
---

This is the implementation-level companion to the [Code Insights overview](/projects/code-insights).<br/>
It's an internal tool, so this is a scrubbed, generic version of the design — no employer-specific details. The conceptual story is in [Coverage and offline static analysis in the editor](/blog/coverage-and-offline-static-analysis-in-the-editor).

![Code Insights architecture: a TypeScript extension host orchestrating spawned mvn/gradle and JVM analyzer processes](/images/code-insights-architecture.svg)

## Source layout

```text
src/
  extension.ts                 # activation, command + view registration
  types.ts                     # shared data models
  provider/
    CoverageViewProvider.ts    # coverage webview + orchestration
    SonarViewProvider.ts       # sonar webview + orchestration
  coverage/
    buildRunner.ts             # run mvn/gradle test as a VS Code Task
    jacocoParser.ts            # parse / merge / filter JaCoCo XML
    coverageDecorations.ts     # editor gutter decorations
  sonar/
    sonarSync.ts               # rule sync via Sonar Web API (raw socket)
    sonarLintRunner.ts         # spawn JVM sonar-java analyzer
    analysisEngine.ts          # lite regex fallback engine
    rulesCache.ts              # persist synced rules to disk
    diagnostics.ts             # publish issues as editor squiggles
    export.ts                  # MD/CSV/SARIF (issues) + MD/CSV (coverage)
resources/
  sonar-runner.jar             # JVM launcher (loads the plugin, emits JSON)
  sonar-plugins/sonar-java-plugin.jar
```

Build is `tsc` for type-checking, `esbuild` to bundle to `dist/extension.js`, packaged with `@vscode/vsce`. Every command is wrapped in a `guard(name, fn)` that logs start/done and, on error, surfaces the output channel plus a toast — so nothing fails silently.

## Data models

```ts
CoverageMetrics { line, branch, instruction, method, class: {covered, missed} }
ClassCoverage   { name, packageName, resolvedPath?, origin?, metrics,
                  lines: Record<lineNr, {ci, mi, cb, mb}> }   // covered/missed instr+branch
CoverageReport  { reportPath, moduleName, metrics, packages, generatedAt }

SonarRule   { key, name, severity, type, language, htmlDescription?, params[], active }
SonarIssue  { ruleKey, ruleName, severity, type, message, filePath, line, startColumn?, endColumn? }
```

Overall coverage matches SonarQube's definition:

```text
coverage = (line.covered + branch.covered)
         / (line.covered + line.missed + branch.covered + branch.missed)
```

## Coverage subsystem

`jacocoParser` reads JaCoCo XML with `fast-xml-parser` and `processEntities:false` (JaCoCo embeds many `&lt;`/`&gt;` in names; entity expansion trips the parser guard on big reports). It recurses through `<group>` for aggregate reports and captures per-line `ci/mi/cb/mb` data for the gutters. `mergeReports` de-dupes classes by `package::class` (keeping the better-covered copy) so multi-module aggregates aren't double-counted, then `filterReport` drops generated sources and excluded paths.

`buildRunner` runs the tests as a real `vscode.Task` (`mvn -B test` / `./gradlew test jacocoTestReport`) and resolves with the process exit code. The `CoverageViewProvider` ties it together: run tests -> find reports -> parse -> merge -> resolve source paths -> apply exclusions -> push to the panel and the gutter decorator. A non-zero test exit shows a "tests failed, coverage may be inaccurate" banner rather than hiding the data.

## Static analysis: a real engine, out of process

The headline decision is **not** reimplementing Sonar rules in JavaScript. Instead the extension spawns the real `sonar-java` analyzer in a child JVM and talks to it over a tiny file-based protocol:

```jsonc
// request file (TS -> jar)
{ "pluginJars": ["…/sonar-java-plugin.jar"], "baseDir": "…",
  "sources": [{ "path": "…/Foo.java", "test": false }],
  "includedRules": ["java:S106", …],
  "extraProperties": { "sonar.java.source": "17",
                       "sonar.java.binaries": "…/target/classes",
                       "sonar.java.libraries": "a.jar,b.jar" } }

// stdout (jar -> TS)
{ "issues": [{ "ruleKey":"java:S106","severity":"MINOR","type":"CODE_SMELL",
               "message":"…","line":30,"startColumn":4,"endColumn":20,
               "filePath":"…/Foo.java" }] }
```

`SonarLintRunner.analyze()` finds `src/{main,test}/java/**/*.java` (excluding build output), collects `target/classes`/`target/test-classes` as `sonar.java.binaries`, best-effort resolves `sonar.java.libraries` via `mvn -o -q dependency:build-classpath`, writes the request to a temp file, and spawns `java -jar runner.jar req.json`. The process boundary means an analyzer crash can't take the editor down with it, and running the real plugin gives **rule parity for free**.

### The three flows

![The three flows: coverage, one-time rule sync, and analysis](/images/code-insights-flows.svg)

- **Coverage** — run tests, parse/merge `jacoco.xml`, exclude generated, render gutters.
- **Rule sync (once)** — pull the quality profile's active rules over the Sonar Web API and cache them on disk. This is the only network call.
- **Analysis** — pick the engine, spawn the JVM with sources + active rules + classpath, turn the issues JSON into squiggles + a panel.

## The lite fallback and engine selection

If there's no JDK or the plugin jars aren't usable, analysis degrades instead of hard-failing: `analysisEngine` is a pure-TS engine implementing ~8 rule checks (`java:S106, S1135, S1134, S2068, S100, S101, S121, S1192, S108`), running only the checks whose rule is active in the synced profile. `resolveEngine()` honors `sonar.engine` (`auto|sonarlint|lite`); `auto` uses `sonar-java` when available and falls back to lite — and a mid-run `SonarLintUnavailableError` also falls back with a warning.

## The raw-socket sync detail

The one network call (rule sync) connects over a **raw `net`/`tls` socket** rather than Node's `http(s)` stack. The editor proxy-patches Node's HTTP, which can mangle exactly that request; writing a minimal HTTP/1.1 GET and de-chunking the response behaves like `curl`/the browser and sidesteps it. Sync resolves the quality profile, then pages `GET /api/rules/search?activation=true&qprofile=…&ps=500&p=N` and merges the active rules.

## Storage and secrets

| Where | Key / file | Contents |
| --- | --- | --- |
| Global storage (disk) | `sonar-rules-cache.json` | The synced rule set (for offline use) |
| SecretStorage | `codeInsights.sonar.token` / `.password` | Credentials — **never** in settings |
| `globalState` | `sonar.suppressions` | Per-issue baseline mutes |
| OS temp dir | `ci-sonar-req-*.json` | Analyzer request (deleted after the run) |

Suppression supports `// NOSONAR` (with `NOSONAR(ruleKey,…)` scoping) honored at analyze time,
plus a per-issue "mute" baseline. Webview HTML is a CSP-locked string with a per-render nonce.

## Error handling and fallbacks

- **Engine:** `auto` -> lite if jars/JDK missing; analyzer non-zero exit -> error with the stderr tail.
- **Classpath:** a per-module `build-classpath` failure is swallowed -> syntactic rules only.
- **Sync:** HTTP non-2xx -> a descriptive error (401/403 -> auth hint); socket error -> reachability hint.
- **Config writes:** a rejected settings write falls back to `globalState` (post-reinstall safety).
- **Parsing:** a bad `jacoco.xml` warns and is skipped; one misbehaving lite check can't abort the whole analysis.

## Extension points

New coverage source -> extend the parser, reuse merge/filter/view. New export format -> add a function in `export.ts` + a quick-pick entry. <br/>
New lite rule -> add a checker to the registry. New language -> bundle the plugin jar and set the language key; the analyzer request is already generic.
