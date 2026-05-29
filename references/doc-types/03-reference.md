# Reference

**Diátaxis mode: information.** The reader knows what they're looking for and needs precise, complete, trustworthy facts. They are not reading top to bottom — they are looking up one entry. Reference is austere, exhaustive, and consistent. It describes the machinery; it does not teach or persuade.

## The contract

- **Accurate above all.** Every signature, type, default, and return value matches source exactly. Reference is the doc readers trust most and forgive least.
- **Complete.** The full public surface. Silently omitting a flag, parameter, or endpoint is a defect — the reader assumes absence means it doesn't exist.
- **Consistent.** Same structure for every entry. Once the reader learns one entry's shape, they read all of them fast.
- **Scannable.** Tables, entries, predictable ordering. The reader finds the one row they need without reading prose.
- **No narrative.** State what is, not how to use it or why it's good. Examples are minimal and illustrative, not tutorials.

## Shape

Per entry (function, flag, endpoint, config key):

```text
Name / signature           — exact, from source
One-line description        — what it does, present tense
Parameters                  — name · type · required? · default · meaning
Returns                     — type and meaning
Errors / raises             — what callers must handle
Example                     — minimal, real, runnable
Notes                       — constraints, side effects, since-version
```

For a flag/endpoint table:

```text
| Name | Type | Default | Description |
```

## Rules

- **Mirror the source.** Parameter names, order, and types come from the code, not memory.
- **Document defaults.** Every optional parameter shows its real default (read it from source).
- **Document errors.** If a caller must handle an error/exception/status, list it.
- **Order predictably.** Alphabetical, grouped-by-category, or source-order — pick one rule and state it.
- **Minimal examples only.** One short, real snippet per non-trivial symbol. Save the walkthrough for a tutorial.
- **Mark versions.** "Since v2.1", "Deprecated in v3.0 — use X". Trace to a real release.
- **No opinions.** "Use this for performance-critical paths" is explanation, not reference. Link to it instead.

## Verification

This is the type that most needs the truth-check. Diff documented surface against source: every flag against `--help`, every function against exported symbols, every endpoint against the router, every default against the code value. A reference that's 95% accurate is more dangerous than no reference, because the reader trusts it completely.

## Anti-patterns

- Narrating or persuading instead of stating.
- Omitting part of the surface.
- Parameters without type, default, or meaning.
- Arbitrary ordering.
- Inventing options to look complete.
- Stale signatures (the most common reference drift — run sync regularly).
