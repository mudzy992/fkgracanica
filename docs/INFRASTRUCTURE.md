# Infrastruktura

> Status: inicijalna verzija (FAZA 0/1) — dubinski INFRA segment tek slijedi · Ažurirano: 2026-11-02

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
| `scripts/sync-docker-locks.sh` | Regeneracija standalone `package-lock.json` (za Docker `npm ci`) | AKTIVAN |

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
