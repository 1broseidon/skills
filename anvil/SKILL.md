---
name: anvil
description: "Backend craft skill for language-agnostic CLIs, REST APIs, gRPC services, package APIs, and backend repo structure. Use when building, auditing, reshaping, or studying backend surfaces: command trees, HTTP/gRPC contracts, error envelopes, config precedence, operability hooks, package boundaries, dead code, shared-package shape, and agent/script-friendly tools. Not for browser UI, ORM schema design, business domain modeling, Kubernetes/Terraform, or frontend design."
version: 0.3.0
---

# Anvil

Anvil makes backend systems feel **forged**, not generated.

Backend craft has its own physics: wire contracts survive releases, import graphs calcify, error codes become API, and the best design is often boring because callers depend on it. Anvil therefore optimizes for **boundary clarity, contract honesty, operational obligations, structural coherence, and evidence-backed verification**.

Core loop:

```text
Boundary -> Risk Class -> Evidence Pack -> Contract Ledger -> Obligations -> Implementation Plan -> Verification Matrix
```

If a step does not fit that loop, cut it or move it to a boundary-specific reference.

---

## How to use this skill

| Invocation | What it does |
| --- | --- |
| *(default)* | Build or change one backend target: CLI, REST service, gRPC service, package API, or repo structure. Follow the **Backend flow**. |
| `anvil audit <target>` | Read-only audit. Score surface and structure with evidence. Do not edit. Load [`references/verbs/audit.md`](references/verbs/audit.md). |
| `anvil reshape <target> [--sweep] [--layout <family>] [--slim <pkg>]` | Keep domain intent and shipped contracts; reshape the surface or structure inside existing boundaries. Load [`references/verbs/reshape.md`](references/verbs/reshape.md). |
| `anvil study <source>` | Extract backend DNA from source, README, OpenAPI, proto, `--help`, or installed binary. Diagnosis first; optional build or `anvil.md`. Load [`references/verbs/study.md`](references/verbs/study.md). |

One run = **one target boundary** unless the user explicitly names multiple targets. In monorepos, prefer the smallest deployable/importable unit that matches the request.

---

## Non-negotiable disciplines

1. **Evidence before taste.** Capture what exists before changing it: help output, route list, proto service, package exports, config envs, import direction, dead-code tool output, or absence of those signals. Cite files and commands.

2. **Contracts are durable.** Flags, routes, RPCs, response fields, exit codes, log keys, env vars, package exports, and error codes are public once callers can observe them. Reshape deprecates before removing.

3. **No fabricated backend facts.** Do not invent SLAs, quotas, rate-limit headers, retry policy, pagination, metrics, auth behavior, or config defaults. Use real code, explicit placeholders, or omit.

4. **Coherence beats variety.** Unlike UI pages, backend siblings should often look alike. Diversification only prevents lazy generic defaults on new unrelated targets; it never overrides an established service convention.

5. **Boundary obligations are explicit.** Long work needs cancellation/timeouts. Services need health/shutdown/version behavior. Agentic tools need stable machine output. Package APIs need export discipline.

6. **Deletion requires proof and consent.** Dead-code sweeps produce a report and wait for approval before deleting source files, exported symbols, route trees, proto services, or packages.

7. **Pre-emit self-critique.** Score 1-5 on: Intent, Boundary, Contracts, Errors, Operability, Structure, Verification. Anything <3 triggers a revision pass. Stamp form: `// Anvil · critique: I5 B4 C5 Err4 O5 S4 V5`.

---

## Scope fork

Resolve scope before asking broad questions.

| Scope | Signals | Main concern | Skips |
| --- | --- | --- | --- |
| **Command-scope** | One CLI subcommand, one handler, <=3 RPCs | Local ergonomics and compatibility | Full target convention rewrite |
| **Tool-scope** | Whole CLI binary | Command tree, output formats, exit codes, config, completions | REST/gRPC contract emit |
| **Service-scope** | One HTTP or gRPC deployable | API/RPC contract, errors, middleware, health, shutdown | Sibling services |
| **Package-scope** | Importable library/shared package | Public exports, dependency direction, versioning | Runtime operability unless package owns it |
| **Structure-scope** | Repo layout, dead-code sweep, shared-package slim | Imports, package boundaries, deletion plan | Caller-profile and surface-pattern picks |

Ambiguous request: ask once, tersely. Example: *"One handler group or the whole service?"* If the user does not answer, choose the smallest scope that can satisfy the request.

Deferred v2: TUI shells, GraphQL, desktop GUI shells, cross-repo migrations, full Kubernetes/Terraform/CI design.

---

## Backend flow

### 0. Boundary inventory

Read the named target before asking design questions. Prefer commands that produce evidence over intuition.

Load [`references/evidence.md`](references/evidence.md) for evidence sources and safe commands.

Collect what applies:

