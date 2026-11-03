#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UPLOAD_DIR="/mnt/shared-app-files/fkgracanica"

mkdir -p "${UPLOAD_DIR}/originals" "${UPLOAD_DIR}/thumbs" "${UPLOAD_DIR}/medium"

# Backend kontejner radi kao user `app` (uid/gid 999 u node:22-bookworm-slim)
CONTAINER_UID=999
CONTAINER_GID=999

if [[ "${EUID}" -eq 0 ]]; then
  chown -R "${CONTAINER_UID}:${CONTAINER_GID}" "${UPLOAD_DIR}"
elif docker ps --format '{{.Names}}' 2>/dev/null | grep -qx fkgracanica-backend; then
  docker exec -u root fkgracanica-backend sh -c \
    'mkdir -p /app/uploads/originals /app/uploads/thumbs /app/uploads/medium && chown -R app:app /app/uploads'
else
  # BE-09c/P-B09c-12: bez `|| true` — ako chown padne, backend (uid 999) ne može
  # pisati u uploads, pa skripta mora pasti glasno umjesto „ready”.
  if ! sudo chown -R "${CONTAINER_UID}:${CONTAINER_GID}" "${UPLOAD_DIR}"; then
    echo "GREŠKA: chown ${UPLOAD_DIR} nije uspio — backend neće moći pisati uploads." >&2
    exit 1
  fi
fi

echo "Upload root ready: ${UPLOAD_DIR}"
ls -la "${UPLOAD_DIR}"
