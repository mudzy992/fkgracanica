# Handoff

## Status

**Implementacija završena** — Faze 1–7 scaffold + funkcionalni API i UI.

## Env

- MySQL: `sql.ba101.top` / baza `fkgracanica` — kredencijali u `backend/.env` i root `.env` (ne commitati)
- Redis: `docker compose up -d` (opciono, za cache/jobs)
- Admin: `admin@fkgracanica.ba` / `Admin123!` (promijeni u produkciji)

## Pokretanje

```bash
docker compose up -d          # Redis
npm run dev:backend           # :3000
npm run dev:frontend          # :5173
npm run dev:mobile            # Expo
```

- Swagger: http://localhost:3000/api/docs

## Struktura

- `backend/` — 33 NestJS modula, Prisma 7 + MariaDB adapter
- `frontend/` — javni portal + admin (React Router)
- `mobile/` — Expo Router, tabs + live/membership/tickets

## Matrice

`.cursor/docs/matrices/{rbac,live_center,membership,ticketing}/`

## Napomene

- Online plaćanje nije implementirano — box office + admin potvrda
- Upload renditions stub — proširiti sa sharp u produkciji
- Image renditions i puni E2E suite mogu se dodati iterativno
