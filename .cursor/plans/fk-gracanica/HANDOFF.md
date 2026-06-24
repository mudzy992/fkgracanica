# HANDOFF — FK Gračanica

> Predložak: [HANDOFF_TEMPLATE.md](./HANDOFF_TEMPLATE.md)  
> Ažurirano: **2026-06-24** (kraj sesije — koraci 1–4 gotovi)

---

## 1. Meta

| Polje | Vrijednost |
|-------|------------|
| **Branch** | `main` (lokalno **nije commitano** — vidi §9) |
| **Zadnji commit** | `8a012b9` — handoff template |
| **Repo** | https://github.com/mudzy992/fkgracanica (private) |
| **Aktivna faza** | **Post-scaffold** — koraci 1–4 gotovi; sljedeći **§7 korak 5 (sigurnost)** |
| **Plan folder** | `.cursor/plans/fk-gracanica/` |

---

## 2. Status u jednoj rečenici

Produkcija radi sa **demo sadržajem**, **admin news/objava**, **upload renditions (sharp)** i **live centrom (socket + komentator UI)**; sljedeće je **sigurnost**, **dodatni testovi** i **mobile parity**.

---

## 3. Produkcija / deploy

| Resurs | URL / putanja |
|--------|----------------|
| **Web** | https://fkgracanica.ba101.top |
| **API** | https://fkgracanica.ba101.top/backend/api/v1 |
| **Swagger** | https://fkgracanica.ba101.top/backend/api/docs |
| **Health** | https://fkgracanica.ba101.top/backend/api/v1/health |
| **Socket** | `wss://…/backend/realtime`, path klijenta `/backend/socket.io` |
| **Upload host** | `/mnt/shared-app-files/fkgracanica` → `/app/uploads` |

**Docker:** `fkgracanica-backend`, `fkgracanica-frontend`, `fkgracanica-redis` — **healthy** (zadnji deploy ove sesije).

```bash
cd /home/administrator/Documents/GitHub/fkgracanica
./scripts/sync-docker-locks.sh      # OBAVEZNO prije builda ako je dodan npm paket
./scripts/docker-prod-build.sh
docker compose up -d
docker compose ps
```

**Docker lock pravilo:** `backend/` i `frontend/` imaju **svoj** `package-lock.json` za `npm ci` u Dockerfileu. Root workspace lock nije dovoljan. Skripta: `scripts/sync-docker-locks.sh`.

---

## 4. Env

- **Lokacija:** root `.env` (compose `env_file`)
- **`.env` je u gitu** — korak 5: `.gitignore` + rotacija secreta
- **Kritično:** `DATABASE_URL`, `JWT_*`, `REDIS_URL`, `UPLOAD_PATH`, `CORS_ORIGINS`, `API_PUBLIC_URL`, `VITE_API_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- **`SOCKET_IO_PATH`:** u **kontejneru** mora biti `/socket.io` (`docker-compose.yml` override). Klijent (frontend) na produkciji automatski koristi `/backend/socket.io`. Ako lokalni dev backend ne radi socket — postavi `SOCKET_IO_PATH=/socket.io` u root `.env`.

---

## 5. Pokretanje

```bash
# Lokalni dev
npm run dev:backend    # :3000
npm run dev:frontend   # :5173
npm run db:seed        # RBAC + admin + demo sadržaj

# Testovi (backend)
cd backend && npm run test:e2e   # admin-smoke, live-center, upload-renditions, health
```

**Admin:** `admin@fkgracanica.ba` / iz `ADMIN_PASSWORD` u `.env`

---

## 6. Šta radi / šta ne radi

### Radi (E2E ove sesije)
- **Seed:** klub, sezona, 3 vijesti, CMS `home.hero`, sponzori, 2 utakmice (`backend/prisma/seed/`)
- **Hero** čita CMS; naslovna prikazuje vijesti/utakmice/sponzore
- **Admin vijesti:** kreiranje nacrta → objava (`NewsAdminPage`)
- **Upload:** `sharp` → `originals/`, `thumbs/`, `medium/`; `POST /media/upload`; MediaPage
- **Live:** komentator start/gol/završi → socket `match:join|event|score|status` → `/live/:id` live
- **E2E:** `admin-smoke`, `upload-renditions`, `live-center`, `health`

### Još nije / dug
- **Plaćanje** — defer (F6)
- **Mobile live** — stub (`socketStub` i18n), nema socket integracije
- **Trophy frontend** — `title` vs Prisma `name` (zabilježeno, nije fixano)
- **LeagueTable / FeaturedPlayers / Gallery** — prazni bez ručnog unosa
- **`.env` u gitu**, JWT/admin lozinka nisu rotirani

---

## 7. Sljedeći koraci (nova sesija)

1. **Sigurnost (§7.5)** — `.env` → `.gitignore`, novi JWT secreta, promjena admin lozinke na serveru
2. **Commit** — sav uncommitted rad ove sesije (koraci 1–4 + lock skripte)
3. **Testovi** — ticket QR E2E, više integration testova
4. **Mobile** — socket + live protiv produkcijskog API-ja
5. **Ručni QA** — komentator flow na produkciji (utakmica kolo 13 ako još SCHEDULED)

---

## 8. Phase dokumenti (ova sesija)

| Faza | Dokument |
|------|----------|
| 8 Seed | [08_phase-seed-content.md](./08_phase-seed-content.md) |
| 9 Admin smoke | [09_phase-admin-smoke.md](./09_phase-admin-smoke.md) |
| 10 Upload | [10_phase-upload-renditions.md](./10_phase-upload-renditions.md) |
| 11 Live E2E | [11_phase-live-center-e2e.md](./11_phase-live-center-e2e.md) |

Matrica: [.cursor/docs/matrices/live_center/MATRIX.md](../../../.cursor/docs/matrices/live_center/MATRIX.md)

---

## 9. Ključni novi fajlovi (uncommitted)

**Backend:** `prisma/seed/*`, `upload/image-rendition.service.ts`, `live/live-score.util.ts`, `realtime.gateway.ts` (public join), `test/*-e2e-spec.ts`  
**Frontend:** `lib/realtime.ts`, `hooks/use-{match-realtime,live-admin,news-admin,media-admin}.ts`, `CommentatorControls.tsx`, `NewsAdminFormSheet.tsx`  
**Ops:** `scripts/sync-docker-locks.sh`, `docker-compose.yml` (`SOCKET_IO_PATH`), lock fajlovi backend+frontend

---

## 10. Pravila za nastavak

- Fajlovi **~100–150 linija** → helpers
- **Plan-first** za veće featuree
- Matrix + CHANGELOG kad mijenjaš live/ticketing/RBAC
- **Commit/push** samo na eksplicitni zahtjev korisnika

---

## Brzi start za novog agenta

```
Projekat: FK Gračanica — CMS + live + ticketing.
Stack: NestJS + Prisma 7 + MySQL, React, Expo.
Deploy: Docker + Traefik, API /backend, socket /backend/realtime.
Gotovo: seed, admin news, upload renditions, live socket E2E.
Kreni od: HANDOFF §7 korak 1 (sigurnost) ili korisnikov zadatak.
Prvo pitaj: želi li commit prije daljeg rada.
```
