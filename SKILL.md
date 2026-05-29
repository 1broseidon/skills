---
name: scribe
description: "Documentation craft skill for project docs that match the code and read well. Use when writing, auditing, syncing, or extracting documentation: READMEs, API references, tutorials, how-to guides, conceptual explanations, architecture notes, changelogs, runbooks, and in-code API docs (docstrings/comments). Enforces source-truth (no invented flags, endpoints, params, defaults, or return types), Diátaxis-aligned structure, audience fit, drift detection against real code, and prose that earns its length. Not for marketing copy, blog posts, legal/policy text, slide decks, or UI microcopy."
version: 0.1.0
---

# Scribe

Scribe makes documentation feel **written by someone who read the code**, not generated next to it.

Docs have their own physics: they rot the moment code moves, they lie by omission, readers arrive mid-task with one specific question, and the best page is skimmable first and deep on demand. Scribe therefore optimizes for **source-truth, reader-task fit, structural navigability, and prose that earns its length**.

Core loop:

```text
Audience -> Doc Type -> Source Evidence -> Outline -> Draft -> Truth-Check -> Readability Pass
```

If a step does not fit that loop, cut it or move it to a doc-type-specific reference.

---

## How to use this skill

| Invocation | What it does |
| --- | --- |
| *(default)* | Write or update one document for one audience. Follow the **Doc flow**. |
| `scribe audit <doc>` | Read-only audit. Score a doc for accuracy, structure, prose, and links with evidence. Do not edit. Load [`references/verbs/audit.md`](references/verbs/audit.md). |
| `scribe sync <doc>` | Reconcile a doc against current code: find drift, fix the claims, preserve the parts still true. Load [`references/verbs/sync.md`](references/verbs/sync.md). |
| `scribe extract <source>` | Generate doc scaffolding from code, API surface, `--help`, OpenAPI, proto, or an existing README. Diagnosis first; optional draft. Load [`references/verbs/extract.md`](references/verbs/extract.md). |

One run = **one document for one audience** unless the user explicitly names more. In a docs set, prefer the smallest page that answers the request over rewriting the whole site.

---

## Non-negotiable disciplines

1. **Evidence before prose.** Read the code before describing it. Every factual claim about behavior — a flag, an endpoint, a parameter, a default, a return type, an exit code, an env var, a config key — traces to a source line or a command you ran. Cite it.

2. **No fabricated facts.** Do not invent flags, routes, function signatures, defaults, error codes, supported versions, performance numbers, or roadmap promises. Use real code, an explicit placeholder, or omit. A confident wrong sentence is worse than a missing one.

3. **Docs are a contract too.** Once readers can see a documented command, signature, or guarantee, they depend on it. When code changes, the doc is drift until reconciled. Sync deprecates and corrects; it does not silently rewrite history.

4. **Match length to the reader's task.** Prose where understanding is the goal; terse tables, lists, and code blocks where lookup is the goal. Every paragraph that does not change what the reader does or understands is cut.

5. **Structure is navigation.** Readers scan before they read. Headings, ordering, progressive disclosure, and links are not decoration — they are how a reader finds the one paragraph they came for.

6. **One doc, one job.** A tutorial is not a reference; a how-to is not an explanation. Mixing the four Diátaxis modes on one page is the most common documentation failure. Pick the mode and hold it.

7. **Pre-emit self-critique.** Score 1–5 on: Accuracy, Audience, Structure, Completeness, Concision, Links, Examples. Anything < 3 triggers a revision pass. Stamp form: `<!-- Scribe · critique: Acc5 Aud4 Str5 Comp4 Con5 Lnk4 Ex5 -->`.

---

## Doc-type fork

Resolve doc type before drafting. Each type has a different job, shape, and failure mode. Load [`references/doc-types.md`](references/doc-types.md) for the full map; the four learning-oriented types follow Diátaxis.

| Type | Reader's question | Mode | Skips |
| --- | --- | --- | --- |
| **Tutorial** | "Teach me by doing." | Diátaxis: learning | Exhaustive option coverage, edge cases |
| **How-to guide** | "How do I accomplish X?" | Diátaxis: task | Teaching basics, full API enumeration |
| **Reference** | "What exactly does this do?" | Diátaxis: information | Narrative, opinion, hand-holding |
| **Explanation** | "Why is it this way?" | Diátaxis: understanding | Step lists, exhaustive params |
| **README** | "What is this and should I use it?" | Orientation + routing | Deep API detail (link out instead) |
| **Architecture / ADR** | "How is it built and why these choices?" | Decision record | Step-by-step usage |
| **Changelog / migration** | "What changed and what must I do?" | Versioned diff | Conceptual teaching |
| **Runbook / ops** | "It's on fire — what do I run?" | Operational procedure | Background theory |
| **In-code API docs** | "What does this symbol do?" (at call site) | Docstring/comment | Tutorials, prose essays |

