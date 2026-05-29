#!/usr/bin/env bash
# Full local build: refresh xmake-repo checkout, regenerate the JSON dataset,
# then produce a static site under web/dist/. The same flow runs in CI.
#
# This script auto-installs xmake when missing (Linux/macOS), so a fresh CI
# runner needs only `./build.sh` — no separate setup step required.
#
# Usage:
#   ./build.sh                # full build (install xmake if missing, fetch repo, build data + site)
#   ./build.sh --no-pull      # reuse existing xmake-repo checkout, don't fetch
#   ./build.sh --data-only    # only regenerate JSON, skip the Vue build
#   ./build.sh --site-only    # only run the Vue build (assumes data is fresh)
#
# Env knobs:
#   VITE_BASE        — passed through to Vite; defaults to "/"
#   XMAKE_VERSION    — pin a specific xmake tag when bootstrap installs (default: latest)
#   FULL_HISTORY=1   — clone xmake-repo with full blobs (default: blob-filtered)
#   NO_INSTALL=1     — never auto-install tooling; fail loudly if anything is missing

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG="$ROOT/site.config.json"

log()  { printf '\033[1;32m>>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m!!\033[0m %s\n' "$*" >&2; }
fail() { printf '\033[1;31m!!\033[0m %s\n' "$*" >&2; exit 1; }

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

# -----------------------------------------------------------------------------
# Bootstrap: make sure git, python3, node, npm and xmake are all on PATH.
# Anything but xmake is treated as a prerequisite (CI runners come with these);
# xmake is auto-installed via the upstream installer when missing.
# -----------------------------------------------------------------------------

ensure_command() {
  local cmd=$1 label=${2:-$1}
  command -v "$cmd" >/dev/null 2>&1 || fail "$label is required but not on PATH"
}

install_xmake() {
  [[ "${NO_INSTALL:-0}" == "1" ]] && fail "xmake missing and NO_INSTALL=1 — install xmake or unset NO_INSTALL"

  local ver="${XMAKE_VERSION:-latest}"
  case "$(uname -s)" in
    Linux)
      log "installing xmake (Linux) via xmake.io/shget.text"
      # Official one-liner — runs without sudo into ~/.local/bin.
      curl -fsSL https://xmake.io/shget.text | bash -s "$ver"
      ;;
    Darwin)
      if command -v brew >/dev/null 2>&1; then
        log "installing xmake (macOS) via Homebrew"
        brew install xmake
      else
        log "installing xmake (macOS) via xmake.io/shget.text"
        curl -fsSL https://xmake.io/shget.text | bash -s "$ver"
      fi
      ;;
    MINGW*|MSYS*|CYGWIN*)
      fail "auto-install of xmake on Windows is not supported here — install from https://xmake.io and rerun"
      ;;
    *)
      fail "unsupported platform $(uname -s) — install xmake manually from https://xmake.io"
      ;;
  esac

  # xmake.io's installer writes to ~/.local/bin; CI shells often don't have it on PATH yet.
  export PATH="$HOME/.local/bin:$PATH"
  command -v xmake >/dev/null 2>&1 || fail "xmake still not on PATH after install (looked in \$HOME/.local/bin)"
  xmake --version | head -n 1
}

ensure_xmake() {
  if command -v xmake >/dev/null 2>&1; then
    return
  fi
  install_xmake
}

ensure_node() {
  ensure_command node Node.js
  local v=$(node -p 'process.versions.node.split(".").map(Number)[0]')
  if [[ "$v" -lt 18 ]]; then
    fail "Node.js >= 18 required (have $(node --version))"
  fi
}

# -----------------------------------------------------------------------------
# Argument parsing
# -----------------------------------------------------------------------------

DO_PULL=1
DO_DATA=1
DO_SITE=1
for arg in "$@"; do
  case "$arg" in
    --no-pull)   DO_PULL=0 ;;
    --data-only) DO_SITE=0 ;;
    --site-only) DO_DATA=0; DO_PULL=0 ;;
    -h|--help)
      sed -n '2,22p' "$0"; exit 0 ;;
    *) fail "unknown arg: $arg" ;;
  esac
done

# -----------------------------------------------------------------------------
# Resolve config (after parsing so --help doesn't require python3)
# -----------------------------------------------------------------------------

ensure_command python3 Python3
ensure_command git Git
ensure_command curl curl

REPO_URL=$(read_config build.repoUrl)
REPO_DIR=$ROOT/$(read_config build.repoCheckoutDir)
DATA_DIR=$ROOT/$(read_config build.dataOutDir)
LATEST_DAYS=$(read_config build.latestWindowDays)

# -----------------------------------------------------------------------------
# Data step: clone/refresh xmake-repo, run the lua indexer
# -----------------------------------------------------------------------------

if [[ "$DO_DATA" == 1 ]]; then
  ensure_xmake

  if [[ ! -d "$REPO_DIR/.git" ]]; then
    log "cloning $REPO_URL into $REPO_DIR"
    mkdir -p "$(dirname "$REPO_DIR")"
    if [[ "${FULL_HISTORY:-0}" == "1" ]]; then
      git clone "$REPO_URL" "$REPO_DIR"
    else
      # Partial clone: full history (needed for accurate added_at/updated_at)
      # but blobs are fetched on demand, which speeds the initial clone ~5x.
      git clone --filter=blob:none "$REPO_URL" "$REPO_DIR"
    fi
  elif [[ "$DO_PULL" == 1 ]]; then
    log "pulling latest in $REPO_DIR"
    git -C "$REPO_DIR" fetch --all --quiet
    git -C "$REPO_DIR" reset --hard origin/HEAD --quiet
  fi

  log "generating index into $DATA_DIR"
  rm -rf "$DATA_DIR"
  mkdir -p "$DATA_DIR"
  xmake l "$ROOT/indexer/build.lua" \
    --repo="$REPO_DIR" \
    --out="$DATA_DIR" \
    --latest_days="$LATEST_DAYS"
fi

# -----------------------------------------------------------------------------
# Site step: install npm deps, run the Vue build (which also runs prerender)
# -----------------------------------------------------------------------------

if [[ "$DO_SITE" == 1 ]]; then
  ensure_node
  ensure_command npm npm
  cd "$ROOT/web"
  if [[ ! -d node_modules ]]; then
    log "installing web dependencies"
    npm install --no-audit --no-fund
  fi
  log "building static site"
  npm run build
  log "done: $ROOT/web/dist"
fi
