#!/usr/bin/env bash
# Checks that a workshop copy is ready before you open scenario pull requests.
# Usage: scripts/verify-repo.sh [owner/repo]
set -uo pipefail

REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"
FAIL=0
check() { if [[ "$2" == ok ]]; then echo "  ok    $1"; else echo "  FAIL  $1: $3"; FAIL=1; fi; }

echo "Verifying $REPO"

branches="$(gh api "repos/$REPO/branches" -q '[.[].name] | join(" ")')"
missing=""
for b in main scenario/refund-endpoint scenario/payout-batch scenario/balances-endpoint; do
  [[ " $branches " == *" $b "* ]] || missing="$missing $b"
done
[[ -z "$missing" ]] && check "branches" ok || check "branches" no "missing$missing (run provision-copy.sh)"

ss="$(gh api "repos/$REPO" -q '.security_and_analysis.secret_scanning_push_protection.status' 2>/dev/null)"
[[ "$ss" == enabled ]] && check "secret scanning push protection" ok || check "secret scanning push protection" no "status '$ss'"

langs="$(gh api "repos/$REPO/code-scanning/default-setup" -q '.languages | join(",")' 2>/dev/null)"
[[ "$langs" == *javascript-typescript* ]] && check "CodeQL covers TypeScript" ok \
  || check "CodeQL covers TypeScript" no "languages '$langs' (rerun scripts/setup-repo.sh $REPO)"

for name in "copilot: automatic code review" "main: quality gates"; do
  state="$(gh api "repos/$REPO/rulesets" -q ".[] | select(.name == \"$name\") | .enforcement")"
  [[ "$state" == active ]] && check "ruleset '$name'" ok || check "ruleset '$name'" no "enforcement '${state:-missing}'"
done

ci_runs="$(gh api "repos/$REPO/actions/workflows/ci.yml/runs?per_page=1" -q .total_count 2>/dev/null || echo 0)"
if [[ "${ci_runs:-0}" -gt 0 ]]; then
  check "CI workflow has run" ok
else
  check "CI workflow has run" no "no runs yet. New repos can take a while before Actions starts the repo's workflows. Open a draft PR (drafts don't request Copilot) and confirm 'test' runs; retry later if not"
fi

echo
[[ $FAIL -eq 0 ]] && echo "Ready. Open live PRs at least 10 minutes before you show them: a review of a defect-heavy PR took about 10 minutes." \
  || { echo "Not ready."; exit 1; }
