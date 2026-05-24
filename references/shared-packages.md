# Shared packages

When code is used in multiple places, the reflex is to extract it. The discipline is knowing when not to. Anvil's stance: **wait for the third user, name by capability, never by location.**

This file covers when to extract, when to inline, how to name, how to slim, and how to prevent the bucket anti-pattern.

---

## The rule of three

Do not extract a shared package until **three distinct call sites** in **three distinct domains** need the same thing.

One user → inline.
Two users → still inline. Duplication here is honest; abstraction would be premature.
Three users from different domains → extract.

Why three and not two? Because two is often coincidence. Two `parseDate()` calls that look the same might diverge the moment the third use case appears with slightly different semantics. Extracting at two forces an abstraction that then has to be generalised under pressure.

"Distinct domains" matters too. Three callers in `billing/`, all doing billing-specific formatting, don't justify a shared package. Three callers across `billing/`, `auth/`, and `notifications/` do.

---

## Naming

Shared packages must be named after their **capability**, never their **location**.

| Wrong | Right |
| --- | --- |
| `util` | `hashing` · `pagination` · `retry` |
| `utils` | (same) |
| `common` | `events` · `ids` · `timeutil` |
| `helpers` | `httputil` · `jsonutil` (only when genuinely generic HTTP/JSON helpers) |
| `lib` | `validation` · `email` · `iters` |
| `shared` | (pick a specific capability name) |
| `internal/misc` | (same) |
| `base` | (same) |

A package named `util` is a sign that the author didn't know what to call it because it holds too many unrelated things. The cure is always to split, not to rename.

Capability names are safe when the capability has a stable interface and single purpose:
- `retry` — retry logic with backoff and jitter
- `pagination` — cursor and page-based pagination shapes
- `hashing` — consistent hashing or password hashing (name which)
- `iters` — iterator utilities (Go 1.23+ range functions)
- `ids` — ID generation (UUIDs, NanoIDs, snowflakes)
- `clock` — injectable time abstraction for testability
- `env` — typed env-var parsing with defaults
- `ptr` — pointer-helper one-liners (Go idiom: `ptr.To(42)`)

---

## The bucket anti-pattern

A bucket is a package where the only thing the contents share is "someone didn't know where to put this."

Signs:
- 10+ exported symbols with unrelated types (a `Retry` function next to an `EmailAddress` type next to a `ParseCSV` function)
- Package name is location-based (`util`, `common`, `helpers`, `lib`, `shared`, `misc`)
- File count grows monotonically with the project — everything new that doesn't fit elsewhere lands here
- Callers are scattered across every domain; nothing is isolated enough to reason about

