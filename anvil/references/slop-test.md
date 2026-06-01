# Slop test

**Load at the verification step, after the build.** The gates are a post-emit check, not a pre-emit reference. Pre-loading costs tokens for nothing; `anti-patterns.md` is the pre-emit guide.

Every gate is a question whose answer must be **NO** (i.e., you must not exhibit the failure).

When a gate fails: fix the output, re-run the relevant gate block, re-emit the slop row.

---

## Universal (U01–U20)

| Gate | Question — answer must be NO |
| --- | --- |
| U01 | Did I invent metrics, quotas, or SLAs not in the brief or backed by code? |
| U02 | Does help text, OpenAPI, or proto disagree with actual code defaults? |
| U03 | Are secret-shaped placeholders (`sk_live_xxx`, `token_abc`) in examples? |
| U04 | Is there only one exit/status path for distinct failure classes? |
| U05 | Did I add rate-limit headers or quota fields without implementation? |
| U06 | Are log field keys inconsistent across handlers within the target? |
| U07 | Is cancellation undocumented for operations expected to run > 2s? |
| U08 | Did I copy another service's command/route/proto tree wholesale in a monorepo? |
| U09 | Are error messages non-actionable (`Error`, `failed`, `something went wrong`)? |
| U10 | Did I fail to append `.anvil/log.json` with this run's entry? |
| U11 | Does a backend-specific flag activate when a different backend is selected? |
| U12 | Did I emit a 202 without a `Location` header or `status_url` body field? |
| U13 | Did I use different error envelope shapes in the same service? |
| U14 | Is pagination undocumented on any list endpoint that can return > 1 page? |
| U15 | Did I add a telemetry beacon (network call on behalf of the operator) without opt-in and documentation? |
| U16 | Did I add `TODO:remove` / `FIXME` without an owner and condition? |
| U17 | Are there retry policies that retry on all error codes including non-retryable ones? |
| U18 | Did I hardcode a version string instead of using ldflags / build-time injection? |
| U19 | Is the startup log missing version, listen address, or environment? |
| U20 | Did I emit config that is required but not validated at startup (fails silently on deploy)? |

---

## CLI (C01–C15)

| Gate | Question — answer must be NO |
| --- | --- |
| C01 | Is the root command literally `run` without explicit user request? |
| C02 | Are flags single-letter with no description (`-f`, `-d`)? |
| C03 | Do log lines or progress output go to stdout instead of stderr? |
| C04 | Is config precedence (flags > env > file > defaults) unstated? |
| C05 | Are exit codes undocumented or collapsed to only `0` and `1`? |
| C06 | Does help text state a default that differs from the code default? |
| C07 | Are invented or secret-shaped sample values in help examples? |
| C08 | Is `--flag=true` / `--flag=false` the primary boolean UX instead of `--flag` / `--no-flag`? |
| C09 | Does the default user path block on an interactive prompt (`(y/N)`, readline, TTY menu)? |
| C10 | Are different flag names used for the same concept across commands (`--project` vs `--project-id`)? |
| C11 | Is `SilenceUsage` unset, causing usage dump on `RunE` errors? *(cobra only)* |
| C12 | Is `main()` doing business logic, flag parsing, or I/O instead of delegating? |
| C13 | Does the binary miss a `--version` flag or `version` subcommand? |
| C14 | Are shell completion scripts missing when completion is selected as a boundary obligation? |
| C15 | Is there no `conventions.yaml` on a tool-scope build? |

---

## Agentic (A01–A10)

Run this block when caller profile includes **agent** OR when the brief names agent/script callers.

| Gate | Question — answer must be NO |
| --- | --- |
| A01 | Does the binary claim to be agent-first (README, description) but lack `--json` on data-emitting commands? |
| A02 | Does stdout emit ANSI colour codes when stdout is not a TTY, without `--color always` explicitly set? OR is `NO_COLOR=1` not honoured? |
| A03 | Does the `--json` output schema differ between runs for the same input (non-deterministic keys, ordering, shape)? |
| A04 | Does help text list a flag that does not exist in the binary's source? |
| A05 | Does help text state a default that the binary doesn't honour when that flag is omitted? |
| A06 | Is a pluggable-backend surface present but `<tool> config` fails to list `available_backends`? |
| A07 | Does the tool silently fail over to an alternate backend when the requested one is unavailable, without notifying the caller via stderr or exit code? |
| A08 | Does `--background` return no handle ID, leaving the caller unable to poll or cancel? |
| A09 | Were async operation state names renamed between versions without a deprecation cycle? |
| A10 | Does a streaming NDJSON command mix human-readable lines with JSON objects in the same stream? |

Quick smoke list for agentic CLI (verifiable without source):

```bash
# Outputs JSON?
tool search "test" --json | jq type

# NO_COLOR honoured?
NO_COLOR=1 tool search "test" | grep $'\e'   # should emit nothing

# Config introspectable?
tool config --json | jq '.available_backends'

# Exit code not 0 for error?
tool search --limit -1; echo "exit: $?"   # expect exit 2

# --help flag in help matches binary?
tool search --max-chars 10 "test"   # should not error if --max-chars listed in help
```

---

## REST (R01–R15)

