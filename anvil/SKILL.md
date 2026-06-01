---
name: anvil
description: "Backend craft skill for language-agnostic CLIs, REST APIs, gRPC services, package APIs, and backend repo structure. Use when building, auditing, reshaping, or studying backend boundaries: command trees, HTTP/gRPC contracts, error envelopes, config precedence, operability hooks, package boundaries, dead code, shared-package shape, and agent/script-friendly tools. Not for browser UI, ORM schema design, business domain modeling, Kubernetes/Terraform, or frontend design."
version: 0.4.0
---

# Anvil

Read the named target boundary before proposing any change. Capture evidence with file and command citations: help output, routes, proto, exports, config, imports. Never design from intuition.

## Glossary

Use only these terms in Anvil output.

| Term | Meaning |
| --- | --- |
| boundary | The observable edge being changed or preserved. |
| target | The named CLI, service, package, command, handler group, or structure unit. |
| scope | One of command, tool, service, package, structure. |
| caller profile | One of human-operator, script, agent, sdk-client, internal-admin. |
| risk class | One of R0, R1, R2, R3, R4, R5. |
| contract | A public observable: flag, route, RPC, field, exit code, env var, export, error code, log key. |
| ledger | The contract ledger. |
| obligation | A runtime, compatibility, operability, or caller guarantee implied by the boundary. |
| gate | A binary check that must pass before handoff. |
| evidence level | One of observed, derived, stated, absent. |

---

## How to use this skill

- Default: build or change one backend target. Follow the Backend flow.
- `anvil audit <target>`: read-only audit. Do not edit. Read references/verbs/audit.md.
- `anvil reshape <target> [--sweep] [--layout <family>] [--slim <pkg>]`: keep domain intent and shipped contracts. Read references/verbs/reshape.md.
- `anvil study <source>`: extract backend DNA from source, README, OpenAPI, proto, `--help`, or installed binary. Read references/verbs/study.md.

One run = one target boundary unless the user names multiple targets. In monorepos, prefer the smallest deployable or importable unit that matches the request.

---

## Non-negotiable disciplines

1. **Evidence before taste.** Capture what exists before changing it, cite files and commands, and mark missing signals as evidence level absent.
2. **Contracts are durable.** Flags, routes, RPCs, response fields, exit codes, log keys, env vars, package exports, and error codes are public once callers can observe them.
3. **No fabricated backend facts.** Do not invent SLAs, quotas, rate-limit headers, retry policy, pagination, metrics, auth behavior, or config defaults.
4. **Boundary obligations are explicit.** Long work needs cancellation and timeouts, services need health and shutdown, agent tools need stable machine output, and package APIs need export discipline.

---

## Gold decision trace

```text
Request: Add machine-readable output to cmd/search for agent callers.

Boundary inventory:
· Target: cmd/search (cli, Go/cobra)
· Scope: tool
· Evidence: `go run ./cmd/search --help` shows search/show/index/version commands; cmd/search/root.go defines SEARCH_ env prefix; cmd/search/search.go has text output only; no exit-code table found in README.md.
· Preserve: cobra, SEARCH_ prefix, text default, flat cmd package, internal/index and internal/backends.
· Investigate: exit codes and cancellation for index.

Risk class: R1, additive public flag and JSON fields.
Caller profile: agent, script.
Surface pattern: Verb-surface CLI, from existing search/show/index verbs in `go run ./cmd/search --help`.
Ledger:
surface | change | risk | compatibility | artifact | verification
CLI flag --json | add | R1 | additive, text remains default | cmd/search/search.go | help smoke + jq type
JSON keys query/results/count | add | R1 | new machine contract | README.md | fixture comparison
Obligations: stdout JSON only under --json, diagnostics on stderr, stable keys, bounded output, exit-code table deferred until codes are inventoried.
File plan: modify cmd/search/search.go and README.md. No deletes.
Verification: go test ./...; go run ./cmd/search --help; go run ./cmd/search search test --json | jq type.
Handoff: report contracts added, contracts preserved, verification results, deferred exit-code obligation.
```

