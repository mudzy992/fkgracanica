# Arhitektura

> Status: inicijalna verzija (FAZA 0/1) — dopunjava se po audit segmentima · Ažurirano: 2026-11-02

## Pregled

Monorepo (npm workspaces: `backend`, `frontend`, `mobile`) — **API-first** platforma:
web i mobilni klijenti dijele isti REST API i Socket.IO realtime kanal.

```
frontend (React SPA + admin)  ─┐
                               ├─► backend (NestJS, /api/v1) ─► PostgreSQL (Prisma 7)
mobile  (Expo, expo-router)   ─┘         │
                                          ├─► Redis (opciono): BullMQ email red + ioredis keš
                                          └─► SMTP (preko tabele Settings, slanje u email queue)
```

## Backend (`backend/`)

- **NestJS 11** modularni monolit: ~48 paketa u `backend/src/` (auth, rbac, users, settings,
  cms, news, gallery, media, matches, competitions, statistics, live, realtime, ticketing,
  membership, payments, newsletter, contact, notifications, audit, dashboard, search, seo,
  showcase, museum, hall-of-fame, app-releases, health, jobs, cache, upload, …).
- **Prisma 7** + `@prisma/adapter-pg` (driver adapter — ne Rust engine konekcija).
  Šema: 59 modela, 17 enuma. Migracije: `backend/prisma/migrations/` (trenutno samo
  `20260825072946_init_postgres`), primjenjuju se pri startu kontejnera (`prisma migrate deploy`).
- **API**: REST, verzionisan (`app.setGlobalPrefix('api/v1')`), Swagger na `api/docs`,
  validacija preko `class-validator` DTO-a, centralni exception filter (→ BACKEND.md).
- **Realtime**: Socket.IO (`realtime.gateway.ts`), path iz `SOCKET_IO_PATH`, sobe
  `match:<id>` i `newsletter`; događaji: `match:join/leave`, `newsletter:join/leave`,
  `newsletter:campaign`, `settings:changed`, emit rezultata događaja.
- **Auth**: JWT access + refresh (`auth/`, `jwt.strategy.ts`), RBAC permission tabele,
  6 rola (Administrator, Moderator, Writer, Komentator, Redar, Član). Guardovi su
  **lokalni** (`@UseGuards` po controlleru — nema globalnog `APP_GUARD`; konzistentnost
  se auditira u BE segmentima).
- **Queue/keš (opciono)**: `REDIS_URL` postavljen → BullMQ `email` red (`jobs/jobs.module.ts`,
  koriste ga contact, membership, newsletter, notifications, payments, ticketing) +
  ioredis keš (`cache/cache.module.ts`). Bez `REDIS_URL` — email sinhrono, keš no-op.
  TLS: `rediss://` + `REDIS_TLS_CA` (vidi `docs/DECISIONS.md` D-001).
- **Upload**: fajlovi na hostu (`/mnt/shared-app-files/fkgracanica` → `/app/uploads`),
  u bazi samo putanje; image renditions (thumb/medium/original).

## Frontend (`frontend/`)

- React 19 + Vite 8 + Tailwind 4; React Router 7 (`src/router/app-routes.tsx`),
  TanStack Query, Zod + RHF, i18next (bs/en), tema (`src/lib/theme.tsx`), PWA
  (`public/manifest.json`, `sw.js`, `offline.html`).
- Stranice: `pages/public` (25 .tsx), `pages/admin` (147 .tsx, 15 sekcija),
  `pages/showcase` (režim "u izradi" — javni demo), `pages/home`.
- Admin ruta zaštićena `ProtectedRoute`; login: `/prijava` (član) i `/admin/login`.

## Mobile (`mobile/`)

- Expo 57 (RN 0.86) + expo-router (`app/`), 57 screenova, i18n (bs/en), staff hub
  (Writer, Galerija, Komentator, Moderator, Ulaz/Redar, Admin).
- **Ne dirati** showcase intercept u `app/_layout.tsx` i `(tabs)/_layout.tsx` (pravilo iz HANDOFF-a).
- EAS build profili (`eas.json`): preview (APK) i production; Google services konfiguracija prisutna.

## Podaci i integracije

- **PostgreSQL** — jedina baza (MySQL backup: `backend/prisma-mysql-backup/`, penzionisan).
- **Redis** — vidi iznad (opciono; Coolify: `rediss://…:6380`).
- **SMTP** — konfiguracija u `Settings` tabeli (`smtp.*` ključevi), slanje preko BullMQ-a.
- **Plaćanja** — Stripe, PayPal, Monri (`backend/src/payments/`), webhook-ovi + readiness gate.
- **YouTube** — live stream embed (po settings ključu).

## Ključne konvencije

- Datoteke ≤ 200 linija (config ≤ 400) — `.cursorrules`.
- Složeni moduli moraju imati `.cursor/docs/matrices/<module>/MATRIX.md` + `CHANGELOG.md`.
- Environment konfiguracija kroz env varijable (vidi `.env.example` i `docs/INFRASTRUCTURE.md`).
- Odluke korisnika: `docs/DECISIONS.md`.
