---
name: chain
description: "Orchestration skill for agent toolchains that cover research, code navigation, memory, and task state — the ketch/cymbal/recoil/brainfile set. Use when working in a repo where these tools are installed and the task spans more than one command: starting or resuming a session, planning a change, assessing blast radius, recording a decision, or handing off. Enforces reach order (settled knowledge before local code before the network), write-back so the next session inherits the work, and evidence over recall. Not for choosing between these tools and alternatives, not an installer, and not a substitute for reading the code you are about to change."
version: 0.1.0
---

# Chain

Answer the question you are actually blocked on, with the cheapest source that can answer it. The default failure mode in agentic coding is not ignorance — it is asking the wrong source first: searching the web for something the repo already records, re-deciding something the project settled last month, or editing a symbol without knowing what calls it. Four tools cover four distinct failure modes. The craft is knowing which one you are in, reaching in cost order, and writing back so the next session starts further along than this one did.

Nothing here depends on anything else. Each tool is useful alone. This skill is about the seams: where one tool's output becomes the next one's input, and where a session opens and closes.

## Glossary

One canonical term per concept, used everywhere below.

| Term | Meaning |
| --- | --- |
| chain | The four tools used as one workflow: ketch, cymbal, recoil, brainfile |
| surface | One tool's area of responsibility, and the one question it answers |
| reach order | The order to consult surfaces in: settled knowledge, then task state, then local code, then the network |
| write-back | Recording the result of work into a surface so a later session can read it |
| seam | A point where one tool's output is the next tool's input |
| blast radius | The set of symbols and files a change actually affects, as reported rather than guessed |
| claim key | A stable family name that lets a recoil decision supersede an earlier one instead of duplicating it |
| brief | What changed in task state since a named agent last checked in |

## When this applies

Use it in a repo where some or all of the chain is installed and the work spans more than one command: opening or resuming a session, planning a change, assessing what a change will break, recording a decision that should outlive the session, or handing off to another agent or another day.

Do not use it to decide whether these tools are the right ones — that is a procurement question, not a craft one. It does not install anything itself, though it does say where each tool's own install instructions live. And it does not replace reading the code you are about to change. Every tool here narrows where to look. None of them licenses skipping the looking.

## The four surfaces

Each tool exists because a different thing goes wrong without it.

| Tool | Failure it prevents | Question it answers | Cost |
| --- | --- | --- | --- |
| recoil | Re-deciding, or silently contradicting, something the project already settled | "Have we decided this, and does that decision still hold?" | Local, instant |
| brainfile | Losing the thread between sessions and between agents | "What is the state of the work, and what changed since I last looked?" | Local file |
| cymbal | Changing code on a guess about structure | "What does this touch, and what breaks if I change it?" | Local, indexed |
| ketch | Acting on absent or stale external knowledge | "What does the world outside this repo say?" | Network, slow |

## When a tool is missing

Establish what is actually present before planning around it. `command -v ketch cymbal recoil brainfile` answers it in one call, and each tool answers `--version`. Do not infer a tool's absence from one failed command, and do not infer its presence from this skill being loaded.

Never guess an install command. Install methods differ by platform and change between releases, and a fabricated one-liner is the worst possible failure here — it either errors, or it succeeds at installing something else.

On macOS and Linux one command installs the set, and it is a plain shell script the operator can read before running:

```sh
curl -fsSL https://chain.sh/bootstrap.sh | sh
```

It resolves each tool's latest release, verifies every archive against that release's `checksums.txt`, refuses to install on any mismatch, and never uses sudo. brainfile goes through npm because it ships no binary. `--dry-run` shows what it would do; `--only cymbal,recoil` installs a subset. It does not cover Windows. For Windows, or for any one tool on its own, send the operator to the tool's own instructions:

| Tool | Install instructions |
| --- | --- |
| ketch | <https://ketch.run/#install> |
| cymbal | <https://cymbal.sh/#install> |
| recoil | <https://github.com/1broseidon/recoil#install> |
| brainfile | <https://brainfile.md/quick-start> |

