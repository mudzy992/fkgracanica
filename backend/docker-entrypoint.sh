#!/bin/sh
# docker-entrypoint.sh — start backend kontejnera (CI-04 / B-CI04-02).
#
# Zašto postoji: Coolify je prije ovoga koristio build-arg `DATABASE_URL` koji je
# završavao kao RUNTIME env (P1001 na `build-arg-dummy.invalid`). Sada build ne
# dobija URL, a ovaj entrypoint:
#   1. tvrdo pada ako `DATABASE_URL` nema,
#   2. pada ako je ostala placeholder/dummy vrijednost iz builda,
#   3. ispiše host (bez lozinke) da se odmah vidi gdje se spaja,
#   4. tek onda pokrene `prisma migrate deploy` i aplikaciju.
set -eu

mask() {
  # postgresql://user:PASS@host:5432/db -> postgresql://user:***@host:5432/db
  printf '%s' "$1" | sed -E 's#(://[^:/@]+):[^@]*@#\1:***@#'
}

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[entrypoint] FATAL: DATABASE_URL nije postavljen u okruženju kontejnera." >&2
  echo "[entrypoint] Provjeri Coolify → Application → Environment Variables" >&2
  echo "[entrypoint] i da je varijabla navedena u docker-compose.yml (environment:)." >&2
  exit 1
fi

case "$DATABASE_URL" in
  *build-arg-dummy* | *placeholder:placeholder*)
    echo "[entrypoint] FATAL: DATABASE_URL je PLACEHOLDER iz builda, ne runtime vrijednost:" >&2
    echo "[entrypoint]   $(mask "$DATABASE_URL")" >&2
    echo "[entrypoint] Ukloni DATABASE_URL iz build.args (Coolify izvozi build-args i u runtime env)." >&2
    exit 1
    ;;
esac

echo "[entrypoint] DATABASE_URL = $(mask "$DATABASE_URL")"

npx prisma migrate deploy
exec node dist/src/main.js
