#!/bin/sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
DEFAULT_MESSAGE="Deploy updates"

extract_doc_title_from_path() {
  path=$1

  case "$path" in
    docs/[0-9][0-9][0-9][0-9]/*/*)
      remainder=${path#docs/[0-9][0-9][0-9][0-9]/}
      title=${remainder%%/*}
      [ -n "$title" ] || return 1
      printf '%s' "$title"
      return 0
      ;;
  esac

  return 1
}

sanitize_commit_message() {
  path=$1

  title="$(extract_doc_title_from_path "$path" || true)"
  if [ -n "$title" ]; then
    printf '%s' "$title"
    return 0
  fi

  name="$(basename "$path")"

  case "$name" in
    ""|.DS_Store|INDEX.md|search.json)
      return 1
      ;;
  esac

  name="${name%-Summary.md}"
  name="${name%.md}"
  name="${name%.pdf}"
  name="${name#\[WWDC 26\] }"
  name="${name#\[WWDC26\] }"
  name="${name#\[WWDC 25\] }"
  name="${name#\[WWDC25\] }"
  name="${name#\[WWDC 24\] }"
  name="${name#\[WWDC24\] }"

  printf '%s' "$name"
}

find_path_for_commit_message() {
  doc_candidate=""
  generic_candidate=""
  tmp_file="$(mktemp)"

  trap 'rm -f -- "$tmp_file"' 0 1 2 15

  {
    git -c core.quotePath=false ls-files --others --exclude-standard
    git -c core.quotePath=false diff --name-only
    git -c core.quotePath=false diff --cached --name-only
  } > "$tmp_file"

  while IFS= read -r path; do
    [ -n "$path" ] || continue

    if ! sanitize_commit_message "$path" >/dev/null 2>&1; then
      continue
    fi

    case "$path" in
      docs/[0-9][0-9][0-9][0-9]/*/*-Summary.md)
        printf '%s\n' "$path"
        rm -f -- "$tmp_file"
        trap - 0 1 2 15
        return 0
        ;;
    esac

    if [ -z "$doc_candidate" ] && extract_doc_title_from_path "$path" >/dev/null 2>&1; then
      doc_candidate="$path"
      continue
    fi

    if [ -z "$generic_candidate" ]; then
      generic_candidate="$path"
    fi
  done < "$tmp_file"

  rm -f -- "$tmp_file"
  trap - 0 1 2 15

  if [ -n "$doc_candidate" ]; then
    printf '%s\n' "$doc_candidate"
    return 0
  fi

  if [ -n "$generic_candidate" ]; then
    printf '%s\n' "$generic_candidate"
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
  COMMIT_PATH="$(find_path_for_commit_message || true)"
  if [ -n "$COMMIT_PATH" ]; then
    COMMIT_MESSAGE="$(sanitize_commit_message "$COMMIT_PATH")"
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
