# Doc types

**Pick one before drafting.** Then load the matching deep file under `doc-types/<slug>.md` if it exists. Each type answers a different reader question, has a different shape, and fails in a different way. The most common documentation mistake is writing one type while thinking you're writing another.

## The Diátaxis backbone

Four of the types map to the [Diátaxis](https://diataxis.fr/) framework, organized on two axes: **study vs. work**, and **practical vs. theoretical**.

```text
            PRACTICAL                 THEORETICAL
STUDY     Tutorial  (learning)      Explanation (understanding)
WORK      How-to    (task)          Reference   (information)
```

The discipline: a reader is in exactly one of these modes at a time. A page that serves one mode well beats a page that serves all four poorly. When you need another mode, make another page and link to it.

## Index

| # | Type | Slug | Reader's question | Deep file |
| --- | --- | --- | --- | --- |
| 01 | Tutorial | `01-tutorial` | "Teach me by doing." | drafted |
| 02 | How-to guide | `02-how-to` | "How do I accomplish X?" | drafted |
| 03 | Reference | `03-reference` | "What exactly does this do?" | drafted |
| 04 | Explanation | `04-explanation` | "Why is it this way?" | drafted |
| 05 | README | `05-readme` | "What is this, should I use it, where do I start?" | drafted |
| 06 | Architecture / ADR | `06-architecture` | "How is it built and why these choices?" | stub |
| 07 | Changelog / migration | `07-changelog` | "What changed and what must I do?" | stub |
| 08 | Runbook / ops | `08-runbook` | "It's on fire — what do I run?" | stub |

If a deep file is a stub or absent, use the row below as the contract and continue. Do not fail or load unrelated files.

## Type at a glance

| Type | Shape | Length norm | Top failure |
| --- | --- | --- | --- |
| Tutorial | Numbered, one happy path, builds to a result | Medium–long | Branching into options; assuming setup |
| How-to | Numbered steps for one goal | Short | Teaching instead of doing |
| Reference | Tables/entries, exhaustive, scannable | As long as the surface | Narrating; omitting surface |
| Explanation | Prose, concepts and trade-offs | Medium | Drifting into steps; no opinion |
| README | Orientation + routing, links out | Short–medium | Inlining deep detail; broken quick-start |
| Architecture/ADR | Context → decision → consequences | Medium | Usage steps; vague rationale |
| Changelog | Versioned, grouped by change kind | Grows over time | Untraceable entries |
| Runbook | Symptom → command → expected result | Short, dense | Background theory mid-incident |

## Choosing when the request is ambiguous

- "How do I…" → **how-to** (one task) unless they want to learn the whole thing → **tutorial**.
- "Document the…" / "what are all the…" → **reference**.
- "Explain / why / how does it work" → **explanation**.
- "Getting started" → **tutorial** if hands-on, **README** if orientation.
- "What changed" → **changelog**; "how do I upgrade" → **migration (how-to family)**.

Ask once if it genuinely splits two types. Otherwise pick the one the phrasing implies and state your choice.

## Mixing rule

If a single page legitimately needs two modes (common in small projects with one README), separate them with clear headings and keep each section pure: a "Quick start" (tutorial-ish) section and a "Reference" section can coexist in a README, but the reference section must not start teaching and the quick-start must not start enumerating options. When the project grows, split them into separate pages.
