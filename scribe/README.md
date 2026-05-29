# Scribe

**A documentation craft skill for AI coding agents — docs that read like they were written by someone who read the code.**

Scribe helps an agent write, audit, sync, and extract project documentation that matches the code, fits the reader, and earns its length. It exists to stop the most common failure mode of generated docs: confident sentences about flags, defaults, and behavior that the code does not actually have.

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

Every run follows one loop:

```text
Audience -> Doc Type -> Source Evidence -> Outline -> Draft -> Truth-Check -> Readability Pass
```

## What makes it different

- **Source-truth.** No invented flags, endpoints, parameters, defaults, return types, or version claims. Every behavioral fact traces to a source line or a command that was run — tracked in a claim ledger before a word is drafted.
- **Doc-type discipline.** Types follow [Diátaxis](https://diataxis.fr/) (tutorial / how-to / reference / explanation) plus README, architecture, changelog, and runbook. One mode per page — no tutorials that drift into reference, no references that start teaching.
- **Audience fit.** New users, integrators, contributors, operators, and decision-makers get different depth, vocabulary, and ordering. Pick one primary reader; route the rest.
- **Drift detection.** `scribe sync` reconciles a doc against current code and reports every mismatch — phantom flags, stale defaults, broken examples — in a drift ledger.
- **Verification, not vibes.** Documented surface is checked against source; code snippets are executed when the toolchain allows, and explicitly marked "not run" when it doesn't.
- **Prose that earns its length.** Prose where understanding is the goal, tables and lists where lookup is. Filler, false ease ("simply", "just"), and marketing adjectives are cut.

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
scribe extract <source>   # scaffold docs from code / --help / OpenAPI / proto / README
```

One run produces one document for one audience. In a docs set, scribe writes the smallest page that answers the request rather than rewriting the whole site.

## What a run looks like

Ask the agent to document something, and scribe works the loop out loud before writing:

```text
> scribe sync README.md

Source inventory:
· Subject: cli `search` (Go/cobra) — 8 commands from live --help
· Doc type: README · Audience: new user
· Existing: README claims --format (removed in cmd/root.go L52)

Drift reconciled:
| Doc claim      | Code reality          | Fix            | Verification   |
| --------       | ------------          | ---            | ------------   |
| `--format`     | removed cmd/root.go52 | deleted        | `search --help`|
| "defaults 30s" | config.go L18 = 60s   | corrected      | grep config.go |

Verification: flags vs --help pass · quick-start ran pass · links pass
Fixed 2 (1 phantom, 1 stale default). Left flagged: "Postgres 14+" — no manifest evidence.
```

The accuracy work is the point. Scribe reports what it corrected, what it verified, and what it left flagged.

## Documentation

Scribe's own guidance lives in lazily loaded references. Start where your concern is:

| If you want to understand… | Read |
| --- | --- |
| How scribe avoids inventing facts | [source-evidence.md](references/source-evidence.md) — evidence levels and the claim ledger |
| Which doc type to write | [doc-types.md](references/doc-types.md) + the [deep files](references/doc-types/) per type |
| How drift gets caught and fixed | [drift-ledger.md](references/drift-ledger.md) |
| How a doc is proven correct | [verification.md](references/verification.md) |
| What "good" reads like | [prose.md](references/prose.md), [structure.md](references/structure.md), [audience.md](references/audience.md) |
| What scribe refuses to ship | [slop-test.md](references/slop-test.md), [anti-patterns.md](references/anti-patterns.md) |
| The verbs in detail | [audit](references/verbs/audit.md) · [sync](references/verbs/sync.md) · [extract](references/verbs/extract.md) |

The full skill entrypoint is [SKILL.md](SKILL.md).

## Repository layout

```text
.
├── SKILL.md                     # main skill entrypoint
├── references/                  # lazily loaded documentation guidance
│   ├── source-evidence.md       # evidence levels, claim ledger
│   ├── doc-types.md             # Diátaxis-aligned doc-type map
│   ├── doc-types/               # per-type deep files
│   ├── audience.md
│   ├── prose.md
│   ├── structure.md
│   ├── links-and-format.md
│   ├── code-vs-docs.md          # docstrings vs prose docs
│   ├── drift-ledger.md
│   ├── verification.md
│   ├── slop-test.md
│   ├── anti-patterns.md
│   ├── scribe-md.md             # opt-in convention artifact
│   └── verbs/                   # audit, sync, extract
├── examples/                    # human-only examples
├── ROADMAP.md
└── README.md
```

## Status

Version `0.1.0` — initial release. Deep files exist for tutorial, how-to, reference, explanation, and README; architecture, changelog, and runbook are covered by their index rows with deep files planned. See [ROADMAP.md](ROADMAP.md).

## Contributing

Issues and pull requests are welcome at [github.com/1broseidon/scribe](https://github.com/1broseidon/scribe). Scribe is built to its own standard — proposed docs and references should pass the [slop test](references/slop-test.md).

## Out of scope

Scribe does not write marketing or landing copy, blog posts, legal/policy text, slide decks, or UI microcopy. It does not run full docs-site IA migrations or localization workflows. It can still help with the technical documentation around any of those.

<!-- Scribe · critique: Acc5 Aud5 Str5 Comp4 Con4 Lnk5 Ex5 -->
