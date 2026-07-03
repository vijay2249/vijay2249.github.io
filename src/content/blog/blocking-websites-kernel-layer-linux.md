---
title: Blocking websites at the kernel layer on Linux — without a setuid binary
description: How I designed a per-user, system-wide website blocker that catches even raw-IP curl, while keeping a single narrow privileged surface and zero setuid bits.
date: 2026-05-02
category: tutorial
tags:
  - linux
  - security
  - go
  - architecture
  - networking
cover: /images/webblock-cover.svg
coverAlt: A request hitting a netfilter egress hook and being dropped
---

I wanted something that sounds simple: block a list of websites on a Linux box. The moment you take it seriously, it stops being simple — and the interesting part is *where* you enforce the block and *who* is allowed to change it. This is the design walk-through for **webblock**, and more importantly, the reasoning behind each decision.

> **Status: in progress.** webblock is an active work-in-progress project — the design below reflects the current implementation and is still evolving (see the [project page](/projects/webblock)). Treat it as a living design rather than a finished release.

## Start from the threats, not the features

The naive approach is to drop entries into `/etc/hosts` or a DNS blocklist. It's a trap. The requirements I actually cared about were:

1. The block applies to **every client**, not just browsers — including `curl`, including `curl http://<ip>` (a raw IP) and `curl --resolve` tricks.
2. **Root's rules apply to everyone**; a **user's rules apply only to that user** and stay **private** from other non-root users.
3. **No setuid binary anywhere.**

Each of those quietly kills an "easy" option:

- `/etc/hosts` / DNS-only blocking is **system-wide only and trivially bypassed** by hitting the IP directly. Out.
- Per-user privacy means a plain shared file won't do — one user must not read another's list.
- "No setuid" rules out the classic trick of a root-owned binary anyone can run.

> Write down the constraints that eliminate options *before* you start building. Half the architecture falls out of "what does this requirement forbid?"

## Decision 1: enforce at the IP layer, in the kernel

To catch `curl http://<ip>`, you have to block by **destination IP at the packet layer** — a kernel egress filter that drops packets regardless of which process or which name resolution produced them. So a domain block becomes: *resolve the domain to IPs, drop those IPs, and re-resolve periodically* to track CDN drift.

That has a known limitation I accepted up front: it's IP-level, not L7, so domains that share an IP with allowed content would over-block. For the stated use case, fine.

## Decision 2: a root daemon + an unprivileged client

"No setuid" pushes you toward a **privileged daemon** that owns the firewall, plus an **unprivileged CLI** that just sends it requests over a Unix socket:

![How the unprivileged CLI, root daemon, and kernel cooperate](/images/webblock-cli-daemon.svg)

Why this shape wins: there's exactly **one narrow privileged surface**. Compromising the CLI grants nothing — it holds no privileges and makes no policy decisions. The daemon runs with just `CAP_NET_ADMIN` (not full root powers), locked down further by the systemd unit (`NoNewPrivileges`, `ProtectSystem=strict`, `ProtectHome`, `PrivateTmp`).

The alternatives I rejected, and why:

| Option | Why not |
| --- | --- |
| setuid-root binary | Every invocation runs fully root — one bug = full compromise |
| sudoers / polkit rules | Still full root per call; trusts `SUDO_UID`; fragile rules |
| `CAP_NET_ADMIN` filecap on a binary | Privileged on *every* run; cap doesn't protect per-user file privacy |

## Decision 3: identity comes from the kernel, never the client

Here's the subtle bit that makes per-user policy trustworthy. The request protocol has **no uid field**. If the client could say "I am uid 1000," any user could lie. Instead the daemon reads the caller's identity from the socket itself via **`SO_PEERCRED`**, which the kernel fills in and the client cannot forge.

```
Request{ Version, Action, Domains[], IPs[], TargetUser }   // note: no uid
```

Authorization then becomes a tiny, centralized rule:

- uid 0 → full access (global list, or any user via `--user`).
- any other uid → only its own scope; it can never read or write another user's list.

That single source of truth — "identity is kernel-verified, decisions live in one place" — is what lets me reason about the security of the whole thing.

