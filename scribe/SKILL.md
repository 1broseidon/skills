---
name: scribe
description: "Documentation craft skill for project docs that match the code and read well. Use when writing, auditing, syncing, or extracting documentation: READMEs, API references, tutorials, how-to guides, explanations, architecture notes, changelogs, runbooks, and in-code API docs. Enforces evidence-level claims (no fabricated flags, endpoints, params, defaults, or return types), Diátaxis-aligned structure, audience fit, drift detection, and prose that earns its length."
version: 0.3.0
---

# Scribe

Read the code before writing about it. Every claim traces to evidence or is labeled with its evidence level. No exceptions.

## Glossary

One canonical term per concept. Use only these terms in all output.

| Term | Meaning |
| --- | --- |
| **claim** | A factual statement the doc makes about behavior, API surface, defaults, or constraints |
| **evidence level** | How a claim is grounded: `observed`, `derived`, `stated`, or `absent` |
| **doc type** | The kind of document: tutorial, how-to, reference, explanation, README, ADR, changelog, runbook, in-code API docs |
| **mode** | The Diátaxis mode governing structure: learning, task, information, understanding (or a non-Diátaxis mode) |
| **audience** | The primary reader: new user, integrator, contributor, operator, or decision-maker |
| **ledger** | The claim-by-claim evidence table built before drafting |
| **gate** | A binary (yes/no) check before handoff. Any `no` triggers a fix loop |
| **drift** | A doc claim that no longer matches the code |
| **outline** | The heading tree and per-section length budget drafted before prose |

---

## Disciplines

1. **No fabricated facts.** Do not invent flags, routes, signatures, defaults, error codes, versions, performance numbers, or roadmap promises. Use real code, an explicit placeholder, or omit.

2. **Every claim carries an evidence level.** Trace claims to source lines or command output. Label the evidence level. A confident wrong sentence is worse than a missing one.

3. **One doc, one job.** A tutorial is not a reference. A how-to is not an explanation. Pick the mode, hold it. Mixing modes on one page is the most common documentation failure.

4. **Docs are a contract.** Once readers see a documented command, signature, or guarantee, they depend on it. When code changes, the doc is drift until reconciled.

---

## Decision trace

Every run follows this sequence. This example is the gold template.

```
Request: "document the search CLI for pipeline integrators"
→ Inventory: read cmd/, --help, config.go; found 8 commands, SEARCH_ env prefix, exit 0/1/2
→ Picks: doc-type=how-to · audience=integrator · mode=task
→ Ledger:
    --json flag exists     | observed | cmd/root.go L40   | step 2 command flag
    default timeout 30s    | observed | config.go L18     | inline note in step 3
    retries on 5xx         | derived  | client.go L72-88  | troubleshooting note
    supports Postgres 14+  | stated   | README badge       | prerequisite, flagged for confirm
    --format flag          | absent   | grep found nothing | omitted from doc
→ Draft: outline, then prose, holding task mode throughout
→ Truth-check: --help vs doc table (pass), defaults vs code (pass), links resolve (pass)
→ Gates: claims-sourced=yes, outline-holds-mode=yes, snippets-honest=yes,
         defaults-match=yes, no-fabricated=yes, links-resolve=yes
→ Handoff: files changed, claims verified, drift fixed, unverified flagged
```

---

## Doc flow

### 0. Inventory

Read the thing you are documenting before writing about it. Read `references/source-evidence.md`. Read `references/doc-types.md`.

Collect:

- **Subject:** what code, API, command, or system the doc describes
- **Public surface:** flags, commands, routes, RPCs, exported symbols, config keys, env vars, exit codes
- **Real defaults and behavior:** confirmed from source, not assumed
- **Existing docs:** what is written, what is stale, what is worth keeping
- **Doc tooling:** Markdown only, or a generator (Sphinx, Docusaurus, MkDocs, rustdoc, godoc, JSDoc)
- **Convention source:** `scribe.md`, style guide, existing tone

Resolve doc type using the reader's question:

