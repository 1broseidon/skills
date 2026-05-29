# Explanation

**Diátaxis mode: understanding.** The reader wants to understand — the why behind the how, the design decisions, the trade-offs, the mental model. This is the most prose-driven type and the one where opinion and context are not just allowed but required. It is read away from the keyboard, when the reader is trying to grasp the shape of the thing.

## The contract

- **Discusses, doesn't instruct.** No numbered steps. No "do this". You're explaining, not directing.
- **Provides context and rationale.** Why does the system work this way? What alternatives were rejected? What constraints shaped it?
- **Connects ideas.** Explanation links concepts together, draws comparisons, gives the reader a model they can reason with.
- **Allows opinion.** "We chose X over Y because…" is the whole point. Reference and how-to stay neutral; explanation takes a position and defends it.
- **Bounded by truth.** Opinions are fine; invented mechanisms are not. The behavior you explain must match the code. Explain the real design, not an idealized one.

## Shape

Looser than other types — it's prose. But a useful skeleton:

```text
1. The question / topic       — what concept or decision this page illuminates
2. Context                    — the problem space, constraints, forces at play
3. The approach               — how the system addresses it, and the model behind it
4. Trade-offs / alternatives  — what was chosen, what wasn't, and why
5. Implications               — what this means for how you use or extend it
6. See also                   — the how-to and reference pages for the practical side
```

## Rules

- **Lead with the question.** The first paragraph states what the reader will understand by the end.
- **Prose where prose earns it.** This is the one type where paragraphs beat tables. Use them to build a model.
- **Ground claims in the real design.** "The cache is write-through" must be true of the code. Cite source where it helps.
- **Name the trade-offs honestly.** Every design has costs. A page that only lists benefits reads as marketing and teaches nothing.
- **Don't drift into steps.** The moment you write "first, run…", you're in how-to territory. Move it.
- **Don't enumerate the surface.** Options and signatures belong in reference. Link to them.

## Verification

Lighter on command-checking, heavier on accuracy-of-model. Confirm that the architecture, data flow, and behavior you describe match the code. The risk here isn't a wrong flag — it's a plausible, well-written explanation of a mechanism that doesn't actually exist that way. Read the relevant source before explaining it.

## Anti-patterns

- Turning into a tutorial or how-to (steps creep in).
- Listing options (that's reference).
- All benefits, no trade-offs (marketing voice).
- Explaining an idealized design instead of the real one.
- Abstract hand-waving with no concrete grounding in the actual system.
