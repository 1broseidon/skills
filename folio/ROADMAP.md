# Folio roadmap

## v0.1.0 — done

**Theme: Concept and craft loop**

- [x] Core loop: Inventory → Picks → Manifest ledger → Build → Verify → Gates → Handoff
- [x] Verbs: default create/update, `audit`, `publish`, `remix` (stub references)
- [x] Glossary: artifact, bundle, kind, host profile, manifest, ledger, gates
- [x] Host profile index: local, surge, gh-pages, cf-pages, cf-worker
- [x] Manifest ledger discipline (deps, mocks, publish targets)
- [x] Security baseline (no secrets, mock labeling, user input)
- [x] `folio.md` convention artifact (opt-in)

## v0.2.4 — current

**Theme: Entrance gate — prevent overuse**

- [x] "When to use folio — and when not to" section at top of SKILL.md (entrance gate before the artifact flow)
- [x] Tightened `description:` trigger: "durable, openable, shareable web deliverable" not "creating static artifacts"
- [x] "Overuse" anti-pattern in `references/anti-patterns.md`
- [x] Standalone-as-default stated explicitly as behavior, not just a glossary term

## v0.2.3 — done

**Theme: Standalone-first creation + template starters**

- [x] 7 gate-passing template starters in `references/templates/` (doc, sheet, dashboard, explainer, slides, tool, landing)
- [x] Templates verified: 88–107 lines, console-clean from file://, all gates pass
- [x] SKILL.md build step: "Start from a template" — load `templates/<kind>.html` and adapt placeholders
- [x] Reference loading: templates loaded when kind is chosen

## v0.2.2 — done

**Theme: Canonical manifest, describe verb, honest audit**

- [x] Deepened `.folio/site.json` schema: per-artifact ledger, bundle, provenance (`source`), publish state
- [x] Derivation rule: stamps and index derive from `site.json`, not hand-written — eliminates triple-write drift
- [x] `folio describe` verb — consumer surface for the manifest (reads kind, ledger, provenance, publish state)
- [x] Standalone-to-site upgrade path — single artifact works without site root; upgrades when second artifact appears
- [x] Honest audit: local mode (full) vs remote mode (limited) — names what each can/can't verify, forces `unknown` not `pass`
- [x] Remix records provenance (`source` field); remote remix documented as partial limitation
- [x] Fixed drift bug: `audit.md` `.folio/manifest.json` → `.folio/site.json`
- [x] Updated live `folio-samples.surge.sh` site.json to deepened schema

## v0.2.1 — done

**Theme: Site-root publish model**

- [x] Artifacts live under one site root (`site-root/artifacts/<slug>/`) and publish as one domain
- [x] Site index page auto-generated, reads `.folio/site.json` inline, groups by kind
- [x] `.folio/site.json` site manifest schema (domain + artifact registry)
- [x] Slug convention: `<kind>-<descriptor>` or `<descriptor>` alone
- [x] Publish verb deploys whole site root, verifies all paths
- [x] `references/site-index.md` deep file
- [x] Migrated 9 samples to `folio-site/` structure, live at `folio-samples.surge.sh`

## v0.2.0 — done

**Theme: Static-only discipline, visual baseline, auth**

- [x] New artifact kinds: doc, sheet, dashboard, explainer, slides, tool, landing
- [x] Migration table from v0.1 kinds (report→doc, demo→explainer, etc.)
- [x] **Static-only rule**: no `fetch()` to external APIs, no WebSocket, no XHR. Data embedded or loaded from local files. `api` kind removed from ledger.
- [x] **Visual baseline** (`references/visual-baseline.md`): OKLCH token block, system fonts, no italic headings, tinted neutrals, contrast minimums, named AI tells to avoid. Distilled from Hallmark.
- [x] New gates: `static-only`, `visual-baseline`
- [x] Visual anti-patterns in `anti-patterns.md` and `slop-test.md`
- [x] **Auth probe for external hosts**: silent check before deploy, one-message guidance if not authed, env-var path for CI documented but not surfaced proactively
- [x] **Silent-by-default publish**: never advertise host profiles unless user asks
- [ ] Worked examples in `examples/`
- [ ] Optional `scripts/folio_verify.sh` (serve + link check + console hook)

## v0.3 — planned

**Theme: Opt-in API integration, agent ergonomics**

- [ ] Re-introduce `api` ledger kind as opt-in: user must name the endpoint, provide evidence it exists, artifact must degrade gracefully when offline
- [x] `.folio/site.json` schema — canonical manifest with per-artifact ledger, provenance, publish state
- [ ] Remix workflow: fork slug, ledger inheritance, breaking-change labels
- [ ] Template starters: doc, sheet, dashboard, explainer, slides (plain HTML)
- [ ] Optional Playwright smoke snippet in verification.md

## v0.4 — planned

**Theme: Publish paths agents can run reliably**

- [ ] Surge profile: project detection, domain naming, teardown notes (deep guide)
- [ ] GitHub Pages profile: branch vs `/docs`, Actions vs manual
- [ ] Cloudflare Pages profile: wrangler pages project + deploy
- [ ] `folio audit` severity punch list (P0–P2) aligned with scribe/anvil
- [ ] Benchmark rubric for generated artifacts (1–5, anvil-style)

## Deferred (v2+)

- React/Vue/Svelte/Vite artifact templates (explicit build step)
- Auth-gated or private host profiles
- Artifact registry / versioning UI
- Collaborative multi-agent editing of one artifact
- Automated visual regression
- Custom domain + TLS runbooks beyond host defaults
- Webfont pairing catalog (currently deferred to system stack)

## Out of scope

- Backend APIs and databases (anvil)
- Long-form project documentation (scribe)
- Production product UI and design systems (hallmark)
- Mobile native shells
