# Shell completion

Load only when brief requests completion or project already ships `completion` scripts.

## Rules

- Generate from command tree, not hand-maintained duplicates
- Document install path in README (`source <(tool completion bash)`)
- Same flag names as runtime

## Framework notes

- Cobra: `GenBashCompletion`
- urfave/cli: `bash.BashCmd` autocomplete
- Other: follow pre-flight detected stack