| Reader's question | Doc type | Mode | Skips |
| --- | --- | --- | --- |
| "Teach me by doing." | Tutorial | learning | Exhaustive options, edge cases |
| "How do I accomplish X?" | How-to | task | Teaching basics, full enumeration |
| "What exactly does this do?" | Reference | information | Narrative, opinion |
| "Why is it this way?" | Explanation | understanding | Step lists, exhaustive params |
| "What is this, should I use it?" | README | orientation | Deep API detail (link out) |
| "How is it built, why these choices?" | Architecture/ADR | decision record | Step-by-step usage |
| "What changed, what must I do?" | Changelog | versioned diff | Conceptual teaching |
| "It's on fire, what do I run?" | Runbook | operational procedure | Background theory |
| "What does this symbol do?" | In-code API docs | docstring | Tutorials, prose essays |

Identify the audience (new user, integrator, contributor, operator, or decision-maker). Read `references/audience.md` when the choice is unclear or shapes structure. Ambiguous request: ask once, tersely.

If `scribe.md` exists, read it as convention data. It overrides defaults.

Emit a compact inventory with citations before proceeding.

### 1. Picks

Emit before proceeding: `Picks: doc-type=<x> · audience=<y> · mode=<z>`. Do not change picks mid-run without re-stating them.

### 2. Ledger

Build the ledger before drafting. Read `references/source-evidence.md`.

Columns: `claim | evidence level | source | in doc as`

| Evidence level | Meaning | Assign when |
| --- | --- | --- |
| `observed` | You read the source or ran the command and saw the behavior | The exact flag, default, or route is in source |
| `derived` | You inferred it from code patterns (a retry loop implies retries) | A code pattern implies the behavior |
| `stated` | Someone else wrote it (README, comment) and you did not verify | A claim in docs or comments is unverified |
| `absent` | You looked and found nothing | Nothing found after searching the relevant code |

`absent` claims: flag, placeholder, or cut. `stated` claims: mark for confirmation.

### 3. Draft

Write to the ledger, the audience, and the mode. Read `references/prose.md`. Read `references/links-and-format.md`.

**Outline first.** Draft the heading tree and length budget per section before writing sentences. Read `references/structure.md`. Match length to the reader's task: prose where understanding is the goal, terse tables and code blocks where lookup is the goal. Headings, ordering, and progressive disclosure are navigation, not decoration. Hold the chosen mode throughout. If the outline starts teaching inside a reference or enumerating options inside a tutorial, fix the outline.

**Explore for subjective prose only.** Audience, doc type, and mode already fix structure. Exploration is for the axes they do not fix: the opening hook, the central analogy, the worked-example domain. Generate 2-3 candidates on one such axis, select with a one-line rationale, then write. If the picks already determine the choice, skip it. Do not re-litigate an upstream pick.

```
Candidates (worked-example domain for an explanation of rate limiting):
  (1) coffee shop with a fixed number of cups
  (2) highway on-ramp metering light
  (3) nightclub bouncer enforcing capacity
Selected: 2. Closest to the real mechanism: tokens refill over time.
```

Skip exploration for reference tables, flag lists, exit-code tables, changelogs, and any section with a deterministic correct shape.

**Then write:**

- **Examples are real.** Every snippet copy-pastes and works, or is a clearly marked placeholder.
- **Show expected output** when the reader needs to distinguish success from failure.
- **Front-load.** First sentence of every section answers the section's question. One canonical place per fact; link, don't duplicate.
- **One mode per page.** Need another mode? Link to a separate page.

State the file plan before editing.

### 4. Truth-check

Verify the doc against reality. Read `references/verification.md`.

Record: `check | command/evidence | result | notes`

Checks: documented flags exist (`--help` vs doc table), defaults match code, snippets run (when feasible), links resolve, signatures match. Snippet execution is optional and repo-dependent. Never claim a snippet works if you did not run it.

### 5. Gates

Apply before handoff. Any `no` triggers a fix. Do not hand off with a failing gate.

| Gate | Check |
| --- | --- |
| `claims-sourced` | Every claim has an evidence level in the ledger |
| `outline-holds-mode` | The doc stays in its declared mode throughout |
| `snippets-honest` | No snippet is presented as working unless run or compiled |
| `defaults-match` | Every default in the doc matches source code |
| `no-fabricated` | No invented flags, routes, signatures, defaults, or error codes |
| `links-resolve` | Every internal link and anchor resolves |