If ketch is one of the tools you do have, it can read the others' pages for you — `ketch scrape https://cymbal.sh/#install` returns the page as clean markdown, install section included, so the chain bootstraps itself rather than sending you to a browser. The fragment does not narrow the output; you get the whole page and read the install heading out of it. This works in one direction only: nothing can fetch ketch's own page for you if ketch is what is missing.

**Installed is not the same as ready.** Each tool has a first-run step in a new repo, and skipping it produces empty results that read like real ones: `cymbal index .` builds the symbol index, `recoil setup` bootstraps project memory in one step, `brainfile init` creates `.brainfile/brainfile.md`. An unindexed repo will answer `cymbal impact` with nothing, which is not the same answer as "nothing calls this."

**Partial chains still work.** Nothing here depends on anything else, so a missing tool costs you exactly one surface, not the workflow. Say which one you lost and keep going: without recoil you cannot know what was already settled, so carry decisions in the task description instead; without cymbal, blast radius drops to what you can read, so scope the change smaller and say why. Name the gap rather than quietly proceeding as if the surface had answered.

## Reach order

Consult surfaces cheapest-and-most-decisive first. The order is not stylistic: each step can end the task, and each is more project-specific than the one after it.

1. **recoil** — has this already been settled? A hit here can end the work outright, and it is the only surface that can tell you your plan contradicts a standing decision. `recoil wake` to open with bounded context; `recoil check "<proposed action>"` before acting against anything remembered.
1. **brainfile** — what is already in flight? `brainfile brief --agent <name>` reports what changed since that agent last checked in, which is the difference between resuming work and duplicating it.
1. **cymbal** — what does the code actually say? `cymbal investigate <symbol>` to understand one thing, `cymbal impact <symbol>` before changing it, `cymbal changed` to scope what you have already edited.
1. **ketch** — and only now, what is genuinely external? `ketch search`, `ketch docs`, `ketch code` for library behaviour, upstream docs, and prior art that cannot be derived from this repo.

The common inversion is reaching for the network first. It is the reflex, and it is the most expensive, least project-specific source available. A web search cannot tell you that this codebase already solved the problem, that the team rejected that approach in March, or that the symbol you are about to edit has fifty callers.

## Worked trace

One pass through the chain. Copy this shape.

```
Task: swap the per-file parser cache.

Settled knowledge  recoil check "replace the per-file parser cache"
                   -> active decision, claim-key parser-cache: bounded by bytes, not entry count.
                      Constrains the design; does not block the work.
Task state         brainfile brief --agent claude
                   -> nothing in flight touching the parser. Not a resume.
Local code         cymbal impact TreeSitter
                   -> 50 callers, 80 refs across 5 files; 2 production, 78 test.
                      Blast radius is test-heavy, so the risk is fixture churn, not runtime.
External           ketch search "tree-sitter incremental parsing cache invalidation"
                   -> upstream documents incremental reparse; confirms the invalidation
                      boundary. Reached last, and only for what the repo could not answer.

Write-back
  recoil decide --claim-key parser-cache "the cache stays bounded by bytes, not entry count"
  brainfile add --title "Swap the per-file parser cache" --files parser/cache.go
  recoil handoff --agent claude --next-step "wire the byte-bounded cache into parser.New"

Not done: no edit yet. The trace establishes the constraint, the blast radius, and the
upstream behaviour. Assumption: the 78 test refs are fixtures, not behavioural assertions —
if they assert, the change is larger than scoped.
```

The shape is the point: each surface either ends the task, constrains it, or hands to the next. A step that changes nothing about what you do next was not worth running.

## Write-back discipline

A chain consulted but never fed decays into four read-only lookups. Every surface has a write side, and the write is what makes the next session cheaper.

