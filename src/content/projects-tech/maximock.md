---
summary: How maximock works — WireMock-backed stubbing declared in code, an embedded HTTP server, request matching, and a CI-native lifecycle, shipped as a Maven dependency.
---

This is the implementation-level companion to the [maximock overview](/projects/maximock).<br/>
It's open source on [GitHub](https://github.com/WeDontTrack/maximock), published as a Maven package under WeDontTrack.

![API mocking in your build: tests declare stubs, maximock serves them over a local HTTP endpoint](/images/maximock-architecture.svg)

## The idea, in one line

maximock is a thin, opinionated layer over **WireMock** that lets you keep mock API "collections" in code and run them from your JVM build — a central place to store and execute stubs, instead of a heavyweight desktop tool with accounts and tracking.

## How the pieces fit

- **Stubs declared in code.** A request matcher (method + path + headers/body criteria) is paired with a canned response (status, headers, body). Because that lives in the test or a versioned resource, it diffs, reviews, and merges like any other code.
- **Embedded HTTP server.** maximock starts a local WireMock-backed HTTP server and registers the stubs against it. The code under test simply points its base URL at that endpoint and behaves exactly as if it were calling the real service.
- **Request matching.** Incoming requests are matched against the registered stubs; the first matching stub's response is returned, so you can model both happy paths and error cases.
- **Lifecycle.** The server starts before the scenario and is torn down after, so tests stay isolated and ports don't leak between runs.

## Why a Maven package (not a GUI)

Shipping as a Maven dependency is the whole point:

- **Versioned & reviewable.** Mock definitions travel with the code in source control, instead of living in someone's desktop app export.
- **CI-native.** It's just another dependency — the same mocks run on a laptop and in a pipeline, with no app to install and no account to manage.
- **Privacy-first.** No accounts, no tracking; everything runs locally in the build.

## Where it fits in a test

The typical flow is: start maximock, register the stubs for the scenario, run the code under test against the local endpoint, assert on the result, then stop the server. Because it's WireMock underneath, you get its mature matching and response features for free — maximock's job is to make storing and executing those collections ergonomic inside an ordinary JVM project.

> Note: this is a focused open-source utility. The deeper value is the workflow it removes — no separate API-client app in the loop — rather than a large internal architecture.
