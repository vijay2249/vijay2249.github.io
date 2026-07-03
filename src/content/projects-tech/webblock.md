---
summary: How webblock is built — the IPC protocol, the daemon's internal split, kernel-verified identity, the nftables/iptables data plane, and the O(1) performance model.
---

This is the implementation-level companion to the [webblock overview](/projects/webblock).<br/>
It walks the IPC protocol, the daemon internals, the firewall backends, and the performance and failure model. The conceptual story lives in the blog post [Blocking websites at the kernel layer on Linux](/blog/blocking-websites-kernel-layer-linux).

![webblock high-level design: one privileged daemon between an unprivileged CLI and the kernel](/images/webblock-hld.svg)

## Repository layout

The codebase is split so that the only privileged code is small and obvious:

```text
cmd/webblock        unprivileged CLI client
cmd/webblockd       privileged daemon, split by concern:
                      main.go, config.go, identity.go, server.go (transport),
                      ratelimit.go, authz.go, dispatch.go, handlers.go, engine.go
internal/proto      JSON IPC types (versioned)
internal/store      config persistence (/var/lib/webblock)
internal/validate   normalization + validation
internal/backend    Backend interface + nftables and iptables implementations
internal/resolver   domain -> IP resolution (concurrent)
deploy/             systemd unit
```

## The IPC protocol

The CLI and daemon speak a tiny, **versioned** request/response over a Unix domain socket — one request per connection. The single most important property: the request carries **no uid field**. Identity is read from the kernel, never asserted by the client.

```go
// internal/proto
Request{ Version, Action, Domains[], IPs[], TargetUser }   // no uid
Response{ OK, Error, Message, Views[], Status }

// Actions: add | remove | show | status
```

Every `Request` carries `Version`; the daemon rejects versions newer than it understands. The CLI does client-side normalization and validation for fast feedback, then sends one newline-terminated JSON request and reads one response. It holds no privileges — it is purely a messenger and renderer.

## Daemon internals (split by concern)

`webblockd` is deliberately decomposed so permission decisions live in exactly one place:

| File | Responsibility |
| --- | --- |
| `main.go` | Flags into `Config`, backend detection, **startup reconcile**, signals, launches refresh loop + socket server |
| `identity.go` / `peercred_linux.go` | `SO_PEERCRED` — the kernel-verified caller identity |
| `server.go` | Transport: accept, read peer creds, decode one request, rate-limit, dispatch (no per-action logic) |
| `ratelimit.go` | Per-uid fixed-window limiter |
| `authz.go` | `ResolveScope` + access control — the **only** place permission decisions live |
| `dispatch.go` | Routes an action to its handler; enforces the protocol version check |
| `handlers.go` | The add/remove/show/status handlers + authoritative input validation |
| `engine.go` | The single serialization point for firewall rebuilds; holds the resolved-address cache |

## Kernel-verified identity and authorization

The daemon reads the caller's uid/gid from the socket via `SO_PEERCRED`, which the kernel fills in and the client cannot forge. Authorization is then a small, central rule:

```text
request received
  -> valid action?            no  -> error: unknown action
  -> show                     -> build views by role
  -> add/remove + caller root?
       no  -> target empty/self?  no  -> error: permission denied
                                  yes -> scope = own uid
       yes -> target set?  no/global -> scope = global
                           name/uid  -> scope = that user
  -> normalize + validate -> store.Mutate -> engine.Rebuild -> backend.Apply
```

uid 0 gets full access (global list, or any user via `--user`); any other uid is confined to its own scope and can never read or write another user's list. On `--show`, a non-root caller only ever receives their own list plus the global list (read-only) — other users' lists are never returned.

## Storage

Config is root-owned under `/var/lib/webblock` (mode `0700`), one JSON file per scope:

```text
/var/lib/webblock/
  global.json          # root-managed, applies to all users
  users/<uid>.json     # per-user, private
```

Writes are atomic — marshal to a temp file, `chmod 0600`, then `rename`. `Mutate(scope, fn)` loads, applies a closure, and saves under a single lock; entries are normalized to sorted, de-duplicated sets. Filesystem permissions are defense-in-depth; privacy is enforced centrally by the daemon.

