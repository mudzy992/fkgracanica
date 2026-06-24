# HANDOFF — FK Gračanica

> Predložak za buduće sesije: [HANDOFF_TEMPLATE.md](./HANDOFF_TEMPLATE.md)  
> Ažurirano: **2026-06-24**

---

## 1. Meta

| Polje | Vrijednost |
|-------|------------|
| **Branch** | `main` |
| **Zadnji commit** | `6c0ccaf` — sync backend package-lock za Docker build |
| **Repo** | https://github.com/mudzy992/fkgracanica (private) |
| **Aktivna faza** | **Post-scaffold** — infrastruktura + API/UI skeleton gotovi; sadržaj i hardening sljedeći |
| **Plan folder** | `.cursor/plans/fk-gracanica/` |

---

## 2. Status u jednoj rečenici

Monorepo (backend + frontend + mobile), Prisma 7 migracije/seed, Docker/Traefik deploy i svi moduli su **scaffoldani i pokrenuti u produkciji**; sljedeće je **popuna pravim sadržajem, testiranje tokova i prod hardening** (upload renditions, E2E, uklanjanje `.env` iz gita).

---

## 3. Produkcija / deploy

| Resurs | URL / putanja |
|--------|----------------|
| **Web** | https://fkgracanica.ba101.top |
| **API** | https://fkgracanica.ba101.top/backend/api/v1 |
| **Swagger** | https://fkgracanica.ba101.top/backend/api/docs |
| **Health** | https://fkgracanica.ba101.top/backend/api/v1/health |
| **Traefik** | mreža `web`, TLS `le`, backend StripPrefix `/backend` |
| **App mreža** | `fkgracanica-network` (backend + redis) |
| **Upload host** | `/mnt/shared-app-files/fkgracanica` → kontejner `/app/uploads` |

**Docker (zadnje poznato stanje):** `fkgracanica-backend`, `fkgracanica-frontend`, `fkgracanica-redis` — svi **healthy**.

```bash
cd /home/administrator/Documents/GitHub/fkgracanica
docker compose ps
./scripts/docker-prod-build.sh   # rebuild
docker compose up -d
```

---

## 4. Env

- **Lokacija:** root [`.env`](../../../.env) (compose `env_file`)
- **`.env` je trenutno u gitu** — korisnik će ručno dodati u `.gitignore` kad prebaci secreta
- **Kritične varijable:** `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `REDIS_URL`, `UPLOAD_PATH`, `CORS_ORIGINS`, `API_PUBLIC_URL`, `SOCKET_IO_PATH`, `VITE_API_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- **MySQL:** host `sql.ba101.top`, baza `fkgracanica` (dev kredencijali u `.env`)
- **Redis u Dockeru:** `redis://redis:6379`

---

## 5. Pokretanje

### Produkcija (preporučeno na serveru)

```bash
sudo ./scripts/setup-upload-dir.sh   # jednom, ako /mnt/shared-app-files/fkgracanica ne postoji
./scripts/docker-prod-build.sh
docker compose up -d
```

### Lokalni dev

```bash
npm run dev:backend    # :3000
npm run dev:frontend     # :5173 (Vite čita .env iz roota)
npm run dev:mobile       # Expo
npm run db:migrate       # prisma migrate dev
npm run db:seed          # role + admin + settings
```

**Admin login (seed):** `admin@fkgracanica.ba` / `Admin123!` — promijeniti u produkciji.

---

## 6. Šta radi / šta ne radi

### Radi
- NestJS API (33 modula), JWT + RBAC, Settings registry, notifikacije, audit
- Javni portal + admin UI (rute i CRUD ekrani)
- Expo mobile scaffold (login, vijesti, live stub, članstvo, ulaznice)
- Prisma 7 + MariaDB adapter, migracija `20260624104219_init`, seed
- Docker build (`npm ci` u backendu — lock fiksiran u `6c0ccaf`)
- Traefik rutiranje, health + Swagger preko HTTPS

