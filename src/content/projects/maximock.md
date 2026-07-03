---
title: maximock
tagline: A WireMock-based alternative to Postman, published as a Maven package.
stack: Open source · Java · WireMock
tech: [Java, WireMock, Maven]
repo: https://github.com/WeDontTrack/maximock
license: No formal license yet (all rights reserved by default)
status: shipped
year: '2026'
featured: false
order: 5
highlights:
  - Published as a Maven package under the WeDontTrack org
  - WireMock-based mocking that fits into existing JVM test workflows
  - Privacy-first — no accounts, no tracking
---

**maximock** is a WireMock-based alternative to Postman, published as a Maven package under
[WeDontTrack](https://github.com/WeDontTrack). It brings API mocking into JVM workflows
without an external app, account, or any tracking.

## Why

Mocking and exercising APIs usually means reaching for a heavyweight desktop tool.
maximock keeps it in code and in your build, where it's versioned, reviewable, and runs in
CI like any other dependency.

## Architecture

maximock wraps WireMock so stubs are declared **in test code** instead of a separate GUI. At runtime it spins up an embedded HTTP server that answers from a stub registry — so the code under test calls it exactly like a real API.

![API mocking in your build: tests declare stubs, maximock serves them over a local HTTP endpoint](/images/maximock-architecture.svg)

## Technical explanation

- **Stubs as code.** Request matchers and canned responses are defined in the test, so they live in version control, get code-reviewed, and diff like anything else.
- **Embedded HTTP server.** maximock starts a local endpoint backed by WireMock; the system under test points at it and behaves as if it were talking to the real service.
- **CI-native.** Because it's just a Maven dependency, there's no separate app to install or account to manage — it runs the same on a laptop and in a pipeline, with no tracking.
