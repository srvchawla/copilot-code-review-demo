#!/usr/bin/env bash
# Opens a fresh pull request for a seeded scenario so Copilot reviews it from scratch,
# and checks the new branch out locally so you can keep working on it.
#
# Usage: scripts/open-scenario-pr.sh [--no-instructions] <scenario> [suffix]
#   scenario: refund-endpoint | payout-batch | balances-endpoint
#   --no-instructions  remove Copilot instructions and skills on the PR branch, to compare
#                      a review without repository standards (Copilot reads them from the head branch)
set -euo pipefail

NO_INSTRUCTIONS=false
if [[ "${1:-}" == "--no-instructions" ]]; then NO_INSTRUCTIONS=true; shift; fi

SCENARIO="${1:?scenario required: refund-endpoint | payout-batch | balances-endpoint}"
SUFFIX="${2:-$(date +%H%M%S)}"
SOURCE="scenario/$SCENARIO"
BRANCH="live/$SCENARIO-$SUFFIX"
$NO_INSTRUCTIONS && BRANCH="$BRANCH-no-instructions"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree has uncommitted changes. Commit or stash them first." >&2
  exit 1
fi

# Target the repository that `origin` points to, not an upstream parent.
REPO="$(git remote get-url origin | sed -E 's#(\.git)?$##; s#^.*github\.com[:/]##')"

git fetch origin "$SOURCE" --quiet
git switch --create "$BRANCH" "origin/$SOURCE"

if $NO_INSTRUCTIONS; then
  git rm -r --quiet .github/copilot-instructions.md .github/instructions .github/skills AGENTS.md
  git commit --quiet -m "Remove Copilot instructions for comparison run"
fi

git push --quiet --set-upstream origin "$BRANCH"

TITLE="$(git log -1 --format=%s "origin/$SOURCE")"
$NO_INSTRUCTIONS && TITLE="$TITLE (no instructions)"
BODY="$(git log -1 --format=%b "origin/$SOURCE" | sed '/^Co-authored-by:/d')"

gh pr create --repo "$REPO" --head "$BRANCH" --base main --title "$TITLE" --body "$BODY"
echo "You are now on branch $BRANCH."
