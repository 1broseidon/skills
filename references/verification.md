# Verification

The truth-check turns a plausible doc into a verified one. Run the checks the doc type warrants, prefer commands the reader can repeat, and never claim a check passed that you did not run.

## Verification matrix

```text
check | command / evidence | result | notes
```

Report `pass`, `fail`, or `not run` (with a reason). "Not run" is honest; a fabricated "pass" is the worst outcome.

## Checks by doc type

| Doc type | Must verify |
| --- | --- |
| README | Install command works; quick-start runs; links resolve; feature list matches code |
| Reference | Every symbol/flag/route/param exists in source with the stated signature and default |
| Tutorial | The full sequence runs end to end from a clean state; expected output matches |
| How-to | Each step's command runs; the result is the claimed result |
| Explanation | Claims about behavior trace to source; no invented internals |
| Architecture/ADR | Component names and boundaries match the actual layout; decisions cite real constraints |
| Changelog/migration | Every "changed"/"removed" entry traces to a real diff; migration steps run |
| Runbook | Commands and signals are real; recovery steps were reasoned against actual failure modes |
| In-code API docs | Docstring matches the symbol's real params, return, and errors |

## Standard checks

### Surface existence

Compare every documented flag, command, route, RPC, or exported symbol against source:

```bash
# documented flags vs real flags
diff <(grep -oE '`--[a-z-]+`' README.md | sort -u) \
     <(tool --help | grep -oE '\-\-[a-z-]+' | sort -u)
```

Any flag in the doc but not the binary fails. Load the drift ledger if syncing.

### Defaults match

For each documented default, read the code value and compare. A doc that says "defaults to 30s" while `config.go` says `60` is drift, not a typo.

### Links resolve

No dead internal anchors or file paths. Check relative links and heading anchors:

```bash
rg -o '\]\(([^)]+)\)' -r '$1' doc.md   # extract link targets, then verify each exists
```

### Code snippets (optional, repo-dependent)

Run or compile snippets **when the toolchain is present and the snippet is self-contained**. This is the highest-value check and the one most often skipped dishonestly.

```bash
# extract and run a fenced bash block, or compile a Go/Rust/TS snippet
# language- and repo-specific; only do this when it actually works here
```

Decision rule:

- Toolchain present + snippet self-contained → **run it**, record pass/fail.
- Toolchain absent, snippet needs unavailable services, or environment can't execute → **mark "not run"** and say why.
- Never write "verified working" for a snippet you did not execute or compile.

When you cannot run it, you can still statically check it: imports exist, function names match the API surface, arguments are in the right order.

### Version / compatibility claims

Trace every supported-version claim to a manifest (`package.json` engines, `go.mod`, `Cargo.toml`, `pyproject.toml`, CI matrix). If it is not in a manifest and not tested, flag it as stated/unverified.

## Output

```markdown
## Verification matrix

| Check | Command / evidence | Result | Notes |
| --- | --- | --- | --- |
| Flags exist | `search --help` vs README table | pass | observed |
| Default page size | handler.go L22 vs prose | pass | both 50 |
| Quick-start runs | `npm i && npm start` | pass | clean checkout |
| Snippet (curl example) | executed | not run | needs live server |
| Links | internal anchor scan | pass | 0 dead |
```

End every doc by stating what you verified and what you could not. Unverified claims left in the doc must be flagged in the handoff.
