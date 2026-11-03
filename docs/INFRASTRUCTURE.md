# Infrastruktura

> Status: inicijalna verzija (FAZA 0/1) — dubinski INFRA segment tek slijedi · Ažurirano: 2026-11-02

## Docker build konteksti (CI-04)

| Servis | Kontekst | Lock |
|--------|----------|------|
| `backend` | `./backend` | `backend/package-lock.json` (standalone) |
| `frontend` | `.` (root) | **root** `package-lock.json` (npm workspace); `frontend/package-lock.json` je obrisan i ne smije se vraćati |

Zašto: `npm install -w frontend` piše samo u root lock, pa je standalone
`frontend/package-lock.json` zarašao i srušio Coolify deploy (`npm ci` EUSAGE,
B-CI04-01). Guard: `npm run check:all` pokreće `docker-context`, koji provjerava
da sva `COPY` putanja postoje i da nema „stranog” locka za workspace koji se
gradi iz root konteksta.

## Env varijable na Coolify — zašto ne dođu do kontejnera (B-CI04-02)

Coolify (docker-compose resurs) NE ubacuje varijable direktno u kontejner. Tok je:

```
Coolify UI (Environment Variables)  ->  /artifacts/<uuid>/.env  ->  docker compose
                                        (--env-file)              interpolacija ${VAR}
                                                                  u `environment:` bloku
```

Iz toga slijede tri pravila koja objašnjavaju „varijable su upisane, ali ih aplikacija ne vidi":

1. **`environment:` u `docker-compose.yml` je allowlista.** Varijabla koja postoji u
   Coolify UI, a nije navedena u compose `environment:` bloku, **nikad** ne dođe do
   kontejnera. Novu varijablu uvijek dodaj na oba mjesta.
2. **`${VAR}` bez vrijednosti = prazan string.** Ako varijabla nije u `.env` fajlu,
   kontejner dobije `VAR=""` i aplikacija padne na nekoj kasnijoj provjeri
   (npr. Prisma: `P1001 Can't reach database server at localhost:5432`).
   Zato od CI-04 stoji **`${VAR:?poruka}`** za kritične varijable — deploy padne
   odmah, sa imenom varijable koja fali.
3. **`localhost` unutar kontejnera = sam kontejner.** Za bazu na Coolify mreži
   `db_net` koristi ime DB servisa (npr. `postgres` / Coolify UUID) ili javni host
   (`sql.ba101.top`) uz `?sslmode=verify-full&sslrootcert=/etc/ssl/certs/coolify-ca.crt`.

Napomena o logu `injected env (0) from .env`: to je `dotenv` iz `backend/prisma.config.ts`.
`(0)` znači „u slici nema `.env` fajla" — to je **ispravno i očekivano** (tajne ne idu u
image); Prisma tada radi isključivo sa procesnim env varijablama. Ako su one prazne,
Prisma nema fallback.

### Dijagnostika na serveru

```bash
./scripts/diag-deploy.sh              # nađe backend kontejner sam
./scripts/diag-deploy.sh <container>  # ili eksplicitno
```

Skripta ispisuje: koje env varijable **stvarno postoje** u kontejneru (tajne maskirane),
na koji host/port pokazuje `DATABASE_URL`, da li se host razrješava unutar docker mreže
i da li je TCP port otvoren — bez ispisivanja lozinki.

Ručno, ako skripta nije pri ruci:

```bash
docker exec <backend> printenv DATABASE_URL | sed -E 's#(://[^:/@]+):[^@]*@#\1:***@#'
docker exec <backend> getent hosts <db-host>
docker inspect <backend> --format '{{range .Config.Env}}{{println .}}{{end}}' | grep DATABASE
```

## Šta je implementirano

### Datoteke

