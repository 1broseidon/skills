---
name: prompt-mechanics
description: "Engineer system prompts, agent instructions, and other skills against how LLMs actually process text, instead of writing them by feel. Use when authoring or revising any prompt-like artifact: a system prompt, agent instruction set, SKILL.md, tool-use policy, CLAUDE.md, or long behavioral instruction block an LLM executes. Triggers: 'tighten/improve this prompt', a critique or rewrite request, a prompt that is ignored or unreliable, or porting a prompt to a new harness or model. The value is applying the mechanism behind each fix, not just the fix."
version: 0.1.0
---

# Prompt mechanics

Engineer prompts against how LLMs process text. The default failure mode in prompt authoring is writing by feel: adding a rule because it sounds right, stacking emphasis, hoping the model complies. This skill replaces feel with a method. Every change names the mechanism that makes it work, and every change is verified against that named mechanism rather than against a self-report or a vibe.

Two things live here. The method is the spine: how to evaluate a prompt, change it, and check the change. The techniques are named moves that hang off the method, each carrying its own mechanism and its own test for when it does not apply. Apply the method always. Reach for a technique only when its mechanism is actually present in the artifact in front of you. A glossary on a prompt that has no vocabulary drift is wasted tokens; a gold trace in a render path that displays it is a bug. The method is what tells you which.

## Glossary

One canonical term per concept, used everywhere below.

| Term | Meaning |
| --- | --- |
| artifact | The prompt-like thing being authored or revised: system prompt, agent instruction set, skill, tool-use policy, CLAUDE.md, long rule block |
| mechanism | The reason a change works, grounded in how the model processes text (attention, induction, superposition, etc.), not in taste |
| tier | How settled a mechanism is: `[established]` or `[bet]` |
| target harness | The runtime the artifact executes in: its position, render path, tools, and length budget |
| render path | Which channels the harness shows or hides (pre-tool text, reasoning, tool calls) |
| gold trace | One complete worked example near the top of an artifact, consistent with every rule below it |
| mismatch | A place where an instruction fights the mechanism the model actually applies to it |

## When this applies

Use it for any artifact an LLM will execute as instructions: system prompts, agent instruction sets, skills, tool-use policies, CLAUDE.md files, long behavioral rule blocks. Use it for both fresh authoring and revision. Do not use it for ordinary prose, documentation aimed at humans, or code; those are not executed as model instructions and the mechanisms here do not apply to them.

## The method

Work this loop. It is the part that does not change.

1. Read the artifact as the model will receive it. Note where it sits (system vs first user turn), how long it is, and which render path shows or hides what. A prompt is processed in position order with uneven attention, not read like a document. The constraint that matters most is often the environment the prompt runs in, not the prompt text.
1. Find the mechanism mismatches. For each instruction, ask what the model actually does with it: does it sit in a high-attention position or get lost in the middle, is the rule stated once or drifting across synonyms, is a “required” step one whose removal would change nothing, is a critical example absent so the model has nothing to copy. The Technique catalog below names the common mismatches.
1. Make one change per mismatch, and name the mechanism in your change log or delivery notes (not inside the target artifact, unless its format supports comments and the note helps the model). “Move the opener to an imperative because early positions get disproportionate attention” is a change you can verify. “Make it punchier” is not.
1. Verify against the named mechanism, not against a self-report. This is the step most authors skip and the one that catches the real bugs. If you added a glossary to fix vocabulary drift, grep every synonym and confirm one canonical term survives. If you added a gold trace, confirm every visible token in it is something the harness would actually render. If you wrote a “forced step,” delete it mentally and check the output degrades; if it does not, the step was theater. The model’s own claim that it complied is not evidence.
1. Check cross-file and cross-section consistency. Tightening one section while leaving its dependents stale is the most common way a prompt fails its own discipline. If you change a vocabulary or a rule in one place, every other place that referenced the old form is now drift you introduced.

The method is mechanism-grounded throughout, but be honest about how settled each mechanism is. Some are well-established; some are reasonable bets. Apply the well-established ones freely. Treat the bets as bets: useful defaults, not laws, and the first thing to drop if a change is not earning its keep. The catalog marks the tier of each.

## Worked trace

One pass of the method, end to end. Copy this shape.

```
Artifact: a coding agent's system prompt. Position: system. Render path: pre-tool text is displayed as narration; reasoning is hidden.
Mismatches found:
- Opener spends first line on identity ("You are an expert assistant that can read, search, edit..."). First-position attention wasted on a capability list.
- "mode", "turn type", and "task kind" all name the same concept. Synonym drift.
- A required step ("first restate the task") whose removal changes no output. Delete-test failure.
Changes (one per mismatch, mechanism named):
- Rewrote opener to an imperative naming the core behavior. [Imperative opener, established]
- Fixed one canonical term "turn type"; removed the other two spellings. [Controlled glossary, established]
- Cut the restate-the-task step. [Delete-test forced steps, established]
Verification against the named mechanism:
- Opener is now a command that would change behavior if deleted: pass.
- grep "mode"|"task kind": zero survivors outside their unrelated senses: pass.
- Deleted the cut step mentally; output identical, so removal was correct: pass.
Not changed: the BAD/GOOD pairs (already end on GOOD). Assumption: pre-tool text is displayed; if the harness hid it, the opener placement argument would weaken.
```

## Reading the artifact’s environment first

Before any rewrite, establish the constraints the prompt runs under, because a technically perfect prompt that fights its harness loses. The questions that change what you can write:

