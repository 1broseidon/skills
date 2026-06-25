---
name: folio
description: "Static artifact craft skill for self-contained HTML/CSS/JS documents: docs, sheets, dashboards, explainers, slides, tools, and landing pages. Use when the user asks for a durable, openable, shareable web deliverable they'll keep or hand off — a report, a dashboard, a slide deck, a data table, a page. Local folder first, optional publish to Surge, GitHub Pages, or Cloudflare Pages. Not for quick look renders, inline snippets, or throwaway scratch. Not for SPA frameworks, backend APIs, database apps, or production product UI."
version: 0.2.4
---

# Folio

Read the request and any existing artifact before writing HTML. Every external dependency and publish URL belongs in the manifest ledger. Artifacts are static documents — they do not call APIs.

## When to use folio — and when not to

Folio is for **durable, openable, shareable web deliverables** — things the user will keep, reopen, or hand to someone else.

**Use folio when:**

- The user asks for a doc, dashboard, sheet, deck, or page they'll save or send
- The output is a deliverable, not a quick look ("make me a report", "build a dashboard for the team", "put this online", "I want a page that…")
- The user invokes a verb explicitly (`folio publish`, `folio audit`, `folio remix`, `folio describe`)

**Do not use folio when:**

- The user wants a quick look, not a deliverable ("show me", "what does this look like", "just check", "can you display")
- The output won't be opened again after this conversation — answer inline or write a scratch file, don't stamp it, ledger it, or gate it
- The request is for a code snippet, a config file, a single function — those aren't browser artifacts

**Entrance gate.** Before entering the artifact flow, ask: *will the user open this file again after this session?* If no, folio is the wrong tool — just answer. If yes, proceed.

**Standalone is the default.** The lightest folio path is a single folder with one `index.html` — no site root, no `site.json`, no index page. A site root appears only when there's a second artifact or the user asks to publish a collection. Do not create site ceremony for one file.

## Glossary

Use only these terms in Folio output.

| Term | Meaning |
| --- | --- |
| **artifact** | A self-contained static web deliverable: HTML with CSS/JS, runnable in a browser |
| **bundle** | One of `single-file` (inline CSS/JS) or `multi-file` (linked assets in one directory) |
| **artifact kind** | One of doc, sheet, dashboard, explainer, slides, tool, landing |
| **host profile** | Where the site lives: `local`, `surge`, `gh-pages`, `cf-pages`, `cf-worker` |
| **site root** | A directory containing an `index.html` and an `artifacts/` tree, published as one domain. Artifacts are paths under it, not separate subdomains. |
| **site manifest** | `.folio/site.json` — the canonical source of truth. Carries domain + per-artifact registry (slug, kind, bundle, ledger, provenance, publish state). Stamps, index, and audit all derive from it. |
| **standalone artifact** | An artifact with no site root. The HTML stamp is its only manifest. Upgrades to a site entry when a second artifact appears. |
| **provenance** | The `source` field on a remixed artifact: `{ slug, site, url }`. Null for originals. Read by `describe`, `audit`, and `remix`. |
| **manifest** | Entry HTML, file list, external deps, and optional publish metadata |
| **ledger** | The manifest ledger — deps, data files, URLs, and evidence levels before build |
| **gate** | A binary check that must pass before handoff |
| **evidence level** | One of `observed`, `derived`, `stated`, `absent` |

---

## How to use this skill

- Default: create or update one artifact. Follow the artifact flow. A single artifact is standalone by default — no site root required.
- `folio audit <path|url>`: read-only audit. Do not edit. Read `references/verbs/audit.md`.
- `folio describe <path|url|slug>`: read an artifact's manifest entry (kind, ledger, provenance, publish state). Read `references/verbs/describe.md`.
- `folio publish <site-root>`: deploy a site root (all artifacts) to the chosen host profile. Read `references/verbs/publish.md`.
- `folio remix <path|url>`: fork an artifact and change it while preserving manifest honesty and recording source lineage. Read `references/verbs/remix.md`.

One run = one artifact unless the user names multiple. Prefer the smallest bundle that satisfies the request. A single artifact is standalone; multiple artifacts live under one site root and publish as one domain. Read `references/site-index.md` for the site-root model and standalone-to-site upgrade.

---

## Non-negotiable disciplines

1. **Runnable before pretty.** The artifact opens in a browser and core interactions work before polish or publish.
2. **Static documents only.** No `fetch()` to external APIs, no WebSocket connections, no `XMLHttpRequest` to live endpoints. Data is embedded inline, loaded from a local file via `fetch('./data/…')`, or generated at build time. The only network requests an artifact makes are to ledgered CDN scripts, styles, and fonts.
3. **Manifest honesty.** CDN scripts, fonts, images, and data files are ledger rows, not surprises.
4. **Local-first.** Default host profile is `local`. Publish only when the user asks or `folio publish` is invoked. Never advertise publish capabilities proactively.
5. **No secrets in static files.** API keys, tokens, and private URLs do not belong in HTML/JS committed or published.
6. **Not ugly.** Artifacts follow the visual baseline. Read `references/visual-baseline.md` before build.

