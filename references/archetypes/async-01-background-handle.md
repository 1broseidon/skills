# Archetype · ASYNC-01 · Background + handle

For operations that **routinely take longer than 5 seconds** — site crawls, bulk imports, long-running model calls, large indexing jobs, multi-step migrations. The user (human or agent) should be able to fire-and-forget, get a handle back, and poll or stream status later.

Reference shapes: `ketch crawl --background → id`, AWS Step Functions / Batch handles, Stripe async tasks, gRPC long-running operations (LRO), Kubernetes Job + status.

## When to pick it

- The operation can run >5s and the caller may want to do other work meanwhile.
- The operation produces a state (progress, partial results) the caller wants to observe without blocking.
- Multiple operations may run in parallel and the caller needs to address each.

**Don't pick it** for:

- Operations that are always <2s — synchronous is simpler.
- One-shot operations the caller can't recover anyway — just stream to stdout.
- Cases where the result is meaningless without the launching context (then the caller probably wants synchronous + a `--timeout` flag).

## CLI shape

The pattern is a triplet:

```
<tool> <verb> ARG --background      # returns: { "id": "<handle>", "started_at": "..." }
<tool> <verb> status <id>           # returns: { "id": "...", "state": "running|complete|failed|cancelled", "progress": 0.42, ... }
<tool> <verb> stop <id>             # cancels; returns: { "id": "...", "state": "cancelled" }
```

Optional fourth verb:

```
<tool> <verb> list                  # all known handles for the verb, sorted by start time
```

For Verb-Surface macros, the sub-verbs (`status`, `stop`, `list`) live under the original verb:

```
ketch crawl --background          # async fire
ketch crawl status <id>           # poll
ketch crawl stop <id>             # cancel
ketch crawl list                  # enumerate
```

For Verb-Noun trees, they slot in naturally:

```
ledger migration start --background → id
ledger migration status <id>
ledger migration stop <id>
```

## Handle format

- **Opaque** to callers — no embedded semantics they should parse. UUIDv4 or a content-addressed short hash both work.
- **Short enough to copy-paste** but unique. 8–12 chars after stripping dashes is enough for human use; full UUID for any inter-machine handoff.
- **Listed in the tool's handle directory.** Stored in `$XDG_STATE_HOME/<tool>/handles/<id>.json` (or platform equivalent), readable by the same user.

## State machine

Documented and stable:

| State | Meaning | Can transition to |
| --- | --- | --- |
| `pending` | Accepted, not started | `running`, `cancelled` |
| `running` | Active | `complete`, `failed`, `cancelled` |
| `complete` | Successful terminal | — |
| `failed` | Terminal with error | — |
| `cancelled` | User-requested terminal | — |

States are part of the wire contract — once published, they don't get renamed silently.

## Status payload

JSON shape for `<tool> <verb> status <id>`:

```json
{
  "id": "abc12345",
  "verb": "crawl",
  "state": "running",
  "started_at": "2026-05-21T14:32:11Z",
  "updated_at": "2026-05-21T14:33:02Z",
  "progress": 0.42,
  "summary": {
    "pages_seen": 211,
    "pages_total_estimate": 500
  },
  "result": null,
  "error": null
}
```

- `progress` is `null` if unknown, else a float in `[0, 1]`.
- `summary` is verb-specific, optional, stable schema once shipped.
- `result` is `null` until `state == "complete"`, then carries the terminal result.
- `error` is `null` unless `state == "failed"`, then carries `{ "code": "...", "message": "..." }` matching the tool's error envelope.

Status calls are **cheap and idempotent** — agents may poll every 2–10s. The state directory must not require locks the caller can starve.

## Streaming variant

When the caller wants live updates:

```
<tool> <verb> status <id> --watch       # stream status JSON every N seconds until terminal
<tool> <verb> tail <id>                 # stream log lines from the running op
```

`--watch` emits NDJSON with one status line per update; `tail` emits free-form log lines (to stderr-style channel) until the op terminates, then exits.

## Cancellation

`<tool> <verb> stop <id>`:

- Idempotent. Stopping a `complete`/`cancelled`/`failed` op returns the current state without error.
- Honours grace period. Internally, stop sends a cancellation signal to the runner; if the runner doesn't terminate in 30s, the state moves to `cancelled` regardless and the runner is killed.
- Documented exit code on partial cancel: handle moves to `cancelled` but any side effects already committed remain. Stop is not a transaction.

## REST shape (when this maps to HTTP)

```
POST   /v1/crawls                 → 202 Accepted, { "id": "...", "status_url": "/v1/crawls/abc12345" }
GET    /v1/crawls/{id}            → 200, the status payload
DELETE /v1/crawls/{id}            → 200, { "state": "cancelled" }   (cancel, idempotent)
GET    /v1/crawls                 → 200, list
GET    /v1/crawls/{id}/events     → 200 text/event-stream            (streaming variant)
```

The `Location` header on the initial 202 carries the status URL. Both `Location` and the body's `status_url` say the same thing — agents pick whichever they parse first.

**202 without a status URL is slop gate U12.** A 202 that doesn't tell the caller how to follow up is broken async.

## gRPC shape (long-running operations)

Use `google.longrunning.Operation`:

```protobuf
service Ledger {
  rpc StartMigration(StartMigrationRequest) returns (google.longrunning.Operation);
  // Standard LRO RPCs handled by the LRO server side:
  // GetOperation, CancelOperation, ListOperations
}
```

The `Operation.metadata` carries the typed progress; `Operation.response` carries the terminal result. Document retryability per [`grpc-conventions.md`](../grpc-conventions.md).

## Persistence

Handles persist across tool restarts. State directory layout:

```
$XDG_STATE_HOME/<tool>/handles/
  <id>.json        ← latest known state
  <id>.log         ← optional tail buffer
```

GC policy: handles older than 7 days in terminal state are pruned by `<tool> <verb> list --cleanup` (or automatically on `list` if config says so). Active handles never auto-pruned.

## Anti-patterns

| Tell | Why |
| --- | --- |
| **Async without a handle** | Op fires, returns nothing; caller can't poll or cancel |
| **202 without status URL** | Same, HTTP flavour |
| **Renamed state values across versions** | `running` → `in_progress` → `executing` over three releases breaks every poller |
| **Stop that throws on already-complete** | Cancellation must be idempotent |
| **Poll endpoint that holds connection open** | Conflates poll and stream; agents can't drive both |
| **Unbounded handle directory** | No cleanup, no list, no GC — directory fills the disk |
| **Progress that goes backwards** | Resets to 0 mid-op without explanation; agents assume monotonic |

## Slop gates

- **U12** REST 202 without `Location` or `status_url` → fail
- **A08** Async CLI returns nothing on `--background` (no id) → fail
- **A09** State machine renames between major versions without deprecation cycle → fail
- **G05** gRPC long-op without `google.longrunning.Operation` (or documented equivalent) → fail

## Studied examples

- **ketch crawl** — exemplary CLI shape. `--background` returns id; `crawl status <id>`; `crawl stop <id>`. State directory in user state path.
- **AWS Batch** — REST + gRPC-ish pattern at scale. Operations and statuses are first-class resources.
- **kubectl + Jobs** — declarative LRO; the resource IS the handle, status is on the resource.
- **Google Cloud LRO** — the canonical gRPC LRO pattern that proto's `google.longrunning.Operation` was designed for.
