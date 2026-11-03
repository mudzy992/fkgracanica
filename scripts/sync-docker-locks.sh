#!/usr/bin/env bash
# Regenerates standalone package-lock.json files used by Docker npm ci, for the
# services that still build from their own directory context.
#
# CI-04 (2026-11-03): `frontend` više NIJE ovdje — frontend se gradi iz root
# konteksta sa root `package-lock.json` (npm workspace), pa standalone lock ne
# postoji i ne smije se vraćati (čuva ga `scripts/standards/docker-context.mjs`).
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
