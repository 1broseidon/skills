# Techniques

Full detail for each move in the SKILL.md catalog. Each entry has the mechanism, a before/after, an **applies when** test (does this artifact actually have the mismatch this fixes), and a **worked when** test (how to verify the change did what the mechanism predicts). Apply a technique only when its applies-test is true. A technique used where its mechanism is absent is wasted tokens at best and a new bug at worst.

Tiers: **[established]** rests on interpretability or training-dynamics results that are fairly settled. **[bet]** is a reasonable heuristic with a plausible mechanism but weaker evidence; apply lightly, drop first.

-----

## Imperative opener [established]

**Mechanism.** A prompt is processed in position order, and early positions get disproportionate attention. Whatever sits there shapes how everything after is read. Brand copy (“You are an expert, world-class…”) and capability lists (“You can read files, search, edit…”) spend that slot on tokens that do not steer behavior.

**Before.** `You are fam, an expert coding assistant. You help users by exploring code, executing commands, editing files, and verifying results.`

**After.** `You are fam, a coding agent. Your default is to act: when a tool call would answer the question, make it instead of describing what you would do. Read evidence before you edit, edit before you explore, verify before you report.`

**Applies when.** The opening lines describe identity or enumerate capabilities the rest of the prompt already covers, rather than stating the behavior you most want.

**Worked when.** The first sentence is a command the model could follow on turn one, and deleting it would visibly change behavior. If the opener is still a noun phrase about what the assistant is, it has not been fixed.

-----

## Controlled glossary [established]

**Mechanism.** Superposition: models pack many concepts into shared representational space, so reusing several surface terms for one concept tends to smear it across features and weaken every rule that references it. One canonical term per concept keeps the representation sharper.

**Before.** A prompt that says “preview” in one section, “the ledger” in another, and “the change record” in a third, all meaning the same artifact.

**After.** A glossary near the top fixing one term (“ledger”) with a one-line meaning, and that term used everywhere, every other spelling removed.

**Applies when.** The artifact uses two or more words for one concept, or uses one word for two concepts. Long multi-file artifacts drift here almost by default.

**Worked when.** Grep each synonym. Exactly one survives per concept, including in examples and reference files, not just the main body. Drift that survives in a high-salience example will be copied back in.

-----

## Gold trace [established]

**Mechanism.** Induction heads complete sequences by copying the first complete instance of a pattern they have seen. A single worked example near the top is copied far more reliably than a set of described rules is followed. The corollary is a trap: the model copies what the example *shows*, so any inconsistency between the trace and the rules below it is resolved in favor of the trace.

**Before.** A prompt that describes a workflow across nine numbered rules but never shows one full run end to end.

**After.** One complete worked instance near the top: the exact shape of a correct run, every step in order, ending in the exact output format wanted.

**Applies when.** The artifact specifies a multi-step procedure or a structured output and relies on prose to convey the shape. Also strongly indicated whenever the desired behavior is a *sequence* the model keeps getting wrong.

**Worked when.** Every token visible in the trace is something the target harness would actually render, and the trace is consistent with every rule below it. The render-path check is not optional: if the harness displays pre-tool text and your trace shows a private label, the trace teaches the model to print the label. That was a real bug in this skill’s history.

-----

## Bidirectional mapping [established]

**Mechanism.** The reversal curse: a model trained on “A is B” does not reliably answer “what is B” with A. Stating only one direction of a mapping leaves the reverse lookup unreliable, and prompts routinely need the reverse.

**Before.** A risk table that defines “R4 means breaking removal” but never says “a removed shipped flag is R4,” so the model can recite the class but not classify a situation into it.

**After.** Both directions present: the class-to-meaning table, plus a short situation-to-class list (“removed or renamed shipped surface → R4”).

**Applies when.** The artifact defines categories, codes, or labels the model must apply to inputs, not just recite. Routers, classifiers, risk schemes, and turn-type selectors all need this.

**Worked when.** For each mapping, both lookups are present in the text. Test the reverse direction specifically: given an input, can the model reach the label using only what is written.

-----

## Decompose compound rules [established]

**Mechanism.** Attention spreads unevenly across a long compound instruction, so a rule that bundles five constraints into one sentence reliably gets two or three of them followed and the rest dropped. Atomic rules are each independently attended and checkable.

**Before.** One numbered rule carrying parallelism policy, a no-batch-with-mutation rule, a no-setup-line rule, a visible-text rule, and a batch-inputs preference.

**After.** Five short rules under one header, each stating one constraint.

**Applies when.** Any single rule contains more than one independently-checkable obligation, especially if joined by “and,” “but,” or semicolons.

**Worked when.** Each resulting rule states exactly one thing you could verify in isolation. If you cannot write a single check for a rule, it is still compound.

-----

## Process-supervision gate [established]

**Mechanism.** Process supervision: rewarding decomposed, checkable intermediate steps produces more reliable behavior than rewarding a single final judgment. A holistic self-score (“rate your output 1-5 on quality”) is anchored high by training and never fails; a set of binary, countable gates with an enforced fix loop is checkable and actually constrains.

