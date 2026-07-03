---
summary: How swagger-view is built — the host/webview split, the SOLID service boundaries, the parse/hash/render pipeline, unused-definition detection, and transaction-safe deletion.
---

This is the implementation-level companion to the [swagger-view overview](/projects/swagger-view).<br/>
The source is open under [WeDontTrack](https://github.com/WeDontTrack/swagger-view) (GPL-3.0); the design story is in [shipping a local-first dev tool](/blog/shipping-swagger-view-local-first).

![Swagger view architecture: a Node/TypeScript host feeding a sandboxed Swagger UI webview from disk](/images/swagger-view-architecture.svg)

## Source layout

The extension is split into a thin host plus a set of single-responsibility services:

```text
src/
  index.ts                 # activation, command registration, change listener
  swaggerPreviewPanel.ts   # webview lifecycle, pin-to-file, postMessage bridge
  specAnalyzer.ts          # find unused defs/params/responses
  hashUtils.ts             # content hashing for change detection
  constants.ts  types.ts  interfaces.ts  utils.ts
  services/
    SpecParser.ts          # read + parse YAML/JSON -> in-memory OpenAPI model
    CacheManager.ts        # memoize parse/analysis results
    DefinitionService.ts   # safe delete (single / bulk)
    NavigationService.ts   # map any node back to its source location
```

## Two runtimes, one source of truth

There are exactly two runtimes: the **extension host** (Node/TypeScript) where all parsing and analysis live, and a **webview** (the sandboxed Swagger UI) that only renders and posts messages. Disk is the single data source — there is no backend and no network.

The host owns truth; the webview is a pure view. They talk over a `postMessage` bridge: the host posts `updateSpec`, the webview posts back navigation/source requests. Because the parsed model is computed once and cached, **preview, unused-definition detection, deletion, and navigation are all just readers of the same model** — which is exactly why none of them needs a server.

## The update pipeline

![The update flow: edit, debounce, hash check, parse, then post to the webview or surface an error](/images/swagger-view-update-flow.svg)

The "live preview" is a small pipeline where each hop is kept honest:

1. A document edit is **debounced** so rapid typing doesn't thrash the parser.
2. `hashUtils` computes a content hash; if it's unchanged, the pipeline **short-circuits** before doing any work.
3. On a real change, `SpecParser` parses the file into the in-memory OpenAPI model.
4. On success the host posts `updateSpec` and Swagger UI re-renders in place; on a parse error it surfaces the message and the line number instead of blanking the preview.

`CacheManager` memoizes parse/analysis output keyed on that hash, so repeated renders of an unchanged spec stay cheap.

## Unused-definition detection

Because `SpecParser` already produced the full model, `specAnalyzer` walks it to find definitions, schemas, parameters, and responses that are declared but never referenced. Results drive the preview's banner (unused vs. total), color-coded badges per component type, and an expandable list. Each entry is clickable — `NavigationService` maps the node back to its exact line/column so a click jumps straight to the declaration, and every API path gets a "Source" button that jumps to the specific HTTP method.

## Transaction-safe deletion

Deleting unused definitions — one at a time or in bulk — is the operation most likely to corrupt a file, because removing a node shifts the line numbers of everything below it. `DefinitionService` applies edits **bottom-to-top**, so earlier deletions never invalidate the source ranges of later ones. The deletions are computed from the same model the preview and analyzer use, so what you see flagged is exactly what gets removed.

## Why this shape holds up

- **The model is computed once and reused** — preview, analysis, deletion, and navigation are all readers, which is what makes a server unnecessary.
- **The boundary is a message bus** — the host owns truth, the webview only renders, so the sandbox stays a sandbox.
- **Local-first is a property, not a feature** — reading from disk and parsing in-process is what lets the whole thing work with zero callbacks, which matters when the spec describes an internal or unreleased API.
