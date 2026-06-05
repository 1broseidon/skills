# Prompt mechanics

**A prompt-engineering skill for AI coding agents — engineer prompts against how LLMs actually process text, not by feel.**

Prompt mechanics helps an agent author and revise prompt-like artifacts — system prompts, agent instruction sets, `SKILL.md` files, tool-use policies, `CLAUDE.md` files, long behavioral rule blocks — by naming the mechanism behind every change and verifying the change against that mechanism instead of against a self-report or a vibe.

It exists to stop the most common failure mode of prompt authoring: adding a rule because it sounds right, stacking emphasis, and hoping the model complies.

## What makes it different

- **Mechanism per change.** Every edit names the reason it works — attention position, induction heads, superposition, the reversal curse, lost-in-the-middle — not taste. "Make it punchier" is not a mechanism; "move the opener to an imperative because early positions get disproportionate attention" is.
- **Verify against the mechanism, not a self-report.** The step most authors skip and the one that catches real bugs. Added a glossary? Grep every synonym and confirm one survives. Added a gold trace? Confirm every visible token is something the harness would actually render. Wrote a forced step? Delete it mentally and check the output degrades.
- **Environment first.** A technically perfect prompt that fights its harness loses. Before any rewrite, establish position, render path, tool model, and length budget. Most real bugs are environment mismatches, not bad techniques.
- **Honest tiers.** Each technique is marked `[established]` (well-supported by interpretability or training research) or `[bet]` (a reasonable heuristic with weaker evidence, applied lightly and dropped first). Bets are never presented as fact.
- **Convergence by default.** On tasks with a correct answer (a code edit, a contract, an extraction), suppress exploration. On underdetermined tasks (prose, naming, design), induce it. The disposition is set by the task, not applied uniformly.

## The method

Work this loop. It is the part that does not change.

```text
Read the environment -> Find mismatches -> One change per mismatch (mechanism named) -> Verify against the mechanism -> Check cross-file consistency
```

## Install

Install from the public GitHub repo with the `skills` CLI:

```bash
npx skills add 1broseidon/skills --skill prompt-mechanics
```

The `skills` CLI is documented at [skills.sh](https://skills.sh/docs/cli).

## When to use it

Use it for any artifact an LLM will execute as instructions, on both fresh authoring and revision. Triggers:

- "tighten / improve this prompt"
- a critique or rewrite request
- a prompt that is being ignored or behaving unreliably
- porting a prompt to a new harness or model

Do not use it for ordinary prose, human-facing documentation, or code — those are not executed as model instructions, and the mechanisms here do not apply.

## Technique catalog

The skill carries a named-move catalog, each move with its mechanism and tier:

| Technique | Tier |
| --- | --- |
| Imperative opener | established |
| Controlled glossary | established |
| Gold trace | established |
| Bidirectional mapping | established |
| Decompose compound rules | established |
| Process-supervision gate | established |
| Accountable escape hatch | established |
| Delete-test forced steps | established |
| Mid-context placement | established |
| BAD/GOOD ending on GOOD | bet |
| Recency mandate | bet |
| Exploration disposition | bet |

Apply a technique only when its mechanism is actually present in the artifact in front of you. A glossary on a prompt with no vocabulary drift is wasted tokens; a gold trace in a render path that displays it is a bug.

## Repository layout

```text
.
├── SKILL.md                     # main skill entrypoint: method, catalog, checklist
├── references/
│   ├── techniques.md            # full detail per technique: mechanism, before/after, applies-when, worked-when
│   └── worked-example.md        # development history: the method catching its own bugs
└── README.md
```

## Core references

- [techniques.md](references/techniques.md): the mechanism, a before/after, and the applies-when / worked-when tests for each catalog move
- [worked-example.md](references/worked-example.md): the development history this skill was distilled from — a render-path bug, cross-file vocabulary drift, and a missing test-first trace, and how the method caught each

## Status

Version `0.1.0`. Initial release: the method, a twelve-move technique catalog with honest tiers, a glossary, a worked trace, and two references.

## Contributing

Issues and pull requests are welcome at [github.com/1broseidon/skills](https://github.com/1broseidon/skills).

## Out of scope

Prompt mechanics does not write the domain content of a prompt for you, tune model weights or sampling parameters, or guarantee behavior on any specific model. It engineers the instruction text against how models process it; the subject-matter decisions remain yours.
