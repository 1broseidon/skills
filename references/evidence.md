# Evidence pack

Anvil starts with evidence. The goal is not to exhaustively reverse-engineer the repo; it is to capture enough repeatable facts to avoid inventing contracts or reshaping the wrong boundary.

## Evidence levels

| Level | Meaning | Use |
| --- | --- | --- |
| **Observed** | Command output, source line, generated contract, compiled test | Strongest evidence; cite it |
| **Derived** | Inferred from source structure or framework convention | Say "derived" |
| **Stated** | README, docs, comments, issue text | Useful but may be stale |
| **Missing** | Expected contract or hook absent | Finding candidate |
| **Unknown** | Not checked, not knowable from current target | Do not guess |

Prefer "observed" for anything that affects caller behavior.

## Safe discovery commands

Use the language's own tooling and keep commands read-only during inventory.

### CLI

```bash
<tool> --help
<tool> version 2>/dev/null || <tool> --version
NO_COLOR=1 <tool> --help | cat
```

For source:

```bash
rg 'Use:|Short:|Long:|PersistentFlags|Flags|cobra.Command|clap|argparse|click|urfave' .
rg 'Exit|exit|os.Exit|process.exit|System.exit' .
```

Evidence to record:
- root command and subcommand tree
- stdout/stderr split
- output modes (`--json`, `--format`, `--minimal`)
- config flags/envs/files
- exit-code behavior if safely testable

### REST

```bash
rg 'GET|POST|PUT|PATCH|DELETE|route|router|Handle|FastAPI|APIRouter|chi|gin|echo|axum|Spring' .
rg --files | rg 'openapi|swagger'
```

Evidence to record:
- route list and handler files
- existing OpenAPI location and version
- error response shape
- request ID/auth/log middleware order
- health/version/readiness endpoints

### gRPC

```bash
rg --files | rg '\.proto$|buf.yaml'
rg 'service |rpc |Register.*Server|reflection.Register|grpc_health' .
```

Evidence to record:
- proto packages and services
- server registration files
- health/reflection setup
- status/error detail mapping
- long-running or streaming RPCs

### Package API

```bash
rg '^func [A-Z]|^type [A-Z]|^const [A-Z]|^var [A-Z]' .
rg 'export |module.exports|public class|public interface|pub ' .
```

Evidence to record:
- exported symbols
- public docs/examples/tests
- import direction
- consumers inside the repo

### Structure

```bash
rg --files
rg 'TODO|FIXME|XXX|HACK|Deprecated:|deprecated|old impl|kept for reference' .
```

Evidence to record:
- layout family
- bucket packages (`util`, `common`, `helpers`, `lib`, `shared`, `misc`)
- generated-code markers
- dependency direction
- dead-code tool output when requested

## Citation format

Use file citations in prose:

```text
cmd/root.go L31 defines the root cobra command.
internal/api/server.go L44 mounts /healthz.
openapi.yaml has no /v1/jobs/{id}/cancel path.
```

For command evidence, include the command:

```text
Observed via `NO_COLOR=1 search --help | cat`: no ANSI escapes.
```

## Missing evidence

Say when a check was not possible:

- "Binary not built; help output not observed."
- "OpenAPI exists, but server route listing requires app startup."
- "Package is public; unused exports inside the repo are not proof of dead code."

Missing evidence is not failure by itself. It becomes a finding only when the boundary requires that evidence.
