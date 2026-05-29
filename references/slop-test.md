# Slop test

**Load only at Step 6.** These gates are a post-emit check, not a pre-emit reference. For avoiding failures up front, use [`anti-patterns.md`](anti-patterns.md).

Every gate is a question whose answer must be **NO** (you must not exhibit the failure).

When a gate fails: fix the doc, re-run the relevant block, re-emit the slop row.

---

## Universal (U01–U18)

| Gate | Question — answer must be NO |
| --- | --- |
| U01 | Did I document a flag, command, route, param, or symbol that does not exist in source? |
| U02 | Does a stated default differ from the actual code default? |
| U03 | Does a code example contain invented or secret-shaped values (`sk_live_abc`, `password123`)? |
| U04 | Did I claim a snippet works without running or compiling it? |
| U05 | Did I invent performance numbers, limits, quotas, or SLAs not backed by code or brief? |
| U06 | Did I promise roadmap/future behavior as if it ships today? |
| U07 | Are there dead internal links or broken heading anchors? |
| U08 | Did I repeat the same fact in three places instead of linking to one canonical source? |
| U09 | Is the first sentence of a section failing to answer that section's question? |
| U10 | Did I mix two Diátaxis modes on one page (tutorial steps inside a reference, etc.)? |
| U11 | Is there filler prose that does not change what the reader does or understands? |
| U12 | Did I use vague hedges (`simply`, `just`, `easy`, `obviously`) that hide real complexity? |
| U13 | Are version/compatibility claims unbacked by a manifest or test? |
| U14 | Did I leave a TODO/placeholder in the shipped doc without flagging it in handoff? |
| U15 | Is the audience inconsistent (jargon-free intro, then unexplained internals, then back)? |
| U16 | Did I omit expected output for a command where the reader can't tell success from failure? |
| U17 | Did I describe behavior as "derived" but write it as a hard guarantee? |
| U18 | Did I omit the self-critique stamp? |

---

## README (RM01–RM08)

| Gate | Question — answer must be NO |
| --- | --- |
| RM01 | Is there no one-line description of what the project is, above the fold? |
| RM02 | Does the quick-start fail to run from a clean checkout? |
| RM03 | Is the install command missing, wrong, or version-fragile? |
| RM04 | Does the feature list describe features not in the code? |
| RM05 | Is deep API detail inlined instead of linked to a reference? |
| RM06 | Is there no "where to go next" routing for the different reader types? |
| RM07 | Are badges decorative-only (broken, stale, or meaningless)? |
| RM08 | Is the license/contributing/support path absent when the repo is public? |

---

## Reference (RF01–RF08)

| Gate | Question — answer must be NO |
| --- | --- |
| RF01 | Does any signature, type, or return value disagree with source? |
| RF02 | Are parameters listed without type and meaning? |
| RF03 | Are raised/returned errors undocumented when callers must handle them? |
| RF04 | Is the entry narrating or persuading instead of stating facts? |
| RF05 | Is ordering arbitrary (not alphabetical, grouped, or source-ordered by a stated rule)? |
| RF06 | Are defaults omitted for optional parameters? |
| RF07 | Is there no minimal usage example per non-trivial symbol? |
| RF08 | Does the reference silently omit part of the public surface? |

---

## Tutorial / How-to (TH01–TH08)

| Gate | Question — answer must be NO |
| --- | --- |
| TH01 | Does the tutorial assume state or setup it never established? |
| TH02 | Is a step missing its command or its expected result? |
| TH03 | Does the how-to teach concepts instead of accomplishing the one task? |
| TH04 | Are prerequisites unstated or unversioned? |
| TH05 | Does the happy path branch into many options (tutorial should have one path)? |
| TH06 | Is there no "verify it worked" checkpoint? |
| TH07 | Are error/troubleshooting cases absent for steps that commonly fail? |
| TH08 | Does the end leave the reader without a clear next step or outcome? |

---

## In-code API docs (CD01–CD06)

Run when the target is docstrings / doc comments.

| Gate | Question — answer must be NO |
| --- | --- |
| CD01 | Does the docstring restate the function name instead of explaining behavior (`// GetUser gets a user`)? |
| CD02 | Do documented params/returns disagree with the signature? |
| CD03 | Are side effects, mutations, or errors omitted? |
| CD04 | Did I duplicate a full prose tutorial into a docstring instead of linking? |
| CD05 | Is the comment style inconsistent with the language convention (godoc/rustdoc/JSDoc/PEP 257)? |
| CD06 | Is the docstring stale relative to the current signature? |

---

## Fix policy

- **P0** (factually wrong, broken snippet, dead quick-start, security): fix before emitting. Do not hand back.
- **P1** (drift, mode mixing, missing required section, unverified claim stated as fact): fix before emitting.
- **P2** (polish, concision, link hygiene, formatting): note in preview; fix before `lock the style`.

Emit the slop row after fixes:

```markdown
- **Slop test** · U: 18/18 · RM: 8/8 · RF: 0/8 (n/a) · TH: 0/8 (n/a) · CD: 0/6 (n/a)
```
