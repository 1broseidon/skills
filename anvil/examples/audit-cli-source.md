# Worked example: anvil audit lattice

**Target:** `lattice` — Rust workspace, single binary crate, ~60 source files
**Mode:** source audit (surface + structure)
**Date:** 2026-05-22

`lattice` is a fictitious-but-plausible import-graph query CLI for monorepos. It indexes a workspace, builds a symbol graph, and answers queries like `paths`, `cycles`, `affected`. Used as a worked example here for an **agentic, Verb-Surface Rust CLI with a flat layout**.

---

## Pre-flight findings

```
Pre-flight findings:
· Framework: clap v4 derive (src/cli.rs L1)
· Surface kind: CLI — 9 top-level verbs
· Config: LATTICE_DB env + --db flag; figment for env+file merge (src/config.rs)
· Observability: no HTTP server; CLI tool — N/A
· Completion: clap_complete registered (src/cli.rs)
· Version: built-in --version + `version` subcommand (env!("CARGO_PKG_VERSION"))
· Layout: flat — src/{main,cli,graph,index,query,output,config,backends}.rs
· Shared crates: none — single binary crate, no workspace members
· Dead-code signals: #[allow(dead_code)] absent; cargo +nightly udeps not yet run

Anvil will preserve: clap v4, LATTICE_DB, --db flag, flat src/ layout
Anvil will review: caller profile, surface pattern, contract ledger, obligations, and slop gates
```

---

## Step 1 — Context gate

*Skipped — this is an audit, not a build.*

Inferred from surface scan:
- **Audience**: code-tooling agents, CI bots, monorepo platform teams
- **Primary action**: query the symbol/import graph of a workspace
- **Caller profile**: **agent** — `--json` is persistent, NDJSON streaming on `query`/`affected`, `--minimal` and `--max-chars` budget controls, no interactive prompts

State: *Caller profile: agent. Surface: cli. Pattern: Verb-Surface (11).*

---

## Step 2 — Macrostructure diagnosis

**Detected:** Verb-Surface (11) — 9 top-level verbs with implicit subject ("the graph"):
`affected`, `cycles`, `deps`, `dependents`, `index`, `outline`, `paths`, `query`, `version` (+ `completion`, `config`, `help` as standard infra)

Clean inside the 15-verb ceiling. Verbs are non-overlapping; no obvious candidate to group under a noun.

**Note** `query` is kind-adaptive — returns symbol metadata for functions, member lists for types, file structure for modules. Documented in `lattice query --help`; mirrors the cymbal `investigate` pattern.

---

## Audit report

### P0 — user-facing wrong / security

*(none detected)*

---

### P1 — contract drift

**[C15]** No `conventions.yaml` emitted. For an agent-caller tool-scope CLI, the exit-code table, env-var glossary, and backend list belong in `conventions.yaml`. Currently only `--help` footers reference `LATTICE_DB`.

**[A07]** Silent fail-over: when `--backend rust-analyzer` is requested but the rust-analyzer binary is missing, `lattice index` falls back to the `tree-sitter` backend with only a debug-level log. Agent callers require stderr notification at minimum, ideally a non-zero exit unless `--allow-fallback` is set.

---

### P2 — polish

**[C11] ✓** clap's equivalent of `SilenceUsage` — `disable_help_subcommand(false)` is fine; usage is not dumped on `RunE`-style errors because clap separates parse errors from execution errors by default.

**[A01] ✓** `--json` is a global persistent flag wired through `clap`'s `global = true`.

**[A02] ✓** Confirmed via `NO_COLOR=1 lattice query foo | cat` — no ANSI escapes. `lattice` uses the `anstream` crate which honours `NO_COLOR` automatically.

**[A06] ✓** `lattice config --json` returns `available_backends: ["rust-analyzer", "tree-sitter", "native"]`.

**[A10] ✓** `lattice query --json` emits one JSON object per line; no banners, no progress text on stdout (progress goes to stderr).

**[U18] ✓** Version via `env!("CARGO_PKG_VERSION")` at compile time — no hardcoded string.

**[S07] ✓** No bucket module observed. Capabilities are split into `graph`, `index`, `query`, `output`, `backends` — each is a named capability, not a `util.rs` dump.

**[S01] ✓** Flat layout is appropriate for a single-binary Verb-Surface CLI under 100 files. No mixed-layout issue.

**[S08]** Dead-code signals not run in this audit. Recommend `cargo +nightly udeps` for unused dependencies and `cargo clippy -- -W dead_code` for unused items.

**[S09]** Two `TODO:` comments observed in `src/backends.rs` without owner or ticket reference. Add owner + condition or delete.

---

## Slop gate summary

| Block | Gates checked | Fails |
| --- | --- | --- |
| Universal (U) | U01–U20 | U15 (no conventions.yaml) |
| CLI (C) | C01–C15 | C15 (no conventions.yaml) |
| Agentic (A) | A01–A10 | A07 (silent backend fail-over) |
| Structural (S) | S01–S15 | S09 (un-owned TODOs); S08 pending |

**Overall: 3 confirmed findings (C15, A07, S09), 1 pending (S08). No P0.**

---

## Binary gates

- evidence-cited: yes
- contract-ledger-complete: yes
- risk-classified: yes
- obligations-stated-or-deferred: yes
- no-fabricated-facts: yes
- verification-runnable: yes

---

## Recommendations

**P1 (address before next release):**
1. Add `conventions.yaml` (exit codes + LATTICE_DB + backend list).
2. Stop the silent backend fall-back — emit on stderr and exit 4 (upstream) unless `--allow-fallback` is passed.

**P2 (next sprint):**
3. Granulate exit codes: 2 validation, 3 not-found, 4 upstream, 6 cancelled (currently most non-success paths collapse to 1).
4. Run `cargo +nightly udeps` and `cargo clippy -- -W dead_code`; sweep findings.
5. Resolve or delete the two `TODO:` comments in `src/backends.rs`.

---

## Study notes (for `anvil study lattice`)

If using `lattice` as a `study` source for a new agentic CLI:

- **Adopt:** Verb-Surface macrostructure, persistent `--json` + `--minimal` + `--max-chars`, clap derive layout, `anstream` for NO_COLOR, flat module split with named capabilities
- **Consider adapting:** add the `--allow-fallback` flag pattern up front; bake granular exit codes into the error enum from day one
- **Avoid carrying over:** the silent backend fall-back behaviour
- **Avoid:** copying the flat layout for a multi-domain service — flat is right for this single-subject tool, not for a service with billing + auth + inventory boundaries
