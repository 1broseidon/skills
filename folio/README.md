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
folio share <site-root>       # temporary public link via tunnel (localhost.run default, --ngrok alt)
folio publish <site-root>     # durable deploy to surge / gh-pages / cf-pages / cf-worker
folio remix <path|url>        # fork and modify while preserving manifest honesty + lineage
```

## Run locally

The default deliverable is a folder you can open. For anything beyond a fully inlined single file, serve it over HTTP so relative `fetch` and module imports work. One command ensures the `artifacts/` folder, regenerates the index/search page from the manifest ledger, finds an open port, and serves the site root:

```bash
node <folio-skill>/scripts/serve.js <site-root>
# serve: url:  http://127.0.0.1:8000/
```

Zero npm dependencies (Node stdlib only). No Node? Any static server works (`python3 -m http.server`, `php -S`, `npx serve`) — start it from the **site root**, not an artifact subdirectory. Full guide, including the system-agnostic runtime probe order: [references/local-server.md](references/local-server.md).

## Share a temporary link

To let someone see the artifact **right now** — without deploying it anywhere — open a tunnel to the running local server. The default is [localhost.run](https://localhost.run/) over SSH: no install, no account. One command starts the server (if needed), opens the tunnel, and prints the observed public URL:

```bash
node <folio-skill>/scripts/share.js <site-root>
# share: public  https://<sub>.lhr.life   (ephemeral — closes on Ctrl-C)
```

The machine stays the host and the link dies with the process — it is **not** a deploy. Pass `--ngrok` to use ngrok instead (needs the `ngrok` binary + authtoken). When the link must persist, that is publish, not share. Details: [references/verbs/share.md](references/verbs/share.md).

## Reach: local → share → publish

| Tier | Command | Reach | Lifetime |
| --- | --- | --- | --- |
| **local** | `scripts/serve.js` | loopback (`127.0.0.1`) | while serving |
| **share** | `scripts/share.js` | temporary public URL | while the process runs |
| **publish** | `folio publish` | durable public URL | until torn down |

`share` is the default answer to "send me a link." The **host profiles** below are for durable publishing — when the URL must outlive the session.

## Host profiles (v0.2)

| Profile | Default? | Use when |
| --- | --- | --- |
| `local` | yes | Agent or human opens from disk via static server |
| `surge` | no | Durable public URL, no repo setup (quick temporary link → `share`) |
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
│   ├── local-server.md          # run locally: file:// vs HTTP, serve.js, runtime probe
│   ├── philosophy.md            # human-only design rationale
│   ├── templates/               # 7 gate-passing starters, one per kind
│   ├── examples/                # human-only worked examples (describe, audit, remix)
│   └── verbs/                   # audit, describe, share, publish, remix
├── scripts/
│   ├── gen-index.js             # build index/search page from .folio/site.json
│   ├── serve.js                 # one-command local run (ensure artifacts/, regen index, open port, serve)
│   └── share.js                 # temporary public link via tunnel (localhost.run default, ngrok alt)
├── ROADMAP.md
└── README.md
```

## Status

Version `0.2.6` — temporary public link via tunnel (`scripts/share.js`: starts/attaches the local server, opens a localhost.run SSH tunnel by default — no install, no account — or ngrok on `--ngrok`, prints the observed URL, tears down cleanly), `share` verb separating ephemeral sharing from durable publish, three-tier reach model (local → share → publish), one-command local run (`scripts/serve.js`), consolidated system-agnostic local-run guide (`references/local-server.md`), static-only discipline, new artifact kinds, visual baseline, auth probe, site-root publish model, canonical manifest with per-artifact ledger and provenance, `describe` verb, standalone-to-site upgrade, honest local/remote audit, gate-passing template starters per kind, entrance-gate anti-overuse.

See [ROADMAP.md](ROADMAP.md).

## Out of scope

Folio does not build production SPAs, backend APIs, authenticated apps, or database-backed tools. It does not replace full product UI design — it ships **runnable static documents** for demos, reports, and handoff.
