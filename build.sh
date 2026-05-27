#!/usr/bin/env bash
# Full local build: refresh xmake-repo checkout, regenerate the JSON dataset,
# then produce a static site under web/dist/. The same flow runs in CI.
#
# Usage:
#   ./build.sh                # full build
#   ./build.sh --no-pull      # reuse existing xmake-repo checkout
#   ./build.sh --data-only    # only regenerate JSON, skip the Vue build
#   ./build.sh --site-only    # only run the Vue build (assumes data is fresh)
#
# Honors VITE_BASE for sub-path deploys, e.g. VITE_BASE=/xmake-packages-index/.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG="$ROOT/site.config.json"

# Tiny JSON probe so we don't need jq as a hard dependency for two values.
read_config() {
  local key=$1
  python3 - "$CONFIG" "$key" <<'PY'
import json, sys
cfg = json.load(open(sys.argv[1]))
keys = sys.argv[2].split(".")
v = cfg
for k in keys:
    v = v[k]
print(v)
PY
}

REPO_URL=$(read_config build.repoUrl)
REPO_DIR=$ROOT/$(read_config build.repoCheckoutDir)
DATA_DIR=$ROOT/$(read_config build.dataOutDir)
LATEST_DAYS=$(read_config build.latestWindowDays)

DO_PULL=1
DO_DATA=1
DO_SITE=1
for arg in "$@"; do
  case "$arg" in
    --no-pull)   DO_PULL=0 ;;
    --data-only) DO_SITE=0 ;;
    --site-only) DO_DATA=0; DO_PULL=0 ;;
    -h|--help)
      sed -n '2,12p' "$0"; exit 0 ;;
    *) echo "unknown arg: $arg" >&2; exit 2 ;;
  esac
done

if [[ "$DO_DATA" == 1 ]]; then
  command -v xmake >/dev/null || { echo "xmake not found in PATH" >&2; exit 1; }

  if [[ ! -d "$REPO_DIR/.git" ]]; then
    echo ">> cloning $REPO_URL"
    mkdir -p "$(dirname "$REPO_DIR")"
    # Shallow clone is enough for current state; git_history.lua walks the
    # full log only when --no-shallow is used (set FULL_HISTORY=1 to opt in).
    if [[ "${FULL_HISTORY:-0}" == "1" ]]; then
      git clone "$REPO_URL" "$REPO_DIR"
    else
      # We do still need history for added/updated timestamps, but only on
      # files under packages/. Use a partial clone for speed.
      git clone --filter=blob:none "$REPO_URL" "$REPO_DIR"
    fi
  elif [[ "$DO_PULL" == 1 ]]; then
    echo ">> pulling latest in $REPO_DIR"
    git -C "$REPO_DIR" fetch --all --quiet
    git -C "$REPO_DIR" reset --hard origin/HEAD --quiet
  fi

  echo ">> generating index into $DATA_DIR"
  rm -rf "$DATA_DIR"
  mkdir -p "$DATA_DIR"
  xmake l "$ROOT/indexer/build.lua" \
    --repo="$REPO_DIR" \
    --out="$DATA_DIR" \
    --latest_days="$LATEST_DAYS"
fi

if [[ "$DO_SITE" == 1 ]]; then
  command -v npm >/dev/null || { echo "npm not found in PATH" >&2; exit 1; }
  cd "$ROOT/web"
  if [[ ! -d node_modules ]]; then
    echo ">> installing web dependencies"
    npm install --no-audit --no-fund
  fi
  echo ">> building static site"
  npm run build
  echo ">> done: $ROOT/web/dist"
fi
