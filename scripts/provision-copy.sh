#!/usr/bin/env bash
# Creates a copy of this demo with full Git history in another org, for example a
# PayPal org whose members use managed (EMU) accounts and cannot fork public repos.
# Do not use "Use this template": template copies have unrelated branch histories,
# so scenario branches cannot be opened as pull requests against main.
#
# Usage: scripts/provision-copy.sh <owner/new-repo> [--internal|--private|--public]
set -euo pipefail

TARGET="${1:?target required, e.g. my-org/copilot-code-review-demo}"
VISIBILITY="${2:---private}"
SOURCE_URL="$(git remote get-url origin)"
WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

if gh repo view "$TARGET" >/dev/null 2>&1; then
  echo "$TARGET already exists; pushing branches into it."
else
  gh repo create "$TARGET" "$VISIBILITY" --description "Copilot code review workshop (OctoPay demo)"
fi

git clone --quiet --bare "$SOURCE_URL" "$WORKDIR/src.git"
git --git-dir="$WORKDIR/src.git" push --quiet "https://github.com/$TARGET.git" \
  "refs/heads/main:refs/heads/main" "refs/heads/scenario/*:refs/heads/scenario/*"

gh repo edit "$TARGET" --default-branch main --delete-branch-on-merge
(cd "$WORKDIR" && git clone --quiet "https://github.com/$TARGET.git" copy && cd copy && scripts/setup-repo.sh "$TARGET")

echo "Provisioned https://github.com/$TARGET"
echo "Next: update .github/CODEOWNERS, add participants, and confirm Copilot code review is enabled for the org."
