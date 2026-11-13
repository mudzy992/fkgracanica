#!/bin/sh
# docker-migrate.sh — izdvojeni migrator servis (P-CI04-2 napredno).
#
# Zašto postoji: prije je `prisma migrate deploy` bio u `docker-entrypoint.sh`
# i svaki backend kontejner je čekao migracije prije starta (sporiji start,
# dupliranje posla kod scale-a, healthcheck lažno KO dok migracije traju).
# Sada migracije radi poseban `migrator` servis (isti image kao backend) koji
# završi sa `service_completed_successfully`, a backend čeka na njega
# (depends_on). Time se boot ubrzava i migracije su idempotentne (prisma ih
# preskače ako su već primijenjene).
set -eu

mask() {
  printf '%s' "$1" | sed -E 's#(://[^:/@]+):[^@]*@#\1:***@#'
}

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[migrator] FATAL: DATABASE_URL nije postavljen" >&2
  exit 1
fi
case "$DATABASE_URL" in
  *build-arg-dummy* | *placeholder:placeholder*)
    echo "[migrator] FATAL: DATABASE_URL je PLACEHOLDER: $(mask "$DATABASE_URL")" >&2
    exit 1
    ;;
esac
echo "[migrator] DATABASE_URL = $(mask "$DATABASE_URL")"
echo "[migrator] pokrećem migracije..."

# P-CI04-2 hotfix: dual fallback (Prisma 7 vs 8)
PRISMA_BIN="./node_modules/.bin/prisma"
if [ ! -x "$PRISMA_BIN" ]; then PRISMA_BIN="npx prisma"; fi

if $PRISMA_BIN migrate deploy; then
  echo "[migrator] migracije OK (migrate deploy)"
elif $PRISMA_BIN db migrate 2>&1; then
  echo "[migrator] migracije OK (db migrate fallback)"
else
  echo "[migrator] FATAL: migracije nisu uspjele" >&2
  exit 1
fi
echo "[migrator] završeno — backend može startati"
