# 03 · Flat Pipeline

## Shape

One primary command (or stdin mode). Flags configure transform.

```
tool [--filter expr] [--format json] [file...]
cat data.json | tool --filter '.items[]'
```

## When to use

Unix-style filters, log processors, codegen pipes, CI helpers.

## Contract

- stdin: primary input when no files
- stdout: **only** program output
- stderr: diagnostics, progress
- Exit 0 on success even when output is empty list (document this)

## Defaults

- CFG-02 or CFG-01 with env for defaults
- Minimal subcommand tree (often none)

## Anti-slop

Do not add subcommands "for structure" when the brief is a filter.
