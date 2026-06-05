# Worked example: the method finding its own bugs

This skill was distilled from engineering three artifacts: two skills (a documentation skill and a backend-craft skill) and an agent system prompt. The value of reading this is not the specific artifacts; it is watching the method catch bugs that the techniques alone would have produced. The method is mechanism-grounded, but the bugs were environment mismatches, which is exactly where mechanism-by-feel fails.

Read this to calibrate two things: the register of a good delivery (mechanism named, tier stated, non-changes called out), and the discipline of verifying against a named check instead of a self-report.

-----

## Case 1: the technique that was right and the environment that made it wrong

The agent system prompt needed a task-type router, because a coding agent is two dispositions in one prompt: convergent on implement turns, exploratory on research turns. The router is the highest-leverage primitive. The first rewrite defined the router well and added a gold trace showing a full implement turn, opening with a visible label: `[turn type: implement]`.

The author of the harness pushed back with a fact about the render path: the harness displays pre-tool assistant text immediately, and that text persists as narration or a tool-group title. So a visible turn-type label is exactly the harness chatter the prompt’s own Response Style section banned.

This is the central lesson. The technique (gold trace) was correct and the router design was correct. The bug was that the trace was written as if the harness had a hidden scratch channel for the label, and it did not. The prompt contradicted itself: one section said suppress preamble, the trace modeled emitting preamble, and because the model copies the trace over the rule, the trace would win.

The fix was not to drop the router. It was to move the routing decision into the channel the harness *does* hide (reasoning), and to rewrite the trace so every visible token is something the harness would actually render: tool calls and a one-line result, no label. The annotations explaining the call count became margin commentary for the human reader, explicitly not text the model emits.

The method step that catches this is “read the artifact as the model will receive it,” specifically the render-path question. Skipping it produces a beautiful prompt that generates chatter on turn one.

-----

## Case 2: cross-file drift, the discipline failing its own discipline

The backend-craft skill had grown to a main file plus many reference files. Tightening the main file introduced a controlled glossary that fixed evidence levels to four canonical values. But one reference file still defined five, and a self-critique stamp that the main file had removed still lived in three other places: a gate, a verb reference, and a worked example. The worked example even used different axis names than the main file, so the example and the rule already disagreed.

Left alone, the dead format would have been copied back in from the high-salience example, because induction heads pattern-match the example over the rule. The glossary fix on the main file was correct and useless in isolation, because its dependents were stale.

The method step that catches this is the cross-file consistency check, and the verification is mechanical: grep the synonyms and the dead stamp across every file, expect zero survivors. A self-report (“I updated the evidence levels”) passes; the grep is what actually proves it. The recurring catch across this whole history: self-reports pass everything, and real verification requires reading the output against a specific named rule.

-----

## Case 3: the missing trace, and why prose does not override an example

The agent prompt needed a test-first path for repos that require it: write the failing test, run it red, implement, run it green. The first version stated this in prose inside the implement-turn definition. The push-back was that the red/green sequence was not spelled out strongly enough, and the deeper issue was that the single gold trace only modeled the non-test-first path.

A test-first turn has a different visible shape: two mutations (test file, then implementation) with a verification wedged between them, which is a different order than the simple trace teaches. Induction copies the shape it was shown. Prose describing a different shape does not reliably override a visible example of the wrong one.

The fix was a second, skeletal trace showing exactly the order: write test, run red, edit, run green, with a result line that reports both phases. Plus an accountable escape hatch on the red run, because “run it red when practical” is a self-graded condition a confident model skips. The hatch became: skipping the red run requires a stated reason the user can see.

The method steps at work: the gold-trace technique’s own caveat (the model copies what the trace shows, so a needed shape needs its own trace), and the accountable-escape-hatch technique (a soft self-judged condition gets graded leniently unless the exception must be stated).

-----

## The register to copy

Each delivery in this history did the same things, and the skill’s output discipline asks for them:

- Named the mechanism for each change, in one clause, so the user could evaluate it.
- Marked which mechanisms were established and which were bets, so the user could overrule a bet without distrusting the established moves. Presenting a bet as fact would have poisoned the calibration.
- Pushed back where a proposed change had a soft spot, rather than accepting it whole. The “when practical” hedge got challenged and replaced with an accountable hatch; that was the author acting as architect, not order-taker.
- Ended by naming what was deliberately not changed and why (the risk-class scheme left intact because it was the strongest mechanism present; a YAML key left unrenamed because renaming it was a breaking change that needed its own deprecation path, not a casual edit).
- Flagged the environment assumptions that, if wrong, would flip a decision, which is what surfaced the render-path bug in the first place.

The throughline: techniques are cheap and a model can apply them by pattern. The method is what makes the application correct, and verification against a named check is what separates a real fix from a self-report that everything is fine.
