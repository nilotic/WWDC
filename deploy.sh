#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_MESSAGE="Deploy updates"
COMMIT_MESSAGE="${*:-$DEFAULT_MESSAGE}"

cd "$ROOT_DIR"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$BRANCH" == "HEAD" ]]; then
  echo "Cannot deploy from a detached HEAD." >&2
  exit 1
fi

echo "Running reindex..."
"$ROOT_DIR/scripts/reindex.sh"

if [[ -z "$(git status --porcelain)" ]]; then
  echo "No changes to deploy."
  exit 0
fi

echo "Committing changes..."
git add -A
git commit -m "$COMMIT_MESSAGE"

echo "Pushing to origin/$BRANCH..."
git push origin "$BRANCH"

echo "Deployment complete."
