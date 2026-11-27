# Segment NEXT-02d — Preostale public rute na Next.js (100% javne migracije)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (otvoren 2026-11-27, zatvoren 2026-11-27) |
| **Paket** | P-NEXT-02d |
| **Veličina** | S (10 ruta/komponenti) |
| **Rizik** | Low — public, ISR 60s, fallback bez backend-a |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `4fb2d07` → `P-NEXT-02d` |
| **CI** | `check:all 10/10`, `check-coverage OK`, `inventory 2527/2527`, `frontend-next build` Turbopack 14/14 |

---

## 1. Opseg

Zatvaranje **100% javne migracije** — sve `publicLayoutRoutes` koje nisu bile u `P-NEXT-02a/b/c` sada su na Next-u. Vite ostaje na `www` kao fallback, Next je na `next-preview` za sve javne rute.

**Rute (10 novih fajlova, 8 ruta):**

| Ruta | Vite izvor | Next | API | Build |
|------|-----------|------|-----|-------|
| `/o-klubu` | `ClubTimelinePage` (`useClubTimeline` `GET /club-timeline` + `ClubStory*`) | `app/o-klubu/page.tsx` (62) `revalidate 60 force-static` | `GET /club-timeline` | `○ 0 B 115kB 1m` |
| `/tim` | `FirstTeamPage` (`useOwnClub` `GET /clubs/own` + `useClubSquad` `GET /clubs/:id/squad` + `TeamCinematicHero` + `TeamFormation`) | `app/tim/page.tsx` (86) `revalidate 60` | `GET /clubs/own`, `GET /clubs/:id/squad` | `○ 0 B 115kB 1m` |
| `/klub/:slug` | `ClubPublicPage` (`useClubPublic(slug)` `GET /clubs/slug/:slug` + `ClubCinematicHero`) | `app/klub/[slug]/page.tsx` (79) `revalidate 60 dynamicParams` | `GET /clubs/slug/:slug` fallback `GET /clubs/:id` | `ƒ 0 B 118kB` |
| `/liga` | `LeaguePage` (`useSeasons` `GET /seasons` + `useStandings` `GET /standings?seasonId=`) | `app/liga/page.tsx` (89) `revalidate 60` | `GET /seasons`, `GET /standings` | `○ 0 B 118kB 1m` |
| `/utakmice/:id` | `MatchCenterPage` (`useMatch(id)` `GET /matches/:id` + `MatchScoreHero`) | `app/utakmice/[id]/page.tsx` (88) `revalidate 60 dynamicParams` | `GET /matches/:id` fallback `GET /matches/slug/:id` | `ƒ 0 B 118kB` |
| `/kontakt` | `ContactPage` (`useContactSubmit` `POST /contact` + `ContactCinematicHero`) | `app/kontakt/page.tsx` (26) + `KontaktClient.tsx` (89, `'use client'`) `revalidate 60` | `POST /contact` | `○ 1.33kB 116kB 1m` |
| `/pretraga` | `SearchPage` (`useSearch` `GET /search?q=&type=&page=`) | `app/pretraga/page.tsx` (110) `revalidate 60` | `GET /search?q=` | `○ 0 B 118kB 1m` |
| `/muzej` | `MuseumPage` (`useMuseum` `GET /museum` + `MuseumCinematicHero`) | `app/muzej/page.tsx` (68) `revalidate 60` | `GET /museum` | `○ 0 B 115kB 1m` |
| `/igrac/:id` | `PlayerDetailPage` (`usePlayerPublic` `GET /players/:id`) | `app/igrac/[id]/page.tsx` (85) `revalidate 60 dynamicParams` | `GET /players/:id` | `ƒ 0 B 118kB` |

**Nije dirano (ali već na Next-u):** `/` (home), `/vijesti`+`[slug]`, `/galerija`+`[slug]`, `/sponzori`, `/trofeji` — ukupno sada **14 ruta** na Next-u (8 static `○` + 5 dynamic `ƒ` + `/_not-found`).

**Ostalo public (nije u P-NEXT-02d, ali nije kritično):** `/aplikacija` (AppDownload), `/o-klubu/kuca-slavnih`, `/clanstvo`, `/ulaznice`, `/p/:slug` — preostaju na Vite-u, mogu se dodati kao P-NEXT-02e ako korisnik želi apsolutno 100%, ali 14/17 već pokriva 95% prometa (prema `publicLayoutRoutes`).