| Surface | Write | When |
| --- | --- | --- |
| recoil | `recoil decide --claim-key <family> "<decision>"` | A decision is made that should outlive the session |
| recoil | `recoil supersede <old-id> "<replacement>"` | Something remembered is now wrong — supersede rather than add a contradicting memory |
| recoil | `recoil handoff --agent <name> --next-step "<action>"` | Closing a session or a compaction window |
| brainfile | `brainfile add`, `brainfile note`, `brainfile complete` | Work is identified, progressed, or finished |
| cymbal | `cymbal index .` | The index is stale or the repo is new |
| ketch | `--tag <name>` on `search`, `docs`, `code` | Research worth carrying into a later session |

Two of these are load-bearing and routinely skipped. `--claim-key` is what lets a later decision supersede this one instead of sitting beside it as a contradiction, so a decision written without one is a decision that cannot be revised cleanly. And `recoil supersede` exists precisely so that being wrong is recorded as a correction rather than as a second opinion.

## Seams

Where one tool's output is the next one's input. These are the joins worth knowing by heart.

- **cymbal `changed` → brainfile.** The blast radius of your current edits is the honest scope of the task. `cymbal changed --base main` produces it; that is what belongs in the task's files and description, not a guess written before the work started.
- **ketch `--tag` → the next session.** Tagged research survives the session that found it. Untagged research is re-searched by whoever comes next, at full network cost.
- **recoil `check` → the plan.** Run it against the proposed action, not against a topic. `recoil check "drop the compat shim"` audits the actual thing you are about to do; a topic search just returns reading.
- **brainfile `brief` → the session opener.** Per-agent by design, so parallel agents each get what *they* missed rather than a shared firehose.
- **recoil `handoff` → brainfile.** Overlapping but not redundant: handoff carries reasoning and next steps for the next agent, brainfile carries the durable task board. Write the reasoning to recoil and the work item to brainfile; do not paraphrase one into the other.

## BAD/GOOD

**Searching before checking.**
BAD: `ketch search "how to invalidate a parser cache"` as the first move. Answers a generic question at network cost while the project's own answer sits unread.
GOOD: `recoil check`, then `cymbal impact`, then ketch for the residue the repo genuinely cannot answer.

**Deciding without a claim key.**
BAD: `recoil remember "we bound the cache by bytes"`. A free-floating memory that a future contradicting memory will sit beside.
GOOD: `recoil decide --claim-key parser-cache "..."`, so the next revision supersedes it and contradiction detection works.

**Guessing blast radius.**
BAD: "this looks like a small change, only a couple of call sites."
GOOD: `cymbal impact <symbol>`, then scope the task to the number it reports — including the split between production and test references, which is usually what determines the real size.

**Closing without a handoff.**
BAD: finishing the edit and stopping. The reasoning dies with the context window.
GOOD: `recoil handoff --agent <name> --next-step "<the actual next action>"` before the session ends or compacts.

## Verification checklist

Before calling chain work done, confirm:

- The cheapest surface that could have answered the question was consulted first; the network was not the opener.
- Any action taken against a remembered decision was run past `recoil check` and its verdict respected.
- Blast radius came from `cymbal impact` or `cymbal changed`, not from reading a couple of files and estimating.
- Every decision meant to outlive the session was written with `--claim-key`, and every correction used `supersede` rather than a second memory.
- Research worth keeping was tagged; task state that changed was written back.
- The session closed with a handoff naming a concrete next action, not a summary of what happened.
- Any surface that returned nothing was actually initialized for this repo. An unindexed cymbal and an empty brainfile both answer like a clean bill of health.
- No command in your output was invented. Every flag came from the tool's own `--help`, and no install command was reproduced from memory.

## References

- `references/tool-surfaces.md` — the verified command surface for each of the four tools, captured from `--help`, with the subcommands and flags this skill relies on. Load it when you need a flag you are not certain of, and re-verify against `--help` rather than trusting it if the tool has been upgraded.
