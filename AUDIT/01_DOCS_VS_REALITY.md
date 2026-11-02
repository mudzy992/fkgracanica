# FAZA 1 — Dokumentacija vs. stvarnost

> Kreirano: 2026-11-02 · Metoda: brzi audit (grep/direktna provjera fajlova, bez dubinskog review-a)
> Legenda statusa: ✅ potvrđeno · ⚠️ nepotvrđeno · ❌ kontradikcija · 🕰️ zastarjelo

| # | Tvrdnja iz dokumentacije | Stvarno stanje | Status | Referenca (fajl → stvarnost) |
|---|--------------------------|----------------|--------|------------------------------|
| 1 | Stack: backend na **MySQL** | Prisma `provider = "postgresql"`, adapter `@prisma/adapter-pg` | 🕰️ | `aplikacijski-plan.md` (Osnovni stack) → `backend/prisma/schema.prisma:5-6`, `backend/src/prisma/prisma.service.ts` |
| 2 | **"Online payment gateway nije u prvoj verziji"** (Faza 6) | Stripe, PayPal i Monri su kompletno implementirani (checkout, webhook, confirm, digest util + specovi) | 🕰️ | `aplikacijski-plan.md` (Faza 6) → `backend/src/payments/` (24 fajla, `providers/`) |
| 3 | Rate limiting ("API standard → Rate limiting", "Sigurnost → Rate limiting") | `@nestjs/throttler` **instaliran ali NIGDJE korišten** u `src/`; jedini rate limit je custom za javne posjete | ❌ | `aplikacijski-plan.md` → `backend/package.json:38` vs `grep -rni throttl backend/src` (prazno); `backend/src/public-analytics/visit-rate-limit.util.ts` |
| 4 | RBAC seed = **5 rola** | 6 rola: Administrator, Moderator, Writer, Komentator, **Redar**, Član | 🕰️ | `.cursor/plans/fk-gracanica/CHECKLIST.md` (Faza 1) → `backend/prisma/seed/rbac.ts:5-10` |
| 5 | Backend stack: "**Expo 56**", "backend … **MySQL** … stabilan" | Expo **57.0.16**; backend na Postgresu | 🕰️ | `.cursor/plans/fk-gracanica/00_overview.md` (Stack) → `mobile/package.json`, `schema.prisma` |
| 6 | "package-lock **nije regenerisan** — `npm ci` u Dockerfile-u će pući" | Backend standalone lock **jesinkronizovan** (mariadb: 0, adapter-pg: 3) — upozorenje više ne važi za backend | 🕰️ | `docs/mysql-to-postgres-migration.md` §1 → `backend/package-lock.json` (grep) |
| 7 | "`docker-compose.yml` backend prepisuje `DATABASE_URL` na host `postgres` na mreži `web`" | **Nijedan** compose to ne radi na taj način: `docker-compose.yml` = Coolify varijanta (eksterne `db_net`/`redis_net`, bez prepisivanja), `docker-compose1.yaml` = Traefik varijanta (radi prepis, ali to je **drugi fajl**) | ❌ | `docs/mysql-to-postgres-migration.md` §0/§6 → `docker-compose.yml`, `docker-compose1.yaml` |
| 8 | Redis "opciono, `docker compose up -d`" | `docker-compose.yml` (Coolify) **nema** redis servis (eksterna `redis_net`); `docker-compose1.yaml` ima vlastiti redis. Aplikacija koristi Redis **ako** je `REDIS_URL` postavljen (BullMQ + keš) | ⚠️ | `README.md:17` → `docker-compose.yml:73-77`, `backend/src/jobs/jobs.module.ts:28` |
| 9 | PWA podrška (Faza 7 ✔) | `manifest.json`, `sw.js`, `offline.html`, link u `index.html` — prisutno | ✅ | `CHECKLIST.md` → `frontend/public/manifest.json`, `frontend/index.html:10` |
| 10 | Dark mode (Faza 7 ✔) | `frontend/src/lib/theme.tsx` + CSS varijable; mobilni theme flow u smoke checklisti | ✅ | → `frontend/src/lib/theme.tsx` |
| 11 | i18n BS default + EN infrastruktura | web `src/i18n` + `locales/{bs,en}`; mobile `src/i18n` (i18next) | ✅ | `aplikacijski-plan.md` (Globalna usklađenost) → `frontend/src/i18n/`, `mobile/src/i18n/` |
| 12 | Swagger na `/backend/api/docs`, health endpoint | `SwaggerModule.setup('api/docs')`, `@Controller('health')`, globalni prefiks `api/v1`, helmet uključen | ✅ | `README.md` → `backend/src/main.ts:17,26,53`, `backend/src/health/health.controller.ts:6` |
| 13 | JWT + Refresh token auth | `refresh.dto.ts`, `jwt.strategy.ts`, `auth.service` — prisutno; guardovi na 41 fajlu (`@UseGuards`) | ✅ | `aplikacijski-plan.md` → `backend/src/auth/` |
| 14 | "Eksplicitni CI popravke" (`menu.sh` → "Popravka CI") | Skripta zapravo **sinkronizuje package-lock** fajlove; pravi CI (`.github/`) **nikad nije postojao** | ❌ | `scripts/menu.sh` (opcija 2) → `scripts/sync-docker-locks.sh`; `git log --all -- .github/*` (prazno) |
| 15 | Mobile E2E u pipeline-u kao završni korak | **Nema CI-a** → nema pipeline-a; mobile **nema nikakvih test alata** u package.json | ❌ (cilj vs. stanje) | protokol FAZA B → `mobile/package.json` |
| 16 | Frontend kompletan "Web Complete APPROVED" + testovi (spec u HANDOFF-u) | Postoji **1** frontend spec fajl; nema `test` skripte ni test runner-a u package.json | ⚠️ | `.cursor/.../36_ops-ticketing-live/HANDOFF.md` → `frontend/package.json` (skripte: dev/build/lint/preview) |
| 17 | Migracija `20260818190000_app_releases_live_notify` u repu | U `backend/prisma/migrations/` postoji **samo** `20260825072946_init_postgres` (squash?) | ❌ | `.cursor/.../36_ops-ticketing-live/HANDOFF.md` → `ls backend/prisma/migrations/` |
| 18 | Buildin problem = dokumentacija | Fajl je **paste Expo DOM error loga**, bez struktura/opisa | 🕰️ (nije dokumentacija) | `BUILDIN_PROBLEMS.md` |
| 19 | `backend/README.md`, `frontend/README.md` kao dokumentacija modula | Netaknuti **template boilerplate** (NestJS/Vite), bez ijedne informacije o projektu | 🕰️ | `backend/README.md`, `frontend/README.md` |
| 20 | "Baza: `sql.ba101.top`" kao runtime host (README preduvjeti) | Za Coolify TLS (`verify-full`) hostname mora odgovarati CN-u certa (interno ime) — javni host vjerojatno ne prolazi | ⚠️ (Q-08) | `README.md:14` → `.env.example` (ssl parametri) |
| 21 | `.env.example` = primjer bez tajni | Sadrži **stvarni izgled hosta + lozinku** `Mojalozinka!1` (isto i u docs) | ❌ **Kritično (F-001)** | `.env.example:19`, `docs/mysql-to-postgres-migration.md` §2 |

