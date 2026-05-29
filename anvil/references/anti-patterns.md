# Anti-patterns

Named tells Anvil must not emit or approve. Used during generation (pre-emit) and audit (`verbs/audit.md`). Every pattern here maps to ≥1 slop gate.

---

## CLI surface

| Tell | Gate | Why |
| --- | --- | --- |
| **Root-only `run`** | C01 | Hides real verbs; every LLM CLI defaults here |
| **Mystery flags** (`-f`, `-d`, `-x` with no description) | C02 | Operators can't script what they can't decode |
| **Logs to stdout** | C03 | Breaks pipes; stdout must be result-only |
| **Undocumented config precedence** | C04 | Env overrides flags silently; operators debug for hours |
| **Exit 1 for everything** | C05 | Scripts can't branch on failure class |
| **Help text lies** | C06 | Default in help ≠ code default; operators trust help |
| **Invented sample values** | C07 | `sk_live_xxx`, fake account IDs in examples — look like real secrets |
| **`--flag=true` / `--flag=false` as primary UX** | C08 | Flags are on/off; use `--flag` / `--no-flag` |
| **Interactive prompt on the default path** | C09 | Blocks unattended runs; use `--yes` / `--force` for destructive ops |
| **Different flag names for the same concept across commands** | C10 | `--project` in one command, `--project-id` in another |

---

## Agentic surface

| Tell | Gate | Why |
| --- | --- | --- |
| **Claims agent-first, no `--json`** | A01 | README says "for AI agents" but output is human-only |
| **ANSI colour on non-TTY stdout** | A02 | Agents get escape codes they can't parse; breaks pipelines |
| **`NO_COLOR=1` not honoured** | A02 | Same; plus a community contract violation |
| **JSON schema drifts between runs** | A03 | Agents memorise schemas; field renames are silent breaking changes |
| **Help text lists a flag that doesn't exist in code** | A04 | Agents call the flag; get an error; give up |
| **Help text default ≠ code default** | A05 | Agents pass `--limit 5` explicitly only to hit a different default |
| **`config` output omits `available_backends`** | A06 | Agents can't discover capability; must read docs |
| **Silent fail-over to alternate backend** | A07 | Cost / latency / capability changes without the caller knowing |
| **`--background` returns nothing** | A08 | Agent has no handle; can't poll or cancel |
| **Async state names renamed across versions** | A09 | Every poller breaks silently on upgrade |
| **NDJSON mixed with human-readable lines** | A10 | Agent can't parse the stream |

---

## REST surface

| Tell | Gate | Why |
| --- | --- | --- |
| **CRUD-five for non-resources** | R01 | Verb bias when the domain isn't naturally CRUD |
| **Wrapper soup** (`{"data": {"data": …}}`) | R02 | Nested accident; no reason for the extra level |
| **Anonymous 400** (`{"error":"bad request"}`) | R03 | No field paths, no stable code; callers can't act |
| **OpenAPI drift** (spec ≠ live routes) | R04 | OpenAPI is a contract; divergence means broken client SDKs |
| **Invented rate limits** | R05 | `X-RateLimit-*` headers not backed by a limiter; lies to callers |
| **202 without a status URL** | R06 | Async pattern half-done; caller can't follow up |
| **`500` for not-found** | R07 | Misleads monitoring; operator wakes up for a 404 |
| **`4xx` for server bugs** | R08 | Client retries something the server should fix |
| **Undocumented pagination** | R09 | Callers don't know how to page; get partial results |
| **Different error shapes from the same service** | R10 | Two error formats → two parsers for every client |

---

## gRPC surface

| Tell | Gate | Why |
| --- | --- | --- |
| **RPC names mirror REST 1:1** (`CreateGetUser`) | G01 | Wrong abstraction; gRPC verbs should be domain actions |
| **String-only errors** | G02 | Business meaning only in `Message()` text; unstable |
| **`NOT_FOUND` and `INVALID_ARGUMENT` interchangeable** | G03 | Different semantics; different retry policies |
| **No documented rich error detail type** | G04 | Callers can't branch on error class |
| **gRPC LRO without `google.longrunning.Operation`** | G05 | Custom half-baked alternatives — same problem, no standard tooling |
| **Missing cancellation docs for long unary** | G06 | Long ops block without a deadline; operators can't intervene |
| **`Check` always `SERVING` with no dep checks** | G07 | Health is a lie; readiness probes pass through partial outages |
| **Casual proto field reuse** | G08 | Reusing field numbers after deletion breaks binary clients |