---

## Scope fork

Resolve scope before asking broad questions.

- command: one CLI subcommand, one handler, <=3 RPCs. Concern: local ergonomics and compatibility. Skip full target convention rewrite.
- tool: whole CLI binary. Concern: command tree, output formats, exit codes, config, completions. Skip REST/gRPC contract emit.
- service: one HTTP or gRPC deployable. Concern: API/RPC contract, errors, middleware, health, shutdown. Skip sibling services.
- package: importable library/shared package. Concern: public exports, dependency direction, versioning. Skip runtime operability unless package owns it.
- structure: repo layout, dead-code sweep, shared-package slim. Concern: imports, package boundaries, deletion plan. Skip caller profile and surface pattern picks.

Ambiguous request: ask once, tersely. Example: "One handler group or the whole service?" If the user does not answer, choose the smallest scope that can satisfy the request.

---

## Backend flow

### 0. Boundary inventory

Read the named target before asking design questions. Prefer commands that produce evidence over intuition. Read references/evidence.md.

Collect target kind, language/framework, public contracts, runtime obligations, structure, and existing convention source.

Emit a compact findings block with citations:

```text
Boundary inventory:
· Target: cmd/search (cli, Go/cobra)
· Scope: tool
· Public contracts: 8 commands from `go run ./cmd/search --help`; SEARCH_ env prefix in cmd/search/root.go; exit-code table absent in README.md
· Output: text default, --json on search/show, progress on stderr
· Structure: flat cmd package + internal/index and internal/backends; no util bucket
· Obligations: --version present; cancellation absent for index

Preserve: cobra, SEARCH_ prefix, text+json output, flat layout.
Investigate: exit codes, cancellation, backend fallback, conventions artifact.
```

If `anvil.md` exists, read it as convention data. It makes consistency the default.

### 1. Classify risk

Before proposing a change, classify the work. Read references/risk-classes.md when the change touches shipped contracts or deletions.

| Class | Meaning | Rule |
| --- | --- | --- |
| R0 | Additive internal: private helper, tests, docs, local refactor | Normal edit + tests |
| R1 | Additive public: new flag, route, RPC, export, log key | Document in ledger |
| R2 | Compatible behavior change: same wire, different behavior/default/perf | Explain caller impact + verify |
| R3 | Deprecation: old public surface remains but new one is introduced | Deprecation notice + removal milestone |
| R4 | Breaking/removal: public surface removed, renamed, or retyped | Stop for explicit approval unless user already requested it |
| R5 | Destructive structural: package moves, file deletion, dead-code removal | Written plan + proof + approval + verification |

Situation to risk class:

- Private helper, test, doc, local refactor -> R0
- New shipped flag, route, RPC, export, field, log key -> R1
- Changed default, output ordering, retry behavior, performance envelope -> R2
- Replacement while old contract remains -> R3
- Removed or renamed shipped flag, route, RPC, field, env var, export -> R4
- Source deletion, package move, dead-code sweep, import rewrite -> R5

Backend quality depends on change risk, not novelty.

### 2. Identify caller profile

Caller profile names who depends on the boundary. Pick only what affects behavior.

| Caller profile | Optimize for | Required checks |
| --- | --- | --- |
| human-operator | Help text, safety, readable errors, recovery | stderr/stdout split, exit codes, examples |
| script | Stable output, deterministic exit/status | `--json`/machine format, no prompts, no ANSI in pipes |
| agent | Token-bounded introspection and schemas | `--json`, `--minimal`/limits, config introspection, stable keys |
| sdk-client | Typed contracts and compatibility | OpenAPI/proto/package docs, versioning, error map |
| internal-admin | Dense workflows behind trust boundary | audit logs, auth assumptions, explicit danger flags |

A target can have multiple caller profiles. Load guidance only when behavior choices need it: human-operator reads references/genres/operator.md; script reads references/genres/utilitarian.md; agent reads references/genres/agentic.md; sdk-client reads references/genres/productized.md; internal-admin reads references/genres/internal-admin.md.

