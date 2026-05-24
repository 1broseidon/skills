# 01 · Verb-Noun Tree

## Shape

```
tool <resource> <verb> [args]
tool invoice create --amount 100
tool invoice list --status open
```

Global flags: `--config`, `--output`, `--verbose`. Resource as middle tier.

## When to use

Developer tools, SaaS CLIs, multi-entity ops where users think in **objects then actions**.

## When not to use

Single-purpose binaries (use Single Shot). Kubernetes-style infra (Resource-Oriented often fits better).

## Defaults

- ERR-01 or ERR-02 (if machine-readable errors to stderr JSON)
- CFG-01
- HELP-01 on every leaf

## Exit codes

Document per verb family in `conventions.yaml`: 0 ok · 2 usage · 3 auth · 4 upstream.

## Anti-slop

No `tool run`. No duplicate verbs (`create` vs `new`) for the same action.
