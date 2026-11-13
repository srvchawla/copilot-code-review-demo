#!/usr/bin/env bash
# Opens a fresh pull request for a seeded scenario so Copilot reviews it from scratch.
# Usage: scripts/open-scenario-pr.sh <refund-endpoint|payout-batch|balances-endpoint> [suffix]
set -euo pipefail

SCENARIO="${1:?scenario required: refund-endpoint | payout-batch | balances-endpoint}"
SUFFIX="${2:-$(date +%H%M%S)}"
SOURCE="scenario/$SCENARIO"
BRANCH="live/$SCENARIO-$SUFFIX"

git fetch origin "$SOURCE" --quiet
git push origin "refs/remotes/origin/$SOURCE:refs/heads/$BRANCH"

TITLE="$(git log -1 --format=%s "origin/$SOURCE")"
BODY="$(git log -1 --format=%b "origin/$SOURCE")"

gh pr create --head "$BRANCH" --base main --title "$TITLE" --body "$BODY"