---

## Gold decision trace

```text
Request: Build an interactive latency histogram from this CSV for a teammate.

Inventory:
· Target: new artifact `latency-hist`
· Existing: none
· Data: user attached `runs.csv` (observed, 840 rows)
· Constraints: local folder, no publish

Picks: kind=explainer · bundle=multi-file · host=local · audience=teammate handoff

Ledger:
dep | kind | evidence | in artifact as
d3@7 (cdn.jsdelivr) | script | stated, user did not pin | index.html script tag + note in README
runs.csv | data | observed | ./data/runs.csv, loaded via fetch('./data/runs.csv')

File plan:
Create: artifacts/latency-hist/index.html, style.css, app.js, data/runs.csv, README.md
No deletes.

Verification: npx serve artifacts/latency-hist; chart renders; console clean
Gates: opens-locally=yes, console-clean=yes, ledger-complete=yes, no-secrets=yes, mock-labeled=n/a, visual-baseline=yes

Handoff: path, how to open, ledger summary, deferred: none
```

---

## Scope fork

Resolve scope before broad design questions.

| Request shape | Bundle | Host | Skip |
| --- | --- | --- | --- |
| Quick throwaway demo | `single-file` | `local` | README, publish, multi-page |
| Written doc or report | `single-file` or `multi-file` | `local` | Charts, heavy JS |
| Data table or sheet | `single-file` or `multi-file` | `local` | Narrative prose, decoration |
| Metrics dashboard | `multi-file` | `local` | Full CRUD, live data feeds |
| Concept explainer | `multi-file` | `local` | Dense raw data dumps |
| Slide deck | `multi-file` | `local` | Scroll layouts, widgets |
| Shared teammate artifact | `multi-file` | `local` | Framework build step |
| Public demo link | `multi-file` | `surge` or `cf-pages` | Auth, server logic |
| Agent handoff preview | `single-file` preferred | `local` | Publish unless asked |

Ambiguous request: ask once, tersely. Example: "Single self-contained file or a small folder with separate CSS/JS?" If unanswered, choose the smallest bundle that works.

---

## Artifact flow

### 0. Inventory

Read the request and any existing artifact tree. Read `references/evidence.md` and `references/artifact-types.md`.

Collect:

- **Subject:** what the artifact should show or let the user do
- **Inputs:** files, JSON, CSV, copy, design constraints (with evidence levels)
- **Existing artifact:** path, entry HTML, manifest, last publish URL if any
- **Host profile:** default `local`; read `references/host-profiles.md` when publish is in scope
- **Convention source:** `folio.md` if present

Emit a compact inventory with citations before proceeding.

### 1. Picks

Emit before building: `Picks: kind=<x> · bundle=<y> · host=<z> · audience=<a>`.

Read `references/artifact-types.md` when kind is unclear. Read `references/host-profiles.md` when host is not `local`.

### 2. Manifest ledger

Build the ledger before writing HTML. Read `references/manifest-ledger.md`.

Columns:

```text
dep | kind | evidence | in artifact as
```

Kinds: `script`, `style`, `font`, `image`, `data`, `mock`, `publish-target`.

Data files and mock data must be explicit. External API calls are out of scope — see discipline #2.

### 3. File plan and build

State the file plan before editing:

```text
Create: artifacts/<slug>/index.html, app.js, data/sample.json
Modify: none
No deletes.
```

**Start from a template.** Load `references/templates/<kind>.html` and adapt it — replace the `{{placeholder}}` content and `<!-- Replace: ... -->` markers with real content. Templates are gate-passing folio artifacts themselves; they carry the token block, the light/dark toggle, the favicon, and the kind-specific structure. Read `references/templates/` index for what each template provides.

Read `references/visual-baseline.md` before writing CSS.

Build with plain HTML/CSS/JS unless the user named a specific stack. Prefer:

- Semantic HTML, one obvious entry file (`index.html`)
- CSS custom properties for all visual tokens (color, type, spacing, radius, shadow)
- OKLCH for color; no inline hex/rgb outside the `:root` token block
- Vanilla JS or a single named CDN library — ledgered
- `multi-file`: keep all asset paths relative; no absolute machine paths
- No italic headings; readable measure (`max-width: 60–70ch`); `overflow-x: clip` on `html` and `body`

Read `references/security.md` when the artifact accepts user input, embeds third-party content, or publishes publicly.

Stamps (HTML comment, top of entry file):

```html
<!-- Folio · slug: latency-hist · kind: explainer · bundle: multi-file · host: local -->
<!-- deps: d3@7 · data: runs.csv · publish: none -->
```

