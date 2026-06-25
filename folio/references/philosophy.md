# Philosophy (human-only)

Design rationale for Folio. **Agents do not load this file at runtime.**

## Why Folio exists

ChatGPT and Claude web UIs popularized **artifacts**: self-contained interactive pages generated in conversation. Local agents (Cursor, Claude Code, Codex) can write files but lack a shared craft for:

- knowing when an artifact should be single-file vs a folder
- ledgering CDN deps and mock data honestly
- opening locally vs publishing to a URL
- not inventing backends that do not exist

Folio fills that gap the way **anvil** fills backend boundaries and **scribe** fills documentation truth.

## Design choices

### Local-first

Agents already have filesystem access. The default deliverable is a path and a serve command, not a deploy pipeline. Publish is a verb, not the default flow.

### Manifest ledger over taste

HTML generation is cheap; **surprise dependencies** are expensive. The ledger forces explicit choices about scripts, data, and APIs before markup.

### Plain HTML/CSS/JS

Framework build steps hide errors and slow handoff. v1 stays vanilla + ledgered CDN libs. Vite/React templates are deferred until publish and verify stories are solid.

### Host profiles as adapters

Surge, GitHub Pages, and Cloudflare differ in CLI, auth, and URL shape. Folio treats them as **host profiles** with evidence-backed publish steps — not one-size-fits-all bash.

### Relationship to other skills

| Skill | Owns |
| --- | --- |
| Folio | Static browser artifacts, local + static publish |
| Anvil | Backend APIs, CLIs, services |
| Scribe | Project documentation |
| Hallmark / frontend-ui-patterns | Production UI design quality |

## Name

**Folio** — a collection of leaves/pages. The output term remains **artifact** (familiar from chat UIs).
