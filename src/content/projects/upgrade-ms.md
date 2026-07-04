---
title: upgrade_ms & ops tooling
tagline: One command to upgrade a microservice in OpenShift — plus a wider set of ops & AI automations.
stack: Python · OpenShift · Helm
tech: [Python, OpenShift, Helm, Nexus, MCP]
internal: true
license: Proprietary / internal
status: active
year: '2024'
featured: false
order: 4
highlights:
  - Failure-report triage and merge-conflict resolution via MCP/agents
  - Postman environment generation for B2B test suites
  - Engineering standards codified as review guardrails
---

A CLI that **upgrades a microservice version in an OpenShift environment** with "happy helming" — pulling charts from Nexus, logging into OCP, and templating the deploy. It collapses a manual, error-prone, multi-step release into a single command.

> **Internal project.** This is employer ops tooling, so the source isn't public. 
> The flow below is the generic shape — no environment-specific details. There's a developer-journal entry on building it: [collapsing microservice upgrades into one command](/blog/week-notes-one-command-upgrades).

## Architecture

`upgrade_ms` is a thin orchestrator over the tools a release already needs. Each step is idempotent and fails loudly, so a half-finished run never leaves an environment in an unknown state.

![upgrade_ms collapses the upgrade pipeline into one command: pull chart, login, template, apply, verify](/images/upgrade-ms-flow.svg)

## Technical explanation

The CLI wraps the manual runbook into one reviewable path:

1. **Pull the chart** for the target version from Nexus, pinned explicitly.
2. **Log in to OpenShift** and select the right project/namespace.
3. **Template the deploy** with Helm, layering environment values and overrides.
4. **Apply and roll out** the new version.
5. **Verify** the rollout status before reporting success.

Keeping each step explicit (rather than one opaque script) makes failures easy to locate and re-run, and means the same command works the same way across environments.

## Part of a wider toolkit

`upgrade_ms` sits alongside a set of operations and developer-experience automations:

- **Failure-report triage and merge-conflict resolution** via MCP servers and AI agents.
- **Postman environment generation** for B2B test suites.
- **Engineering standards codified as review guardrails** so quality stays consistent across a large microservice estate.
