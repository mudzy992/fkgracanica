#!/usr/bin/env bash
# Rotira JWT secreta i ADMIN_PASSWORD u root .env (ne dira DATABASE_URL).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — copy from .env.example first." >&2
  exit 1
fi

gen_secret() { openssl rand -base64 48 | tr -d '\n/+='; }
gen_password() { openssl rand -hex 12; }

ACCESS="$(gen_secret)"
REFRESH="$(gen_secret)"
ADMIN_PW="$(gen_password)"

sed -i "s|^JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=${ACCESS}|" "$ENV_FILE"
sed -i "s|^JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=${REFRESH}|" "$ENV_FILE"
sed -i "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=${ADMIN_PW}|" "$ENV_FILE"

echo "Rotated JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, ADMIN_PASSWORD in $ENV_FILE"
echo "Next: docker compose up -d backend && npm run db:seed"
