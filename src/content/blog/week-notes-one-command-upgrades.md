---
title: "Week notes: collapsing microservice upgrades into one command"
description: A messy, manual, multi-step release became a single Python command. Notes on what I built, what broke, and what I'd do differently.
date: 2026-02-22
category: journal
tags:
  - week-notes
  - automation
  - python
  - openshift
---

A short journal entry on a thing I shipped this week and the bumps along the way.

## The problem

Upgrading a service across environments was a chain of manual steps: pull the right Helm chart version from Nexus, line up config, deploy to OpenShift, verify, repeat per environment. 

Every manual step is a chance to fat-finger a version or skip a check.

## What I built

A small Python CLI that does the whole dance:

- Resolves and pulls the chart version from Nexus.
- Applies the environment-specific values.
- Deploys to OpenShift and waits for rollout.

The whole thing collapsed into one command. The win isn't cleverness - it's removing the gaps where a human forgets a step.

## What broke

- **Rollout detection.** My first version assumed "deploy returned 0" meant "service is healthy." It doesn't. I had to actually poll rollout status and fail loudly on a stuck deploy.
- **Version drift.** Two environments silently ran different chart versions because the old process let them. The tool now refuses to proceed when it detects a mismatch it wasn't told to expect.

## Lessons

1. **Automate the verification, not just the action.** The deploy was never the risky part - *assuming it worked* was.
2. **Make the unsafe state hard to reach.** Guardrails beat documentation.
3. **Ship the small version.** A CLI that handles 90% of cases today beats a perfect pipeline next quarter.

Next week: pushing the rollout checks into the CI gate so a bad upgrade can't even start.
