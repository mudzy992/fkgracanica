---
name: FK Gračanica Init
overview: "Inicijalizacija full-stack platforme FK Gračanica (backend + admin/public web + Expo scaffold) u 7 faza, na osnovu aplikacijski-plan.md, uz dopunu globalnih pravila (i18n, Settings contract, upload renditions, color tokens) i odluka: mobile scaffold u F1, plaćanje odgođeno (QR/rezervacija), BS UI + EN i18n infrastruktura, MySQL na hostu."
todos:
  - id: update-app-plan
    content: "Dopuniti aplikacijski-plan.md: i18n, Settings contract, Prisma 7, upload renditions, mobile F1, payment defer, color tokens, matrice"
    status: completed
  - id: plan-docs
    content: Kreirati .cursor/plans/fk-gracanica/ (00_overview + 7 phase fajlova + CHECKLIST/CHANGELOG/HANDOFF)
    status: completed
  - id: f1-scaffold
    content: "Faza 1: monorepo backend/frontend/mobile, Docker Redis, Prisma 7 + MySQL, auth/RBAC/settings/notifications/socket stub"
    status: completed
  - id: f1-env
    content: "Faza 1: .env.example + lokalni .env za dev MySQL (bez commita secreta)"
    status: completed
  - id: f2-admin
    content: "Faza 2: admin dashboard, users/RBAC UI, CMS blocks, media library, audit viewer"
    status: completed
  - id: f3-public
    content: "Faza 3: javni portal (naslovna, o klubu, vijesti, galerija, SEO, mobile read screens)"
    status: completed
  - id: f4-stats
    content: "Faza 4: tim/liga/igrači/utakmice + automatska statistika nakon odobrenja"
    status: completed
  - id: f5-live
    content: "Faza 5: Live centar + Socket.IO + komentator + Match Center + matrix doc"
    status: completed
  - id: f6-membership
    content: "Faza 6: članstvo + ulaznice QR/rezervacija bez payment gatewaya"
    status: completed
  - id: f7-premium
    content: "Faza 7: PWA, caching, jobs, analitika, dark mode, mobile parity, security audit"
    status: completed
isProject: false
---

# FK Gračanica — Implementacijski plan

## Izvori i odluke


| Izvor                                        | Sadržaj                                                                                                                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [aplikacijski-plan.md](aplikacijski-plan.md) | Master plan — moduli, role, 7 faza                                                                                                                                                   |
| Global User Rules                            | `ROOT/{backend,frontend,mobile}`, NestJS+Prisma 7+MySQL, Settings contract, in-app notifikacije, Socket.IO realtime, i18n BS+EN infra, matrice                                       |
| Tvoje odluke                                 | Mobile scaffold **Faza 1**; plaćanje **odgođeno** (rezervacija/QR, blagajna); i18n **BS UI + EN keys**; MySQL host `sql.ba101.top` / baza `fkgracanica` (kredencijali samo u `.env`) |


---

## Dopune aplikacijski-plan.md (prije/during F1)

Sljedeće **nedostaje** u master planu i treba dodati u [aplikacijski-plan.md](aplikacijski-plan.md) kao sekciju „Globalna usklađenost”:

1. **i18n** — BS default UI; EN infrastruktura (`i18next` / namespace po modulu); admin i mobile isti key sistem
2. **Settings contract** — „Registry” preimenovati u dokumentaciji kao **Settings Registry** (public/private scope, boolean→switch, number→input, opis po key-u); mapiranje na postojeće Public/Private Registry liste
3. **Prisma 7** — eksplicitno u stacku; `prisma.config.ts`, migracije obavezno
4. **Upload servis** — backend storage, u DB samo putanje; renditions (`thumb`, `medium`, `original`) za Media Library, vijesti, igrače, sponzore
5. **Repo struktura** — `backend/`, `frontend/`, `mobile/` od F1 (plan trenutno kaže „buduća mobilna”)
6. **Plaćanje F6** — online gateway **nije** u prvoj verziji; `Payment` model kao stub + status `pending_paid_at_box_office` / admin potvrda
7. **Color tokens** — design system mapa (vidi ispod)
8. **Feature matrice** — `.cursor/docs/matrices/<module>/MATRIX.md` + `CHANGELOG.md` za Live, Ticketing, Membership, RBAC

### Predložena paleta (plavo/bijelo brendiranje)


| Token          | HEX       | Upotreba                         |
| -------------- | --------- | -------------------------------- |
| `primary`      | `#1E3A8A` | CTA, linkovi, admin akcenti      |
| `primaryLight` | `#3B82F6` | hover, sekundarni akcenti        |
| `background`   | `#FFFFFF` | stranice, kartice                |
| `surface`      | `#F8FAFC` | sekcije, sidebar                 |
| `text`         | `#0F172A` | body tekst                       |
| `textMuted`    | `#64748B` | meta, caption                    |
| `accent`       | `#2563EB` | istaknuti elementi (hero, badge) |
| `success`      | `#16A34A` | uspjeh, live „gol”               |
| `danger`       | `#DC2626` | greške, crveni karton            |


