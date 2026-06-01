# Source evidence

Scribe starts with evidence. The goal is not to reverse-engineer the whole codebase; it is to capture enough repeatable facts that the doc describes what the code actually does — not what the framework usually does, not what the last version did, not what would be nice.

This is scribe's anti-slop spine. Every behavioral claim in a doc traces back to one of these levels.

## Evidence levels

| Level | Meaning | Use in docs |
| --- | --- | --- |
| `observed` | Read from a source line, or produced by a command you ran | Strongest. State plainly. Cite the source. |
| `derived` | Inferred from source structure or framework convention | State it, but soften ("retries transient errors") rather than overclaim a specific policy. |
| `stated` | Found in an existing README, comment, issue, or changelog | Useful lead, may be stale. Verify before repeating as fact. |
| `absent` | You searched the relevant code and the fact is not there | Do not invent. Flag it, placeholder it, or cut. |

A fact that was never checked is not an evidence level. Resolve it during inventory until it becomes `observed`, `derived`, or `absent`, or flag it as out of scope. A check that cannot be run in this environment is recorded as `not run` (see verification.md); an audit finding that could not be verified uses the `unknown` status (see verbs/audit.md). Neither is a claim-evidence level.

Prefer **observed** for anything that affects what a reader will type, call, or rely on. A documented default, signature, flag, route, or return type should be observed, not assumed.

## The claim ledger

Before drafting, list the factual claims the doc will make:

```text
claim | evidence level | source | in doc as
```

Examples:

- `--json flag exists | observed | cmd/root.go L40 | reference table row`
- `default page size 50 | observed | handler.go L22 | "returns 50 items by default"`
- `retries on network error | derived | client.go retry wrapper | "retries transient failures"`
- `requires Node 18+ | stated | package.json engines, unverified | flag for confirmation`
- `rate limit 100 req/min | absent | no limiter in source | OMIT — do not document`

Any claim below **derived** is flagged, placeholdered, or cut. The ledger is the difference between a doc that ages well and one that lies by next release.

## Safe discovery commands

Use the project's own tooling. Keep inventory read-only.

### CLI

```bash
<tool> --help
<tool> <subcommand> --help
<tool> --version 2>/dev/null || <tool> version
NO_COLOR=1 <tool> --help | cat
```

From source:

```bash
rg 'Use:|Short:|Long:|Flags|cobra.Command|clap|argparse|click|urfave' .
rg 'os.Exit|process.exit|sys.exit|System.exit' .
```

Record: command tree, flags + real defaults, env vars, exit codes, stdout/stderr split, output modes.

### Library / package API

```bash
rg '^func [A-Z]|^type [A-Z]|^pub fn|^export (function|class|const)|def [a-z]' .
rg 'export |module.exports|public class|public interface' .
```

Record: exported symbols, signatures, parameter names and types, return types, raised/returned errors, public examples and tests.

### REST API

```bash
rg 'GET|POST|PUT|PATCH|DELETE|route|router|@app\.|APIRouter|chi|gin|axum|Spring' .
rg --files | rg 'openapi|swagger'
```

Record: route list and handler files, request/response shapes, status codes, error envelope, auth, existing OpenAPI location and version.

### gRPC

```bash
rg --files | rg '\.proto$|buf.yaml'
rg 'service |rpc |message ' .
```

Record: proto packages, services, RPC names, message fields, status mapping.

### Config / behavior

```bash
rg 'default|fallback|env|getenv|os.Getenv|process.env' .
```

Record: config keys, precedence, real default values (read them, do not assume the documented one).

### Existing docs

```bash
rg --files | rg -i 'readme|\.md$|docs/'
```

Record: what exists, what is stale (compare against source), what to keep.

## Citation format

In prose and ledgers, cite the source:

```text
cmd/root.go L40 defines --json.
handler.go L22 sets the default page size to 50.
README claims --format exists, but cmd/root.go has no such flag (removed L52).
```

For command evidence, include the command:

```text
Observed via `search --help | cat`: 8 subcommands, exit codes 0/1/2.
```

## When evidence is absent

Say so. Absent evidence is a finding, not a license to invent:

- "No rate limiter in source; rate-limit docs omitted."
- "Default not found in code; asked the user to confirm."
- "Snippet not executed; toolchain not present in this environment."

An absent fact, clearly marked, is honest. An invented one is the failure scribe exists to prevent.
