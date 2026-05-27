#!/usr/bin/env bash
# Local dev: ensure the JSON dataset exists, then start the Vite dev server.
#
# Usage:
#   ./run.sh             # generate data once if missing, then start dev server
#   ./run.sh --refresh   # always regenerate the dataset before starting
#
# The Vue dev server picks up edits to src/** instantly; rerun ./run.sh
# --refresh to pull a newer xmake-repo snapshot.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$ROOT/web/public/data"

REFRESH=0
for arg in "$@"; do
  case "$arg" in
    --refresh) REFRESH=1 ;;
    -h|--help) sed -n '2,12p' "$0"; exit 0 ;;
    *) echo "unknown arg: $arg" >&2; exit 2 ;;
  esac
done

if [[ ! -f "$DATA_DIR/index.json" || "$REFRESH" == 1 ]]; then
  "$ROOT/build.sh" --data-only
fi

cd "$ROOT/web"
if [[ ! -d node_modules ]]; then
  echo ">> installing web dependencies"
  npm install --no-audit --no-fund
fi
echo ">> starting dev server"
exec npm run dev -- "$@"