| Fajl | Uloga | Status |
|------|-------|--------|
| `docker-compose.yml` | **Produkcija (Coolify)** — backend + frontend; eksterne mreže `db_net`, `redis_net`; TLS CA mount-ovi | AKTIVAN |
| `docs/_retired/docker-compose1.yaml` | ~~Starija Traefik varijanta~~ **PENZIONISANA** (D-005: Traefik ne postoji u infra) | jedini izvor istine: `docker-compose.yml` (Coolify) |
| `backend/Dockerfile` | Multi-stage (deps → build → runner), node:22-bookworm-slim, non-root `app` korisnik, `HEALTHCHECK`, CMD: `prisma migrate deploy && node dist/src/main.js` | AKTIVAN |
| `frontend/Dockerfile` | Build (Vite) + statički/servirani frontend | AKTIVAN |
| `scripts/docker-prod-build.sh` | `docker compose build --pull` + prune dangling | AKTIVAN |
| `scripts/setup-upload-dir.sh` | Priprema upload direktorija na hostu (chown) | AKTIVAN |
| `scripts/rotate-secrets.sh` | Rotacija JWT sekreta + ADMIN_PASSWORD u `.env` | AKTIVAN |
| `scripts/sync-docker-locks.sh` | Regeneracija standalone `package-lock.json` — **samo `backend`**; frontend se gradi iz root konteksta (CI-04) | AKTIVAN |

### Coolify produkcija (`docker-compose.yml`)

- **Eksterne mreže**: `db_net` (Postgres), `redis_net` (Redis) — dijele se sa Coolify servisima.
- **TLS (Coolify CA)** — montirano u backend kontejner:
  - `/data/coolify/ssl/redis-core/redis-ca.crt` → `/run/secrets/redis-ca.crt:ro`
  - `/data/coolify/ssl/coolify-ca.crt` → `/etc/ssl/certs/coolify-ca.crt:ro`
- **Env (backend)** — ključni (kompletno u `.env.example`):
  - `DATABASE_URL` = …`?sslmode=verify-full&sslrootcert=/etc/ssl/certs/coolify-ca.crt`
  - `REDIS_URL` = `rediss://…:6380/0` (Coolify SSL port; bez SSL-a 6379)
  - `REDIS_TLS_CA` = `/run/secrets/redis-ca.crt` (čita backend → `tls.ca` za ioredis)
  - `NODE_EXTRA_CERTS` = `/etc/ssl/certs/coolify-ca.crt` (nužno za `prisma migrate deploy` —
    Prisma CLI ignoriše `sslrootcert`)
  - `JWT_*`, `ADMIN_*`, `CORS_ORIGINS`, `API_PUBLIC_URL`, `SOCKET_IO_PATH`, `UPLOAD_PATH`, …
- **Upload volumen**: `/mnt/shared-app-files/fkgracanica` → `/app/uploads`.

### Okruženja

- **Produkcija**: `https://fkgracanica.ba101.top` (API: `/backend/…` → strip prefix).
- **Lokalni dev**: `npm run dev:backend|frontend|mobile` (root workspace skripte).
- **Mobile**: EAS buildovi (preview APK / production) — izvan Docker-a.

## Šta NEDOSTAJE (kandidati za INF segment)

1. **Monitoring/logging** — nema definisanog logovanja (strukturisani logovi, nivoi),
   nema metrike/alertinga, nema uptime provjere osim Docker HEALTHCHECK-a.
2. **Backup/restore** — nigdje dokumentovano (baza, uploadi) niti testirano.
3. **Resource limiti** — compose nema `deploy.resources`/`mem_limit` za servise.
4. **Pinovanje slika** — `node:22-bookworm-slim` i slično plivaju po tagu; nema digesta.
5. **Skeniranje slika/zavisnosti, SBOM** — nema.
6. **IaC** — Coolify konfiguracija nije u repozitoriju (ručni klikovi na serveru).
7. **Healthcheck u compose-u** — `docker-compose.yml` nema healthcheck/blocked_on za backend
   (Dockerfile HEALTHCHECK postoji; frontend compose bez healthcheck-a).
8. **Paralelnost okruženja** — dev/prod nisu parity-e (nema staginga).
9. **Lockfile higijena** — root `npm ci` pada (F-015); dva lock sistema (F-016).
10. **Coolify CA rotacija** — dokumentovati postupak nakon "Regenerate SSL Certificates"
    (poznati Coolify bugovi #11926/#6081 — vidi sesiju TLS).

## Komande

```bash
./scripts/setup-upload-dir.sh        # jednom na hostu
./scripts/docker-prod-build.sh       # build
docker compose up -d                 # start (Coolify varijanta)
./scripts/menu.sh                    # meni (rebuild / lock sync / migrate / commit / EAS)
./scripts/rotate-secrets.sh          # rotacija JWT + admin lozinke u .env
```
