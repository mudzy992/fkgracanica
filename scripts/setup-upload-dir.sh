#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UPLOAD_DIR="/mnt/shared-app-files/fkgracanica"

mkdir -p "${UPLOAD_DIR}/originals" "${UPLOAD_DIR}/medium" "${UPLOAD_DIR}/thumb"

if [[ "${EUID}" -eq 0 ]]; then
  chown -R 1000:1000 "${UPLOAD_DIR}" 2>/dev/null || chown -R "$(logname):$(logname)" "${UPLOAD_DIR}" 2>/dev/null || true
fi

echo "Upload root ready: ${UPLOAD_DIR}"
ls -la "${UPLOAD_DIR}"
