# Scribe

> [!IMPORTANT]
> **This repository has moved.** Scribe now lives in the [`1broseidon/skills`](https://github.com/1broseidon/skills) monorepo.
>
> Install it with:
> ```bash
> npx skills add 1broseidon/skills --skill scribe
> ```
> This standalone repo is archived and no longer updated.

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
Inventory -> Picks -> Ledger -> Draft -> Truth-check -> Gates -> Handoff
```

## What makes it different

- **Evidence-level claims.** Every behavioral fact traces to a source line or a command that was run, and carries an evidence level (`observed`, `derived`, `stated`, or `absent`). Claims are tracked in a ledger before a word is drafted.
- **Doc-type discipline.** Types follow [Diátaxis](https://diataxis.fr/) (tutorial / how-to / reference / explanation) plus README, architecture, changelog, and runbook. One mode per page.
- **Audience fit.** New users, integrators, contributors, operators, and decision-makers get different depth, vocabulary, and ordering. Pick one primary reader; route the rest.
- **Drift detection.** `scribe sync` reconciles a doc against current code and reports every mismatch (phantom flags, stale defaults, broken examples) in a drift ledger.
- **Binary gates.** Six pass/fail checks before handoff: `claims-sourced`, `outline-holds-mode`, `snippets-honest`, `defaults-match`, `no-fabricated`, `links-resolve`. Any failure triggers a fix loop.
- **Prose that earns its length.** Prose where understanding is the goal, tables and lists where lookup is. Filler, false ease, and marketing adjectives are cut.

## Install

Install from the public GitHub repo with the `skills` CLI:

```bash
npx skills add 1broseidon/skills --skill scribe
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

Inventory:
· Subject: cli `search` (Go/cobra) — 8 commands from live --help
· Surface: SEARCH_ env prefix, exit codes 0/1/2
· Existing: README claims --format (removed in cmd/root.go L52)

Picks: doc-type=README · audience=new user · mode=orientation

Ledger:
  --json flag exists     | observed | cmd/root.go L40   | feature list
  default timeout 30s    | absent   | config.go L18=60s | corrected to 60s
  --format flag          | absent   | grep found nothing | removed from doc

Truth-check: flags vs --help (pass), defaults vs code (pass), links (pass)
Gates: claims-sourced=yes, outline-holds-mode=yes, snippets-honest=yes,
       defaults-match=yes, no-fabricated=yes, links-resolve=yes

Fixed 2 (1 phantom flag, 1 stale default). Flagged: "Postgres 14+" — no manifest.
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
│   ├── philosophy.md            # human-only design rationale
│   └── verbs/                   # audit, sync, extract
├── examples/                    # human-only examples
├── ROADMAP.md
└── README.md
```

## Status

Version `0.3.1`. Deep files exist for tutorial, how-to, reference, explanation, and README; architecture, changelog, and runbook are covered by their index rows with deep files planned. See [ROADMAP.md](ROADMAP.md).

## Contributing

Issues and pull requests are welcome at [github.com/1broseidon/skills](https://github.com/1broseidon/skills). Scribe is built to its own standard: proposed docs and references should pass the [slop test](references/slop-test.md).

## Out of scope

Scribe does not write marketing or landing copy, blog posts, legal/policy text, slide decks, or UI microcopy. It does not run full docs-site IA migrations or localization workflows. It can still help with the technical documentation around any of those.