---

## Structural (repo / package)

| Tell | Gate | Why |
| --- | --- | --- |
| **Mixed layout without a rule** | S01 | Half feature-first, half layer-first; no one knows where new code goes |
| **Reverse import (lower layer → higher)** | S02 | `store` importing `api` inverts the dependency graph |
| **Cross-feature import without documented contract** | S03 | `billing` reaching into `auth.internal` — invisible coupling |
| **Import cycle** | S04 | Prevents compilation in most languages |
| **`pkg/` carrying feature code** | S05 | `pkg/` is a layer designation, not a feature home |
| **Redundant intermediate directory** (`internal/feature/<name>/`) | S06 | The word "feature" adds nothing; use `internal/<name>/` |
| **Bucket package** (`util`, `common`, `helpers`, etc.) | S07 | Dumping ground; names nothing, organises nothing |
| **Dead-code above threshold** | S08 | Unused exports accumulate; reviewers stop flagging |
| **TODOs without owner + condition** | S09 | Anonymous TODOs rot; no one knows if they're still valid |
| **Deprecated symbol past removal milestone** | S10 | Once the milestone passes, the symbol is dead code |
| **Commented-out code block >5 lines** | S11 | Git remembers; comments rot |
| **"Kept for reference" comments** | S12 | Same as S11 |
| **Shared package importing feature package** | S13 | Inverts dependency direction |
| **Package extracted with <3 callers** | S14 | Premature abstraction; wait for the third user |
| **Shared package grew >50% in exports between audits** | S15 | Bucket drift — scope creep catching all the singletons |

---

## Wire breaks

Anvil's "never break the wire silently" discipline. These are the patterns that violate it:

| Tell | Why |
| --- | --- |
| **Flag removed without deprecation cycle** | Agents and scripts that pass the flag break silently (or loudly, which is worse in unattended runs) |
| **Exit code changed** | Scripts branching on exit code get wrong behaviour |
| **JSON field renamed in `--json` output** | Agent code breaks; schema drift without a major version |
| **Env var renamed without alias** | Operator's deployment config stops working |
| **Error code renamed** | Callers matching on `code: "OLD_CODE"` never get their branch |
| **gRPC proto field reuse** | Binary clients get garbled messages |
| **REST route removed without 301 or deprecation header** | Client SDKs get 404 with no path forward |
| **`conventions.yaml` removed from a CI build** | Agents reading it from a known path get file-not-found |

**Deprecation pattern** for flags, endpoints, exit codes:

```
# CLI flag deprecation (cobra)
rootCmd.PersistentFlags().MarkDeprecated("old-flag", "use --new-flag instead; removed in v3.0")

# HTTP endpoint deprecation header
Deprecation: Sat, 01 Jun 2026 00:00:00 GMT
Sunset: Sat, 01 Jan 2027 00:00:00 GMT
Link: </v2/invoices>; rel="successor-version"

# Error code deprecation — add to conventions.yaml
codes:
  - code: LEGACY_CODE
    deprecated: true
    deprecated_since: "v2.1"
    removed_in: "v3.0"
    use_instead: NEW_CODE
```

---

## Universal

| Tell | Gate | Why |
| --- | --- | --- |
| **Invented SLAs** | U01 | "99.99% uptime" without basis; misleads operators |
| **Help / spec disagrees with code default** | U02 | Operators trust docs; drift causes silent bugs |
| **Secret-shaped placeholders** | U03 | `sk_live_xxx` in examples looks real |
| **One exit/status path for distinct failure classes** | U04 | Scripts can't distinguish "not found" from "network error" |
| **Rate-limit headers without implementation** | U05 | Invented contract; clients back off for no reason |
| **Inconsistent log keys** | U06 | Same field under different names in different handlers |
| **Cancellation undocumented for long ops** | U07 | Callers don't know how to interrupt |
| **Wholesale copy of sibling service tree** | U08 | Identical structures diverge silently |
| **Non-actionable error messages** | U09 | "Error", "failed", "something went wrong" |
| **Stamp missing / log.json not appended** | U10 | Diversification breaks on next run |
| **Backend-specific flag bleeds into wrong backend** | U11 | `--searxng-url` flag active when `--backend=brave` |
| **202 without status URL** | U12 | (REST-specific alias of R06 — listed here for slop-test cross-reference) |
