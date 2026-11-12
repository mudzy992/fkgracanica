# FAZA 0 — Razumijevanje projekta

> Kreirano: 2026-11-02 · Grana: `arena/290a6f13-fkgracanica` @ `b0376a5`
> Status: **završeno (čitanje samo)** · Sljedeće: KAPIJA 1 (odobrenje)

## 1. Šta sistem radi

**FK Gračanica — digitalna platforma kluba.** Javni portal (vijesti, liga, tim, live centar,
članstvo, ulaznice), admin CMS za upravljanje sadržajem i korisnicima, te mobilna aplikacija
(Expo) sa paritetom funkcija. API-first: web i mobilni klijenti dijele isti REST API i
Socket.IO realtime kanal.

Glavni tokovi:
1. **Javni portal** — anonimni posjetitelj čita sadržaj, kupuje ulaznice/članstvo (gost → login gate).
2. **Autentikacija** — JWT access + refresh, registracija, uloga Član.
3. **Sadržajni workflow** — Writer kreira (Draft→Pending), Moderator odobrava, objava ide javno.
4. **Live centar** — Komentator vodi utakmicu uživo (događaji, semafor, komentar) preko
   Socket.IO-a; javno praćenje u realnom vremenu; nakon završetka moderatorska potvrda →
   statistika.
5. **Članstvo & ulaznice** — online kupovina/rezervacija, QR karte, skeniranje na ulazu
   (rola Redar), validacija.
6. **Plaćanja** — Stripe, PayPal, Monri (implementirano u kodu — vidi nalaz F-005).
7. **Email** — BullMQ red (`email`) preko Redis-a; bez Redis-a sinhroni fallback.
8. **Newsletter/kontakt** — forma → email kroz queue; in-app + realtime notifikacije.

## 2. Slojevi i stack (iz koda, ne iz dokumentacije)

| Sloj | Tehnologija | Ključni podaci |
|------|-------------|----------------|
| **Backend** | NestJS 11 + TypeScript, Prisma 7 + PostgreSQL (adapter `@prisma/adapter-pg`), Socket.IO 4, BullMQ 5 + ioredis 5, helmet, Swagger, class-validator | 48 controllera, 59 servisa, 32 unit spec-a, 8 e2e spec-a, 59 Prisma modela, 17 enuma, 1 migracija (`20260825072946_init_postgres`), ~17.7k LOC |
| **Frontend** | React 19 + Vite 8 + Tailwind 4, React Router 7, TanStack Query 5, Zod 4, react-hook-form, i18next (bs/en), PWA (sw.js + manifest) | 147 admin .tsx, 25 public .tsx, showcase mod, `lib/theme.tsx` (dark mode), ~38.3k LOC · **bez test runner-a** |
| **Mobile** | Expo 57 (RN 0.86), expo-router, i18next (bs/en), EAS (apk build) | 57 screenova, staff flowovi (Writer/Komentator/Moderator/Redar/Admin), showcase intercept u `_layout.tsx` (NE DIRATI), ~21.6k LOC · **bez test alata** |
| **Baza** | PostgreSQL (primarni); MySQL sačuvan u `backend/prisma-mysql-backup/` za rollback | 59 modela; enumi native PG |
| **Queue/Cache** | BullMQ email red + ioredis keš — **opciono**, aktivno samo ako je `REDIS_URL` postavljen | TLS: `rediss://` + `REDIS_TLS_CA` (commiti `09a292e`, `b0376a5`) |
| **Auth** | JWT access/refresh (passport-jwt), RBAC: 6 rola (Administrator, Moderator, Writer, Komentator, Redar, Član) + permission tabele | guardovi **lokalni** (`@UseGuards` u 41 fajlu), nema globalnog `APP_GUARD` |
| **Repo** | npm workspaces (root `package.json` → backend/frontend/mobile) | dva lock sistema: root (dev) + standalone per-package (za Docker `npm ci`) |
| **Build/Deploy** | Docker multi-stage (node:22-bookworm-slim), `docker compose` | **Dva compose fajla** — vidi §4 i Q-05 |

## 3. Moduli backend-a (48 paketa u `backend/src/`)

auth, rbac, users, settings, cms, news, gallery, media, sponsors, trophies, clubs, players,
competitions, seasons→(rounds), matches, statistics, analytics, public-analytics, live,
realtime, ticketing, membership, finance, payments, newsletter, contact, notifications,
audit, dashboard, search, seo, showcase, museum, hall-of-fame, club-timeline, health, jobs,
cache, upload, email-log, app-releases, + ostali.

## 4. Deployment model (koliko se iz koda/vlastitih sesija zaključuje)

