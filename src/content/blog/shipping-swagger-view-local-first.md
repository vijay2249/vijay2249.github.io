---
title: What shipping swagger-view taught me about local-first tools
description: A developer-journal entry on building a privacy-first Swagger/OpenAPI previewer — and why "no callbacks" turned out to be a feature, not a constraint.
date: 2026-04-12
category: journal
tags:
  - week-notes
  - developer-experience
  - privacy
  - open-source
cover: /images/swagger-view-cover.svg
coverAlt: A locally rendered Swagger UI with no external callbacks
---

Most online Swagger/OpenAPI editors work the same way: you paste a spec, it goes to a server, and you get a preview back. Convenient — until the spec describes an internal or unreleased API that really shouldn't leave your network. That gap is why I built `swagger-view`, a VS Code extension that renders the spec entirely locally.

This is a journal entry, not a tutorial — here's what building it taught me.

## "No callbacks" is a feature

I expected local-first to be a limitation I'd apologize for. Instead it became the whole pitch: your spec is read from disk, parsed locally, and rendered locally. Close the editor and nothing has gone anywhere. For anyone handling sensitive specs, that's the headline.

## Owning the parse unlocks more than preview

Because the extension already understands the spec, it can do more than draw it:

- Find **unused definitions, schemas, parameters and responses**.
- **Jump to the exact location** of any item or endpoint.
- **Delete unused definitions** safely, one at a time or in bulk.

None of that needs a server. The data was already in memory.

## Refactoring toward SOLID paid off

The first version mixed parsing, UI, and file I/O together. Splitting it into clear service boundaries made the cleanup features possible without fear — each piece could change independently. A good reminder that architecture is a feature-enabler, not ceremony.

> Local-first isn't always the easiest path, but for developer tools handling sensitive specs, it's the right default.

## The architecture (HLD)

Local-first didn't mean "simple" — it meant the architecture had to do all the work that a server normally would, in-process. The extension splits into two runtimes: the **extension host** (Node/TypeScript, where parsing and analysis live) and a **webview** (the sandboxed Swagger UI that only renders). Nothing else is in the picture — no backend, no network.

![Swagger view architecture: a Node/TypeScript host feeding a sandboxed Swagger UI webview from disk](/images/swagger-view-architecture.svg)

| Component | Responsibility |
| --- | --- |
| `index.ts` | Activation; registers commands; wires the document-change listener. |
| `SpecParser` | Reads the file and parses YAML/JSON into an in-memory OpenAPI model. The single source of truth everything else reads from. |
| `hashUtils` | Computes a content hash so a no-op edit can short-circuit before re-rendering. |
| `swaggerPreviewPanel` | Owns the webview's lifecycle, the **pin-to-file** binding, and the `postMessage` bridge to Swagger UI. |
| `specAnalyzer` | Walks the model to find unused schemas, parameters, and responses. |
| `DefinitionService` | Deletes unused definitions safely — one at a time or in bulk. |
| `NavigationService` | Maps any node back to its exact line/column for jump-to-source. |
| `CacheManager` | Memoizes parse/analysis output so repeated renders stay cheap. |

### The update flow

The "live preview" everyone expects is a small pipeline, and keeping each hop honest is what makes it feel instant:

![The update flow: edit, debounce, hash check, parse, then post to the webview or surface an error](/images/swagger-view-update-flow.svg)

Two architectural properties fall out of this shape:

- **The model is computed once and reused.** Preview, unused-definition detection, deletion, and navigation are all just *readers* of the same parsed model — which is exactly why none of them needs a server. The data is already in memory.
- **The boundary is a message bus.** The host owns truth; the webview only renders and posts intents back. That clean split is what made it safe to add bulk-delete and jump-to-source later without destabilizing the preview.

### What I'd revisit

The honest weak spot is the host↔webview contract: a subtle **data-shape mismatch** there (passing the wrong type into Swagger UI's update call) was behind a "preview won't refresh" bug. If I rebuilt it, I'd put a single typed serializer at that boundary so the contract is enforced in one place rather than implied at each `postMessage`.

## What's next

A few people have asked for a marketplace listing instead of building the `.vsix` by hand. That's the next chunk of work — packaging and release, ideally automated the same way I [automate releases elsewhere](/blog/auto-publish-release-github-actions).