- Position: is this a system prompt, a developer prompt, the first user turn, or injected mid-conversation? Position sets which content gets the highest-attention slots.
- Render path: does the harness display the model’s pre-tool text, its reasoning, both, neither? If pre-tool assistant text becomes visible narration, you cannot ask the model to “state” a routing decision in that text; it has to decide privately. This is the exact bug that turns a clean prompt into one full of harness chatter.
- Tool and capability model: what tools exist, what are they named, what is already policy-guarded. A rule that re-bans something the harness already blocks is dead weight; a rule that assumes a tool that does not exist is a landmine.
- Length budget: a system prompt pays its token cost on every turn. A gold trace that amortizes well over a long session may be too expensive for a short one. Name the tradeoff; do not pretend it is free.

Get these wrong and the most elegant technique misfires. Most of the real bugs in this skill’s own development history were environment mismatches, not bad techniques. See `references/worked-example.md`.

## Technique catalog

Each technique is a named move with the mechanism that justifies it and the tier of how settled that mechanism is. Tiers: **[established]** is well-supported by interpretability or training research; **[bet]** is a reasonable heuristic with a plausible mechanism but weaker evidence, to be applied lightly and dropped first. Full detail, examples, and the per-technique delete-test live in `references/techniques.md`; load it when applying a specific move. The table is the index.

|Technique               |What it does                                                                                                                        |Mechanism                                                                                                |Tier       |
|------------------------|------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|-----------|
|Imperative opener       |First body line is the core behavior as a command, not brand copy or a capability list                                              |Early positions get disproportionate attention; spend them on signal                                     |established|
|Controlled glossary     |One canonical term per concept, fixed near the top, used everywhere                                                                 |Superposition: reusing several terms for one concept tends to smear it across features and weaken recall  |established|
|Gold trace              |One complete worked example near the top, internally consistent with every rule below it                                            |Induction heads copy the first complete instance more reliably than they follow described rules          |established|
|Bidirectional mapping   |State both directions of any mapping: meaning to label and label to meaning                                                         |Reversal curse: a model trained on “A means B” does not reliably infer “B means A”                       |established|
|Decompose compound rules|Split a rule that bundles several constraints into atomic, separately checkable rules                                               |Attention is uneven across a compound instruction; bundled constraints get partially dropped             |established|
|Process-supervision gate|Replace a holistic self-score with binary, countable, checkable artifacts and an enforced fix loop                                  |Decomposed checkable steps beat a single quality judgment the model anchors high                         |established|
|Accountable escape hatch|An exception must be stated and justified in one line, not silently self-granted                                                    |A confident model grades a self-judged condition leniently; forcing a stated reason raises the bar       |established|
|Delete-test forced steps|Any required step whose removal does not change the output is theater; cut it or make it load-bearing                               |Chain-of-thought is often unfaithful; a step that does not move the result is decoration                 |established|
|Mid-context placement   |Put the least critical content in the middle, not the start or end                                                                  |Lost-in-the-middle: recall is worst for the center of a long context                                     |established|
|BAD/GOOD ending on GOOD |Contrast pairs for top failure modes, each ending on the desired behavior                                                           |Recency plus pattern completion: the last-attended pattern is the one most likely continued              |bet        |
|Recency mandate         |Put the single most important standing contract as the final line                                                                   |The closing position is high-attention and last-attended                                                 |bet        |
|Exploration disposition |Decide per task type whether to induce or suppress exploration; converge where there is a correct answer, explore where there is not|Generate-and-select adds value only on underdetermined problems; on convergent ones it manufactures noise|bet        |

## Disposition: induce or suppress exploration

The single highest-leverage decision in an agent or generative prompt is whether the task has a correct answer. When it does (a backend contract, a code edit, a factual extraction), suppress exploration: read the evidence, name the one honest answer, proceed. Generating three candidates and selecting one manufactures noise around a known solution. When it does not (prose, design, naming, open synthesis), induce controlled exploration: generate candidates, then select. A prompt that routes between task types, like an agent that switches on turn type, is flipping between these two dispositions, which makes the router the most important primitive in the prompt. Get the router defined bidirectionally (signals to type, and type to behavior) before anything else.

## Output discipline

When you deliver a rewrite, deliver the rationale with it. For each change, state the mechanism and the tier in one clause, so the user can overrule a bet they disagree with. Do not present bets as established fact; that is the calibration that lets the user trust the established moves. End by naming what you deliberately did not change and why, and name any environment assumption you made that, if wrong, would flip a decision. The worked example shows this register.

## Verification checklist

Before handing back, confirm:

- Every change names its mechanism, and bets are marked as bets.
- Every visible token in any gold trace is something the target harness would actually render.
- Every canonical glossary term has exactly one spelling across the whole artifact; grep the synonyms and confirm zero survivors.
- Every “required” or “forced” step survives its delete-test, or was cut.
- Every mapping the model must use in reverse is stated in both directions.
- No rule re-bans something the harness already guards, and no rule assumes a tool or channel that does not exist.
- Tightened sections and their dependents agree; you introduced no new drift.
- The single most important contract sits in the opener or the closing line, not buried mid-list.

## References

- `references/techniques.md` — full detail for each catalog technique: the mechanism, a before/after, and the specific test for whether the technique applies and whether it worked. Load when applying a specific move.
- `references/worked-example.md` — the development history this skill was distilled from: engineering two skills and an agent system prompt, including the real misfires (a render-path bug that printed a routing label the harness displayed, cross-file vocabulary drift, a missing test-first trace) and how the method caught each. Read it to calibrate the register and to see the method find its own bugs.
