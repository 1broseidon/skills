# Anti-patterns

Load **before drafting**. These are the failures that make documentation read as generated, age badly, or waste the reader's time. The slop test catches them after the fact; this file prevents them.

## Accuracy anti-patterns

- **Documenting the framework, not the code.** Writing "supports standard pagination" because the framework usually does, without checking this app implements it. Read the source.
- **Confident defaults.** "Defaults to 30 seconds" when you never read the value. If you didn't read it, don't state it.
- **Invented completeness.** Filling a reference with plausible-but-absent options to look thorough. Document the real surface; omit what isn't there.
- **Secret-shaped examples.** `sk_live_abc123`, `password=hunter2`. Use clearly-fake placeholders: `<your-api-key>`.
- **Stale-as-truth.** Copying claims from an old README without verifying against current code.
- **Future-as-present.** Documenting roadmap features as if they ship. Mark unreleased clearly or omit.

## Structure anti-patterns

- **Mode mixing.** A reference that starts teaching; a tutorial that enumerates every option; a how-to that explains theory. One Diátaxis mode per page.
- **Burying the lead.** Three paragraphs of context before the reader learns what the page is for. First sentence answers the section's question.
- **The wall.** No headings, no lists, no tables — a slab of prose for content that is actually a lookup table.
- **Orphan pages.** A doc with no inbound links and no "see also." Readers can't find it.
- **Duplication drift.** The same fact written in four places; three go stale. Pick one canonical home, link the rest.

## Prose anti-patterns

- **Filler.** "It is worth noting that…", "In order to…", "As you can see…". Cut to the verb.
- **False ease.** "Simply", "just", "easy", "obviously" — they hide complexity and shame the stuck reader.
- **Hedge soup.** "This might possibly help in some cases" — say what it does or don't.
- **Marketing voice in technical docs.** "Blazing-fast, powerful, seamless." Show the number or the behavior; drop the adjective.
- **Over-explaining the obvious** while under-explaining the hard part. Spend words where the difficulty actually is.
- **Robotic restatement.** A docstring that says `// SetName sets the name`. Explain what isn't obvious from the name: constraints, side effects, errors.

## Example anti-patterns

- **Untested snippets.** Code that doesn't compile or run, shipped as if it does.
- **Output-less commands.** Showing a command but not what success looks like, so the reader can't tell if it worked.
- **Toy examples for real tasks.** `foo`/`bar` when a realistic example would teach more.
- **Copy-paste landmines.** Examples with placeholders that look real, so readers paste them verbatim and fail.

## Audience anti-patterns

- **Audience whiplash.** Jargon-free intro, then unexplained internals, then hand-holding again. Pick one reader.
- **Knowledge assumptions for new users.** A "getting started" that assumes the reader already knows the domain.
- **Hand-holding for experts.** A reference that explains what a variable is. Integrators want the signature, not a lesson.

## Maintenance anti-patterns

- **No single source of truth.** Facts scattered so updates miss copies.
- **Undated, unowned TODOs.** `TODO: fix this` with no owner or condition.
- **Version-coupled prose with no version marker.** "The new API" — new relative to when? Name the version.
