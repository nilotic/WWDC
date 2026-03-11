#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_MESSAGE="Deploy updates"

sanitize_commit_message() {
  local path="$1"
  local name

  name="$(basename "$path")"
  name="${name%-Summary.md}"
  name="${name%.md}"
  name="${name%.pdf}"
  name="${name#\[WWDC 25\] }"
  name="${name#\[WWDC25\] }"
  name="${name#\[WWDC 24\] }"
  name="${name#\[WWDC24\] }"

  printf '%s' "$name"
}

find_new_file_for_commit_message() {
  local entry path first_candidate=""
  local x_status y_status

  while IFS= read -r -d '' entry; do
    [[ -z "$entry" ]] && continue

    x_status="${entry:0:1}"
    y_status="${entry:1:1}"
    if [[ "$entry" == \?\?* ]]; then
      path="${entry:3}"
    elif [[ "$x_status" == "A" || "$y_status" == "A" ]]; then
      path="${entry:3}"
    else
      continue
    fi

    if [[ "$path" == *"-Summary.md" ]]; then
      printf '%s\n' "$path"
      return 0
    fi

    if [[ -z "$first_candidate" ]]; then
      first_candidate="$path"
    fi
  done < <(git status --porcelain -z --untracked-files=all)

  if [[ -n "$first_candidate" ]]; then
    printf '%s\n' "$first_candidate"
  fi
}

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

if [[ $# -gt 0 ]]; then
  COMMIT_MESSAGE="$*"
else
  NEW_FILE="$(find_new_file_for_commit_message || true)"
  if [[ -n "$NEW_FILE" ]]; then
    COMMIT_MESSAGE="$(sanitize_commit_message "$NEW_FILE")"
  else
    COMMIT_MESSAGE="$DEFAULT_MESSAGE"
  fi
fi

echo "Committing changes..."
echo "Commit message: $COMMIT_MESSAGE"
git add -A
git commit -m "$COMMIT_MESSAGE"

echo "Pushing to origin/$BRANCH..."
git push origin "$BRANCH"

echo "Deployment complete."
