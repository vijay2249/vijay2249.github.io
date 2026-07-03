---
title: "Turning a folder of projects into a developer story"
description: What I learned writing my own READMEs, org profile, and portfolio — how to choose a static-site stack, structure a repo's front page, and quantify your impact honestly without overclaiming.
date: 2026-06-24
category: journal
tags:
  - career
  - writing
  - open-source
  - developer-experience
cover: /images/profile-cover.svg
coverAlt: A developer profile with shipped-tools metrics
---

I'm a **Backend and Platform Engineer**; writing about my work doesn't come as naturally as building it. But a pile of repos isn't a story. This is what I learned turning scattered projects into a coherent presence — GitHub READMEs, an org profile, and a portfolio — and how I handled the trickiest part: **putting numbers on my work without lying to myself.**

## A README is a landing page, not a changelog

The reflex is to dump configuration and a feature list. But a repo's README is the first (often only) thing a visitor reads, so it has a job: in fifteen seconds, answer **what is this, who is it for, and why should I care?** Structure that worked:

- One-line **what it is** and the problem it solves.
- A small **"why"** — the niche it fills that nothing else does.
- *Then* install/usage, screenshots, and details.

I write the top of every README as if the reader will bounce after one paragraph — because most do.

## An org profile is positioning, not a repo list

For an organization page (the special `.github/profile/README.md` that renders on the org home) the goal is different: it should state **what the org stands for** and let the repos hang off that. For a privacy-focused org, the through-line was simple — "applications that don't track users" — and every project read as evidence for that stance rather than a standalone entry.

The lesson: a profile's job is to give people a **lens**. Lead with the position; let the work support it.

## Choosing a stack for the site (again, fit first)

For the org website and my portfolio I ran the same comparison I always do:

- **Plain HTML/CSS/JS** — zero build, perfect for a small site that rarely changes.
- **React + Vite** — worth it only if the site becomes app-like (filters, dashboards).
- **Astro** — component authoring with near-zero shipped JS; the sweet spot for a fast, SEO-friendly, mostly-static site.

There's no universally right answer — only the right answer for the size and lifespan of the thing. Don't reach for a framework a brochure site won't use.

## The hard part: quantifying impact honestly

A portfolio without numbers feels weak; a portfolio with **invented** numbers is worse. My rule was that **every metric has to trace to something real and be defensible in conversation.** Concretely, I split claims into tiers:

- **Tool-internal benchmarks I measured** — e.g. "~50% fewer file reads," "sub-second flow updates," "full rule parity with zero server round-trips." Real, but I label them as *tooling* metrics, not team-wide productivity stats, and I'm ready to explain how they're measured.
- **Countable facts** — number of tools shipped, languages used, IDE platforms targeted, internal automations built. Easy to stand behind because they're just counts.
- **Order-of-magnitude estimates** — phrased as estimates ("a large microservice estate"), not false precision.

> The test for any number on your résumé: *can you explain exactly where it comes from, out loud, without flinching?* If not, soften it or cut it.

The most powerful metrics are genuine **team-level** outcomes (review time saved, defect rate, coverage improvement, onboarding time). If you have those, lead with them. If you only have tool-internal ones, cite them — but label them honestly. Overclaiming is a one-interview strategy.

## Keep one source of truth

I kept the résumé in two synced forms (Markdown and HTML) and the portfolio metrics aligned with both. The annoyance of syncing three places taught me the obvious fix: **one canonical list of facts**, rendered into each surface, so a number can't be right in one place and stale in another.

## What I took away

1. **Write the README top for the reader who bounces** — what, who, why, fast.
2. **An org profile is a lens**; lead with the position, let repos support it.
3. **Pick the site stack by size and lifespan**, not fashion.
4. **Tier your metrics** (measured / counted / estimated) and label each honestly.
5. **Keep one source of truth** for the facts about yourself.

Telling your own story well is a skill worth practicing.