Ambiguous request: ask once, tersely. Example: *"Is this a how-to (one task) or a reference (full surface)?"* If unanswered, choose the type the reader's phrasing implies; default to how-to for "how do I…", reference for "document the…".

**Code-docs vs prose-docs are separate concerns.** In-code API docs (docstrings, doc comments) and standalone prose docs (Markdown pages, docs sites) have different audiences, locations, and lifecycles. Keep them distinct; do not duplicate one into the other. Load [`references/code-vs-docs.md`](references/code-vs-docs.md) when the target is docstrings or when deciding which layer owns a fact.

Deferred v2: marketing/landing copy, blog posts, legal/policy text, slide decks, full docs-site IA migrations, translation/localization workflows.

---

## Doc flow

### 0. Source inventory

Read the thing you are documenting before writing about it. Prefer evidence over recall.

Load [`references/source-evidence.md`](references/source-evidence.md) for evidence levels and safe discovery commands.

Collect what applies:

- **Subject:** what code, API, command, or system the doc describes
- **Public surface:** flags, commands, routes, RPCs, exported symbols, signatures, config keys, env vars, exit codes
- **Real defaults and behavior:** confirmed from source, not assumed from convention
- **Existing docs:** what's already written, what's stale, what's worth keeping
- **Doc tooling:** Markdown only, or a generator (Sphinx, Docusaurus, MkDocs, rustdoc, godoc, JSDoc, etc.) — affects link syntax, file layout, and whether snippets can be tested
- **Convention source:** `scribe.md`, style guide, existing tone, README contract tables

Emit a compact inventory with citations:

```text
Source inventory:
· Subject: cli `search` (Go/cobra) — documenting for new users
· Surface: 8 commands from live --help; SEARCH_ env prefix; exit codes 0/1/2
· Doc type: how-to (README links out to per-command reference)
· Existing: README has stale --format flag (removed in cmd/root.go L52)
· Tooling: plain Markdown, GitHub-rendered; snippets runnable in bash
· Audience: integrator wiring search into a pipeline

Keep: install section, badge row. Fix: --format drift. Add: pipeline example.
```

If `scribe.md` exists, read it as convention data. It overrides defaults and makes house style the baseline.

### 1. Identify the audience

The audience determines vocabulary, assumed knowledge, depth, and what to skip. Pick what affects the writing. Load [`references/audience.md`](references/audience.md) when the choice is unclear or shapes structure.

| Audience | Optimize for | Assume |
| --- | --- | --- |
| **new user** | First success fast; one happy path; no jargon | No prior knowledge of this project |
| **integrator** | Copy-paste correctness; full signatures; edge cases | Fluent in the language/protocol |
| **contributor** | Architecture, build/test, conventions, where things live | Will read source alongside docs |
| **operator** | Run/deploy/recover; commands and signals; failure modes | Owns the system in production |
| **decision-maker** | Trade-offs, constraints, comparisons; why not how | Skims; wants the conclusion early |

A doc can serve one primary audience well or several poorly. Name the primary one. Ask once if unclear:

> *Before I write this: who is the primary reader — new user, integrator, contributor, operator, or decision-maker? Or say "go ahead" and I'll infer from the subject.*

### 2. Outline before prose

Draft the heading tree and ordering before writing sentences. The outline is scribe's preview — it makes structure reviewable before words are spent. Load [`references/structure.md`](references/structure.md).

State the outline and the intended length budget per section:

```text
Outline (how-to: "Add search to a pipeline"):
1. What you'll build       (2 sentences)
2. Prerequisites           (bulleted, versioned)
3. Steps 1–4               (numbered, one command each + expected output)
4. Verify it worked        (one command, one assertion)
5. Troubleshooting         (table: symptom → cause → fix)
6. Next steps / see also    (3 links)
```

Hold the chosen Diátaxis mode. If the outline starts teaching inside a reference, or enumerating options inside a tutorial, fix the outline, not the prose.

### 3. Build the claim ledger

Before drafting, list the factual claims the doc will make and their evidence. This is scribe's anti-slop spine. Load [`references/source-evidence.md`](references/source-evidence.md).

Ledger columns:

```text
claim | evidence level | source | in doc as
```

Examples:

- `--json flag exists | observed | cmd/root.go L40 | reference table row`
- `default timeout 30s | observed | config.go L18 | "defaults to 30 seconds"`
- `retries on 5xx | derived | client.go retry loop | "retries transient errors"`
- `supports Postgres 14+ | stated | README badge, unverified | flag for confirmation`