Ask once if the caller profile is unclear:

> Before I shape this backend boundary: who is the primary caller: human operator, script, agent, SDK client, or internal admin? Or say "go ahead" and I will infer from the target.

Structure scope skips this question.

### 3. State surface pattern once from evidence

Do not generate candidate command-tree or API shapes and select among them. Read the evidence, name the one honest shape, and proceed.

| Kind | Read | Load |
| --- | --- | --- |
| CLI | references/cli-macrostructures.md | One matching `references/cli-macrostructures/<slug>.md` if it exists |
| REST | references/api-macrostructures.md | One matching `references/api-macrostructures/<slug>.md` if it exists |
| gRPC | references/grpc-macrostructures.md | One matching `references/grpc-macrostructures/<slug>.md` if it exists |

If the deep file is absent, use the index row as the contract and continue. Do not fail or load unrelated files.

Do not default to generic patterns: generic-root-run, CRUD-five, resource-CRUD RPCs. This is not permission to explore alternatives. If evidence says the shape is verb-surface, emit verb-surface.

Within an established target or convention, converge and stay coherent. The "differ from the last 3" rule in macrostructure references applies only to genuinely new, unrelated targets.

Before writing code, commit the pick in plain text: `Surface pattern: <name>, from <evidence>`.

For structure scope, skip surface patterns. Read references/repo-layout.md. Read references/shared-packages.md when shared or bucket packages are present. Read references/dead-code.md for sweeps or unused-symbol findings.

### 4. Build the ledger

Before editing, list public contract changes. Read references/contract-ledger.md.

Ledger columns:

```text
surface | change | risk | compatibility | artifact | verification
```

Examples:

- `CLI flag --backend | preserve | R0 | same spelling/default | conventions.yaml | help smoke`
- `HTTP POST /v1/search | add | R1 | additive route | openapi.yaml | route list + contract test`
- `pkg Parser.Parse | deprecate | R3 | old symbol remains until v2 | anvil.md | compile downstream sample`

If no public contract changes exist, say so.

### 5. Select obligations

Obligations are the minimum runtime and caller guarantees implied by the boundary. Read references/obligations.md when building or changing tool scope or service scope targets.

Typical obligations: CLI `--version`, exit-code table, stdout/stderr split, no prompts, completion, config introspection; REST OpenAPI sync, stable error envelope, request ID, health/readiness, graceful shutdown, pagination/idempotency when applicable; gRPC proto sync, reflection, health service, rich status mapping, cancellation, package options; package API export list, semver/deprecation notes, no feature-package imports, examples/tests; structure layout rule, import direction, sweep report, move plan, rollback/check commands.

State obligations before editing. If an obligation is deferred, label it and explain why.

### 6. File plan and implementation

Before editing, state exact files expected to change:

```text
Modify: cmd/search/root.go, internal/search/handler.go
Create: conventions.yaml, .anvil/log.json
No deletes.
```

For deletions or moves, stop for confirmation unless the user has already approved the specific file-level plan.

Build with the local stack and existing patterns. Keep domain logic minimal unless the user asked for it. Prefer narrow adapters at boundaries and stable internal APIs.

Stamps:

```go
// Anvil · target: cmd/search · kind: cli · scope: tool
// caller profile: script,agent · surface pattern: Verb-surface CLI · risk class: R1
// contracts: conventions.yaml · obligations: version,exit-codes,json,minimal,config
```

For structure scope, stamps live in `.anvil/log.json` / `.anvil/sweep-report.md`, not arbitrary source comments.

Append `.anvil/log.json` with newest-first entries. Record target, kind, scope, caller profile, risk class, surface pattern, obligations, and brief. Trim to 20 entries.

### 7. Verification

Read references/verification.md, then run relevant checks. Prefer evidence commands the user can repeat.

Minimum matrix:

```text
check | command/evidence | result | notes
```

