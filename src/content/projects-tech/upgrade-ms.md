---
summary: How upgrade_ms is built — a thin Python orchestrator over Nexus, OpenShift, and Helm, with each step idempotent and fail-loud, plus the wider ops/AI toolkit it sits in.
---

This is the implementation-level companion to the [upgrade_ms overview](/projects/upgrade-ms).<br/>
It's internal employer tooling, so this is the generic shape — no environment-specific details or values. The journal entry on building it is [collapsing microservice upgrades into one command](/blog/week-notes-one-command-upgrades).

![upgrade_ms collapses the upgrade pipeline into one command: pull chart, login, template, apply, verify](/images/upgrade-ms-flow.svg)

## Shape of the tool

`upgrade_ms` is a small Python CLI that orchestrates the tools a release already needs, rather than reinventing them. The module layout keeps the orchestration, the side-effecting helpers, and the configuration cleanly separated:

```text
upgrade_ms/
  main.py            # CLI entry point
  commands/          # the upgrade command(s) — orchestration only
  utils/
    oc_utils.py      # OpenShift (oc) interactions
    file_utils.py    # chart/template file handling
  constants/         # tunables in one place
  data/              # environment -> cluster map, chart source links
```

Configuration (which environment maps to which cluster, where charts come from) lives as data, not code — so adding an environment is a data change, not a logic change.

## The pipeline

The CLI wraps the manual runbook into one reviewable path, where each step is **idempotent** and **fails loudly** so a half-finished run never leaves an environment in an unknown state:

1. **Pull the chart** for the target version from the artifact repository (Nexus), pinned explicitly so the deploy is reproducible.
2. **Log in to OpenShift** and select the correct project/namespace for the environment.
3. **Template the deploy** with Helm, layering the environment's values and overrides.
4. **Apply and roll out** the new version.
5. **Verify** the rollout status before reporting success.

Keeping each step explicit (instead of one opaque script) is the design choice that matters: failures are easy to locate and safe to re-run, and the same command behaves the same way across environments because only the data — not the steps — changes.

## Why one command

The whole point is collapsing a manual, error-prone, multi-step release into a single invocation. The manual version invites mistakes at every hop (wrong chart version, wrong namespace, forgotten value override); folding it into one idempotent command makes the upgrade repeatable and reviewable, and turns "did the rollout actually succeed?" into a checked step rather than a hopeful assumption.

## Part of a wider toolkit

`upgrade_ms` sits alongside a set of operations and developer-experience automations built in the same spirit — make the repeatable, error-prone parts of the job one command:

- **Failure-report triage and merge-conflict resolution** via MCP servers and AI agents.
- **Postman environment generation** for B2B test suites.
- **Engineering standards codified as review guardrails**, so quality stays consistent across a large microservice estate.
