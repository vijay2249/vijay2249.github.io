---
title: "Fair fare-splitting for pooled rides: from a naive split to surplus sharing"
description: Designing a ride-pooling fare model where riders save, the driver is rewarded for pooling, and the math is provably fair — checked against the Shapley value.
date: 2026-05-16
category: tutorial
tags:
  - algorithms
  - go
  - architecture
  - distributed-systems
  - experimental
cover: /images/slipstream-cover.svg
coverAlt: A pooled-ride timeline with shared and solo segments
---

Sitting in a cab one day I started picking at a deceptively hard question: if two strangers share a ride, **what's the fair price for each?** Splitting the meter sounds obvious until you work an example and watch it fall apart. This is how I reasoned my way to the fare model in **Slipstream** — and why the "obvious" split is wrong.

## Model the world first

The city is a **weighted directed graph**: nodes are locations, edges carry a distance and a time. A pooled ride is an ordered list of **stops** (pickups and dropoffs). The key insight that makes fair splitting *possible* is the **segment**: the stretch of road between two consecutive stops, during which the set of on-board passengers never changes.

![A pooled ride split into segments, each labelled with who is on board](/images/pooled-ride-segments.svg)

If you know the cost of each segment and who was aboard, you can attribute cost precisely. Shortest routes (and each rider's **solo** baseline) come from Dijkstra over the graph.

## Matching: only pool when it's actually worth it

Slipstream is *dynamic* — A is already riding when B requests. The matcher keeps A's stop order fixed and tries every valid placement of B's pickup and dropoff, keeping the **minimum-distance feasible** plan. "Feasible" is three constraints:

1. **Capacity** — never exceed the seats.
2. **Per-passenger detour** — each rider's distance stays within `solo × 1.3`, so an existing rider isn't dragged far out of their way.
3. **Combined efficiency** — total pooled distance ≤ the sum of solo distances.

That third one is the quiet hero. Without it, the planner can always "serve" B by finishing A's trip and *then* driving to B — a back-to-back chain that's technically feasible but pointless. Requiring the pooled route to be no longer than separate cars means we **only pool when there's real shared road.**

## The naive split, and why it fails

The obvious model: split each segment's cost by how many people are aboard, and pay the driver the whole metered route.

Work the nested case — B is fully on A's way (same destination). The car drives the *exact same kilometres* whether or not it picks up B. Splitting the fixed meter just redistributes a fixed pie among riders. The driver earns **nothing extra** for carrying a second person.

So why would a driver ever accept a pool? They wouldn't. A fare model that doesn't reward the behavior you want is a broken incentive, not just unfair.

## The fix: share the *surplus*

The real value pooling creates is the **redundant driving it avoids**. Name it:

```
soloMetered(p) = perKm·soloDist(p) + perMin·soloTime(p)
surplus = Σ soloMetered(p)  −  totalMetered      // ≥ 0 by the combined constraint
```

`surplus` is the money saved versus sending separate cars. Split it three ways with shares that sum to 1 (default rider/driver/platform = `0.5 / 0.3 / 0.2`):

- **Riders** keep their share of their own natural saving (so their fare is always ≤ solo).
- **Driver** is paid for road actually driven, **plus** a slice of the surplus — which is strictly positive whenever *any* road is shared. Now even fully-nested pools pay more.
- **Platform** keeps booking fees, commission, and its surplus share.

```
naturalSaving(p) = soloMetered(p) − rawShare(p)
charged(p)       = soloMetered(p) − RiderSurplusShare × naturalSaving(p)
driverEarnings   = totalMetered × (1 − commission) + DriverSurplusShare × surplus
```

## Make fairness a tested property, not a vibe

"Fair" is easy to claim and easy to get wrong, so I encoded the guarantees as tests:

| Property | Guarantee |
| --- | --- |
| Individual rationality | `total(p) ≤ soloFare(p)` for every rider |
| Non-negative savings | `savings(p) ≥ 0` |
| Driver-positive | driver earns strictly more than serving the anchor alone when road is shared |
| Conservation | `Σ total(p) == driverEarnings + platformRevenue` |
| Transparency | every charge traces to specific segments and occupancies |

Money conservation is the one I'd flag for anyone building pricing: it's a single assertion (`what riders pay == what driver + platform receive`) that catches a whole class of "where did that cent go?" bugs.

## Cross-check against the canonical fair answer

The segment split is simple and explainable — but *is* it fair in a formal sense? Game theory has a canonical answer: the **Shapley value**, where each player's share is its average marginal contribution across all arrival orders.

```
φ_p = Σ over coalitions S without p:
        |S|!(n−|S|−1)!/n! × ( c(S ∪ {p}) − c(S) )
```

For the nested-overlap structure typical of corridor pooling, the simple segment split and the Shapley value **coincide** — a satisfying validation that the easy-to-explain rule is also the game-theoretically fair one. Shapley enumerates all `2^n` coalitions, so I use it as an offline cross-check, not on the hot path.

## The takeaway

The lesson I keep from this isn't the fare formula — it's the *process*:

1. **Find the structural primitive** (here, the constant-occupancy segment) that makes the problem tractable.
2. **Work a small example by hand** and watch the naive model break. The nested case exposed the incentive flaw instantly.
3. **Encode fairness as assertions** (conservation, individual rationality) so they can't silently regress.
4. **Validate the simple rule against the rigorous one** — if they agree, you get to keep the explainable version.

Deliberately, this first cut has no live traffic, persistence, or UI. It's a correct, well-tested, explainable engine to build on — which is exactly what I wanted first.
