# Repo layout

How backend repos organise their source files. Anvil's stance: **detect the prevailing pattern, name it, and refuse to mix without a rule.** The worst layout is the half-and-half nobody decided.

This file covers Go, Rust, TypeScript/Node, Python, Java/Kotlin. The vocabulary is language-agnostic; the conventions cited are real and verifiable.

---

## The five families

### 1. Layer-first (by technical role)

Top-level directories carry **kind**, not **domain**.

```
.
├── cmd/             # binaries / entry points
├── internal/
│   ├── api/         # HTTP / gRPC handlers
│   ├── store/       # database access
│   ├── service/     # business logic
│   ├── worker/      # background jobs
│   └── config/      # configuration
├── pkg/             # exported helpers
└── api/             # protos, OpenAPI
```

**When it works:**
- Small to medium codebase, one bounded domain, single team
- The vocabulary of *kinds* is more stable than the vocabulary of *features*
- Cross-cutting tooling (one tracer, one logger, one DB driver) is shared across the whole app

**When it breaks:**
- Two features under the same `internal/api/` start importing each other's handlers indirectly
- The `internal/service/` directory bloats to 80 files with no internal grouping
- Two teams own different features but share every directory — merge conflicts everywhere

**Real-team examples:**
- **Kubernetes** core (`pkg/`, `cmd/`, `staging/`) — at scale with deep functional grouping inside each layer
- **HashiCorp Terraform** (`command/`, `internal/`, `builtin/`)
- **CockroachDB** (`pkg/sql/`, `pkg/kv/`, `pkg/server/`)
- **Most early-stage Go services** following the [`golang-standards/project-layout`](https://github.com/golang-standards/project-layout) shape (note: that repo is community, not official, and intentionally over-elaborate for most projects)

### 2. Feature-first (by domain)

Top-level directories carry **feature**, not **kind**. Inside each feature, the layers exist but are local.

```
.
├── cmd/
├── internal/
│   ├── billing/     # everything billing: api, store, service, worker
│   │   ├── api.go
│   │   ├── store.go
│   │   ├── service.go
│   │   └── worker.go
│   ├── auth/
│   ├── inventory/
│   └── notifications/
└── api/
```

**When it works:**
- Medium to large codebase with clear feature boundaries
- Multiple teams, each owning ≥1 feature
- Cross-feature imports are rare and intentional
- Feature lifecycles differ (some maturing, some experimental, some being retired)

**When it breaks:**
- A feature grows past ~30 files and needs internal layer structure (drift to hybrid)
- Two features genuinely share an aggregate root and the boundary becomes arbitrary
- Cross-feature imports get sloppy — `billing` reaches into `inventory.internal` because "we need just this one thing"

**Real-team examples:**
- **Django apps** — the canonical feature-first layout (`users/`, `payments/`, `inventory/` each is a Django "app" with `models.py`, `views.py`, `urls.py`)
- **Stripe** (publicly described in talks) — bounded-context root directories
- **Square Cash** — similar pattern
- **Most monorepos with many service teams** (`services/billing`, `services/auth`)

### 3. Hybrid (layer-then-feature, or feature-then-layer)

Two-axis layout. Pick one axis at the top, the other inside.

**Variant A — layer at top, feature inside:**

```
.
├── internal/
│   ├── api/
│   │   ├── billing/
│   │   ├── auth/
│   │   └── inventory/
│   ├── store/
│   │   ├── billing/
│   │   ├── auth/
│   │   └── inventory/
│   └── service/
│       ├── billing/
│       ├── auth/
│       └── inventory/
```

**Variant B — feature at top, layer inside:**

```
.
├── internal/
│   ├── billing/
│   │   ├── api/
│   │   ├── store/
│   │   └── service/
│   ├── auth/
│   │   └── …
│   └── inventory/
│       └── …
```

**When it works:**
- The codebase is large enough that one-axis layouts feel cramped
- One axis is stable, the other adds breathing room

**When it breaks:**
- The grid becomes mandatory — every feature has to have every layer even when most are empty
- Imports cross both axes (`internal/api/billing` imports `internal/service/auth`) and ownership gets messy
- Half the features adopt Variant A and half adopt Variant B — anvil's #1 most-flagged hybrid sin

**Real-team examples:**
- **gRPC service repos** with `proto/<service>/v1/` + `internal/<service>/` + `cmd/<service>/`
- **Apache Spark** (sort of) — packages by component, classes by role inside

### 4. Bounded-context (DDD)

A more rigorous feature-first. Each directory is an explicit **domain bounded context** with its own ubiquitous language, its own DB schema, its own API surface, and minimal cross-context interaction (only through documented contracts).

```
.
├── accounts/
│   ├── api/
│   ├── domain/      # aggregates, value objects, ports
│   ├── infrastructure/   # adapters
│   └── application/      # use cases
├── payments/
│   └── …
├── notifications/
│   └── …
└── shared-kernel/
    └── …
```

**When it works:**
- Genuinely complex domain with multiple bounded contexts (finance, healthcare, logistics)
- Team is DDD-fluent and the discipline holds
- Contexts have meaningfully different vocabularies that should NOT cross-pollinate

**When it breaks:**
- Applied to a CRUD app — the layers become ceremony
- "Shared kernel" turns into a bucket
- Teams aren't actually disciplined about context boundaries — same as Hybrid B with more vocabulary

**Real-team examples:**
- **Many Java/Kotlin enterprise codebases** at insurers, banks, healthcare
- **Some mature Stripe-/Square-tier codebases** (publicly described)
- **`eShopOnContainers`** (Microsoft's reference architecture)

### 5. Flat

Top-level is shallow; depth lives in named packages. Common in idiomatic Go, small Rust crates, single-purpose tools.

```
.
├── main.go
├── search.go
├── show.go
├── index.go
├── config.go
└── version.go
```

Or with a single `cmd/` subdirectory:

```
.
├── cmd/<tool>/main.go
├── search.go
├── show.go
└── …
```

**When it works:**
- Single binary, single domain, <30 files
- The tool's verbs *are* the domain (Verb-Surface CLIs like `cymbal`, `ketch`, `rg`)
- One person or a small team

**When it breaks:**
- File count exceeds ~50 and there's no internal grouping
- The flat list mixes concerns (parser, renderer, network, store, CLI plumbing all at the root)
- A second binary appears

**Real-team examples:**
- **ripgrep** — flat-ish with minimal sub-crate split
- **fd** — similar
- **cymbal** itself (~75 Go files in `cmd/` flat, with `index/`, `parser/`, `walker/`, `lang/` carved off when one concern grew)
- **`hugo`** (Go) — flat-ish with thematic packages

---

## Detection

Anvil's pre-flight scans for these signals:

| Signal | Implication |
| --- | --- |
| `internal/<role>/` (api, store, service, worker, handler, db, …) | Layer-first |
| `internal/<noun>/` (billing, auth, accounts, …) | Feature-first or Bounded-context |
| `internal/<role>/<noun>/` or `internal/<noun>/<role>/` | Hybrid |
| Files at repo root + `cmd/<tool>/main.go` | Flat |
| `services/<name>` at root | Monorepo with services (usually feature-first per service) |
| `apps/` + `packages/` (TS) | TS monorepo, often feature-first apps + layer-first packages |
| `<context>/domain/`, `<context>/application/`, `<context>/infrastructure/` | Bounded-context DDD |

Edge cases:

- A mix of `internal/api/`, `internal/store/`, `internal/billing/`, `internal/auth/` → **mixed without rule**. Flag in audit.
- A `pkg/` directory at root containing both helpers and feature code → drift; pkg is a layer designation, can't carry features.
- All features under `internal/feature/<name>/` (a single intermediate "feature" layer) → feature-first with redundant top dir; flag as polish.

---

## Anvil's stance — choosing for a new build

| Situation | Pick |
| --- | --- |
| ≤30 files, single binary, one domain | **Flat** |
| Medium project, one team, one bounded domain | **Layer-first** |
| Multiple bounded domains, one team | **Feature-first** |
| Multiple bounded domains, multiple teams | **Feature-first** or **Hybrid B** |
| Genuinely complex DDD domain | **Bounded-context** (only when DDD vocabulary is real) |
| Open question, no signal | Default **Layer-first** for services, **Flat** for CLIs |

Anvil prefers **Feature-first** for new services unless the brief specifically signals one-team / one-bounded-domain. The arc most repos travel is Flat → Layer-first → Feature-first → Hybrid; jumping ahead is OK, dropping back is rare.

---

## The mix-without-rule anti-pattern

This is the #1 structural slop. Half the codebase organises by layer, half by feature, no rule that picks for new code. New contributors guess. Anvil's audit flags this as **gate S01**.

How it happens:
- Codebase starts layer-first.
- Team grows; one feature gets so big it gets its own `internal/billing/`.
- Other features stay under `internal/api/`, `internal/store/`.
- Convention drift compounds: new features choose at random.

How to fix:
- Pick a layout. Write it in `anvil.md`.
- Migrate the smallest violator first (the feature directory with the fewest files moves into layer-first, OR the layer files for the most-domain-isolated feature move into a new feature directory).
- Done in one PR per migration, ideally one feature at a time.
- Update `anvil.md` afterwards with the rule for *new* code.

---

## Dependency direction

Layout is one axis. **Direction of imports** is the other. Pick a rule and enforce it.

Two patterns, in decreasing order of how often they're worth the discipline:

### 1. Outer → inner only (Clean / Hexagonal / Onion)

`api` → `service` → `domain` ← `store` → `domain`. The domain layer depends on nothing. Adapters (`api`, `store`) depend on the domain through ports. Useful when business logic outlives multiple infrastructure choices.

### 2. Adjacent only

`api` → `service` → `store`. Top-down, no skipping. Pragmatic, dominates most Go services.

**Forbidden in both:** circular imports, store importing api, domain importing infrastructure.

Anvil's audit checks dependency direction by parsing imports (Go/Rust/TS) and flagging:

- **Reverse imports** (lower layer importing higher) → **S02**
- **Cross-feature imports without an explicit contract** → **S03**
- **Cycles** → **S04**

---

## Language-specific notes

### Go

- `cmd/<binary>/` for entry points; one main per directory.
- `internal/` is unimported from outside the module — use it for everything that isn't a public library.
- `pkg/` is a community convention, not a Go language convention. Reach for it ONLY when the repo is genuinely a library *and* the path adds clarity. Most service repos shouldn't have a `pkg/`.
- Package name = directory base name. Avoid plurals (`users` → `user`).
- One package per directory; no nested packages in a directory.

### Rust

- `src/main.rs` for binaries, `src/lib.rs` for libs.
- `Cargo.toml` workspaces for multi-crate (the closest Rust gets to monorepo).
- Module tree mirrors directory tree (`src/foo/mod.rs` + `src/foo/bar.rs`).
- Feature-first via workspace members; layer-first via modules within a crate.

### TypeScript / Node

- Monorepos use `apps/` (deployables) + `packages/` (shared) with pnpm/Nx/Turborepo workspaces.
- Single-app projects often use `src/<feature>/` or `src/<layer>/`. NestJS bundles "modules" which is feature-first by default.
- Index files (`index.ts`) define the package's public surface — what's a wire commitment vs. internal.

### Python

- **Django**: feature-first by app (`users/`, `payments/`).
- **FastAPI**: pick your discipline. Common: `app/api/`, `app/services/`, `app/models/` (layer-first) or `app/<domain>/` (feature-first).
- `src/` layout vs flat — modern packaging prefers `src/<package>/`.

### Java / Kotlin

- `src/main/java/com/<org>/<project>/<feature>/<role>/...` — long path, deeply structured.
- Bounded-context DDD has a real foothold here.
- Spring modules organise by feature; the layer is inside.

---

## Slop gates (cross-ref to `slop-test.md`)

| Gate | Failure |
| --- | --- |
| S01 | Mixed layout without an `anvil.md` rule |
| S02 | Reverse import (lower layer → higher) |
| S03 | Cross-feature import without documented contract |
| S04 | Import cycle |
| S05 | `pkg/` at root carrying feature code |
| S06 | `internal/feature/` redundant intermediate |
| S07 | Bucket directory (see `shared-packages.md`) |
| S08 | Dead-code accumulated beyond threshold (see `dead-code.md`) |

---

## Stamping the choice

When `anvil.md` is locked, the layout family is named in a top section:

```yaml
layout:
  family: feature-first
  rule: "New code lives under internal/<context>/. Cross-context calls go through internal/<context>/api/."
  forbidden:
    - "internal/api/<context>/ — old layer-first leftovers; migrate"
    - "internal/util/ — see shared-packages.md"
```

`anvil reshape <target>` validates against this section before emitting.
