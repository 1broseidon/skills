# Anti-patterns

Study before building. These are the highest-frequency Folio failures.

## API calls in static artifacts

**BAD:** Dashboard calls `fetch('/api/metrics')` because dashboards usually do.

**GOOD:** Embed `data/metrics.json` with label "Sample metrics." Folio artifacts are static documents — they do not call external APIs.

**BAD:** "The data will load from the backend" with no backend in scope.

**GOOD:** Data is a file on disk, embedded inline, or generated at build time. If no real data exists, use mock data and label it.

## Mystery CDN stack

**BAD:** Drop in React, Tailwind CDN, Chart.js, and Font Awesome with no ledger.

**GOOD:** One library if needed; each row in manifest ledger with URL and purpose.

## file:// surprise

**BAD:** `fetch('data.csv')` with handoff "open index.html."

**GOOD:** README: "Requires static server: `npx serve .`" — fetch fails under file://.

## Fake publish URL

**BAD:** "Live at https://my-demo.surge.sh" without running surge.

**GOOD:** URL only after CLI output, or "Publish deferred — run `folio publish`."

## Auth surprise

**BAD:** Running `npx surge .` mid-flow, which blocks on a login prompt with no credentials configured. The agent hangs or fabricates an email.

**GOOD:** Before any deploy, run the auth probe (`surge whoami`, `gh auth status`, `wrangler whoami`). If not authed, tell the user once what to run and wait. Never attempt to authenticate on the user's behalf.

## Single-file bloat

**BAD:** 800-line HTML with duplicated CSS because user said "one file."

**GOOD:** Ask once if multi-file is OK; if single-file required, still ledger deps and trim dead code.

## Production cosplay

**BAD:** Auth screens, settings pages, and empty state copy for a 10-minute explainer.

**GOOD:** Match artifact kind — an explainer gets annotated steps, not a fake SaaS shell.

## Secret in static JS

**BAD:** `const API_KEY = 'sk-...'` for "just a demo."

**GOOD:** Refuse; local-only placeholder or backend proxy (anvil scope).

## Overuse — folio where folio doesn't belong

**BAD:** User says "show me this data as a table" and the agent stamps a sheet artifact, writes a `site.json` entry, runs the full 7-step flow, and hands back a gated deliverable — for a 5-minute look.

**GOOD:** Answer inline or write a scratch file. Folio is for deliverables the user will keep, reopen, or hand off. If the output won't be opened again after this session, folio is the wrong tool.

**BAD:** User asks for "a page I can open" and the agent creates a site root, `site.json`, and an index page — when one `index.html` in a folder would do.

**GOOD:** Standalone is the default. One folder, one file. A site root appears only when there's a second artifact or the user asks to publish a collection.

---

## Visual anti-patterns (distilled from Hallmark)

These are the patterns every LLM reaches for. Any one is suspicious; two in the same artifact confirms AI slop.

| Tell | Fix |
| --- | --- |
| Purple-to-blue gradient hero | One solid accent. No gradient backgrounds. |
| Gradient headline (`background-clip: text`) | Solid ink. Emphasize with weight or accent color. |
| Three equal feature cards (icon · heading · body) | Vary widths, drop an icon, use negative space. |
| Full-viewport centered hero (`min-h: 100vh`) | Content-height hero. Bias left or right. |
| Pure `#000` / `#fff` surfaces | Tint toward anchor hue. |
| Side-stripe card (thick colored left border) | Hairline border all around, or no border. |
| Inter / Roboto / Open Sans as the only font | System stack or a deliberate pairing. |
| Card inside card (nested containers) | One containment layer. |
| Italic headings | Roman headings. Carry emphasis with weight or accent. |
| Inline hex/rgb scattered through CSS | All values in `:root` token block via `var()`. |
| Every section padded identically | Vary section spacing. |
