# Anvil roadmap

## v0.3.0 (current)

**Theme: Backend-native flow**

- [x] Centered the flow on boundary/risk/evidence/contract/verification
- [x] Added boundary inventory as Step 0
- [x] Added R0-R5 risk classes for public surface and structural changes
- [x] Added caller profiles: human-operator, script, agent, SDK client, internal admin
- [x] Replaced "preview" with contract ledger
- [x] Added boundary obligations
- [x] Added verification matrix as a required handoff artifact
- [x] Added benchmark rubric for stress-testing generated outputs
- [x] Kept macrostructure indexes, but demoted them to surface-pattern aids after evidence
- [x] Kept `anvil.md`, but made consistency over variety the locked-system rule
- [x] Added references:
  - `references/evidence.md`
  - `references/risk-classes.md`
  - `references/contract-ledger.md`
  - `references/obligations.md`
  - `references/verification.md`

## v0.3.x hardening

- [x] Rewrite `references/verbs/audit.md` around evidence packs and verification matrices
- [x] Rewrite `references/verbs/reshape.md` around R-class approvals and contract ledgers
- [x] Rewrite `references/verbs/study.md` so "DNA" means obligations + caller model + contract shape, not macrostructure first
- [ ] Rename or bridge `references/genres/` to caller-profile files
- [ ] Update `references/slop-test.md` with evidence-backed gate wording and command hooks
- [ ] Add examples-as-tests:
  - build agentic CLI
  - build REST service with OpenAPI
  - reshape CLI without breaking flags
  - slim bucket package
  - dead-code sweep report
- [ ] Turn benchmark rubric into executable fixtures

## v0.4.0

**Theme: Evidence collectors + smoke harness**

- [ ] `scripts/anvil_inventory.*` — capture help/routes/proto/package/layout evidence into JSON
- [ ] `scripts/anvil_smoke_cli.*` — run `--help`, `--version`, invalid args, JSON output, `NO_COLOR`
- [ ] `scripts/anvil_contract_diff.*` — compare router/OpenAPI or proto/registration evidence
- [ ] Schema stability checker for CLI JSON/NDJSON
- [ ] Import graph helpers for Go/Rust/TS/Python where practical
- [ ] Generated benchmark reports from examples-as-tests

## v0.5.0

**Theme: Catalog completion without taking over the flow**

- [ ] Fill CLI macrostructure deep files 04-10
- [ ] Fill REST macrostructure deep files 01, 04, 05, 06, 08
- [ ] Fill gRPC macrostructure deep files 02, 04, 05, 07
- [ ] Deep archetype files: CFG-02, HEALTH-02, MW-01, HELP-01, OUT-01
- [ ] Expand package-API guidance beyond shared packages
- [ ] Add deprecation reference for flags/routes/RPCs/package exports

## Deferred v2

- [ ] TUI / interactive CLI support
- [ ] GraphQL service surfaces
- [ ] Desktop-app backend surfaces
- [ ] Full buf/codegen orchestration
- [ ] Cross-repo / cross-module structural analysis

## Out of scope

- Browser UI / frontend code
- Business domain modeling
- ORM schema design and migrations
- Kubernetes / Terraform / CI design
- Auth provider wiring
- Pure performance work without a surface, contract, or structure connection
