#!/usr/bin/env bash
# Configures quality gates and Copilot automatic review on the current repository.
# Usage: scripts/setup-repo.sh [owner/repo]   (requires gh, repo admin)
set -euo pipefail

REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"
echo "Configuring $REPO"

echo "- Secret scanning and push protection"
gh api -X PATCH "repos/$REPO" --silent --input - <<'JSON' || echo "  (skipped: needs a public repo or GitHub Secret Protection)"
{ "security_and_analysis": {
    "secret_scanning": { "status": "enabled" },
    "secret_scanning_push_protection": { "status": "enabled" } } }
JSON

echo "- Dependabot alerts"
gh api -X PUT "repos/$REPO/vulnerability-alerts" --silent || true

echo "- CodeQL default setup"
gh api -X PATCH "repos/$REPO/code-scanning/default-setup" --silent \
  -f state=configured -f query_suite=default \
  || echo "  (skipped: needs a public repo or GitHub Code Security)"

for file in .github/rulesets/*.json; do
  name="$(jq -r .name "$file")"
  existing="$(gh api "repos/$REPO/rulesets" -q ".[] | select(.name == \"$name\") | .id")"
  if [[ -n "$existing" ]]; then
    echo "- Updating ruleset: $name"
    gh api -X PUT "repos/$REPO/rulesets/$existing" --input "$file" --silent
  else
    echo "- Creating ruleset: $name"
    gh api -X POST "repos/$REPO/rulesets" --input "$file" --silent
  fi
done

cat <<'MSG'

Done. Finish these settings in the UI (no public API yet):
  Settings > Copilot > Code review: default review effort (Lite / Balanced / Max), Copilot approvals
  Settings > Copilot > Cloud agent > MCP configuration (optional, also used by code review)
MSG
