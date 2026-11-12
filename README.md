# FK Gračanica

Digitalna platforma za FK Gračanica — javni portal, admin CMS, live centar, članstvo i ulaznice.

## Struktura

```
backend/   NestJS + Prisma 7 + PostgreSQL + Socket.IO
frontend/  React + Vite + Tailwind
mobile/    Expo (React Native)
```

## Preduvjeti

- Node.js 20+
- PostgreSQL (dev/prod: `sql.ba101.top`, baza `fkgracanica`)
- Redis (opciono, `docker compose up -d`)

> Projekat je migriran sa MySQL na PostgreSQL. MySQL konfiguracija je
> sačuvana kao backup u `backend/prisma-mysql-backup/` (nije aktivna).
> Detalji: [`docs/_retired/docs/mysql-to-postgres-migration.md`](docs/_retired/docs/mysql-to-postgres-migration.md)
> (pensionisano — historijski zapis migracije).

## Setup

```bash
cp .env.example .env
# Uredi DATABASE_URL i admin kredencijale u .env

cd backend && npm run prisma:migrate && npm run prisma:seed
```

## Pokretanje (Docker produkcija)

```bash
./scripts/setup-upload-dir.sh   # jednom na hostu (sudo ako treba)
./scripts/docker-prod-build.sh
docker compose up -d
```

- Javni sajt: https://fkgracanica.ba101.top
- API: https://fkgracanica.ba101.top/backend/api/v1
- Swagger: https://fkgracanica.ba101.top/backend/api/docs
- Health: https://fkgracanica.ba101.top/backend/api/v1/health
- Uploadi na hostu: `/mnt/shared-app-files/fkgracanica` → `/app/uploads` u backend kontejneru

## Pokretanje (lokalni dev)

```bash
npm run dev:backend   # http://localhost:3000
npm run dev:frontend  # http://localhost:5173
npm run dev:mobile    # Expo
```

- Swagger: http://localhost:3000/api/docs
- Admin login: vrijednosti iz `ADMIN_EMAIL` / `ADMIN_PASSWORD` u `.env`

## Dokumentacija

Jedini izvor istine — `docs/` (nova dokumentacija) i `AUDIT/` (auditni dnevnik):

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — arhitektura sistema
- [docs/INFRASTRUCTURE.md](docs/INFRASTRUCTURE.md) — infrastruktura i deploy
- [docs/BACKEND.md](docs/BACKEND.md) / [docs/FRONTEND.md](docs/FRONTEND.md) / [docs/MOBILE.md](docs/MOBILE.md)
- [docs/TESTING.md](docs/TESTING.md) · [docs/CI.md](docs/CI.md) · [docs/CONVENTIONS.md](docs/CONVENTIONS.md) · [docs/DECISIONS.md](docs/DECISIONS.md)
- [docs/_retired/INDEX.md](docs/_retired/INDEX.md) — penzionisani dokumenti (samo historijska referenca)