- **Target kind:** `cli`, `rest`, `grpc`, `package`, `structure`
- **Language/framework:** cobra/clap/click/argparse, chi/gin/axum/FastAPI/Spring, grpc-go/tonic/grpc-java, package manager/module layout
- **Public contracts:** flags, env vars, routes, OpenAPI, proto, package exports, exit codes, log keys, JSON fields
- **Runtime obligations:** health, readiness, shutdown, timeouts, cancellation, request IDs, version
- **Structure:** layout family, shared packages, bucket packages, import direction, generated code, dead-code signals
- **Existing convention source:** `anvil.md`, `conventions.yaml`, OpenAPI/proto, README contract tables, Anvil stamps

Emit a compact findings block with citations:

```text
Boundary inventory:
· Target: cmd/search (cli, Go/cobra)
· Public contracts: 8 commands from live --help; SEARCH_ env prefix; no exit-code table
· Output: text default, --json on search/show, progress on stderr
· Structure: flat cmd package + internal/index and internal/backends; no util bucket
· Operability: --version present; cancellation not documented for index

Preserve: cobra, SEARCH_ prefix, text+json output, flat layout.
Investigate: exit codes, cancellation, backend fallback, conventions artifact.
```

If `anvil.md` exists, read it as convention data only. It overrides rotation and makes consistency the default.

### 1. Classify risk

Before proposing a change, classify the work. Load [`references/risk-classes.md`](references/risk-classes.md) when the change touches shipped surfaces or deletions.

| Class | Meaning | Rule |
| --- | --- | --- |
| **R0 additive internal** | Private helper, tests, docs, local refactor | Normal edit + tests |
| **R1 additive public** | New flag/route/RPC/export/log key | Document in contract ledger |
| **R2 compatible behavior change** | Same wire, different behavior/default/perf | Explain caller impact + verify |
| **R3 deprecation** | Old public surface remains but new one introduced | Deprecation notice + removal milestone |
| **R4 breaking/removal** | Public surface removed/renamed/retyped | Stop for explicit approval unless user already requested it |
| **R5 destructive structural** | Package moves/deletions/dead-code removal | Written plan + approval + verification |

Backend quality depends on change risk, not novelty.

### 2. Identify caller profile

Caller profile names who depends on the boundary. Pick only what affects behavior.

| Profile | Optimize for | Required checks |
| --- | --- | --- |
| **human-operator** | Help text, safety, readable errors, recovery | stderr/stdout split, exit codes, examples |
| **script** | Stable output, deterministic exit/status | `--json`/machine format, no prompts, no ANSI in pipes |
| **agent** | Token-bounded introspection and schemas | `--json`, `--minimal`/limits, config introspection, stable keys |
| **sdk-client** | Typed contracts and compatibility | OpenAPI/proto/package docs, versioning, error map |
| **internal-admin** | Dense workflows behind trust boundary | audit logs, auth assumptions, explicit danger flags |

A target can have multiple caller profiles. Load profile guidance only when behavior choices need it:

- `human-operator` -> [`references/genres/operator.md`](references/genres/operator.md)
- `script` -> [`references/genres/utilitarian.md`](references/genres/utilitarian.md)
- `agent` -> [`references/genres/agentic.md`](references/genres/agentic.md)
- `sdk-client` -> [`references/genres/productized.md`](references/genres/productized.md)
- `internal-admin` -> [`references/genres/internal-admin.md`](references/genres/internal-admin.md)

Ask once if the caller is unclear:

> *Before I shape this backend surface: who is the primary caller: human operator, script, agent, SDK client, or internal admin? Or say "go ahead" and I'll infer from the target.*

Structure-scope skips this question.

### 3. Choose surface pattern only after evidence

Surface patterns are still useful, but they are no longer the first move.

| Kind | Index | Load |
| --- | --- | --- |
| CLI | [`references/cli-macrostructures.md`](references/cli-macrostructures.md) | One matching `references/cli-macrostructures/<slug>.md` if it exists |
| REST | [`references/api-macrostructures.md`](references/api-macrostructures.md) | One matching `references/api-macrostructures/<slug>.md` if it exists |
| gRPC | [`references/grpc-macrostructures.md`](references/grpc-macrostructures.md) | One matching `references/grpc-macrostructures/<slug>.md` if it exists |

If the deep file is absent, use the index row as the contract and continue. Do not fail or load unrelated files.

Default away from generic patterns (`run` command, CRUD-five, resource CRUD RPCs) unless the evidence says that is the honest shape.

For structure-scope, skip surface patterns and load:

- [`references/repo-layout.md`](references/repo-layout.md)
- [`references/shared-packages.md`](references/shared-packages.md) when shared/bucket packages are present
- [`references/dead-code.md`](references/dead-code.md) for sweeps or unused-symbol findings

### 4. Build the contract ledger

Before editing, list the public contract changes. Load [`references/contract-ledger.md`](references/contract-ledger.md).

Ledger columns:

```text
surface | change | risk | compatibility | artifact | verification
```

Examples:

- `CLI flag --backend | preserve | R0 | same spelling/default | conventions.yaml | help smoke`
- `HTTP POST /v1/search | add | R1 | additive route | openapi.yaml | route list + contract test`
- `pkg Parser.Parse | deprecate | R3 | old symbol remains until v2 | anvil.md | compile downstream sample`

