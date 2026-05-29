# Links and format

Formatting is part of the contract. A code block the reader can't copy cleanly, a link that 404s, a table that doesn't render — each one costs trust and time. This file covers the mechanics: code fences, links, callouts, tables, and the conventions that change with the doc tooling.

## Tooling first

Confirm the rendering target before formatting. It changes link syntax, anchor rules, and available features:

| Target | Notes |
| --- | --- |
| GitHub-rendered Markdown | Relative links, autolinked headings (lowercase, hyphenated), no raw HTML reliance |
| Docusaurus / MkDocs / Sphinx (MyST) | Admonitions, cross-ref macros, sometimes `:::` callout syntax, versioned paths |
| rustdoc / godoc / JSDoc | Intra-doc link syntax per language; comment-based |
| Plain Markdown (editor preview) | Stick to CommonMark; avoid renderer-specific extensions |

When unknown, default to CommonMark that renders everywhere and note the assumption.

## Code blocks

- **Always fence multi-line code** with a language tag for highlighting: ` ```bash `, ` ```go `, ` ```json `.
- **Copy-paste clean.** No leading `$` prompts if the reader will copy the whole block (or use `$` consistently and put output in a separate block). No line numbers inside the fence.
- **Show expected output** in a separate block or with a comment, when the reader needs to confirm success.
- **Real, runnable content.** Snippets compile/run or are marked as illustrative. Placeholders are obviously fake: `<your-api-key>`, `example.com`, never `sk_live_9a8b7c`.
- **Inline code for identifiers.** Flags, filenames, functions, values: `--json`, `config.go`, `Parse()`. Never leave a literal bare in prose.

## Links

- **Descriptive link text.** `[the configuration reference](...)` not `[click here](...)` or a bare URL. Link text should make sense out of context (readers and screen readers scan links).
- **Relative links for in-repo targets.** `[setup](../how-to/setup.md)` survives forks and clones better than absolute URLs.
- **Verify anchors.** Heading anchors are renderer-specific (GitHub lowercases and hyphenates). Check they resolve.
- **One canonical target per fact.** Link to the single source of truth; don't link three near-duplicates.
- **No dead links.** Every internal link resolves to a real file/anchor; check before handoff (slop gate U07).

## Callouts

Use sparingly — overused callouts become noise. Match the renderer's syntax:

- **Note** — useful aside the reader can skip.
- **Warning / Caution** — data loss, breaking change, security. Earns attention by being rare.
- **Tip** — a genuinely better path, not filler.

In plain Markdown, a bold label works: `**Note:** ...`. In Docusaurus/MkDocs, use the admonition syntax. Don't invent a callout for every paragraph.

## Tables

- **Use for multi-dimensional data:** name + type + default + meaning; symptom + cause + fix.
- **Header row states the columns.** Keep cells terse — tables are for scanning, not prose.
- **Don't table an argument.** Connected reasoning is prose; parallel data is a table.
- **Align for readability** in source where it helps maintenance, but don't obsess — renderers don't care.

## Lists

- **Numbered** for sequence (steps where order matters).
- **Bulleted** for unordered sets (options, features, prerequisites).
- **Parallel grammar** across items: all start with a verb, or all are noun phrases.
- **Don't nest past two levels** — deep nesting signals the content wants to be a table or sub-sections.

## Consistency

Within a doc set, keep one convention for each choice: heading case, code-fence language tags, callout style, link style, terminology for the same concept. If `scribe.md` exists, it governs these. Consistency is what lets a reader who learned one page read the next one fast.