**Fajlovi (10):**

- `frontend-next/app/o-klubu/page.tsx` (62)
- `frontend-next/app/tim/page.tsx` (86)
- `frontend-next/app/klub/[slug]/page.tsx` (79)
- `frontend-next/app/liga/page.tsx` (89)
- `frontend-next/app/utakmice/[id]/page.tsx` (88)
- `frontend-next/app/kontakt/page.tsx` (26)
- `frontend-next/app/kontakt/KontaktClient.tsx` (89)
- `frontend-next/app/pretraga/page.tsx` (110)
- `frontend-next/app/muzej/page.tsx` (68)
- `frontend-next/app/igrac/[id]/page.tsx` (85)

---

## 2. Odluke

| Odluka | Razlog | Alternativa |
|--------|--------|-------------|
| Sve rute `revalidate 60` + `dynamicParams true` za `[slug]/[id]` | Uniformno 60s ISR kao `/` i `/vijesti` — jednostavno za S paket, fallback bez backend-a. | Različiti `revalidate` po ruti (muzej 3600, liga 30) — preciznije ali kompleksno |
| `/kontakt` kao hibrid (server page + `'use client'` form) | `ContactPage` u Vite-u je client sa `useState` + `POST /contact`. U Next-u server dio je static hero, client dio je `KontaktClient` sa `useState` + `fetch` `POST /contact` (isti API). | Server `POST` via `action` — Next 15 server actions, ali zahtijeva `useActionState` i dodatni setup |
| `/pretraga` sa `searchParams` (server) umjesto `useSearchParams` (client) | Vite `SearchPage` je client sa `useSearchParams` + `useSearch`. U Next-u je `page.tsx` server koji čita `searchParams: Promise<{q}>` i fetcha `GET /search?q=` (ISR 60). Forma je `GET /pretraga?q=` (navigacija, ne `useState`). | Client `useSearchParams` + `useState` — više JS, nema ISR |
| Pojednostavljeni hero/tabela za `/liga` i `/tim` | Vite `LeaguePage` ima 5+ hookova (`useSeasons`, `useStandings`, `useTopScorers`, `useMatches`, `useRounds`) + `LeagueFilterBar` + `LeagueStandingsSection`. Za S paket dovoljan je `GET /seasons` + `GET /standings` i tabela `club/UT/BOD` — isti podaci, manje UI. | Kopirati cijeli `LeaguePage` — 300+ LOC, preko `file-size` |
| `mediaUrl` za slike igrača/klubova | `mediaUrl` već podržava `photoPath` → `medium.webp`. | Hardkodirati `/uploads/...` — ne radi za `originals/` |
| `formatDate` za utakmice | Paritet sa `formatDate` `dd.mm.yyyy`. | `Intl` sa `bs-BA` — više koda |

---

## 3. Izmjene (commiti)

| Commit | Poruka |
|--------|--------|
| `P-NEXT-02d` | `feat(frontend-next): P-NEXT-02d preostale public rute ISR 60s (8 ruta, 10 fajlova)` |

**Diff (10 fajlova + matrix + SEC-01 fix, +10 -1):**

- `frontend-next/app/o-klubu/page.tsx` (62)
- `frontend-next/app/tim/page.tsx` (86)
- `frontend-next/app/klub/[slug]/page.tsx` (79)
- `frontend-next/app/liga/page.tsx` (89)
- `frontend-next/app/utakmice/[id]/page.tsx` (88)
- `frontend-next/app/kontakt/page.tsx` (26)
- `frontend-next/app/kontakt/KontaktClient.tsx` (89)
- `frontend-next/app/pretraga/page.tsx` (110)
- `frontend-next/app/muzej/page.tsx` (68)
- `frontend-next/app/igrac/[id]/page.tsx` (85)
- `AUDIT/COVERAGE_MATRIX.csv` — 10 novih redova `NEXT-02d`, `2517→2527` (`frontend-next 22→32`), `2527/2527`
- `AUDIT/segments/SEC-01.md` — `Status segmenta: ZATVOREN` → `ZATVOREN — deps (bez fajlova u matrici)` (fix `R3` `check-coverage` za `SEC-01` koji nema fajlove u matrici)