**Fix loop:** gate fails → fix the cause → re-run that gate → confirm `yes`. Repeat until all gates pass.

### 6. Handoff

Include in final response: what changed (files, sections), claims corrected or verified, verification commands and results, unverified claims flagged with reason, gate results (all yes). Do not bury accuracy corrections under prose. If you fixed drift, say so plainly.

---

## BAD/GOOD pairs

Three highest-frequency failures. Study before drafting. Read `references/anti-patterns.md` for the full list.

**Fabricated facts:**

BAD:
```markdown
Use `--retry-count` to set the number of retries (default: 3).
```
(No `--retry-count` flag exists in the code.)

GOOD:
```markdown
The client retries on transient errors. Retry behavior is in `client.go` L72-88.
No user-facing flag is exposed.
```

**Mode-mixing:**

BAD:
```markdown
## How to configure auth
Authentication uses OAuth 2.0 with PKCE, which was designed to protect public clients
from authorization code interception attacks. To configure it:
1. Run `app auth init`
```

GOOD:
```markdown
## How to configure auth
1. Run `app auth init`
2. Paste the client ID from your provider dashboard
3. Run `app auth verify` to confirm the token works

For background on OAuth 2.0 + PKCE, see [Authentication concepts](./concepts/auth.md).
```

**Prose where a table fits:**

BAD:
```markdown
The `search` command supports several output formats. Use `--format json` for JSON,
`--format csv` for CSV, or `--format table` for a human-readable table. Default is `table`.
```

GOOD:
```markdown
| Flag | Output | Default |
| --- | --- | --- |
| `--format json` | JSON | |
| `--format csv` | CSV | |
| `--format table` | Human-readable table | ✓ |
```

---

## Invocations

| Invocation | What it does |
| --- | --- |
| *(default)* | Write or update one document for one audience. Follow the doc flow. |
| `scribe audit <doc>` | Read-only audit. Do not edit. Read `references/verbs/audit.md`. |
| `scribe sync <doc>` | Reconcile doc against current code: find drift, fix claims, preserve truth. Read `references/verbs/sync.md`. |
| `scribe extract <source>` | Generate doc scaffolding from code, API surface, `--help`, OpenAPI, or proto. Read `references/verbs/extract.md`. |

One run = one document for one audience unless the user explicitly names more.

### Audit output format

Emit findings as a severity-labeled punch list:

```
severity | location       | what is wrong            | evidence                    | fix
P0       | README L14     | --format flag missing    | grep cmd/ found nothing     | Remove row or add flag
P1       | API.md §Auth   | token endpoint stale     | routes.go L88: /v2/token    | Update URL
P2       | README L40     | "blazing fast" no bench  | no evidence found           | Cut or add benchmark
```

P0 = factually wrong (drift, fabrication). P1 = structurally broken (wrong mode, missing critical section). P2 = quality (prose, formatting, style).

---

## Convention artifacts

`scribe.md` (voice, structure, link conventions): opt-in, read `references/scribe-md.md`. Once present, house style wins over defaults. Drift ledger emitted in handoff or persisted at `.scribe/drift.md`. Per-type templates live under `docs/`.

---

## Reference loading

### Always load

Read these at the start of every run:

- `references/source-evidence.md`
- `references/doc-types.md`
- `references/verification.md`

### Load when applies

- `references/audience.md`, `references/structure.md`, `references/prose.md`
- `references/links-and-format.md`, `references/code-vs-docs.md`
- `references/drift-ledger.md` (sync), `references/scribe-md.md` (conventions)
- `references/anti-patterns.md` (before drafting), `references/slop-test.md` (after drafting)
- `references/verbs/audit.md`, `references/verbs/sync.md`, `references/verbs/extract.md`

### Never load at runtime

- `references/philosophy.md` (human-only design rationale)
- `examples/` (human-only, not auto-loaded)

---

## Scope

In scope: all nine doc types, evidence-level claims, drift detection, single-doc single-audience work, optional snippet execution, Markdown and common generators. Deferred: marketing copy, blog posts, legal text, slide decks, full-site generation, cross-site IA migrations, localization, bespoke pipelines.
