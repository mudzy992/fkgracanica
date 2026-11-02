# Backend

> Status: inicijalna verzija (FAZA 0/1) — modul-po-modul audit tek slijedi (BE-01…) · Ažurirano: 2026-11-02

## Stack

NestJS 11 · TypeScript · Prisma 7 (`@prisma/adapter-pg`) · PostgreSQL · Socket.IO 4 ·
BullMQ 5 + ioredis 5 (opciono) · passport-jwt · helmet · @nestjs/swagger · class-validator.

## Struktura

- `backend/src/<modul>/` — paket po domenu: `*.controller.ts`, `*.service.ts`, `*.module.ts`,
  DTO/ (`dto/`), helperi (`*.util.ts`), specovi (`*.spec.ts`).
- Zajedničko: `common/` (utils, decorators, filters, guards, types), `prisma/` (PrismaService),
  `realtime/` (Socket.IO gateway), `jobs/` (BullMQ), `cache/` (ioredis), `health/`.
- **Veličina**: 48 controllera, 59 servisa, ~17.7k LOC, 32 unit spec-a, 8 e2e spec-a.

## Pokretanje i skripte

```bash
npm run start:dev        # watch
npm run build            # nest build
npm test                 # jest unit (src/**/*.spec.ts)
npm run test:e2e         # jest e2e (backend/test/, traži bazu — vidi test/setup-e2e-env.ts)
npm run test:cov         # coverage
npm run prisma:generate | prisma:migrate | prisma:seed | prisma:seed:rbac
```

## API

- Prefiks: `/api/v1` (`main.ts`), Swagger: `/api/docs`, health: `/api/v1/health` (`SELECT 1`).
- Autentikacija: JWT access (kratki) + refresh token; login endpointi u `auth/`.
- RBAC: 6 rola (seed: `prisma/seed/rbac.ts`) + permission tabele; guardovi lokalni
  (`@UseGuards` u 41 fajlu — **nema globalnog `APP_GUARD`**, konzistentnost = nalaz F-014,
  dubinski audit u BE segmentima).
- Realtime: Socket.IO path iz `SOCKET_IO_PATH` (default `/socket.io`), sobe `match:*`, `newsletter`.

## Queue / keš (opciono, TLS)

- `REDIS_URL` prisutan → BullMQ `email` red + ioredis keš; odsutan → sinhroni email, keš no-op.
- TLS: `rediss://` + `REDIS_TLS_CA` (helper `common/utils/redis-tls.util.ts` → `tls.ca`);
  `NODE_EXTRA_CERTS` za Prisma CLI migracije. Detalji: `docs/DECISIONS.md` D-001.

## Poznato stanje (iz brzog audita)

| Tema | Stanje |
|------|--------|
| Rate limiting | ❌ `@nestjs/throttler` instaliran, **nekorišten** (F-004); samo custom limit za public-analytics |
| Migracije | 1 fajl (`init_postgres`) — provjeriti saglasnost sa produkcijom (Q-07) |
| Testovi | 32 unit + 8 e2e; **bez coverage praga**; e2e zahtijeva bazu/redis |
| Error model / validacija / logging | za dubinski audit (segmenti BE-xx) — ne tvrditi prije pregleda |
| Tajne | `.env` nije trackan; `.env.example` sadrži sumnjivu lozinku (F-001/Q-04) |