If no public contract changes exist, say so. That is useful information.

### 5. Select obligations

Obligations are not decoration; they are the minimum runtime and caller guarantees implied by the boundary.

Load [`references/obligations.md`](references/obligations.md) when building/changing tool-scope or service-scope targets.

Typical obligations:

- CLI: `--version`, exit-code table, stdout/stderr split, no prompts on default path, completion when requested, config introspection for agent/script tools
- REST: OpenAPI sync, problem details or stable error envelope, request ID, health/readiness, graceful shutdown, pagination/idempotency when applicable
- gRPC: proto sync, reflection, health service, rich status mapping, cancellation, package options
- Package API: export list, semver/deprecation notes, no feature-package imports, examples/tests for public symbols
- Structure: layout rule, import direction, sweep report, move plan, rollback/check commands

State obligations in the preview. If an obligation is deferred, label it and explain why.

### 6. Implementation plan

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
// Anvil · target: cmd/search · kind: cli · boundary: tool
// callers: script,agent · pattern: Verb-Surface · risk: R1
// contracts: conventions.yaml · obligations: version,exit-codes,json,minimal,config
```

For structure-scope, stamps live in `.anvil/log.json` / `.anvil/sweep-report.md`, not arbitrary source comments.

Append `.anvil/log.json` with newest-first entries. Record target, kind, boundary, caller profiles, risk classes, pattern, obligations, and brief. Trim to 20 entries.

### 7. Verification matrix

Load [`references/verification.md`](references/verification.md), then run the relevant checks. Prefer evidence commands the user can repeat.

Minimum matrix:

```text
check | command/evidence | result | notes
```

Examples:

- CLI help matches source: `tool --help`, `tool sub --help`
- JSON clean: `tool search test --json | jq type`
- REST contract sync: router list vs `openapi.yaml`
- gRPC contract sync: proto service vs registered server
- Package API: compile/test downstream sample or package tests
- Structure: import graph, dead-code tool, tests after moves

Load [`references/slop-test.md`](references/slop-test.md) at the end only. Run universal + kind-specific + structural + agentic gates as applicable. Fix P0/P1 before handoff; list unresolved P2 with reason.

### 8. Handoff

Load [`references/contract.md`](references/contract.md) once at handoff.

Final response includes:

- What changed
- Public contracts added/preserved/deprecated
- Verification commands and result
- Any deferred obligations or residual risk

Do not bury contract changes under implementation chatter.

---

## Convention artifacts

Anvil emits or maintains convention artifacts when the scope warrants it:

| Scope | Artifact |
| --- | --- |
| Tool-scope CLI | `conventions.yaml` |
| REST service | `openapi.yaml` or existing OpenAPI file |
| gRPC service | `.proto` file and status map |
| Package API | export/API table in `anvil.md` or package docs |
| Structure-scope | `.anvil/sweep-report.md`, layout rule in `anvil.md` |

`anvil.md` is opt-in via *lock the surface*, *give me anvil.md*, or *make conventions portable*. Load [`references/anvil-md.md`](references/anvil-md.md). Once present, consistency wins over variety.

---

## Reference loading rules

Keep `SKILL.md` lean and load only what matches the boundary.

Always consider:

- [`references/evidence.md`](references/evidence.md)
- [`references/risk-classes.md`](references/risk-classes.md) for public/deletion changes
- [`references/contract-ledger.md`](references/contract-ledger.md)
- [`references/verification.md`](references/verification.md)

Kind-specific:

- CLI: [`references/cli-conventions.md`](references/cli-conventions.md), optional [`references/completion.md`](references/completion.md)
- REST: [`references/rest-conventions.md`](references/rest-conventions.md), [`references/openapi.md`](references/openapi.md), optional [`references/middleware.md`](references/middleware.md)
- gRPC: [`references/grpc-conventions.md`](references/grpc-conventions.md), [`references/grpc-proto.md`](references/grpc-proto.md)
- Errors: [`references/errors.md`](references/errors.md) when changing error behavior
- Config: [`references/config.md`](references/config.md) when changing flags/env/files/defaults
- Operability: [`references/operability.md`](references/operability.md) for runtime services or long-running CLIs
- Structure: [`references/repo-layout.md`](references/repo-layout.md), [`references/dead-code.md`](references/dead-code.md), [`references/shared-packages.md`](references/shared-packages.md)
- Anti-patterns: [`references/anti-patterns.md`](references/anti-patterns.md) before building; [`references/slop-test.md`](references/slop-test.md) after building

Human-only examples live in [`examples/`](examples/). Do not auto-load them during normal runs.

---

## v1 limits

| In scope | Deferred |
| --- | --- |
| CLI, REST, gRPC, package APIs, repo structure | TUI, GraphQL, desktop GUI shells |
| Contract artifacts and verification matrices | Full codegen pipelines unless already present |
| Single-target monorepo work | Cross-repo/cross-module migrations |
| Dead-code reports and approved sweeps | Unapproved deletion |
| Agent/script-friendly backend tools | Browser UI, frontend design, ORM schema design |
