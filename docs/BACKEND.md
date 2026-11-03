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
- **Veličina**: 48 controllera, 59 servisa, ~17.7k LOC, 38 unit spec-a, 8 e2e spec-a.

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
- RBAC: 6 rola (definicija: `src/rbac/rbac-seed.constants.ts`, upis: `prisma/seed/rbac.ts`) + permission tabele.
- **Seed (BE-09c):** `ADMIN_PASSWORD` je **obavezan** pri prvom kreiranju admina
  (seed odbija rad bez njega); postojeći admin se ne prepisuje — namjerni reset je
  `ADMIN_RESET_PASSWORD=1`. Demo sadržaj (vijesti, galerije, CMS, utakmice, igrači)
  se puni **samo** uz `SEED_DEMO=1`; bez flaga seed radi RBAC + settings + admin.
- **Docker slika (BE-09c):** `DATABASE_URL` se koristi samo za `prisma generate`
  i ne ostaje u slojevima slike; `npm prune --omit=dev` uklanja devDependencies
  (seed se zato pokreće iz repoa/CI-ja, ne iz produkcijske slike).
  **Globalni `JwtAuthGuard` (BE-02/D-006)** = default-deny za sav HTTP; javne
  rute nose `@Public()` (**70 ruta** (BE-04: `gallery/:id` više nije javan) — invariant testa `route-access.spec.ts`,
  popis u `guards/approved-public-routes.ts`) uz **tihu autorizaciju**
  (BE-04/P-B04-1): Bearer na @Public ruti popunjava `req.user` — admin
  parametri (`?admin=1`, `?status=`) rade SAMO za prijavljene, anon =
  PUBLISHED/404; `PermissionsGuard` + `@RequirePermissions`
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
- **Plaćanja / ulaznice (BE-07)**:
  - **Iznos određuje server**: `POST /payments/checkout/membership` **ne prima**
    iznos — čita `membership.annualPrice` (`payments/membership-price.util.ts`).
    Cijena ulaznice se računa iz kategorija (`ticketing-orders.service.ts`).
  - **Validacija checkout bodyja**: `payments/checkout-validate.util.ts` —
    nepoznat `provider`, prazan `orderId`/`sessionId` ili ne-http `successUrl`
    → **400** (ranije 500).
  - **Webhook potpisi**: Stripe `constructEvent` (raw body iz `main.ts`),
    PayPal `verify-webhook-signature`, Monri `sha512(key+body)` +
    `timingSafeEqual`; `payments/mobile-return` allowlist samo
    `fkgracanica:`/`exp:`/`exps:`.
  - **Monri forma**: `origin` mora biti sa allowliste
    (`payments/payment-origin.util.ts` = `CORS_ORIGINS` + `API_PUBLIC_URL`)
    → **`CORS_ORIGINS` mora sadržavati javni domen frontenda u produkciji**.
  - **Pristup narudžbi**: `GET /ticketing/orders/:id` — vlasnik ili
    `ticketing.manage` (inače 404); skeniranje ulaznice je atomsko
    (`updateMany` + `count === 1`).
  - **Idempotencija (P-B07-2 A)**: `PaymentEvent(provider, externalId)` je
    claim — webhook retry i dvostruki `confirm-session` ne mogu dvaput
    produžiti članstvo (`payments/payment-event.util.ts`,
    `webhook-confirm.util.ts`). Claim se oslobađa ako obrada padne.
  - **Članstvo ima Payment red (Q-15)**: `Payment.membershipId` (uz
    `orderId`) — checkout otvara `PENDING_ONLINE`, potvrda ga zaključava;
    `finance/` prihod čita iz Payment redova (`finance-loaders.ts`), polje
    `estimated` u API-ju ostaje ali je sada `false` za plaćena članstva.
  - **Otkazivanje / povrat (P-B07-6)**: korisnik otkazuje samo **neplaćenu**
    narudžbu (`pending`); povrat samo za **plaćenu** (`paid`) bez iskorištenih
    ulaznica (`USED`); admin ne otkazuje plaćeno — ide kroz povrat
    (`refund_requested` → `refunded`, ulaznice `CANCELLED`).
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
| Testovi | 38 unit + 8 e2e; **bez coverage praga**; e2e zahtijeva bazu/redis |
| Error model / validacija / logging | ✅ error filter + env validacija + config modul (BE-01, ugovor gore); ⏳ logging konvencija = **INF-03** |
| Tajne | ✅ `.env` nije trackan; `.env.example` očišćen (F-001 → D-004 → **INF-02**) |
