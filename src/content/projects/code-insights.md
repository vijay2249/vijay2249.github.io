---
title: Code Insights
tagline: JUnit/JaCoCo coverage and fully offline SonarQube analysis, inside your editor.
stack: VS Code · TypeScript · Java
tech: [TypeScript, Java, VS Code API, SonarLint, Maven, Gradle]
internal: true
license: Proprietary / internal
status: active
year: '2025'
featured: true
order: 1
cover: /images/code-insights-cover.svg
coverAlt: Coverage gutters and offline static-analysis squiggles in an editor
highlights:
  - Embedded a real SonarLint + sonar-java engine, shaded into a runnable jar — full rule parity with the server, no per-scan calls
  - Auto-detects Maven/Gradle and resolves per-module classpaths and generated sources
  - Secrets stored via VS Code SecretStorage — never in settings
---

**Code Insights** is an IDE extension that surfaces **JUnit/JaCoCo coverage** and runs
**SonarQube rules fully offline** via a bundled SonarLint engine. It gives you the same
findings you'd get from a server scan, but instantly and without sending your code
anywhere.

> **Internal project.** This is a closed-source tool built in an employer context, so the source isn't public. 
> The architecture below is a scrubbed, generic version — there's a fuller write-up in [Coverage and offline static analysis in the editor](/blog/coverage-and-offline-static-analysis-in-the-editor).

## Why I built it

Waiting on a CI quality gate to learn you broke a Sonar rule is a slow feedback loop. <br/>
Code Insights brings coverage and static analysis right into the editor, so issues show up while you're still writing the code that caused them.

## What it does

- Surfaces **line and branch coverage** from JaCoCo directly in the gutter.
- Runs **SonarQube rules offline** with full rule parity — no server round-trips.
- Auto-detects **Maven/Gradle** projects and resolves per-module classpaths.
- Respects quality thresholds and points you at exactly what to fix.

## Architecture

The shape that makes "offline + parity" work is three runtimes cooperating. The **extension host** (TypeScript) orchestrates everything but does no analysis itself; the real work runs in **spawned processes** — `mvn`/`gradle` for tests, and a **JVM running the real `sonar-java` analyzer** for rules. The only network call is a one-time rule sync.

![Code Insights architecture: a TypeScript extension host orchestrating spawned mvn/gradle and JVM analyzer processes](/images/code-insights-architecture.svg)

## Technical explanation

There are two subsystems behind one UI, and three flows tie them together:

![The three flows: coverage, one-time rule sync, and analysis](/images/code-insights-flows.svg)

- **Coverage** runs `mvn`/`gradle test`, then parses and merges `jacoco.xml` across modules, excludes generated sources, and renders gutter highlights you can click to jump to source.
- **Rule sync** happens once: it pulls the quality profile's active rules over the Sonar Web API and caches them on disk. That's the *only* time anything leaves the machine.
- **Analysis** picks an engine — the bundled `sonar-java` when a JDK and jars are available, or a lite regex fallback otherwise — spawns it out-of-process with sources, the active rules, and the resolved classpath, and turns the resulting issues JSON into editor squiggles.

A few decisions hold it together: spawning the *real* analyzer (instead of reimplementing rules in JavaScript) buys rule parity for free and keeps an analyzer crash from taking the editor with it; syncing once and caching on disk keeps every later scan fully local; and secrets live in VS Code **SecretStorage**, never in plain settings.

## What made it hard

The interesting work was embedding a real SonarLint + `sonar-java` engine and shading it
into a runnable jar the extension can drive — getting full rule parity with the server while keeping everything local, and resolving per-module classpaths and generated sources so analysis sees the same code the compiler does.
