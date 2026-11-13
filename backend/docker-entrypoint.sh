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

# P-CI04-2 hotfix (2026-11-13): Prisma 7 = `migrate deploy`, Prisma 8 = `db migrate`.
# Coolify build je pao sa CLI.COMMAND_MOVED (Prisma 8 u slici, 7 u locku — npx je
# vukao `latest` 8). Dual fallback radi sa oba: prvo pokuša 7, pa 8. Koristimo
# lokalni bin ako postoji da ne vučemo latest sa registryja.
echo "[entrypoint] pokrećem migracije..."
PRISMA_BIN="./node_modules/.bin/prisma"
if [ ! -x "$PRISMA_BIN" ]; then PRISMA_BIN="npx prisma"; fi
if $PRISMA_BIN migrate deploy; then
  echo "[entrypoint] migracije OK (migrate deploy)"
elif $PRISMA_BIN db migrate 2>&1; then
  echo "[entrypoint] migracije OK (db migrate fallback)"
else
  echo "[entrypoint] FATAL: migracije nisu uspjele ni sa 'migrate deploy' ni 'db migrate'" >&2
  echo "[entrypoint] Provjeri prisma verziju (package-lock 7.8.0 vs latest 8) i log iznad." >&2
  exit 1
fi
exec node dist/src/main.js