| Gate | Question — answer must be NO |
| --- | --- |
| R01 | Does OpenAPI omit routes that exist in the router? |
| R02 | Are validation errors missing field paths (`body.items[2].amount`)? |
| R03 | Is every resource CRUD when the brief wasn't CRUD? |
| R04 | Do `operationId` values change between OpenAPI generations (non-deterministic)? |
| R05 | Are `X-RateLimit-*` headers present without an implemented rate limiter? |
| R06 | Does any 202 response lack a `Location` header or `status_url` in the body? |
| R07 | Is a 500 returned for a resource-not-found condition? |
| R08 | Is a 4xx returned for a server-side bug (e.g., unhandled exception in business logic)? |
| R09 | Is pagination undocumented or absent on list endpoints that can exceed one page? |
| R10 | Does the same service return different error shapes from different handlers? |
| R11 | Is the `request_id` missing from error responses? |
| R12 | Does the OpenAPI `info.version` disagree with the `/version` endpoint? |
| R13 | Are `deprecated: true` fields present in OpenAPI without a removal version/date? |
| R14 | Does any route return stack traces or internal Go/Rust/Python module paths in the response body? |
| R15 | Is any handler missing middleware (request ID, logging, auth) that other handlers carry? |

---

## gRPC (G01–G15)

| Gate | Question — answer must be NO |
| --- | --- |
| G01 | Does proto disagree with the registered service (handler exists but not in proto, or proto service has no handler)? |
| G02 | Are `NOT_FOUND` and `INVALID_ARGUMENT` used interchangeably? |
| G03 | Is there no documented rich error detail type (`google.rpc.ErrorInfo` or equivalent)? |
| G04 | Do RPC names encode HTTP verbs only (`GetCreate`, `PostInvoice`)? |
| G05 | Is a long-running operation implemented without `google.longrunning.Operation` or a documented equivalent? |
| G06 | Is cancellation undocumented for long unary RPCs (expected > 5s)? |
| G07 | Does `Check` in the health service always return `SERVING` with no actual dependency checks? |
| G08 | Are proto field numbers reused after a field was deleted in a prior version? |
| G09 | Is the gRPC reflection service unregistered (agents/operators can't introspect the schema)? |
| G10 | Are retry policies missing from the service config / proto options? |
| G11 | Does the proto file lack a `go_package` / `java_package` (or equivalent language option) declaration? |
| G12 | Is `INTERNAL` returned for expected business logic errors (locked, not found, validation)? |
| G13 | Are status codes inconsistent across methods for the same semantic failure (one method returns `NOT_FOUND`, another returns `INVALID_ARGUMENT` for the same missing-resource case)? |
| G14 | Is the service missing shutdown logic that drains in-flight RPCs before stopping? |
| G15 | Does the proto lack `option (google.api.http)` annotations when REST transcoding is in scope? |

---

## Structural (S01–S15)

Run this block when the structural axis was in scope (pre-flight surfaced structural signals, or structure-scope fork selected). Also run for tool-scope and service-scope audits.

| Gate | Question — answer must be NO |
| --- | --- |
| S01 | Is the repo layout mixed (some directories feature-first, some layer-first) without a documented rule in `anvil.md`? |
| S02 | Does a lower-layer package import a higher-layer package (e.g., `store` imports `api`)? |
| S03 | Does a feature package import another feature package's internal symbols without a documented contract? |
| S04 | Is there an import cycle? |
| S05 | Does `pkg/` contain feature code (domain logic, business rules, service-specific adapters)? |
| S06 | Is there a redundant intermediate directory that carries no grouping value (`internal/feature/<name>/` when `internal/<name>/` would suffice)? |
| S07 | Is there a bucket package (`util`, `utils`, `common`, `helpers`, `lib`, `shared`, `misc`, `base`) with >5 unrelated exports? |
| S08 | Does dead-code count exceed the per-repo-size threshold? (≤10k LOC: 0 unused exports; 10–100k LOC: ≤5; >100k LOC: ≤15) |
| S09 | Do `TODO`/`FIXME`/`XXX`/`HACK` comments exist without owner and condition (date, ticket, version)? |
| S10 | Is a deprecated public symbol past its declared removal milestone still present? |
| S11 | Are there commented-out code blocks longer than 5 lines? |
| S12 | Are there "kept for reference" or "old impl" comments instead of deletions? |
| S13 | Does a shared package import a feature package? |
| S14 | Was a shared package extracted with fewer than 3 distinct-domain callers and not on the pre-approved list? |
| S15 | Did a shared package's export count grow by >50% between the last two audits (bucket drift)? |

---

## Caller profile overrides

**human-operator** profile: Stricter on exit codes (C05), operational endpoints (HEALTH-01 required), log cardinality. Looser on friendly empty-state messages.

**script** profile: Same as human-operator for exit codes. Stricter on stdout/stderr split and schema stability.

**agent** profile: All A-series gates active. Stricter on C11 (SilenceUsage required). Stricter on schema stability (A03). `config` introspection required.

**sdk-client** profile: Stricter on contract artifacts, error codes, and version/deprecation behavior.

**internal-admin** profile: Stack traces in error responses allowed only if behind authentication. Metrics optional. Exit codes stricter.

---

## Fix policy

- **P0** (user-facing wrong, security, wire break): fix before emitting. Do not hand back.
- **P1** (contract drift, schema inconsistency): fix before emitting. Do not hand back.
- **P2** (polish, documentation gaps, non-critical): note in preview; fix before `lock the surface`.

Update the slop row to reflect the actual outcome after fixes:

```markdown
- **Slop test** · U: 20/20 · C: 15/15 · A: 10/10 · R: 0/15 (n/a) · G: 0/15 (n/a) · S: 14/15 (S08 flagged 3 dead exports — sweep scheduled)
```