### Stubovi / tehnički dug
- **Upload:** samo `originals/`; nema sharp renditions (`thumb`/`medium`)
- **Plaćanje:** nema gatewaya — box office + admin potvrda (F6 defer)
- **Live socket:** gateway postoji; frontend/mobile treba punu integraciju i test uživo
- **CHECKLIST** označava faze kao [x] na nivou **scaffolda** — nije end-to-end QA
- **E2E testovi:** minimalni (auth unit); nema punog smoke suitea
- **Upload dir na hostu:** `setup-upload-dir.sh` može trebati `sudo` ako folder ne postoji
- **Prisma OpenSSL warning** u build stageu — radi, ali razmotriti `apt-get install openssl` u Dockerfile runneru ako zatreba

---

## 7. Sljedeći koraci (prioritet za novu sesiju)

1. **Sadržaj i demo** — seed/prvi unos: vlastiti klub, sezona, 2–3 vijesti, CMS hero, sponzori, test utakmica
2. **Admin smoke test** — login → settings → objavi vijest → javna stranica prikazuje
3. **Upload renditions** — `sharp` u backendu, `thumb`/`medium`/`original`, ažurirati Media modul
4. **Live centar E2E** — komentator unosi gol → socket → javna live stranica (vidi [live_center MATRIX](../../../docs/matrices/live_center/MATRIX.md))
5. **Sigurnost** — rotacija JWT/admin lozinke, `.env` u `.gitignore`, novi secreta na serveru
6. **Testovi** — integration za auth/settings; E2E za login + ticket QR (plan F7)
7. **Mobile** — test na uređaju protiv `https://fkgracanica.ba101.top/backend/api/v1`

---

## 8. Ključna struktura repoa

```
backend/     NestJS, Prisma 7, Socket.IO, BullMQ/Redis cache stub
frontend/    React/Vite, public + /admin, i18n BS, dark mode, PWA manifest
mobile/      Expo Router, tabs
docker-compose.yml   Traefik labels, redis, upload volume
scripts/     docker-prod-build.sh, setup-upload-dir.sh
```

**Dokumenti:**
- [aplikacijski-plan.md](../../../aplikacijski-plan.md) — master plan
- [CHECKLIST.md](./CHECKLIST.md) — faze
- [CHANGELOG.md](./CHANGELOG.md) — plan changelog
- Matrice: `rbac`, `live_center`, `membership`, `ticketing`

---

## 9. Fajlovi dirani u zadnjim sesijama

| Fajl | Napomena |
|------|----------|
| `docker-compose.yml` | Traefik, fkgracanica-network, upload mount |
| `backend/Dockerfile`, `frontend/Dockerfile` | prod images |
| `backend/package-lock.json` | sync za `npm ci` u Dockeru |
| `backend/src/main.ts` | static uploads, Swagger server URL |
| `.env` | produkcijski URL-ovi i DB |
| `.gitignore` | `.env` **nije** ignoriran (namjerno, privremeno) |

---

## 10. Pravila za nastavak

- **~100–150 linija** po fajlu; refaktor u helpers/services
- **Plan-first** za veće featuree; faze u `01_phase-*.md`
- **Matrix + CHANGELOG** kad mijenjaš live/ticketing/membership/RBAC logiku
- **Ne editovati** `.cursor/plans/fk_gračanica_init_*.plan.md`
- **Commit/push** samo na eksplicitni zahtjev korisnika

---

## Brzi kontekst za novog agenta

```
Projekat: FK Gračanica — football club CMS + live + ticketing.
Stack: NestJS + Prisma 7 + MySQL, React, Expo.
Deploy: Docker + Traefik na fkgracanica.ba101.top, API pod /backend.
Trenutno: scaffold kompletan i live na serveru; treba sadržaj, QA i hardening.
Kreni od: HANDOFF §7 korak 1 ili korisnikov konkretni zadatak.
```
