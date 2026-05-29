# Structure

Readers scan before they read. They arrive looking for one paragraph and decide, in seconds of skimming, whether this page has it. Structure is how they find it. Good structure makes a doc navigable without reading it; bad structure hides the right answer inside an undifferentiated wall.

## Outline first

Draft the heading tree before the prose. The outline is the cheapest place to fix a structural problem — reordering a list costs nothing; reordering finished paragraphs costs an hour. State the outline and a length budget per section before drafting:

```text
Outline (how-to: "Add a custom backend"):
1. Goal + when                 (2 sentences)
2. Prerequisites               (bulleted, versioned)
3. Implement the interface     (code block + explanation)
4. Register it                 (1 step + command)
5. Verify                      (1 command + expected output)
6. See also                    (2 links)
```

If the outline can't hold the chosen Diátaxis mode — if a reference outline starts teaching, or a tutorial outline branches — fix the outline, not the prose.

## Heading discipline

- **Headings answer questions.** "Configuring TLS" beats "Configuration". A reader scanning headings is asking "is my answer here?"
- **One H1.** The title. Everything else is H2 and below.
- **Shallow over deep.** Two or three levels. Past H4, the reader is lost; restructure or split the page.
- **Parallel phrasing.** Sibling headings share grammatical shape: all gerunds ("Installing", "Configuring") or all nouns, not mixed.
- **Front-loaded keywords.** "Backend configuration" not "Configuring the backend" if readers scan for "backend".

## Progressive disclosure

Order from most-needed to least:

- **Common before rare.** The 90% case first; edge cases later or in a separate section.
- **Simple before complex.** Minimal example, then the full-featured one.
- **Conclusion before rationale** for decision-makers; steps before theory for doers.
- **Required before optional.** What the reader must do, then what they may.

A reader who stops halfway should still have gotten the important part.

## Scannability

- **Lead sentence per section.** The first sentence states what the section delivers.
- **Lists for parallel items**, prose for connected reasoning. Don't bullet an argument; don't paragraph a lookup table.
- **Tables for any data with two-plus dimensions** (name + type + default; symptom + cause + fix).
- **Code blocks for anything the reader types or sees**, never inline for multi-line commands.
- **Whitespace is structure.** Dense slabs repel; sectioned content invites.

## Length

Match length to the doc type and the reader's task:

- A how-to that's longer than the task warrants is hiding the task.
- A reference is as long as the surface — completeness wins over brevity.
- A tutorial is as long as one sitting allows — finishable beats comprehensive.
- An explanation is as long as the idea needs and no longer.

Cut a section if removing it doesn't cost the reader anything. Split a page if it's doing two jobs.

## Navigation between docs

A doc is part of a set. Wire it in:

- **"See also" / "Next steps"** at the end, pointing to the adjacent docs (the reference for a how-to, the how-to for a tutorial).
- **No orphans.** Every page has at least one inbound link from where readers would look for it.
- **One canonical home per topic.** Link to it; don't re-document it. Duplication is future drift.
