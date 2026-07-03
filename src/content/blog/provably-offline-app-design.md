---
title: "Designing a provably-offline app: privacy as a hard constraint"
description: Lessons from building a local-first finance analyzer — how to make "offline" a guarantee you can prove, not a promise, and the architecture that falls out of it.
date: 2026-05-30
category: journal
tags:
  - privacy
  - architecture
  - flutter
  - llm
  - design
cover: /images/offline-cover.svg
coverAlt: A shield with a no-network symbol — offline by construction
---

I wanted a personal finance analyzer: upload statements, see where the money goes. The catch is the data is about as sensitive as it gets. "We don't upload your data" is the kind of promise every app makes and few can prove. So I set a harder bar: **offline as a property you can verify**, not a marketing line. This is a journal entry on what that constraint did to the architecture.

## "Trust me" isn't a design

Most privacy claims are about *intent* — the code probably doesn't phone home. I wanted a claim about *capability*: the app **cannot** phone home, and anyone can check.

On mobile that turned out to be wonderfully concrete: **declare no `INTERNET` permission in the Android manifest.** With the permission absent, the OS itself blocks every socket. It's not "we chose not to send data" — it's "the platform won't let us, even if we had a bug."

To keep that honest as the code grows, I added a CI guard (`tool/check_offline.dart`) that **fails the build** if the manifest ever gains the INTERNET permission or a networking package sneaks into the dependency tree. The guarantee is now enforced by a machine, not by my memory.

> The strongest privacy guarantee is the one the platform enforces for you. Design so that doing the wrong thing is *impossible*, not merely *discouraged*.

## The architecture the constraint forced

Once "no network" is non-negotiable, a lot of decisions make themselves:

- **No cloud parsing, no cloud LLM.** Everything — PDF/CSV/Excel parsing, categorization, analytics — runs on-device.
- **Local storage only** (SQLite / `sqflite`), schema mirrored between the desktop and mobile versions.
- **A framework-agnostic core.** I kept parsing, categorization, and analytics in a pure module with no I/O or framework deps, so the same logic ports between a Python backend and a Dart mobile app. The constraint made portability cheap.

## Rule-first, LLM-as-fallback

Statements are mostly structured, so the pipeline is **deterministic first, AI only when needed**:

1. **Rule-based parse** — tables/regex for PDFs, column auto-detection for CSV/Excel. Fast, predictable, debuggable.
2. **If that yields nothing usable**, fall back to a **local LLM** to classify the document and extract normalized records (e.g. a payslip's net pay becomes an income credit).
3. The response records `method` (`rules` | `llm`) and the detected `document_type`, so the behavior is always inspectable.

This ordering keeps the common case fast and the AI cost (and unpredictability) confined to the messy long tail. On mobile the model is a small on-device GGUF run via llama.cpp — no desktop dependencies, no server.

## Two design choices that paid off

**Always return a structured 200.** Early on, uploads failed with opaque 500s — a dev proxy was turning backend 4xx responses into 500s for multipart POSTs. I made `/api/upload` **always return HTTP 200** with a structured body (`ok`, `error`, `needs_password`, `wrong_password`, `method`, `document_type`, `inserted`, `skipped_duplicates`). The transport stops lying about what happened, and the UI can react to real states — like prompting for a password on an encrypted PDF — instead of guessing.

**Strict parsing beats clever parsing.** A loose text parser invented phantom rows from a payslip — entries like `(no description)` with implausible years. The fix wasn't smarter heuristics; it was a **strict filter**: require a real description and a plausible year, and drop anything else. A unit test pins it (payslip-like text → 0 rows). For data you'll act on, a false row is worse than a missing one.

## The security lessons that stuck with me

Building this sharpened how I think about security in general — most of it is less about clever defenses and more about *removing the possibility of a mistake*.

**Removing the network removes a whole class of attacks.** Exfiltration, SSRF, a malicious dependency phoning home, a logging library quietly shipping data to a third party — none of them are possible if there is no socket to begin with. The most reliable control isn't one you monitor; it's one that makes the bad outcome *impossible*. The absent INTERNET permission does more than any amount of careful review could.

**Minimal dependencies are a security feature.** No networking packages also means no networking CVEs, and a far smaller supply-chain surface. The CI guard that fails the build if a network library sneaks in is really a supply-chain control: a compromised transitive dependency can't open a connection that the platform won't allow anyway.

**Bind to loopback, not the world.** The desktop build serves its API on `127.0.0.1` only — never `0.0.0.0`. "It's just local" is a common way apps accidentally expose an unauthenticated API to the whole LAN. Loopback-only means even on a shared coffee-shop network, nothing is reachable from another machine.

**Treat every input file as hostile.** Statements are untrusted input — a PDF can be malformed or crafted to trip a parser. So: parse defensively, cap file sizes, never `eval` extracted text, and **fail closed** (the strict parser that drops phantom rows is a security control too, not just a correctness one). A parser that's lenient with junk is a parser that's lenient with attacks.

**Sensitive secrets live in memory only.** An encrypted PDF's password is used for the parse and then discarded — never written to disk, never logged, never persisted alongside the data. The `needs_password` / `wrong_password` states flow through the structured response so the UI can prompt without the backend ever storing the credential.

**Don't let logs become the leak.** It's pointless to keep financial data off the network and then dump it into a log file or an error message. Errors carry status codes and document *types*, never statement contents or PII. The data you worked to contain shouldn't escape through telemetry's back door.

**A local LLM keeps the prompt private too.** Prompts here contain raw financial lines — which are exactly as sensitive as the source document. Sending them to a hosted model would quietly undo the whole guarantee. Running the model on-device (Ollama on desktop, a GGUF via llama.cpp on mobile) keeps the most sensitive payload — the prompt — local as well.

> The throughline: the strongest security decisions I made weren't defenses I added, they were *capabilities I removed*. Fewer things the app **can** do means fewer things that can go wrong.

## Lessons I'm keeping

1. **Turn privacy into a constraint the platform enforces** (no INTERNET permission) and **guard it in CI** so it can't regress.
2. **Deterministic first, AI as fallback** — fast and predictable for the common case, flexible for the rest, always inspectable.
3. **Make the transport tell the truth** — structured, actionable responses beat HTTP status roulette.
4. **Prefer strict over loose** when the output drives decisions; back it with a test.
5. **Secure by removing capability** — no network, minimal dependencies, loopback-only, secrets in memory, PII out of logs. The safest feature is the one that can't exist.

"Offline" stopped being something I asked users to believe and became something the build proves on every commit. That's the bar I'll aim for whenever privacy is the point.
