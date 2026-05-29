# Scribe

Scribe is a documentation craft skill for AI coding agents. It helps agents write, audit, sync, and extract project documentation that matches the code, fits the reader, and reads well — without drifting into invented flags, plausible-but-wrong defaults, mode-mixed pages, or generated-sounding prose.

Scribe is language-agnostic and covers:

- READMEs
- API references
- tutorials and getting-started guides
- how-to guides
- conceptual explanations
- architecture notes and ADRs
- changelogs and migration guides
- runbooks
- in-code API docs (docstrings / doc comments)

It is centered on source-truth and reader fit. The core workflow is:

```text
Audience -> Doc Type -> Source Evidence -> Outline -> Draft -> Truth-Check -> Readability Pass
```

## What It Enforces

- **Source-truth:** no invented flags, endpoints, parameters, defaults, return types, or version claims — every fact traces to a source line or a command that was run
- **Doc-type discipline:** Diátaxis-aligned types (tutorial / how-to / reference / explanation) plus README, architecture, changelog, runbook — one mode per page
- **Audience fit:** new users, integrators, contributors, operators, and decision-makers get different depth and vocabulary
- **Drift detection:** `scribe sync` reconciles docs against current code and reports every mismatch
- **Structure as navigation:** outlines, progressive disclosure, scannable headings and tables
- **Prose that earns its length:** prose where understanding is the goal, terse where lookup is
- **Verification:** documented surface checked against source; code snippets executed when the toolchain allows

## Install

Install from the public GitHub repo with the `skills` CLI:

```bash
npx skills add 1broseidon/scribe
```

The `skills` CLI is documented at [skills.sh](https://skills.sh/docs/cli).

## Invoke

```text
scribe                    # write or update one document for one audience
scribe audit <doc>        # read-only accuracy + structure + prose + link audit
scribe sync <doc>         # reconcile a doc against current code; fix drift
scribe extract <source>   # scaffold docs from code/help/OpenAPI/proto/README
```

## Repository Layout

```text
.
├── SKILL.md                     # main skill entrypoint
├── references/                  # lazily loaded documentation guidance
│   ├── source-evidence.md
│   ├── doc-types.md
│   ├── doc-types/               # per-type deep files (Diátaxis + more)
│   ├── audience.md
│   ├── prose.md
│   ├── structure.md
│   ├── links-and-format.md
│   ├── code-vs-docs.md
│   ├── drift-ledger.md
│   ├── verification.md
│   ├── slop-test.md
│   ├── anti-patterns.md
│   ├── scribe-md.md
│   └── verbs/                   # audit, sync, extract
├── examples/                    # human-only examples
├── ROADMAP.md
└── README.md
```

## Core References

- [source-evidence.md](references/source-evidence.md): evidence levels and the claim ledger
- [doc-types.md](references/doc-types.md): Diátaxis-aligned doc-type map
- [drift-ledger.md](references/drift-ledger.md): doc↔code drift tracking
- [verification.md](references/verification.md): the truth-check matrix
- [slop-test.md](references/slop-test.md): post-emit anti-slop gates

## Current Status

Version: `0.1.0`. Initial release.

## Out Of Scope

Scribe does not write marketing or landing copy, blog posts, legal/policy text, slide decks, or UI microcopy. It does not run full docs-site IA migrations or localization workflows. It can still help with the technical documentation around any of those.