Examples: CLI help matches source, JSON clean with `jq type`, REST router list vs `openapi.yaml`, gRPC proto service vs registered server, package tests or downstream sample, structure import graph and dead-code tool.

Read references/slop-test.md at the end only. Run universal + kind-specific + structural + agentic gates as applicable. Fix P0/P1 before handoff. List unresolved P2 with reason.

### 8. Binary gates

Verify these gates against the output: evidence-cited, contract-ledger-complete, risk-classified, obligations-stated-or-deferred, no-fabricated-facts, verification-runnable.

Any no triggers the fix loop: fix the cause, re-run that gate, confirm yes, then continue. These gates are distinct from references/benchmark-rubric.md, a human-run 1-5 output-quality instrument. Do not convert the rubric to binary. Do not convert these gates to 1-5.

### 9. Handoff

Read references/contract.md once at handoff.

Final response includes:

- What changed
- Public contracts added, preserved, deprecated, or removed
- Verification commands and result
- Deferred obligations or residual risk
- Gate results if any gate required a fix loop

Do not bury contract changes under implementation chatter.

---

## BAD/GOOD contrasts

**BAD:** Invent `X-RateLimit-Remaining`, default timeout `30s`, or a 99.9% SLA because the API feels production-grade.
**GOOD:** Mark the evidence level absent, omit the claim, or write an explicit placeholder for the owner to fill.

**BAD:** Add root `run`, CRUD-five routes, or resource-CRUD RPCs when the evidence shows task verbs.
**GOOD:** State `Surface pattern: verb-surface, from <evidence>` and implement the verb-surface.

**BAD:** Remove `--format`, rename JSON field `items` to `results`, or retype an RPC field without deprecation.
**GOOD:** Classify as R4, stop for approval, or keep the old contract with an R3 deprecation path.

---

## Convention artifacts

Anvil emits or maintains convention artifacts when the scope warrants it: tool scope CLI `conventions.yaml`; REST service `openapi.yaml` or existing OpenAPI file; gRPC service `.proto` file and status map; package API export/API table in `anvil.md` or package docs; structure scope `.anvil/sweep-report.md` and layout rule in `anvil.md`.

`anvil.md` is opt-in via "lock the surface", "give me anvil.md", or "make conventions portable". Read references/anvil-md.md. Once present, consistency wins.

---

## Reference loading rules

Keep SKILL.md lean. Always load before proceeding when a path is listed in the active tier.

Always-load: Read references/evidence.md, references/contract-ledger.md, references/verification.md.

Load-when-applies:

- Public or deletion change: Read references/risk-classes.md
- Tool scope or service scope obligation choices: Read references/obligations.md
- CLI: Read references/cli-conventions.md. Read references/completion.md when completions change.
- REST: Read references/rest-conventions.md and references/openapi.md. Read references/middleware.md when middleware changes.
- gRPC: Read references/grpc-conventions.md and references/grpc-proto.md
- Errors: Read references/errors.md when changing error behavior
- Config: Read references/config.md when changing flags, env vars, files, or defaults
- Operability: Read references/operability.md for runtime services or long-running CLIs
- Structure: Read references/repo-layout.md, references/dead-code.md, references/shared-packages.md as applicable
- Anti-patterns: Read references/anti-patterns.md before building. Read references/slop-test.md after building.
- Contract handoff: Read references/contract.md once at handoff.

Never-load: references/philosophy.md, human-only; examples/, human-only.

Index: [references/benchmark-rubric.md](references/benchmark-rubric.md), human-run 1-5 output-quality instrument; [references/philosophy.md](references/philosophy.md), human-only philosophy and old core-loop diagram; [examples/](examples/), human-only worked examples.

---

## v1 limits

In scope: CLI, REST, gRPC, package APIs, repo structure, contract artifacts, verification matrices, single-target monorepo work, approved sweeps, agent/script-friendly backend tools. Deferred: TUI, GraphQL, desktop GUI shells, full codegen unless already present, cross-repo migrations, unapproved deletion, browser UI, frontend design, ORM schema design.
