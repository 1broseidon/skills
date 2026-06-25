# Folio

**A static artifact craft skill for AI coding agents — self-contained HTML/CSS/JS documents that open locally and optionally publish to a URL.**

Folio helps agents produce artifacts like the interactive pages in ChatGPT or Claude web apps, but grounded for **local agents**: a folder on disk first, with optional no-auth publish to Surge, GitHub Pages, or Cloudflare.

It pairs with [anvil](../anvil/) (backend boundaries) and [scribe](../scribe/) (project docs). Folio owns the **browser-deliverable surface**: docs, sheets, dashboards, explainers, slides, tools, and landing pages.

Every run follows one loop:

```text
Inventory → Picks → Manifest ledger → Build → Verify → Gates → (Publish) → Handoff
```

## What it enforces

- **Static documents only.** No `fetch()` to external APIs, no WebSockets. Data is embedded, loaded from local files, or generated at build time.
- **Runnable before pretty.** Core interactions work in a browser before polish or deploy.
- **Not ugly.** Visual baseline: OKLCH token block, system fonts, no italic headings, no AI-slop patterns. Distilled from [Hallmark](https://github.com/1broseidon/skills).
- **Manifest honesty.** CDN scripts, fonts, data files are ledgered before HTML is written.
- **Local-first.** Default output is a folder on disk; publish is opt-in and never advertised proactively.
- **Binary gates.** Opens locally, console clean, ledger complete, no secrets, mocks labeled, static-only, visual baseline.

## Artifact kinds

| Kind | Reader gets |
| --- | --- |
| **doc** | A readable document with structure |
| **sheet** | Tabular data to scan, sort, or filter |
| **dashboard** | Metrics at a glance with controls |
| **explainer** | A concept walkthrough or data story |
| **slides** | A linear presentation with keyboard nav |
| **tool** | One task accomplished |
| **landing** | Orientation and navigation |

## Install

```bash
npx skills add 1broseidon/skills --skill folio
```

## Invoke

```text
folio                         # create or update one static artifact (standalone by default)
folio describe <path|url|slug> # read an artifact's manifest entry
folio audit <path|url>        # read-only manifest, security, and runtime audit
folio publish <site-root>     # deploy a site root to surge / gh-pages / cf-pages / cf-worker
folio remix <path|url>        # fork and modify while preserving manifest honesty + lineage
```

## Host profiles (v0.2)

| Profile | Default? | Use when |
| --- | --- | --- |
| `local` | yes | Agent or human opens from disk via static server |
| `surge` | no | Quick public URL, no auth setup proactively surfaced |
| `gh-pages` | no | Repo-backed static site |
| `cf-pages` | no | Cloudflare Pages via Wrangler |
| `cf-worker` | no | Static assets on a Worker (advanced) |

Auth for external hosts is checked silently when publish is requested. If not configured, the user gets one clear instruction. Details: [references/host-profiles.md](references/host-profiles.md).

## Repository layout

```text
.
├── SKILL.md                     # main skill entrypoint
├── references/
│   ├── evidence.md
│   ├── artifact-types.md
│   ├── visual-baseline.md       # design patterns (distilled from Hallmark)
│   ├── host-profiles.md
│   ├── manifest-ledger.md
│   ├── verification.md
│   ├── security.md
│   ├── slop-test.md
│   ├── anti-patterns.md
│   ├── folio-md.md
│   ├── site-index.md            # site-root model + standalone-to-site upgrade
│   ├── philosophy.md            # human-only design rationale
│   ├── templates/               # 7 gate-passing starters, one per kind
│   ├── examples/                # human-only worked examples (describe, audit, remix)
│   └── verbs/                   # audit, describe, publish, remix
├── ROADMAP.md
└── README.md
```

## Status

Version `0.2.4` — static-only discipline, new artifact kinds, visual baseline, auth probe, site-root publish model, canonical manifest with per-artifact ledger and provenance, `describe` verb, standalone-to-site upgrade, honest local/remote audit, gate-passing template starters per kind, entrance-gate anti-overuse.

See [ROADMAP.md](ROADMAP.md).

## Out of scope

Folio does not build production SPAs, backend APIs, authenticated apps, or database-backed tools. It does not replace full product UI design — it ships **runnable static documents** for demos, reports, and handoff.