## The data plane

IP-layer enforcement needs IPs, so the resolver turns domains into addresses and the backend programs the kernel. Two backends implement one interface (`Name()`, `Apply(State)`, `Teardown()`), selected by probing `nft list ruleset` and falling back to iptables+ipset.

**nftables (primary)** uses one `inet webblock` table rebuilt per apply as a single atomic `nft -f` transaction. Per-user matching is the clever part — a verdict map keyed on the socket-owner uid means the per-packet cost is **one O(1) map lookup regardless of how many users have lists**, not a linear per-user rule scan:

```text
# per-uid regular chains
chain uid_<uid> { ip daddr @blocked_v4_uid_<uid> drop; ip6 daddr @blocked_v6_uid_<uid> drop }
# output chain
ip  daddr @blocked_v4_global drop
ip6 daddr @blocked_v6_global drop
meta skuid vmap { 1000 : jump uid_1000, 1001 : jump uid_1001 }
```

**iptables + ipset (fallback)** uses `hash:ip` sets per scope/family and a `WEBBLOCK` chain hooked from `OUTPUT`. An apply uses a constant number of subprocesses regardless of list size: one `ipset restore` swaps every set atomically (create/fill/swap/destroy), and one `iptables-restore --noflush` per family rebuilds just the `WEBBLOCK` chain.

## Performance model

With N = blocked entries, U = users with lists:

- **O(1) in list size.** Hash sets give ~O(1) membership, so a 10,000-entry list costs the same per packet as a 10-entry one.
- **O(1) in user count.** The `meta skuid` verdict map is a single lookup, not a per-user scan.
- **Incremental apply.** When only addresses change (the common case) the backend applies element add/delete deltas instead of rebuilding; a delta error self-heals into a full rebuild.
- **DNS off the lock.** Domains resolve concurrently (bounded by `ResolveConcurrency`) outside the engine lock, which is held only to re-read the store and apply — so a slow refresh never blocks an interactive `add`. Reads (`--show`/`--status`) bypass the lock entirely.
- **TTL-aware refresh.** Resolved addresses carry a freshness window (`DNSCacheTTL`); the refresh loop re-resolves only entries past their TTL instead of everything each tick.

## Validation and limits

`internal/validate` normalizes a pasted URL down to a bare hostname (lowercases, strips scheme/userinfo/path/port/trailing dot), runs RFC-style label checks, rejects bare IPs on the domain path (use `--ip`), and canonicalizes IPv4/IPv6. Requests are capped (`MaxItemsPerRequest = 256`) with domain/label length limits, so a malformed or oversized request is rejected before it ever touches the firewall.

## Failure handling

- **No backend at startup:** the daemon fails fast with a clear error.
- **Transient DNS failure:** logged; the **previous resolved IPs are retained** so a domain is never silently unblocked.
- **Firewall apply failure:** the mutate returns an error; because apply is atomic, the prior ruleset stays in effect.
- **Restart:** rules are intentionally left in place on shutdown; on next start the store is reconciled back into the firewall, so blocks survive reboots.

## Security model, in one list

- **Single privileged surface** — only `webblockd` is privileged; compromising the CLI grants nothing.
- **Unforgeable identity** — uid/gid from `SO_PEERCRED`, not the request.
- **Central authorization** — one place decides scope access.
- **No setuid anywhere** — avoids the "every invocation runs as root" risk.
- **Least privilege at runtime** — the systemd unit restricts the daemon to a `CAP_NET_ADMIN` bounding set with `NoNewPrivileges`, `ProtectSystem=strict`, `ProtectHome`, `PrivateTmp`, and a narrow `ReadWritePaths`.
- **Auditing** — every mutation is logged with requesting uid, action, scope, and items.

## Known limitations

- IP-based enforcement can briefly lag a CDN address rotation until the next re-resolution.
- Per-user matching keys off the socket-owner uid, so traffic from a root-owned helper on a user's behalf is attributed to that helper.
- No L7 inspection — destinations sharing an IP with allowed content would over-block, which is acceptable for the stated use case.