Dark mode: CSS varijable od F1, UI toggle u F7.

---

## Arhitektura (ciljno stanje)

```mermaid
flowchart TB
  subgraph clients [Clients]
    PublicWeb[frontend_public]
    AdminWeb[frontend_admin]
    MobileApp[mobile_expo]
  end

  subgraph api [backend NestJS]
    RestAPI["REST /api/v1"]
    SocketGW[SocketIO_Gateway]
    AuthMod[Auth_RBAC]
    SettingsMod[Settings_Registry]
    DomainMods[Domain_Modules]
    UploadMod[Upload_Service]
    NotifMod[Notifications]
    JobsMod[Background_Jobs]
  end

  subgraph data [Data]
    MySQL[(MySQL)]
    Redis[(Redis)]
    FileStore[uploads/]
  end

  PublicWeb --> RestAPI
  AdminWeb --> RestAPI
  MobileApp --> RestAPI
  PublicWeb --> SocketGW
  AdminWeb --> SocketGW
  MobileApp --> SocketGW
  RestAPI --> MySQL
  SocketGW --> Redis
  JobsMod --> Redis
  UploadMod --> FileStore
  DomainMods --> MySQL
```



**Napomene:**

- Jedan `frontend/` sa dva entry/routera ili route grupama: **public** + **admin** (shared UI kit, TanStack Query, i18n)
- `Repository` sloj = tanak Prisma wrapper po modulu (ne dupli ORM); Service drži poslovnu logiku
- IDs: `cuid()` za javne entitete (Users, Matches, Tickets); autoincrement dopušten za čiste join/tabele ako nema eksternog izlaganja

---

## Plan dokumentacija (GlobalPlanFirst)

Kreirati strukturu:

```
.cursor/plans/fk-gracanica/
  00_overview.md
  01_phase-infrastructure.md
  02_phase-admin-cms.md
  03_phase-public-portal.md
  04_phase-competition-stats.md
  05_phase-live-center.md
  06_phase-membership-ticketing.md
  07_phase-premium-optimization.md
  CHECKLIST.md
  CHANGELOG.md
  HANDOFF.md
```

Svaki `01_*.md` sadrži: cilj, backend moduli, Prisma modele, API rute, frontend ekrane, mobile scope, testove, exit kriterije.

---

## Faza 1 — Infrastruktura i scaffold (prioritet)

### 1.1 Monorepo init

- `create_project` na `/home/administrator/Documents/GitHub/fkgracanica`
- Struktura:
  - `[backend/](backend/)` — NestJS strict TS
  - `[frontend/](frontend/)` — Vite React TS, Tailwind, shadcn
  - `[mobile/](mobile/)` — Expo TS, i18n, theme provider
  - `[docker-compose.yml](docker-compose.yml)` — Redis + (opciono) backend dev; **MySQL ostaje na hostu**
  - `[.env.example](.env.example)` — bez secreta; `DATABASE_URL`, `JWT_*`, `REDIS_URL`, `UPLOAD_PATH`, `CORS_ORIGINS`
  - `**.env` u `.gitignore`** — dev kredencijali samo lokalno (nikad u planu/commitu)

### 1.2 Backend core

Moduli u F1:


| Modul                 | Odgovornost                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `PrismaModule`        | Prisma 7 client, migracije                                                  |
| `AuthModule`          | JWT + refresh, login, brute-force limit                                     |
| `UsersModule`         | profil, soft delete                                                         |
| `RbacModule`          | Role, Permission, guards, seed (Admin, Moderator, Writer, Komentator, Član) |
| `SettingsModule`      | Public/private registry, Socket emit na promjenu                            |
| `UploadModule`        | multipart, validacija, renditions stub                                      |
| `NotificationsModule` | in-app CRUD + unread (email stub)                                           |
| `AuditModule`         | log helper, middleware hook                                                 |
| `RealtimeModule`      | Socket.IO gateway, auth handshake                                           |
| `HealthModule`        | `/health`, Swagger `/api/docs`                                              |


Početna Prisma šema (F1): `User`, `Role`, `Permission`, `UserRole`, `RolePermission`, `RefreshToken`, `Setting`, `Notification`, `AuditLog`, `MediaAsset` (minimal).

### 1.3 Frontend core (F1)

- Auth flow (login, refresh, protected admin routes)
- Admin shell layout (sidebar, responsive drawer na mobile)
- Settings UI (public/private tabs, switch/number/text po tipu)
- Design tokens (Tailwind `primary`, `background`, …)
- i18n setup (`bs` default, `en` namespace prazan)
- TanStack Query + API client (`/api/v1`)

### 1.4 Mobile core (F1 scaffold)

- Expo Router ili stack navigacija
- Shared API client + secure token storage
- i18n + theme (plavo/bijelo)
- Ekrani: Splash, Login, Home placeholder, Notifications list stub
- **Bez** domain feature ekrana do F3+

### 1.5 Dev UX

- `npm` workspaces ili root skripte: `dev:backend`, `dev:frontend`, `dev:mobile`
- Prisma migrate dev + seed (admin user, role permissions, default settings)
- Husky/lint opciono u F1 ili F2

