# Worked example: anvil study harbor (binary-only)

**Target:** `harbor` v1.3.2, installed at `/usr/local/bin/harbor`
**Mode:** binary-only study (source not available locally)
**Date:** 2026-05-22

`harbor` is a fictitious-but-plausible multi-backend artifact fetcher (npm / pypi / maven / oci / git). It distributes as a Node CLI via `npm i -g harbor`. Used here as a worked example of `anvil study <tool>` against an installed binary with no source.

---

## Protocol executed

```bash
# Step 1 — help tree traversal
harbor --help
harbor fetch --help
harbor mirror --help
harbor sync --help
harbor sync status --help
harbor sync stop --help
harbor verify --help
harbor prune --help
harbor list --help
harbor inspect --help
harbor config --help
harbor completion --help
harbor version --help

# Step 2 — sample invocations
harbor list --backend npm --json
harbor fetch --limit -1                   # bad flag value
harbor fetch "not-a-valid-spec"           # invalid input
echo "exit: $?"

# Step 3 — introspection
harbor config --json
harbor version --json

# Step 4 — NO_COLOR + TTY check
harbor list --backend npm | cat
NO_COLOR=1 harbor list --backend npm | cat
```

---

## Diagnosis

```
# Anvil study — harbor (binary-only)

Source: /usr/local/bin/harbor v1.3.2 (Node 20, packaged with pkg)

## Surface DNA

**Macrostructure:** Verb-Surface (11)
  7 top-level verbs: fetch · mirror · sync · verify · prune · list · inspect
  (+ completion · config · version · help as standard infra)
  Implicit subject: "artifacts / packages / mirrors"
  Verb count: 7 core (well inside the 15 ceiling)
  Confirmed via --help tree traversal.

**Caller profile:** agent (confirmed)
  Evidence:
  · --json is a global persistent flag (all data-emitting commands)
  · --minimal on list/inspect (tab-separated, one row per line)
  · --max-chars on inspect (truncation budget)
  · sync --background → id; sync status <id>; sync stop <id> (ASYNC-01)
  · harbor config --json returns available_backends (BACKEND-01 introspection)
  · NO_COLOR=1 honoured (A02 ✓ — confirmed via invocation)
  · No interactive prompts on default path

**Error envelope:** ERR-01 with structured stderr
  · --json mode: {"error":{"code":"…","message":"…","hint":"…"}} on stderr
  · Text mode: "harbor: <message>" on stderr, data on stdout
  Confirmed: bad --limit produces clean stderr message; --json mode emits the structured form.

**Exit codes (confirmed via invocation):**
  · 0: success
  · 1: validation error (bad flag value) — NOTE: should be exit 2 (gate C05)
  · 1: invalid spec ("not-a-valid-spec") — collapses with the validation case
  Exit code map is not granular enough for full agent-caller gate pass.

**Config story:** CFG-01 (confirmed via harbor config --json output)
  Effective config as JSON including:
  · config_path  ("~/.harborrc" resolved)
  · backend (current)
  · available_backends list ✓
  · npm_registry, pypi_index_url, maven_central_url, oci_default_registry
  · cache_dir, parallelism

**Backend story:** BACKEND-01 (exemplary)
  · Registries: npm | pypi | maven | oci | git (global --backend)
  · Each backend has namespaced flags (--npm-registry, --pypi-index-url, --oci-auth)
  · `harbor config --json` lists available_backends ✓
  · Silent fail-over behaviour: NOT CONFIRMED — recommend testing

**Async story:** ASYNC-01 (confirmed)
  · harbor sync --background returns sync ID immediately
  · harbor sync status <id> polls state (queued | running | done | failed | cancelled)
  · harbor sync stop <id> cancels (idempotency on already-stopped: not tested)

**Output formats:** full agentic trio
  · text (default TTY, columnar)
  · --json (NDJSON for list/inspect ✓; single JSON object for config/version)
  · --minimal (tab-separated one row per line)
  · --max-chars (truncation on inspect)

**Completion:** harbor completion bash | zsh | fish — registered and functional

**Version:** harbor version --json → {"version":"1.3.2","commit":"…","built":"2026-04-11"}
  Confirmed agentic-clean.

---

## Structural DNA

(binary-only — source not reviewed)
Layout: inferred flat or feature-first under a single npm package; pkg-bundled so internal structure is opaque
Dead-code: cannot assess without source

---

## Anti-patterns observed

- Exit code 1 conflates validation errors and invalid-spec errors (should be 2 vs 2 with distinct messages, or 2 vs 3)
- `--limit -1` produces error but help doesn't state the valid range
- Silent fail-over on unavailable backend: not tested, not confirmed

## Anti-patterns NOT observed (good signs)

- No ANSI on piped stdout ✓
- NO_COLOR=1 works ✓
- No interactive prompts ✓
- --json available on every data-emitting command ✓
- config introspection with available_backends ✓
- version --json available ✓
- Async returns handles ✓

---

## Slop gate summary (binary-only)

| Block | Result |
| --- | --- |
| A01 | ✓ --json present on all data-emitting commands |
| A02 | ✓ NO_COLOR honoured; ANSI absent on piped stdout |
| A03 | ✓ (schema appears stable across runs — sampled 3x) |
| A04 | ✓ (no phantom flags observed) |
| A05 | ✓ (help defaults match invocation) |
| A06 | ✓ config returns available_backends |
| A07 | Not confirmed — recommend testing unavailable backend (e.g., --backend oci with no oci config) |
| A08 | ✓ --background returns id |
| A09 | Not assessable (single version studied) |
| A10 | ✓ NDJSON clean, no mixed lines |
| C05 | ✗ Exit code 1 for validation errors (should be 2); collapses with other failure classes |
| C13 | ✓ version subcommand + --version flag both present |

**Overall: 1 confirmed fail (C05), 1 unconfirmed (A07). Strong agent-caller conformance.**

---

## Limits (binary-only mode)

- Config precedence: inferred from --help and `harbor config --json` output — not source-verified
- Exit-code map: 0/1 confirmed; 2/3/4/6 distinction needs exhaustive error-path testing
- Schema completeness: top-level shape confirmed; nested fields sampled, not exhaustive
- Structural layout: unknown without source (pkg-bundled binary)
- Silent fail-over on backend outage: not tested
- Idempotency of `sync stop` on already-stopped jobs: not tested

---

## After diagnosis

Adopt this DNA wholesale, or change one axis?

Suggested axes to change for a new tool built from harbor DNA:
- **Improve exit codes**: split validation (2) from upstream (4) from cancelled (6) — harbor conflates to 1
- **Document backend fall-back behaviour**: even if the policy is "never fall back", say so explicitly
- **Verb count**: harbor at 7 core verbs is a clean target for Verb-Surface builds
- **Adopt wholesale**: BACKEND-01 + ASYNC-01 + agentic output trio + config introspection + version --json

Say "build with this DNA" to proceed, "lock the DNA" for an anvil.md, or "stop here" for diagnosis only.
```
