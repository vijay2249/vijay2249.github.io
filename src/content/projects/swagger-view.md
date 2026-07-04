---
title: swagger-view
tagline: Local-first Swagger/OpenAPI preview with zero callbacks to any server.
stack: Open source · TypeScript · GPL-3.0
tech: [TypeScript, VS Code API, Swagger UI, OpenAPI]
repo: https://github.com/WeDontTrack/swagger-view
license: GPL-3.0
status: active
year: '2026'
featured: true
order: 3
highlights:
  - Refactored to SOLID services (parser, analyzer, navigation, cache)
  - Hash-based caching + debounced updates for snappy previews
  - Transaction-safe deletion (bottom-to-top to avoid line shifts)
cover: /images/swagger-view-cover.svg
coverAlt: A local Swagger UI preview rendered from a spec on disk
---

**swagger-view** is a **local-first** Swagger/OpenAPI preview extension — an embedded Swagger UI with **zero callbacks to any server**, plus unused-definition detection and safe bulk cleanup. Published as open source under [WeDontTrack](https://github.com/WeDontTrack).

## Local-first by design

Most online editors send your spec to a server to render it. swagger-view reads it from disk, parses it locally, and renders it locally — which matters when the spec describes an internal or unreleased API. There's a fuller write-up in the blog post [on local-first dev tools](/blog/shipping-swagger-view-local-first).

## Architecture

The extension splits into two runtimes: the **extension host** (Node/TypeScript, where parsing and analysis live) and a **webview** (the sandboxed Swagger UI that only renders). <br/>
Nothing else is in the picture — no backend, no network. Disk is the single source of truth.

![Swagger view architecture: a Node/TypeScript host feeding a sandboxed Swagger UI webview from disk](/images/swagger-view-architecture.svg)

The host owns truth and the webview only renders; they communicate over a `postMessage` bridge. Because the parsed model is computed once and reused, preview, unused-definition detection, deletion, and navigation are all just *readers* of the same model — which is exactly why none of them needs a server.

## Technical explanation

The "live preview" everyone expects is a small pipeline, and keeping each hop honest is what makes it feel instant:

![The update flow: edit, debounce, hash check, parse, then post to the webview or surface an error](/images/swagger-view-update-flow.svg)

- An edit is **debounced**, then a **content hash** short-circuits no-op changes before any work happens.
- On a real change, `SpecParser` parses the file; on success the host posts `updateSpec` and Swagger UI re-renders in place; on a parse error it surfaces the message and line number.
- **Hash-based caching** memoizes parse/analysis output so repeated renders stay cheap.
- **Deletion is transaction-safe** — edits are applied bottom-to-top so earlier removals don't shift the line numbers of later ones.

## More than a preview

Because it already understands your spec, it can keep it clean:

- Finds **unused definitions, schemas, parameters and responses**.
- Lets you **jump to the exact location** of any item or endpoint.
- **Deletes unused definitions** safely — one at a time or in bulk.