Buckets are slop gate **S07**. Anvil's audit flags packages where:
- Name matches the bucket list above, OR
- Export count > 15 and cohesion score is low (exports don't share types, don't call each other, don't relate to one capability)

The fix is always the same: split into capability-named packages. The bucket itself disappears.

---

## Extraction protocol

When the rule of three fires:

### 1. Identify the stable interface

What is the minimum set of exports the three callers actually need? Not "what could be useful someday" — what do the three call sites actually call today?

### 2. Name it

Pick a capability name from the naming rules above. If you can't find one, the abstraction is probably too broad — consider two smaller packages.

### 3. Write the package

- One purpose.
- Minimal exports. Everything not exported is easier to change.
- No dependencies on other internal packages unless unavoidable. Shared packages that import feature packages invert the dependency graph.
- Documented public API (at least one-line doc per exported symbol).

### 4. Migrate the three callers

Move the code into the new package. Update the three callers to import it. Compile and test before proceeding.

### 5. Record in `anvil.md`

```yaml
shared_packages:
  - name: retry
    path: internal/retry
    purpose: "Configurable retry with backoff and jitter. Go-idiomatic: accepts context."
    callers: [internal/billing, internal/auth, internal/notifications]
  - name: ids
    path: internal/ids
    purpose: "ID generation: UUIDs and URL-safe NanoIDs."
    callers: [internal/billing, internal/auth, internal/events]
```

The record helps future engineers know extraction was deliberate, not drift.

---

## Slimming an existing bucket

When a bucket already exists, the reshape operation is:

1. **Inventory** — list every export in the bucket and every caller.
2. **Group** — cluster exports by what they're actually doing. An `EmailAddress` type belongs near email validation; a `Retry` function belongs in a retry-specific package; a `MustAtoi` helper probably belongs inlined at its one call site.
3. **Extract** — for each cluster, new capability-named package.
4. **Delete or inline the remainder** — one-caller helpers go back to the calling package. Zero-caller exports are dead code (see `dead-code.md`).
5. **Delete the bucket** — the old package is removed entirely. This is the goal: the bucket shouldn't survive as an empty shell or catch-all.

Do this in one PR per capability extracted, not one mega-PR. Review surface is important here.

---

## Dependency direction for shared packages

Shared packages must not import feature packages. If `internal/retry` imports `internal/billing`, the dependency graph inverts: the supposedly low-level shared package now depends on a high-level feature.

Allowed import patterns:

```
feature packages → shared packages → external dependencies (stdlib, modules)
```

Never:

```
shared packages → feature packages
cmd/       → shared packages      (ok; cmd is the top)
shared packages → cmd/            (not ok; shared should have no entry-point deps)
```

Anvil's audit checks for cross-package imports in the structural axis (gate **S03** for cross-feature, **S02** for layer inversion).

---

## When NOT to extract

| Case | Why to inline |
| --- | --- |
| Fewer than 3 callers | Rule of three; wait |
| Callers are in the same domain | Domain-local; the "shared" is coincidence |
| The code would need a context parameter from the caller to be useful | It's not general enough to be shared; the context coupling will grow |
| The code is a one-liner or two-liner | `return strings.TrimSpace(s)` — just inline it |
| Extracting creates a circular import | The abstraction is wrong; reconsider the layer |
| The shared code would import a feature package | Same as above |

---

## Standard shared packages (pre-approved)

These are so common and stable that extraction is pre-approved without needing three callers — they're industry standard, not domain-specific:

| Package | What it holds | Notes |
| --- | --- | --- |
| `retry` | Backoff / jitter / retry logic | Include context cancellation |
| `pagination` | Page + cursor shapes | One shape per API style (page-offset vs cursor) |
| `ids` | UUID / NanoID generation | Wrap to enforce consistent format |
| `clock` | Time abstraction (`time.Now()` injectable) | For testability of time-dependent logic |
| `ptr` | Pointer helpers (`ptr.To[T]`, `ptr.From[T]`) | Go-idiomatic, tiny |
| `validation` | Field-level validators (email, URL, phone) | Only if ≥2 domains validate the same shapes |
| `env` | Typed env-var parsing | Wrap `os.LookupEnv` with defaults and type coercion |
| `testutil` | Test helpers that span multiple package tests | Keep out of production builds; use `_test` packages in Go |

These can be created immediately without waiting for the third caller. They should still follow the naming and dependency direction rules.

---

## Language-specific notes

### Go

- `internal/` packages can't be imported by external modules — use for anything not meant to be a public library.
- One package per directory. Don't create subdirectories inside a shared package unless each subdirectory has a distinct purpose large enough to warrant separation.
- Package name matches directory basename. `internal/retry` has `package retry`.
- Avoid test code in shared packages unless it's test helper utilities for other packages' test files.

### Rust

- Workspace members (`crates/retry`, `crates/ids`) are the extraction point. Feature crates depend on shared crates.
- Keep shared crates small — Rust compile times are per-crate, so many small crates hurt. Prefer fewer, coherent crates over many micro-crates.
- `pub(crate)` limits visibility to the current crate; `pub(super)` to the parent module. Use liberally to keep internals internal.

### TypeScript / Node

- `packages/` in a monorepo is the extraction point. Each shared package has its own `package.json`, `index.ts`, and build step.
- Barrel exports (`index.ts` re-exporting from `./lib/…`) are the public surface. Don't export internal utilities through the barrel.
- `knip` flags unused exports from `packages/` — run it after extraction to verify callers import what you think.

### Python

- Shared code lives in an importable module or sub-package within the repo. In a Django project: `common/` or `shared/` at the repo root (not as a Django app) for truly cross-app utilities.
- Use `__all__` to declare the public surface explicitly; unexported symbols stay internal.
- Shared packages in Python must be on the `PYTHONPATH` or installed as editable packages — structure accordingly.

---

## Slop gates

| Gate | Failure |
| --- | --- |
| S07 | Bucket package (`util`, `common`, `helpers`, `lib`) exists with >5 unrelated exports |
| S13 | Shared package imports a feature package |
| S14 | Package extracted with fewer than 3 distinct-domain callers and not in pre-approved list |
| S15 | Shared package export count grew >50% between audit runs (bucket drift) |

---

## Quick checklist before extracting

- [ ] Three distinct-domain callers confirmed (or pre-approved list)
- [ ] Capability name chosen (not util/common/helpers)
- [ ] Exports minimal — only what the three callers actually use
- [ ] No imports from feature packages
- [ ] Recorded in `anvil.md` `shared_packages`
- [ ] PR migrates three callers, passes tests
