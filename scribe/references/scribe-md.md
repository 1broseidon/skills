# scribe.md

`scribe.md` is the opt-in convention artifact that locks a project's documentation style so every doc — and every future scribe run — stays consistent. It is to docs what a style guide is to a publication. Once it exists, house style wins over scribe defaults.

## When to emit

Only on request: *lock the style*, *give me a scribe.md*, or *make the docs conventions portable*. Don't create it unprompted — an unwanted config file is clutter.

## What it captures

Record the decisions that should not be re-litigated per doc:

```markdown
# scribe.md

## Voice
- Person: second person ("you run")
- Tense: present, active
- Tone: precise, no marketing adjectives

## Terminology
- The product is "Acme", never "the app" or "the tool"
- Use "endpoint" not "route" in prose
- Spell "command-line" hyphenated

## Structure
- Doc types: Diátaxis (tutorial / how-to / reference / explanation)
- Layout: docs/tutorials/, docs/how-to/, docs/reference/, docs/explanation/
- Every page ends with a "See also" section
- Reference ordering: alphabetical within category

## Formatting
- Renderer: Docusaurus (use admonition syntax `:::note`)
- Code fences: always language-tagged
- Links: relative, descriptive text
- Headings: sentence case

## Evidence
- Snippet execution: required for bash/JS, skipped for the embedded-device examples
- Version claims: must cite package.json engines

## API docs
- In-code style: TSDoc; prose reference generated via TypeDoc — do not hand-edit
```

## How scribe uses it

- **Read it during source inventory.** If present, it overrides defaults and makes consistency the baseline.
- **Conform new docs to it** rather than scribe's generic conventions.
- **Flag conflicts.** If a request contradicts `scribe.md` (e.g. "write this in first person" when the file says second), surface the conflict and ask which wins.

## Keeping it lean

`scribe.md` records decisions, not prose lessons. It should fit on a screen or two. If it grows into a full style manual, link out to that manual and keep `scribe.md` as the quick-reference index of choices. Trim anything that's never been ambiguous in practice.