Any claim that is not at least **derived** from code gets flagged, placeholdered, or cut. If the doc makes no behavioral claims (pure explanation/opinion), say so.

### 4. Draft

Write to the outline, the audience, and the ledger. Load [`references/prose.md`](references/prose.md) for voice and concision rules, and [`references/links-and-format.md`](references/links-and-format.md) for code fences, callouts, tables, and cross-references.

Rules that always apply:

- **Examples are real.** Every command, snippet, and value copy-pastes and works, or is a clearly marked placeholder (`<your-api-key>`, never `sk_live_abc123`).
- **Show expected output** for commands when the reader needs to know success from failure.
- **Front-load.** The first sentence of every section answers the section's question. Detail follows.
- **Link, don't duplicate.** Reference one canonical place for each fact; cross-link the rest.
- **One mode per page.** If you need another mode, link to a separate page.

State the file plan before editing:

```text
Modify: README.md
Create: docs/how-to/pipeline.md
No deletes.
```

### 5. Truth-check

Verify the doc against reality. Load [`references/verification.md`](references/verification.md), then run the checks the doc type warrants.

Minimum matrix:

```text
check | command/evidence | result | notes
```

Typical checks:

- Every documented flag/command exists: `tool --help` vs doc table
- Defaults in prose match code: grep the default, compare
- Code snippets run (when language/repo allows): execute or compile them — see [`references/verification.md`](references/verification.md) for when this is feasible vs skipped
- Links resolve: no dead internal anchors or paths
- API reference matches signatures: doc vs exported symbols
- Version/compat claims trace to a manifest or are flagged

Snippet execution is **optional and repo-dependent**: run it when the toolchain is present and snippets are self-contained; otherwise state it was not run and why. Never claim a snippet works if you did not run or compile it.

### 6. Readability pass + slop gates

Re-read as the target audience. Load [`references/slop-test.md`](references/slop-test.md) at the end only — it is a post-emit check, not a pre-emit reference. Use [`references/anti-patterns.md`](references/anti-patterns.md) before drafting to avoid the common failures up front.

Fix P0/P1 before handoff; list unresolved P2 with reason.

### 7. Handoff

Final response includes:

- What changed (files, sections)
- Claims corrected or newly verified (the drift ledger if this was a sync)
- Verification commands run and results
- Any unverified claims left flagged, and why
- Self-critique stamp

Do not bury accuracy corrections under prose chatter. If you fixed a lie, say so plainly.

---

## Convention artifacts

Scribe emits or maintains convention artifacts when scope warrants:

| Scope | Artifact |
| --- | --- |
| Docs set with house style | `scribe.md` (voice, structure, link conventions) |
| Drift reconciliation | drift ledger in the handoff or `.scribe/drift.md` |
| Recurring doc structure | per-type templates under `docs/` |

`scribe.md` is opt-in via *lock the style*, *give me a scribe.md*, or *make the docs conventions portable*. Load [`references/scribe-md.md`](references/scribe-md.md). Once present, house style wins over scribe defaults.

---

## Reference loading rules

Keep `SKILL.md` lean and load only what matches the doc.

Always consider:

- [`references/source-evidence.md`](references/source-evidence.md)
- [`references/doc-types.md`](references/doc-types.md)
- [`references/verification.md`](references/verification.md)

Type/concern-specific:

- Audience choice shapes structure: [`references/audience.md`](references/audience.md)
- Outlining and navigation: [`references/structure.md`](references/structure.md)
- Voice, concision, prose-vs-terse: [`references/prose.md`](references/prose.md)
- Code fences, callouts, tables, cross-refs: [`references/links-and-format.md`](references/links-and-format.md)
- Docstrings vs prose docs, fact ownership: [`references/code-vs-docs.md`](references/code-vs-docs.md)
- Drift tracking on sync: [`references/drift-ledger.md`](references/drift-ledger.md)
- Anti-patterns: [`references/anti-patterns.md`](references/anti-patterns.md) before drafting; [`references/slop-test.md`](references/slop-test.md) after.

Human-only examples live in [`examples/`](examples/). Do not auto-load them during normal runs.

---

## v1 limits

| In scope | Deferred |
| --- | --- |
| README, API reference, tutorial, how-to, explanation, architecture/ADR, changelog, runbook, in-code API docs | Marketing/landing copy, blog posts, legal text, slide decks |
| Source-evidence claims and drift detection | Auto-generating full docs sites from scratch |
| Single-doc, single-audience work | Cross-site IA migrations, localization workflows |
| Optional snippet execution when toolchain allows | Guaranteed execution across every language/runtime |
| Markdown and common generators (Sphinx/Docusaurus/MkDocs/rustdoc/godoc/JSDoc) | Bespoke or proprietary doc pipelines |