For `single-file`, keep the stamp minimal (one line).

### 4. Verification

Read `references/verification.md`. Run checks that fit the host profile.

Minimum matrix:

```text
check | command/evidence | result | notes
```

Examples: static server + load entry URL, DevTools console clean, click through primary interaction, broken link scan, `file://` vs server note for fetch, visual-baseline spot-check.

### 5. Gates

Apply before handoff. Any `no` triggers a fix loop.

| Gate | Check |
| --- | --- |
| `opens-locally` | Entry HTML loads via static server (or honest `file://` caveat documented) |
| `console-clean` | No uncaught errors on primary path |
| `ledger-complete` | Every external dep and data source appears in the ledger |
| `no-secrets` | No keys, tokens, or private URLs in source |
| `mock-labeled` | Mock/sample data labeled when real data is absent |
| `static-only` | No `fetch()` to external APIs, no WebSocket, no XHR to live endpoints |
| `visual-baseline` | Token block present, no inline colors outside `:root`, no italic headings, contrast adequate |
| `publish-ready` | When publishing: host profile steps documented and verified or explicitly deferred |
| `manifest-derivation` | **Advisory.** HTML stamp (slug, kind, bundle) matches the `site.json` entry for this artifact. Flags drift; see `references/verification.md#manifest-derivation-check`. |

Read `references/slop-test.md` after building. Fix P0/P1 before handoff.

### 6. Publish (optional)

Only when the user requests publish or invokes `folio publish`. Read `references/verbs/publish.md` and the host profile deep file.

Record publish URL in the manifest and handoff. Never claim a URL without evidence from the publish command output.

### 7. Handoff

Include:

- Artifact path and entry file
- How to open locally (exact command)
- Publish URL (if published), with evidence
- Manifest ledger summary
- Verification commands and results
- Deferred items (e.g., `fetch` requires server, mock data in use)

Do not bury manifest or publish facts under implementation chatter.

---

## BAD/GOOD contrasts

**BAD:** Wire `fetch('/api/users')` because dashboards usually load users from an API.
**GOOD:** Embed `data/users.json` with a visible "Sample data" label. No API calls.

**BAD:** Paste Google Analytics, fonts, and three CDN libs without listing them.
**GOOD:** Each dep is a ledger row with URL and purpose.

**BAD:** "Deployed at https://demo.example.com" with no publish command run.
**GOOD:** Publish URL copied from command output, or marked deferred.

**BAD:** Inline `oklch()` values scattered through the CSS, three different font-family declarations.
**GOOD:** All visual values in the `:root` token block, referenced via `var()`.

---

## Convention artifacts

`folio.md` (output dir, default host, CDN allowlist, naming): opt-in. Read `references/folio-md.md`. Once present, house defaults win.

Optional per-project layout:

```text
site-root/
  index.html          # auto-generated site index, groups artifacts by kind
  artifacts/
    <slug>/
      index.html
      ...
.folio/
  site.json           # site manifest: domain + artifact registry
```

Slug convention: `<kind>-<descriptor>` (e.g., `explainer-folio-loop`) or `<descriptor>` alone when the kind is obvious (e.g., `chart-297`). The kind always lives in the stamp and site manifest.

---

## Reference loading rules

Keep SKILL.md lean. Load before proceeding when a path is listed.

**Always load:** `references/evidence.md`, `references/manifest-ledger.md`, `references/verification.md`, `references/visual-baseline.md`.

**Load when applies:**

- Kind choice: `references/artifact-types.md`
- Build: `references/templates/<kind>.html` — the gate-passing starter for the chosen kind
- Host/publish: `references/host-profiles.md`, `references/verbs/publish.md`, `references/site-index.md`
- User input or public publish: `references/security.md`
- Verbs: `references/verbs/audit.md`, `references/verbs/describe.md`, `references/verbs/remix.md`
- Anti-patterns: `references/anti-patterns.md` (before build), `references/slop-test.md` (after build)
- Conventions: `references/folio-md.md`

**Never load at runtime:** `references/philosophy.md`, `references/examples/` (human-only worked examples), `examples/` (human-only).

---

## v2 limits

In scope: static HTML/CSS/JS artifacts (doc, sheet, dashboard, explainer, slides, tool, landing), single-file and multi-file bundles, local folder output, optional Surge / GitHub Pages / Cloudflare Pages publish, audit/remix/publish verbs, manifest ledger, vanilla JS + ledgered CDN libs, visual baseline (OKLCH tokens, system fonts, anti-AI-slop rules).

Deferred: external API integration (v0.3 opt-in with evidence + offline degradation), React/Vue/Svelte build pipelines, SSR, databases, WebSocket backends, artifact versioning UI, collaborative editing, automated screenshot regression.

Out of scope: production app UI, backend APIs, ORM/data layers, native mobile, PDF/Office artifacts (see other skills).
