# Tutorial

**Diátaxis mode: learning.** The reader is a beginner who learns by doing. Your job is to give them a guaranteed success — a moment where something works and they feel competent. You are a teacher, not a reference manual.

## The contract

- **One path, no choices.** The reader does not yet know enough to choose. Make the decisions for them. No "you can either… or…".
- **Guaranteed to work.** Every step succeeds if followed exactly, from a clean starting state. Test the whole sequence end to end.
- **Concrete over abstract.** Real commands, real output, real result. Explain just enough to keep moving; save theory for an explanation page.
- **Builds to something.** The reader ends with a working artifact they made, not a pile of disconnected facts.

## Shape

```text
1. What you'll build / learn   — the payoff, in 1–2 sentences, up front
2. Prerequisites                — versioned, checkable; nothing assumed silently
3. Steps (numbered)             — one action each, with the command and its expected output
4. Checkpoint(s)                — "you should now see X" so the reader confirms progress
5. What you built               — recap the result
6. Next steps                   — 2–3 links: the how-to and explanation pages that go deeper
```

## Rules

- **Show expected output** after commands. The reader needs to confirm each step worked before continuing.
- **State prerequisites with versions.** "Node 18+", not "Node". Give a check command (`node --version`).
- **Start from clean state.** Don't assume leftover config, running services, or prior tutorials.
- **Don't explain everything.** A tutorial that stops to explain every concept loses momentum. Link to explanation pages: "We'll use X here; see [why X](...) for the details."
- **No edge cases.** Edge cases belong in how-to and reference. The tutorial is the golden path.
- **Keep it finishable.** A tutorial the reader can complete in one sitting beats a comprehensive one they abandon.

## Verification

Run the entire sequence from a clean checkout. Every command must produce the shown output. If step 7 depends on step 3's artifact, prove the chain works. A tutorial with one broken step is worse than none — it destroys trust at the exact moment you're building it.

## Anti-patterns

- Branching ("if you're on Mac… if you're on Windows…") — split into separate tutorials or pick one and note the others.
- Enumerating options — that's reference.
- Assuming domain knowledge — that's the one reader who can't have it.
- Ending without a working result.
