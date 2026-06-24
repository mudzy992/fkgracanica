#!/usr/bin/env bash
# Regenerates workspace package-lock.json files used by Docker npm ci (standalone per package).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

sync_lock() {
  local pkg="$1"
  local tmp="${TMPDIR:-/tmp}/fk-lock-${pkg}-$$"
  mkdir -p "$tmp"
  cp "$ROOT/$pkg/package.json" "$tmp/"
  (cd "$tmp" && npm install --package-lock-only)
  cp "$tmp/package-lock.json" "$ROOT/$pkg/package-lock.json"
  rm -rf "$tmp"
  echo "Synced $pkg/package-lock.json"
}

sync_lock backend
sync_lock frontend