**Exit F1:** admin se može ulogovati, mijenjati settings, vidjeti notifikacije stub, mobile app se konektuje na API, Swagger radi, audit log piše login.

---

## Faza 2 — Admin panel i CMS osnova

- Dashboard KPI kartice (početni brojači — mnogi će biti 0)
- CRUD: korisnici, role, permissions
- CMS Blocks model + admin editor (Hero, CTA, Footer, static pages)
- Media Library (folderi, tagovi, upload, renditions)
- Audit log viewer u adminu
- Moderator/Writer workflow stub za content status

**Exit F2:** admin upravlja korisnicima, CMS blokovima i medijima.

---

## Faza 3 — Javni portal

- React Router: naslovna (sve sekcije iz plana), O klubu (timeline), vijesti, galerija, sponzori, trofeji, kontakt, newsletter
- SEO: meta, OG, sitemap, robots (osnovno)
- Global search (backend endpoint + UI)
- Public read API + caching headers
- Mobile: read-only ekrani za vijesti i naslovnu (paritet sa web sadržajem)

**Exit F3:** javni sajt funkcionalan, admin objavljuje sadržaj.

---

## Faza 4 — Tim, liga, statistika

- Modeli: `Team`, `Player`, `Competition`, `Season`, `Match`, `MatchEvent`, `PlayerStatistics`, `TeamStatistics`, `Club` (portfolio)
- Admin: formacije, roster, raspored ručni unos
- Javno: prvi tim (horizontal/vertical teren), klubovi, liga tabela, match list
- Automatski preračun statistike **nakon odobrenog** match reporta (priprema za F5)

**Exit F4:** cijela sezona se može unijeti i prikazati bez live moda.

---

## Faza 5 — Live centar (kritični modul)

- Socket.IO: live events, score, komentari, notifikacije
- Komentator dashboard (instant akcije iz plana)
- Javna live stranica: YouTube embed ili countdown (URL iz Settings)
- Workflow: live → pending approval → moderator publish → statistike se ažuriraju
- Match Center stranica
- Mobile: live ekran (socket + embed)

**Exit F5:** puna utakmica uživo sa odobravanjem izvještaja.

**Matrix obavezna:** `.cursor/docs/matrices/live_center/MATRIX.md`

---

## Faza 6 — Članstvo i ulaznice (bez online plaćanja)

- Membership: registracija, status, digitalna kartica, QR
- Ticketing: kategorije, kapacitet, rezervacija/kupovina sa statusom „plati na blagajni”, QR generisanje
- Admin: validacija QR (web); mobile: QR skener stub
- `Payment` model — stub polja, bez gateway integracije
- Finansijski modul — samo evidencija admin potvrda

**Exit F6:** član i ulaznica rade bez payment gatewaya.

---

## Faza 7 — Premium, optimizacija, mobile parity

- Hall of Fame, digitalni muzej, napredna analitika
- PWA (manifest, service worker)
- Redis caching strategija
- Background jobs (BullMQ): email, image processing, izvještaji
- Dark mode toggle
- SEO/Schema napredno
- Mobile: feature parity za live, tickets, membership kartice
- Sigurnosna revizija, E2E kritični tokovi

---

## Sigurnost i env (obavezno od F1)

- Kredencijali **samo** u `backend/.env` (nikad u git, plan fajlovima, ili seedu)
- `DATABASE_URL` format: `mysql://USER:PASSWORD@sql.ba101.top:3306/fkgracanica`
- Rate limiting (`@nestjs/throttler`), helmet, CORS whitelist
- Upload: MIME whitelist, max size iz Settings
- RBAC na svim mutating rutama

---

## Test strategija


| Faza | Minimum                                       |
| ---- | --------------------------------------------- |
| F1   | Auth unit + RBAC guard integration            |
| F2   | Settings + user CRUD integration              |
| F5   | Live event E2E (komentator → socket → public) |
| F6   | Ticket QR validation E2E                      |
| F7   | Smoke E2E suite u CI                          |


---

## Redoslijed implementacije (prvi sprint)

1. Repo + `.cursor/plans/fk-gracanica/` struktura
2. Ažurirati [aplikacijski-plan.md](aplikacijski-plan.md) sekcijom globalne usklađenosti
3. `backend`: NestJS + Prisma 7 + migrate + seed
4. `frontend`: Vite + shadcn + auth + admin settings
5. `mobile`: Expo scaffold + login
6. Socket.IO + Notifications stub
7. Prvi deploy na dev MySQL host

---

## Rizici i mitigacije


| Rizik                                | Mitigacija                                                |
| ------------------------------------ | --------------------------------------------------------- |
| Scope explosion (7 faza, 20+ modula) | Striktni exit kriteriji po fazi; feature flags u Settings |
| Remote MySQL latency                 | Connection pool, indeksi od F1, read caching u F7         |
| Live modul kompleksnost              | Matrix dokumentacija; odvojen gateway modul               |
| Plan vs „Repository sloj”            | Tanak Prisma repository — bez over-abstraction            |
| Credentials u chatu                  | Rotacija za prod; dev `.env` lokalno                      |
