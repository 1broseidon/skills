# Scribe roadmap

## v0.3.1 — current

- Core loop: Inventory → Picks → Ledger → Draft → Truth-check → Gates → Handoff
- Verbs: default write, `audit`, `sync`, `extract`
- Diátaxis-aligned doc types with deep files for tutorial, how-to, reference, explanation, README
- Source-evidence discipline and claim ledger
- Drift ledger and `scribe sync`
- Verification matrix with optional, repo-dependent snippet execution
- Slop test and anti-patterns
- Writing-craft references: audience, prose, structure, links/format, code-vs-docs
- `scribe.md` convention artifact

## v0.2 — planned

- Deep files for architecture/ADR, changelog/migration, runbook (currently index stubs)
- Worked examples in `examples/` (audit of a real README, a sync run, an extract scaffold)
- Per-language in-code doc deep files (godoc, rustdoc, JSDoc/TSDoc, PEP 257)
- Generator-specific guidance (Docusaurus, MkDocs, Sphinx) as optional references
- Benchmark rubric for scoring generated docs (anvil-style 1–5)

## Deferred (v2+)

- Marketing/landing copy and blog posts
- Legal/policy text, slide decks, UI microcopy
- Full docs-site information-architecture migrations
- Translation and localization workflows
- Automated docs-site build pipelines
