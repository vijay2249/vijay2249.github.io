---
title: "How I choose an architecture"
description: My repeatable process for architecture decisions — start from the constraints, write an 'alternatives considered' table, and make the trade-off explicit. With examples from real projects.
date: 2026-06-20
updated: 2026-06-25
category: note
tags:
  - architecture
  - design
  - clean-code
  - distributed-systems
---

> 🌱 A digital-garden note on how I actually make architecture decisions. It's tended over time as I find sharper examples.

People imagine architecture is about knowing the "right" pattern. In practice it's a much more boring, repeatable process: figure out what the requirements *forbid*, lay out the honest options, and pick the trade-off you can live with — on the record. Here's the loop I run, with examples from projects I've written up elsewhere.

## 1. Start from the constraints, not the features

The fastest way into a design is to ask: **what does each requirement eliminate?** Features tell you what to build; constraints tell you what you can't do, and that prunes the option tree fast.

When I built a Linux website blocker, three constraints did most of the architectural work before I wrote any enforcement code:

- "must catch raw-IP `curl`" → kills DNS/`hosts`-based blocking.
- "per-user privacy" → kills a shared plain file.
- "no setuid" → kills the classic root-owned binary.

What's left after the eliminations is usually a small, defensible space. (Full write-up: [blocking websites at the kernel layer](/blog/blocking-websites-kernel-layer-linux).)

## 2. Make "non-negotiable" a real constraint, then enforce it

If something is a hard requirement, encode it so it *can't* silently erode. A promise in a README is not a constraint; a check that fails the build is.

In a finance app where privacy was the whole point, "offline" became **no `INTERNET` permission** (the OS blocks sockets) plus a **CI guard** that fails if networking ever sneaks in. The guarantee stopped depending on my discipline. (Write-up: [designing a provably-offline app](/blog/provably-offline-app-design).)

## 3. Write the "alternatives considered" table

This is the single highest-leverage habit I have. For any real decision, I write a small table: the options, their pros/cons against *my* constraints, and a verdict. It forces me to take the rejected options seriously and leaves a record of *why* — which is gold when someone (often future me) asks "why didn't you just…?"

| Option | Security | Per-user privacy | Ops cost | Verdict |
| --- | --- | --- | --- | --- |
| Root daemon + unprivileged client | Best — one narrow privileged surface | Strong | Medium | **Chosen** |
| sudoers / polkit | Medium — full root per call | Weaker | Low | Rejected |
| setuid-root | Poor — every run fully root | n/a | Low | Rejected |

The verdict column is the point. A design without recorded rejections is just an assertion.

## 4. Design the hot path for its complexity class early

Some performance choices are cheap up front and painful to retrofit. So I decide the *complexity class* of the critical path before building. For the blocker, the data plane had to be **O(1) in blocklist size** — hash sets + a uid-keyed verdict map — so a huge list costs the same per packet as a tiny one. Picking that on day one was free; bolting it on later would not have been.

The mirror image: don't over-engineer the cold path. The same project resolves DNS and rebuilds rules with deliberately simple, even brute-ish code, because it's off the hot path.

## 5. Find the primitive that makes the problem tractable

Hard problems usually have one structural insight that unlocks them. Finding it *is* the design. In a ride-pooling fare splitter, that primitive was the **segment** — the stretch of road where the on-board set doesn't change. Once cost attaches to segments, "fair split" becomes arithmetic. (Write-up: [fair fare-splitting for pooled rides](/blog/fair-fare-splitting-pooled-rides).)

When I'm stuck, the question is rarely "which pattern?" — it's "what's the primitive I haven't named yet?"

## 6. Choose fail-safe defaults

Decide what happens when things break, and bias toward the safe failure. A security tool must **fail closed** (a DNS hiccup retains the old blocks rather than unblocking). A data importer should **drop a doubtful row** rather than invent one. Naming the failure mode is part of the design, not an afterthought.

## 7. Make guarantees testable

The last step is turning the properties you care about into assertions that can't quietly regress: money conservation in a pricing engine, "0 phantom rows" for a strict parser, "no network packages" for an offline app. If a guarantee isn't tested, it's a wish.

## The loop, condensed

1. List what the requirements **forbid**.
2. Turn non-negotiables into **enforced constraints**.
3. Write the **alternatives-considered table** and record verdicts.
4. Fix the **hot path's complexity class** early; keep the cold path simple.
5. Name the **primitive** that makes the problem tractable.
6. Choose **fail-safe** defaults.
7. Make the guarantees **testable**.

None of this is exotic. The value is in doing it *explicitly* and *writing it down* — the artifact (a design doc with tables and diagrams) is often worth as much as the decision.

---

*Open thread: I want to add a worked example of step 4 vs. step 5 in tension — when the tractable primitive and the fast path pull in different directions.*
