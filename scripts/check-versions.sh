#!/usr/bin/env bash
# Verify the version in the root README table matches each skill's SKILL.md.
# Usage:
#   scripts/check-versions.sh         # check only; non-zero exit on mismatch
#   scripts/check-versions.sh --fix   # rewrite README rows to match SKILL.md
set -euo pipefail

cd "$(dirname "$0")/.."

readme="README.md"
fix=0
[ "${1:-}" = "--fix" ] && fix=1

status=0

for skill_md in */SKILL.md; do
  dir="${skill_md%/SKILL.md}"
  # Source of truth: the version: field in the skill's front matter.
  src_ver="$(sed -n 's/^version:[[:space:]]*//p' "$skill_md" | head -n1)"
  if [ -z "$src_ver" ]; then
    echo "WARN  $skill_md has no version: field; skipping"
    continue
  fi

  # README row: | [name](dir/) | `x.y.z` | ... |
  row_ver="$(sed -n "s|.*\[[^]]*\](${dir}/)[^\`]*\`\([^\`]*\)\`.*|\1|p" "$readme" | head -n1)"
  if [ -z "$row_ver" ]; then
    echo "WARN  $dir not listed in $readme"
    status=1
    continue
  fi

  if [ "$src_ver" = "$row_ver" ]; then
    echo "OK    $dir $src_ver"
  elif [ "$fix" -eq 1 ]; then
    # Replace the first backtick-version on the row for this skill's dir.
    sed -i "s|\(\[[^]]*\](${dir}/)[^\`]*\)\`${row_ver}\`|\1\`${src_ver}\`|" "$readme"
    echo "FIX   $dir $row_ver -> $src_ver"
  else
    echo "DIFF  $dir README=$row_ver SKILL.md=$src_ver"
    status=1
  fi
done

if [ "$status" -ne 0 ] && [ "$fix" -eq 0 ]; then
  echo
  echo "Version mismatch. Run: scripts/check-versions.sh --fix"
fi
exit $status
