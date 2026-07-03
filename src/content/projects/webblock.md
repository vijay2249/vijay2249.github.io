---
title: webblock
tagline: A per-user, system-wide website/IP blocker that enforces at the Linux kernel packet layer — no setuid anywhere.
stack: Go · Linux · nftables
tech: [Go, Linux, nftables, iptables, ipset, netfilter, systemd]
license: Not yet released — license TBD on open-sourcing
status: in-progress
year: '2026'
featured: true
order: 2
highlights:
  - Blocks egress at the kernel packet layer (nftables / iptables+ipset) so even raw-IP curl is caught
  - Root daemon + unprivileged CLI over a Unix socket — no setuid bit anywhere; caller identity via SO_PEERCRED
  - Per-user private blocklists with an O(1) data plane (hash sets + per-uid verdict map) and atomic, fail-safe applies
cover: /images/webblock-cover.svg
coverAlt: A request hitting a netfilter egress hook and being dropped
---

**webblock** is a Linux website/IP blocker that drops outbound traffic to specified domains
and IPs **at the kernel packet layer**, enforcing both system-wide and per-user policies —
without a single setuid binary.

> **Status: in progress.** This is an active work-in-progress personal project. The design is implemented and evolving; it isn't open-sourced yet. See the design walk-through in [Blocking websites at the kernel layer on Linux](/blog/blocking-websites-kernel-layer-linux).

## Why I built it

`/etc/hosts` and DNS blocklists are system-wide only and trivially bypassed by hitting an IP
directly. I wanted a blocker that applies to **every** client (including `curl http://<ip>`),
supports **private per-user lists**, lets **root administer everyone**, and uses **no setuid**
— each of which quietly rules out the easy options.

## Architecture

The whole system is two processes split across a privilege boundary, with the kernel as the actual enforcement point. The goal of the shape is to keep **one small surface privileged** and everything else powerless.

![webblock high-level design: one privileged daemon between an unprivileged CLI and the kernel](/images/webblock-hld.svg)

A root daemon (`webblockd`, `CAP_NET_ADMIN` only) owns the firewall and config; an unprivileged CLI just validates input and sends one JSON request per connection over a Unix socket. Compromising the CLI grants nothing — it holds no privileges and makes no policy decisions.

![How the unprivileged CLI, root daemon, and kernel cooperate](/images/webblock-cli-daemon.svg)

## Technical explanation

- **Enforcement in the kernel:** a netfilter egress filter drops packets by destination IP,
  so the block is independent of which process or name resolution produced the request.
- **Kernel-verified identity:** the request protocol carries **no uid field**. The daemon reads the caller's uid from `SO_PEERCRED` — which the kernel fills in and the client can't forge — so per-user authorization is trustworthy. uid 0 manages everyone; any other uid is scoped to its own list.
- **O(1) data plane:** named hash sets give ~O(1) membership checks, and a per-uid verdict map (`meta skuid vmap`) keeps the per-packet cost a single map lookup regardless of how many users have lists — not a linear scan.
- **Atomic, fail-safe applies:** every change is one `nft -f` transaction (or the ipset create/swap/destroy idiom), so there's never a half-applied ruleset. A transient DNS failure **retains the previous IPs** rather than silently unblocking, and persisted lists are reconciled into the live firewall on boot.

## What made it interesting

Most of the architecture fell out of the constraints: "no setuid" and "per-user privacy"
forced the daemon/client split and kernel-verified identity. Designing the data plane for
O(1) up front, and defaulting every failure mode to *fail-safe* (a DNS hiccup keeps the
previous block rather than silently unblocking), were the decisions that mattered most.
