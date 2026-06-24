# FK Gračanica

Digitalna platforma za FK Gračanica — javni portal, admin CMS, live centar, članstvo i ulaznice.

## Struktura

```
backend/   NestJS + Prisma 7 + MySQL + Socket.IO
frontend/  React + Vite + Tailwind
mobile/    Expo (React Native)
```

## Preduvjeti

- Node.js 20+
- MySQL (dev: `sql.ba101.top`)
- Redis (opciono, `docker compose up -d`)

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

- [aplikacijski-plan.md](aplikacijski-plan.md) — master plan
- [.cursor/plans/fk-gracanica/](.cursor/plans/fk-gracanica/) — fazni plan
- [.cursor/docs/matrices/](.cursor/docs/matrices/) — feature matrice