**Before.** A pre-emit self-critique stamp scoring the output 1-5 across seven axes. It never scores below 3.

**After.** A binary checklist (evidence-cited: yes/no, ledger-complete: yes/no, …) where any “no” triggers a stated fix loop: fix the cause, re-run that gate, confirm yes, continue.

**Applies when.** The artifact contains a self-assessment that produces a score or a vibe rather than a pass/fail per concrete property. Also when you want to bound a runaway behavior with a countable limit (max N calls, then a forced action).

**Worked when.** Each gate is answerable yes/no by inspecting the output, and a “no” has a defined consequence. A 1-5 axis that survived the rewrite is not a gate. Keep genuine human-run scoring rubrics separate and intact; those are measurement instruments, not model self-grading, and converting them to binary destroys them.

-----

## Accountable escape hatch [established]

**Mechanism.** Any exception condition the model grades for itself (“when practical,” “if appropriate,” “where reasonable”) is graded leniently by a confident model, which routes around the rule using the hatch. Requiring the exception to be *stated and justified in one line* moves the bar from private judgment to defensible-to-the-user, which is a real constraint.

**Before.** “Run the test red first when practical.” The model decides “practical” privately and skips it whenever it feels confident.

**After.** “If the red run is genuinely impossible (no harness, unavailable fixtures), say so in one clause and proceed; never skip it merely because you expect it to fail.”

**Applies when.** A rule has a soft escape condition the model evaluates for itself. The tell is a hedge word with no external referent.

**Worked when.** Taking the escape requires emitting a stated reason the user can see and challenge. If the model can skip silently, the hatch is still self-granted.

-----

## Delete-test forced steps [established]

**Mechanism.** Chain-of-thought is frequently unfaithful: the stated reasoning is often not what drives the answer. A “required” step whose removal would not change the output is decoration that costs tokens and teaches the model that ritual substitutes for work.

**Before.** “First, restate the problem. Then list considerations. Then decide.” where the decision is identical with or without the first two steps.

**After.** Cut the decorative steps, or make them load-bearing by having a later step consume their output in a way that changes the result.

**Applies when.** The artifact mandates intermediate steps. Run the test on each: mentally delete it; if the final artifact is unchanged, cut it.

**Worked when.** Every surviving mandated step has a downstream consumer whose output depends on it. If removing a step changes nothing, it failed and should be gone.

-----

## Mid-context placement [established]

**Mechanism.** Lost-in-the-middle: for long contexts, recall is strong at the start and end and weakest in the middle. Place content by importance, not by topical tidiness.

**Applies when.** The artifact is long enough that the middle is genuinely low-recall (many hundreds of lines), and it contains a mix of critical and reference-grade content.

**Worked when.** The opener and the closing line carry the highest-stakes instructions; pure reference material and low-stakes enumerations sit in the middle.

-----

## BAD/GOOD ending on GOOD [bet]

**Mechanism.** Recency plus pattern completion: of the patterns in a contrast pair, the last one attended is the one induction is most primed to continue. Ending a pair on the bad example raises the probability of reproducing it. This is a reasonable bet, not a settled result; the recency effect is real but its strength here is not precisely pinned. Apply it, but do not stake much on it.

**Before.** “Good: act directly. Bad: narrate every step before acting.” (ends on the failure)

**After.** “Bad: narrate every step before acting. Good: act directly, then report the verified result.” (ends on the target)

**Applies when.** The artifact uses contrast examples to mark failure modes. If it has none, the prior technique to consider is whether it needs them at all.

**Worked when.** Every contrast pair ends on the desired behavior. Trivial to verify; cheap to apply; just do not treat it as load-bearing.

-----

## Recency mandate [bet]

**Mechanism.** The closing position is high-attention and last-attended, so the final line is disproportionately likely to be honored. Put the single most important standing contract there. Same tier caveat as above: the closing-position effect is real but its magnitude is a bet.

**Applies when.** The artifact has one obligation that matters more than the rest (finish the task, never break the wire, verify before reporting) and it is currently buried mid-list.

**Worked when.** The last line of the artifact is the one contract you would keep if you could keep only one.

-----

## Exploration disposition [bet]

**Mechanism.** Generate-and-select (self-consistency style) improves outputs on underdetermined problems where many answers are plausible, and degrades them on convergent problems where evidence points to one answer, by manufacturing variance around a known solution. So the disposition should be set by the task, not applied uniformly. The underlying self-consistency result is well-supported; the framing as a per-task-type switch is the bet.

**Before.** A prompt that tells a coding agent to “consider multiple approaches and pick the best” for a mechanical bug fix where the evidence already determines the change.

**After.** Route by task type. Convergent tasks (code edits, contract design, extraction): read evidence, name the one answer, proceed; do not generate candidates. Underdetermined tasks (prose, naming, design): generate candidates, then select.

**Applies when.** The artifact drives either generation or an agent that handles both convergent and open tasks. The highest-value version is a prompt with a task-type router: define the router bidirectionally and let it flip the disposition.

**Worked when.** Convergent paths contain no generate-and-select instruction, and open paths do. If the prompt tells the model to explore alternatives on a task with a correct answer, the disposition is inverted.
