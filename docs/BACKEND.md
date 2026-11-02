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
- RBAC: 6 rola (seed: `prisma/seed/rbac.ts`) + permission tabele.
  **Globalni `JwtAuthGuard` (BE-02/D-006)** = default-deny za sav HTTP; javne
  rute nose `@Public()` (**71 ruta** — invariant testa `route-access.spec.ts`,
  popis u `guards/approved-public-routes.ts`); `PermissionsGuard` + `@RequirePermissions`
  ostaju lokalni po ruti (audit: 0 violacija). WS autentikacija = vlastiti
  handshake realtime gatewaya (token ili public klijent).
- **Error ugovor** (globalni `common/filters/http-exception.filter.ts`, BE-01):
  `{ statusCode, message, timestamp, path }` — FE i MOB čitaju `message`;
  Prisma greške: `P2002→409`, `P2025→404`, `P2006→400`, ostalo → 500.
  `message`/status kodove NE mijenjati bez usklađivanja oba klijenta (pravilo 1).
- **Rate limiting** (BE-01/Q-11): globalno **100 req/60s** po IP + **10/60s** na
  `POST auth/login` i `auth/refresh`; `trust proxy = 1` (Coolify proxy) u `main.ts`.
- **Env validacija** (BE-01/P1): `config/env.validate.ts` — app odbija start bez
  `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (jasna poruka).
  Tipizirana konfiguracija: `config/configuration.ts` (ključevi: `port`,
  `databaseUrl`, `corsOrigins`, …); nova env varijabla → tamo + `.env.example`.
- Realtime: Socket.IO path iz `SOCKET_IO_PATH` (default `/socket.io`), sobe `match:*`, `newsletter`.

## Queue / keš (opciono, TLS)

- `REDIS_URL` prisutan → BullMQ `email` red + ioredis keš; odsutan → sinhroni email, keš no-op.
- TLS: `rediss://` + `REDIS_TLS_CA` (helper `common/utils/redis-tls.util.ts` → `tls.ca`);
  `NODE_EXTRA_CERTS` za Prisma CLI migracije. Detalji: `docs/DECISIONS.md` D-001.

## Poznato stanje (iz brzog audita)

| Tema | Stanje |
|------|--------|
| Rate limiting | ✅ globalno 100/60s + auth 10/60s + `trust proxy` (BE-01/Q-11); custom limit za public-analytics ostaje |
| Migracije | 1 fajl (`init_postgres`) — provjeriti saglasnost sa produkcijom (Q-07) |
| Testovi | 32 unit + 8 e2e; **bez coverage praga**; e2e zahtijeva bazu/redis |
| Error model / validacija / logging | ✅ error filter + env validacija + config modul (BE-01, ugovor gore); ⏳ logging konvencija = **INF-03** |
| Tajne | ✅ `.env` nije trackan; `.env.example` očišćen (F-001 → D-004 → **INF-02**) |
