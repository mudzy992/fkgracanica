#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose build --pull
docker image prune -f --filter dangling=true
echo "Build complete. Run: docker compose up -d"
