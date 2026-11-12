#!/usr/bin/env bash
# diag-deploy.sh — dijagnostika za Coolify deploy (CI-04 / B-CI04-02).
#
# Odgovara na pitanje "zašto backend ne vidi env varijable / bazu":
#   1. koje env varijable stvarno POSTOJE u running kontejneru (bez tajni)
#   2. na koji host/port pokazuje DATABASE_URL (bez lozinke)
#   3. da li se taj host razrješava unutar docker mreže
#   4. da li je TCP port otvoren iz kontejnera
#
# Pokretanje NA SERVERU (iza Coolify):
#   ./scripts/diag-deploy.sh                 # traži kontejner po imenu "backend"
#   ./scripts/diag-deploy.sh <container>     # eksplicitno ime/id kontejnera
#
# Skripta NIKAD ne ispisuje lozinke (maskira ih kao ***).
set -uo pipefail

CONTAINER="${1:-}"
if [ -z "$CONTAINER" ]; then
  CONTAINER="$(docker ps --format '{{.Names}}' | grep -i backend | head -n1 || true)"
fi
if [ -z "$CONTAINER" ]; then
  echo "✗ Nema running kontejnera sa 'backend' u imenu. Proslijedi ime: $0 <container>"
  docker ps --format '  {{.Names}}\t{{.Image}}\t{{.Status}}'
  exit 1
fi

echo "== kontejner: $CONTAINER"
docker ps --filter "name=$CONTAINER" --format '  image={{.Image}}  status={{.Status}}'

echo
echo "== env varijable u kontejneru (tajne maskirane)"
for name in DATABASE_URL REDIS_URL JWT_ACCESS_SECRET JWT_REFRESH_SECRET ADMIN_PASSWORD \
  API_PUBLIC_URL INTERNAL_API_URL CORS_ORIGINS PORT NODE_EXTRA_CERTS REDIS_TLS_CA UPLOAD_PATH; do
  value="$(docker exec "$CONTAINER" printenv "$name" 2>/dev/null || true)"
  if [ -z "$value" ]; then
    echo "  $name = <NIJE POSTAVLJENA>"
    continue
  fi
  case "$name" in
    DATABASE_URL | REDIS_URL)
      # maskiraj kredencijale: scheme://user:***@host:port/db
      masked="$(printf '%s' "$value" | sed -E 's#(://[^:/@]+):[^@]*@#\1:***@#')"
      echo "  $name = $masked"
      ;;
    *SECRET* | *PASSWORD)
      echo "  $name = *** (postavljena, ${#value} znakova)"
      ;;
    *)
      echo "  $name = $value"
      ;;
  esac
done

echo
DB_URL="$(docker exec "$CONTAINER" printenv DATABASE_URL 2>/dev/null || true)"
if [ -z "$DB_URL" ]; then
  echo "✗ DATABASE_URL nije u kontejneru."
  echo "  → Coolify: Application → Environment Variables mora imati DATABASE_URL,"
  echo "    i mora biti navedena u docker-compose.yml (environment:), inače do kontejnera ne dođe."
  exit 2
fi

REST="${DB_URL#*://}"
HOSTPORT="${REST#*@}"
DB_HOST="${HOSTPORT%%:*}"
DB_PORT="${HOSTPORT#*:}"
DB_PORT="${DB_PORT%%/*}"
DB_PORT="${DB_PORT%%\?*}"

echo "== da li je URL upisan u SLIKU (baked ENV — čest uzrok P1001)"
IMAGE="$(docker inspect "$CONTAINER" --format '{{.Config.Image}}' 2>/dev/null || true)"
BAKED="$(docker image inspect "$IMAGE" --format '{{range .Config.Env}}{{println .}}{{end}}' 2>/dev/null | grep -c '^DATABASE_URL=' || true)"
if [ "${BAKED:-0}" -gt 0 ]; then
  echo "  ✗ SLIKA ($IMAGE) ima ugrađen ENV DATABASE_URL:"
  docker image inspect "$IMAGE" --format '{{range .Config.Env}}{{println .}}{{end}}' \
    | grep '^DATABASE_URL=' | sed -E 's#(://[^:/@]+):[^@]*@#\1:***@#' | sed 's/^/    /'
  echo "    → build-arg ili ENV u Dockerfile-u; Coolify build-args pregaze runtime env."
else
  echo "  ✓ slika nema ugrađen DATABASE_URL (env dolazi iz compose 'environment:')"
fi

echo "== baza: host='$DB_HOST' port='${DB_PORT:-5432}'"
case "$DB_URL" in
  *"&amp;"*)
    echo "  ✗ DATABASE_URL sadrži HTML-entitet '&amp;' umjesto '&'."
    echo "    Tada se 'sslrootcert' NE parsira (postaje 'amp;sslrootcert') i TLS/CA"
    echo "    podešavanja se ignoriraju. Upiši vrijednost ponovo sa običnim '&'."
    ;;
esac
case "$DB_HOST" in
  *build-arg-dummy*)
    echo "  ✗ Ovo je DUMMY build-arg iz backend/Dockerfile, ne prava vrijednost —"
    echo "    proces je radio bez Coolify env varijable (npr. tokom builda)."
    ;;
esac
case "$DB_HOST" in
  localhost | 127.0.0.1)
    echo "  ✗ 'localhost' UNUTAR kontejnera znači sam kontejner, ne bazu."
    echo "    Upiši ime DB servisa na db_net mreži (npr. 'postgres' ili Coolify UUID),"
    echo "    ili javni host (npr. 'sql.ba101.top') uz ?sslmode=verify-full&sslrootcert=..."
    ;;
esac

echo
echo "== DNS unutar kontejnera: $DB_HOST"
docker exec "$CONTAINER" node -e "
const dns = require('dns');
dns.lookup(process.argv[1], { all: true }, (e, addrs) => {
  if (e) { console.log('  ✗ ne razrješava se: ' + e.code +
    '  → kontejner nije na istoj docker mreži kao baza (db_net)'); process.exit(1); }
  for (const a of addrs) console.log('  ✓ ' + a.address);
});
" "$DB_HOST" || true

echo
echo "== TCP provjera: $DB_HOST:${DB_PORT:-5432}"
docker exec "$CONTAINER" node -e "
const net = require('net');
const [host, port] = [process.argv[1], Number(process.argv[2])];
const s = net.connect({ host, port, timeout: 5000 });
s.on('connect', () => { console.log('  ✓ port otvoren'); s.destroy(); });
s.on('timeout', () => { console.log('  ✗ timeout (firewall / pogrešan port)'); s.destroy(); process.exitCode = 1; });
s.on('error', (e) => { console.log('  ✗ ' + e.code + ' (port zatvoren / host nedostupan)'); process.exitCode = 1; });
" "$DB_HOST" "${DB_PORT:-5432}" || true

echo
echo "== zadnjih 20 linija loga kontejnera"
docker logs --tail 20 "$CONTAINER" 2>&1 | sed 's/^/  /'