## Kritični nalaz (pravilo 9)

**F-001 — Tajne u repozitoriju:** lozinka `Mojalozinka!1` uz host `sql.ba101.top` nalazi se u
`.env.example` (trackan) i `docs/mysql-to-postgres-migration.md` (trackano), a time i u git
historiji. `.env` nije nikad trackan (provjereno: `git log --diff-filter=A -- .env` = prazno).
**Ne diram ništa sam** — čekam odluku (Q-04): ako je stvarna → rotacija lozinke + uklanjanje
iz historije (git filter-repo/BFG) + regeneracija sekreta (`scripts/rotate-secrets.sh` postoji
za JWT/admin, ne za DB).

## Ostali nalazi iz brzog skeniranja

| ID | Ozbiljnost | Nalaz |
|----|------------|-------|
| F-002 | High | **CI ne postoji** — `.github/` nikad nije bio u historiji; protokol zahtijeva zelen CI (→ Q-06, segment CI-01) |
| F-003 | High | **Testovi:** frontend bez runner-a (1 spec, ručno), mobile bez ijednog testa; backend ima unit+e2e ali bez coverage praga |
| F-004 | Medium | `@nestjs/throttler` mrtva zavisnost (instaliran, nekorišten) — tvrdnja o rate limitingu netačna |
| F-005 | Medium | `aplikacijski-plan.md` zastarjelo na ključnim mjestima (MySQL, plaćanja) — penzionisano u `docs/_retired/` |
| F-010 | Medium | `scripts/menu.sh` "Popravka CI" zavaravajući naziv (lock sync, ne CI) |
| F-015 | High | **Root `npm ci` pada** — `package-lock.json` nije sinhronizovan (`Missing: react@19.3.1 …`) — blokira bilo koji budući CI korak instalacije |
| F-014 | Info | Nema globalnog `APP_GUARD` — auth/rbac guardovi su lokalni po controlleru (konzistentnost → dubinski audit u BE segmentima) |
| F-016 | Info | Dva lock sistema (root workspace lock + standalone per-package lock za Docker) — dokumentovano u `scripts/sync-docker-locks.sh`; rizik divergencije |
