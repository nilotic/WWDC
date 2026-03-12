#!/bin/sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
DEFAULT_MESSAGE="Deploy updates"

sanitize_commit_message() {
  path=$1

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
  first_candidate=""
  tmp_file="$(mktemp)"

  trap 'rm -f -- "$tmp_file"' 0 1 2 15

  {
    git ls-files --others --exclude-standard
    git diff --cached --name-only --diff-filter=A
  } > "$tmp_file"

  while IFS= read -r path; do
    [ -n "$path" ] || continue

    case "$path" in
      *-Summary.md)
        printf '%s\n' "$path"
        rm -f -- "$tmp_file"
        trap - 0 1 2 15
        return 0
        ;;
    esac

    if [ -z "$first_candidate" ]; then
      first_candidate="$path"
    fi
  done < "$tmp_file"

  rm -f -- "$tmp_file"
  trap - 0 1 2 15

  if [ -n "$first_candidate" ]; then
    printf '%s\n' "$first_candidate"
  fi
}

cd "$ROOT_DIR"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" = "HEAD" ]; then
  echo "Cannot deploy from a detached HEAD." >&2
  exit 1
fi

echo "Running reindex..."
"$ROOT_DIR/scripts/reindex.sh"

if [ -z "$(git status --porcelain)" ]; then
  echo "No changes to deploy."
  exit 0
fi

if [ "$#" -gt 0 ]; then
  COMMIT_MESSAGE=$*
else
  NEW_FILE="$(find_new_file_for_commit_message || true)"
  if [ -n "$NEW_FILE" ]; then
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
