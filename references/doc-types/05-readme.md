# README

**Mode: orientation + routing.** The README is the front door. Most readers arrive here first and decide in seconds whether to stay. Its job is to answer three questions fast — *what is this, should I use it, where do I start* — and then route each reader type to the right deeper doc. It is not the place for the full API; it links there.

## The contract

- **Above-the-fold clarity.** The first screen tells the reader what the project is and whether it's for them. One sentence, no jargon, no marketing.
- **Fast to first success.** A quick-start that actually runs from a clean checkout. This is the single highest-value section.
- **Routes, doesn't contain.** Deep API detail, full tutorials, and exhaustive config belong in dedicated docs. The README links to them.
- **Honest scope.** Features listed exist in the code. "Coming soon" is clearly marked, not implied as present.

## Shape

```text
1. Name + one-line description   — what it is, plainly
2. (badges, if meaningful)        — build/version/coverage that actually work
3. What it does / why            — 2–4 sentences or a short bullet list of real features
4. Install                       — the real command, version-aware
5. Quick start                   — minimal runnable example to first success
6. Usage / key examples          — 2–3 common real invocations
7. Where to go next              — links: full docs, reference, how-tos, contributing
8. Project meta                  — license, support, contributing path (for public repos)
```

Scale to the project: a small library's README can hold a short reference inline; a large project's README is almost pure routing.

## Rules

- **Lead with what it is**, not how to install it. The reader decides relevance before they install.
- **One-line description that distinguishes.** "A fast CLI for X" beats "A tool for developers".
- **Quick-start must run.** Test it from a clean state. A broken quick-start in the README is the most damaging single defect in a project's docs.
- **Real features only.** Cross-check the feature list against the code surface.
- **Link out for depth.** Resist inlining the full flag reference or a 10-step tutorial. Link to them; keep the README skimmable.
- **Meaningful badges only.** A broken or stale badge is worse than none.
- **Route by reader.** A "Documentation" section that points new users, integrators, and contributors to their respective pages.

## Verification

Run the install command and the quick-start from a clean checkout. Check the feature list against real code. Verify every link resolves. Confirm the stated minimum versions against the manifest.

## Anti-patterns

- Burying what-it-is under install instructions or badges.
- A quick-start that assumes prior setup.
- Inlining the entire API (turns the README into an unscannable reference).
- Feature lists describing roadmap as if shipped.
- Decorative-only badges.
- No routing — the reader who needs the how-to can't find it.
