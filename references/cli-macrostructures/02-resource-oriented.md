# 02 · Resource-Oriented

## Shape

```
tool get <type> <id>
tool describe <type> <id>
tool delete <type> <id>
tool apply -f <file>
```

Verbs are **generic**; resource type carries domain meaning.

## When to use

Operators managing many entity types, infra-style CLIs, support tooling.

## Defaults

- ERR-01 with stable `CODE` field for scripting
- CFG-01 + global `--context`
- Output: `-o json|yaml|table` on read verbs

## Help

Group commands by resource in help root. Each type documents id format and required flags.