## Decision 4: make the data plane O(1) in list size

A blocker is useless if it slows down the network. Two choices keep the packet path fast:

- **Hash sets** (nftables named sets / ipset `hash:ip`) give ~O(1) membership checks, so a 10,000-entry blocklist costs the same per packet as a 10-entry one.
- **Per-user matching via a verdict map** keyed on the socket-owner uid (`meta skuid vmap`), so the per-packet cost is one O(1) map lookup *regardless of how many users have lists* — not a linear scan of per-user rules.

```
# global drops
ip daddr @blocked_v4_global drop
# per-user: one map lookup, then jump to that user's chain
meta skuid vmap { 1000 : jump uid_1000, 1001 : jump uid_1001 }
```

The control plane matters too: every apply is **atomic** (one `nft -f` transaction, or the ipset create/swap/destroy idiom), so there's never a window where a half-applied ruleset leaks traffic. And DNS resolution runs **off the lock**, concurrently, so a slow refresh never blocks an interactive `add`.

## Decision 5: fail safe, not open

A blocker must never *silently unblock* something. So:

- A **transient DNS failure retains the previous IPs** for that domain rather than dropping the block.
- On boot, persisted lists are **reconciled into the live firewall**, so blocks survive reboots and daemon restarts.
- If a firewall apply fails, the mutate request returns an error and — because apply is atomic — the prior ruleset stays in effect.

## High-level design (HLD)

Pulling those decisions together, the system is two processes split across a privilege boundary, with the kernel as the actual enforcement point. The whole architecture exists to keep **one small surface privileged** and everything else powerless.

![webblock high-level design: one privileged daemon between an unprivileged CLI and the kernel](/images/webblock-hld.svg)

| Component | Process | Privilege | Responsibility |
| --- | --- | --- | --- |
| `webblock` (CLI) | client | none | Parse/validate args, send one JSON request, render the response |
| `webblockd` | daemon | root (`CAP_NET_ADMIN`) | Own the firewall + config; authenticate, resolve, apply |
| `authz` | in daemon | — | Read `SO_PEERCRED`, enforce per-user scope, validate, rate-limit |
| `engine` | in daemon | — | Serialize rebuilds; merge store + resolved IPs; drive the backend |
| `resolver` | in daemon | — | Resolve domains to IPv4/IPv6 with a timeout; refresh periodically |
| `store` | in daemon | — | Atomic persistence of blocklists per scope (root-owned, `0700`) |
| `backend` | in daemon | — | Translate desired state into nftables/iptables rules, atomically |

The request protocol is deliberately tiny and **versioned**, and — the crucial part — carries **no uid field**, because identity comes from the kernel, not the caller:

```text
Request{ Version, Action, Domains[], IPs[], TargetUser }   // no uid — taken from SO_PEERCRED
Response{ OK, Error, Message, Views[], Status }
```

A single `add` walks the whole stack:

1. **user** runs `webblock --add --name x.com`
2. **CLI** validates and sends `{Version, Action: add, Domains: [x.com]}` (no uid)
3. **authz** reads the uid via `SO_PEERCRED` and authorizes the requested scope
4. **engine** resolves `x.com` to IPs, persists to the store, rebuilds the ruleset
5. **backend** applies one `nft` transaction atomically
6. **daemon -> CLI** returns `{OK: true}`; the CLI prints the result

A fuller LLD (the IPC module, the per-user verdict-map layout, the full alternatives table) lives in the project's design doc; this is the shape you need to reason about its security.

## What I'd take to the next project

The shape here generalizes far beyond blocking websites:

1. **Let the constraints prune the design.** "No setuid" and "per-user privacy" did most of the architectural work.
2. **One privileged surface, kernel-verified identity, centralized authorization.** That's a reusable pattern for any local privileged tool.
3. **Design the data plane for O(1) early** — picking hash sets and a verdict map up front was cheaper than retrofitting performance later.
4. **Default to fail-safe.** For a security tool, the safe failure mode is non-negotiable.

There's a fuller HLD/LLD (component breakdown, sequence diagrams, the full alternatives table) in the project's design doc. The thread running through all of it: decide *where* trust lives before you write a line of enforcement.
