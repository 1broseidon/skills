# How-to guide

**Diátaxis mode: task.** The reader is competent and has a specific goal. They know what they want; they need the steps to get it. Respect their time: get to the task, finish the task, stop.

## The contract

- **One goal per guide.** "Configure TLS", "Add a custom backend", "Export results as CSV". Titled as a task, usually starting with a verb.
- **Assumes competence.** The reader knows the domain and the tool's basics. Don't teach — that's a tutorial.
- **Practical, not complete.** Cover the real path for this task, including the common variations that matter. Skip the full option surface — that's reference.
- **Addresses real-world messiness.** Unlike a tutorial, a how-to can branch ("if you use Postgres… if you use MySQL…") because the competent reader can choose.

## Shape

```text
Title: "How to <accomplish goal>"
1. Goal + when you'd want this  — one or two sentences of context
2. Prerequisites                — only what this task needs
3. Steps (numbered)             — commands with the relevant flags; expected result per step
4. Variations                   — the common forks ("for X, do Y instead")
5. Verify                       — confirm the goal is achieved
6. See also                     — reference for full options, related how-tos
```

## Rules

- **Title as a task.** "How to rotate credentials", not "Credentials". The reader scans titles looking for their goal.
- **Front-load the goal.** First sentence confirms they're in the right place.
- **Real flags, real values.** Show the actual invocation, not a skeleton. Use realistic placeholders.
- **Link out for depth.** Don't inline the full flag reference; link to it. Don't explain the concept; link to it.
- **Cover the failure the reader will hit.** If a step commonly fails, say what success and failure look like.
- **Stop at the goal.** When the task is done, end. No victory-lap prose.

## Verification

Run the steps and confirm they produce the stated result. If the guide branches, verify the primary branch and statically check the others. Every flag and command must exist in source.

## Anti-patterns

- Teaching basics the competent reader already has.
- Enumerating every option (that's reference).
- A "how-to" that's actually five tasks — split it.
- Skipping the verify step, so the reader can't tell if they succeeded.