- **Produkcija (aktivna)**: Coolify na serveru — `docker-compose.yml` koristi eksterne mreže
  `db_net` i `redis_net`, mount-ove Coolify CA certova (`/data/coolify/ssl/...`), TLS za
  Redis (`rediss://`, port 6380) i Postgres (`sslmode=verify-full&sslrootcert=...`).
  Javni URL: `https://fkgracanica.ba101.top` (API pod `/backend`, Traefik/Coolify strip prefix).
- **`docker-compose1.yaml`**: starija Traefik varijanta sa vlastitim `redis` servisom i
  `web` mrežom — vjerovatno zastarjela (Q-05).
- **Migracije**: `npx prisma migrate deploy` pri startu backend kontejnera (Dockerfile CMD).
- **Mobile**: EAS build (`eas.json` profili preview/production), APK (ne AAB — rukovodstvo
  iz Track 36).
- **Backup/monitoring/logging**: **nigdje dokumentovano** — praznina (INFRASTRUCTURE segment).

## 5. Testni ekosustav (stvarno stanje)

- Backend: jest unit (`*.spec.ts` u src) + 8 e2e spec-a (`backend/test/`, zahtijeva bazu/redis).
- Frontend: **1** spec fajl, pokretanje ručno (`npx tsx --test ...`) — nema `test` skripte,
  nema vitest/playwright/testing-library u package.json.
- Mobile: **nema** ni jest ni e2e alata.
- CI: **ne postoji** (`.github/` nikada nije postojao u historiji — vidi F-002).

## 6. Dokumentacija (kao što je zatečena)

- 237 `.md` fajla ukupno; **221 u `.cursor/`** (plans + matrices — planovi su historijski,
  matrice su živi radni dokumenti po pravilima iz `.cursorrules`).
- Živa/korisna: root `README.md`, `.cursor/docs/matrices/**`, `mobile/PREVIEW_SMOKE.md`,
  `mobile/PRODUCTION_SMOKE.md`, `docs/club-launch/**` (pre-launch checklista),
  `docs/mysql-to-postgres-migration.md` (operativni zapis migracije).
- Zastarjelo/bofler: `aplikacijski-plan.md` (MySQL, "plaćanje nije u v1"), `backend/README.md`
  (NestJS template), `frontend/README.md` (Vite template), `BUILDIN_PROBLEMS.md` (paste
  error loga), `.cursor/.../00_overview.md` (Expo 56, MySQL).
- Nova dokumentacija (izvor istine): `docs/` + `AUDIT/` — penzionisani u `docs/_retired/`.

## 7. Šta je nejasno / nije se moglo zaključiti iz koda (PITANJA — vidi i KAPIJA 1)

| ID | Pitanje |
|----|---------|
| Q-01 | Root `README.md` — zadržati kao ulaznu tačku (samo ažurirati linkove, što je urađeno) ili penzionisati i zamijeniti čitavim docs/? |
| Q-02 | `.cursor/plans/**` (~190 historijskih planova) — penzionisati u `docs/_retired/`? Preporuka: **DA** za `plans`, **NE** za `.cursor/docs/matrices` (žive matrice) i `.cursorrules`/`.cursor/rules` (konfiguracija agenata). |
| Q-03 | `mobile/PREVIEW_SMOKE.md` i `mobile/PRODUCTION_SMOKE.md` — žive operativne checkliste? Preporuka: **zadržati** (premjestiti u `docs/` ili ostaviti u `mobile/`). |
| Q-04 | **KRITIČNO:** `Mojalozinka!1` (uz stvarni host `sql.ba101.top`) je u `.env.example` **i** `docs/mysql-to-postgres-migration.md`. Je li ovo stvarna produkcijska lozinka? Ako da → rotacija + čišćenje historije (traži tvoju odluku, ne diram sam). |
| Q-05 | Koji compose je izvor istine za produkciju: `docker-compose.yml` (Coolify) ili `docker-compose1.yaml` (Traefik)? Preporuka: Coolify varijanta; compose1 označiti legacy/penzionisati. |
| Q-06 | CI nikad nije postojao → pravilo 3 (zelen CI nakon svakog pusha) trenutno nije moguće ispuniti. Odobravaš li da **CI-01 (skelet CI-a) bude prvi segment** nakon KAPIJE 1, i da pushovi do tada budu bez CI-a (dokumentovano u STATE.md)? |
| Q-07 | Repozitorij ima samo `init_postgres` migraciju (HANDOFF je spominjao `20260818190000_app_releases_live_notify` koja više ne postoji → vjerovatni squash). Zna li se da je produkcija baza u skladu sa šemom? (Ne mogu provjeriti produkciju iz okruženja.) |
| Q-08 | `.env.example` koristi javni host `sql.ba101.top` za `DATABASE_URL`, ali Coolify TLS zahtijeva interno ime (CN certa) — koji host tačno vrijedi u produkciji? (Potrebno za INFRASTRUCTURE dokument.) |