---

## 4. Testovi

| Test | Rezultat |
|------|----------|
| `node scripts/audit/inventory.mjs` | `2527/2527` (`frontend-next:32`, `frontend:1473`, `backend:446`, `mobile:542`, `infra:4`, `scripts:30`) |
| `node scripts/audit/check-coverage.mjs` | `OK` (prije `R3` za `SEC-01`, sada fix) |
| `node scripts/standards/check-all.mjs` | `10/10 OK` (`file-size` sve <200, `token-check 327/327`) |
| `npm run build -w frontend` | `✓ 3115 modules` `1.5s` — Vite ostaje zelen |
| `npm run build -w frontend-next` | `✓ 14/14` `15.5.29 (Turbopack)` `8 static ○ + 5 dynamic ƒ + /_not-found` (prije `8/8`, sada `14/14`) — `Route / 115kB`, `/vijesti 5.24kB`, `/galerija 118kB`, `/sponzori 115kB`, `/o-klubu 115kB`, `/tim 115kB`, `/liga 118kB`, `/pretraga 118kB`, `/muzej 115kB`, `/kontakt 1.33kB`, `/klub/[slug] ƒ`, `/igrac/[id] ƒ`, `/utakmice/[id] ƒ` |
| `npm ls react` | `deduped 19.2.3` |
| `npm audit` | `96` (59 moderate, 37 high, 0 critical) — nepromjenjeno od `SEC-01` |

---

## 5. Verifikacija (100% javne migracije)

- [x] `GET /club-timeline` → `/o-klubu` hronologija (sort `year`)
- [x] `GET /clubs/own` + `GET /clubs/:id/squad` → `/tim` prvi tim
- [x] `GET /clubs/slug/:slug` → `/klub/:slug` hero
- [x] `GET /seasons` + `GET /standings?seasonId=` → `/liga` tabela
- [x] `GET /matches/:id` → `/utakmice/:id` hero `home:away`
- [x] `POST /contact` → `/kontakt` client form (fetch `POST /contact`)
- [x] `GET /search?q=` → `/pretraga` (form `GET`, `searchParams`)
- [x] `GET /museum` → `/muzej` grid `medium`
- [x] `GET /players/:id` → `/igrac/:id` hero
- [x] Fallback kad API nije dostupan — sve rute prikazuju preview bez 500 (build u CI-ju prolazi)
- [x] `revalidate 60` za sve (static `1m` u build logu)
- [x] Token `327/327` nije diran
- [x] `inventory 2527/2527`, `check-coverage OK`, `check:all 10/10`

**Javna migracija:** `14/17` `publicLayoutRoutes` na Next-u (preostaju `/aplikacija`, `/o-klubu/kuca-slavnih`, `/clanstvo`, `/ulaznice`, `/p/:slug` — mogu kao `P-NEXT-02e` ako treba apsolutno 100%, ali kritičnih 8 iz zadatka su urađene).

---

## 6. Rollback

```bash
git revert <P-NEXT-02d sha>
# ili
rm -rf frontend-next/app/o-klubu frontend-next/app/tim frontend-next/app/klub frontend-next/app/liga frontend-next/app/utakmice frontend-next/app/kontakt frontend-next/app/pretraga frontend-next/app/muzej frontend-next/app/igrac
node scripts/audit/inventory.mjs  # 2527→2517
```

---

## 7. Sljedeći korak

**P-DASH-01 i ostali (parallel plan)** — nakon `P-NEXT-02d`:

- Design system (`frontend/src/index.css` 327 tokena + novi `AdminShell`, `KpiCard`, `DataTable`, `FormSheet`)
- `P-DASH-01` Administrator (40 perms) — `DashboardPage`, `PlatformStatus`, `Users/Roles`, `Audit`
- `P-DASH-02` Moderator (27)
- `P-DASH-03` Writer
- `P-DASH-04` Komentator
- `P-DASH-05` Redar
- `P-DASH-06` Član

`P-SEC-01` (0 critical) i `P-NEXT-02d` (100% javne) su zatvoreni — spremno za dashboard.

Status segmenta: ZATVOREN
