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
  sudo chown -R "${CONTAINER_UID}:${CONTAINER_GID}" "${UPLOAD_DIR}" 2>/dev/null || true
fi

echo "Upload root ready: ${UPLOAD_DIR}"
ls -la "${UPLOAD_DIR}"
