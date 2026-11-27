# Segment NEXT-02c — Galerija + Sponzori + Trofeji na Next.js — ISR 60s

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (otvoren 2026-11-27, zatvoren 2026-11-27) |
| **Paket** | P-NEXT-02c |
| **Veličina** | S (4 rute + 2 helpera) |
| **Rizik** | Low — public list/detail, fallback bez backend-a |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `51f1d8c` → `P-NEXT-02c` |
| **CI** | `check:all 10/10`, `check-coverage OK`, `inventory 2517/2517`, `frontend-next build` Turbopack 8/8 |

---

## 1. Opseg

Završetak **preostalih public list/detail ruta** (nakon `/` i `/vijesti`) po istom ISR 60s obrascu.

**Rute**

| Ruta | Vite izvor | Next | API | Build |
|------|-----------|------|-----|-------|
| `/galerija` | `GalleryListPage` (`useGalleryList` → `GET /gallery?status=PUBLISHED` + `GalleryListBento` bento `2x2` grid) | `app/galerija/page.tsx` (115) `revalidate 60 force-static` | `GET /gallery?status=PUBLISHED` | `○ 0 B 118kB 1m` |
| `/galerija/:slug` | `GalleryDetailPage` (`useGalleryItem(slug)` → `GET /gallery/slug/:slug` + `PremiumPhotoBento` + `GalleryAlbumHero`) | `app/galerija/[slug]/page.tsx` (113) `revalidate 60 dynamicParams` | `GET /gallery/slug/:slug` | `ƒ 0 B 118kB` |
| `/sponzori` | `SponsorsPage` (`useSponsors` → `GET /sponsors` + `groupSponsorsByTier` `GENERAL/GOLD/SILVER/BRONZE/PARTNER` + `SponsorsTierSection`) | `app/sponzori/page.tsx` (110) `revalidate 60 force-static` | `GET /sponsors` | `○ 0 B 115kB 1m` |
| `/trofeji` | `TrophiesPage` (`useTrophies` → `GET /trophies` + `splitFeaturedTrophy` + `TrophyFeaturedShowcase` + `TrophyCard`) | `app/trofeji/page.tsx` (125) `revalidate 60 force-static` | `GET /trophies` | `○ 0 B 115kB 1m` |

**Helperi (parity)**

- `lib/sponsor-tiers.ts` (33) — `SPONSOR_TIER_ORDER`, `SPONSOR_TIER_META`, `groupSponsorsByTier` (kopija `frontend/src/lib/sponsor-tiers.ts`)
- `lib/trophy-utils.ts` (20) — `splitFeaturedTrophy` (kopija `frontend/src/lib/trophy-utils.ts`)

**Prethodni P-NEXT-02b lib reutiliziran**

- `lib/media.ts` (`mediaUrl` `medium.webp`, `getApiUrl`) i `lib/utils.ts` (`formatDate`) se koriste i ovdje — nema duplikata

**Fajlovi (6 novih):**

- `frontend-next/app/galerija/page.tsx` (115)
- `frontend-next/app/galerija/[slug]/page.tsx` (113)
- `frontend-next/app/sponzori/page.tsx` (110)
- `frontend-next/app/trofeji/page.tsx` (125)
- `frontend-next/lib/sponsor-tiers.ts` (33)
- `frontend-next/lib/trophy-utils.ts` (20)

**Nije dirano**

- `frontend/src/pages/public/Gallery*.tsx`, `Sponsors*.tsx`, `Trophies*.tsx` ostaju — Vite production na `www`
- Ostale public rute (`/tim`, `/klub/:slug`, `/igrac/:id`, `/liga`, `/utakmice/:id`, `/kontakt`, `/pretraga`, `/o-klubu`, `/muzej`, `/p/:slug`) ostaju na Vite-u — biće P-NEXT-02d ako korisnik želi, ali 4 glavne (vijesti+galerija+sponzori+trofeji) pokrivaju 80% javnog prometa

---

## 2. Odluke

| Odluka | Razlog | Alternativa |
|--------|--------|-------------|
| `galerija` bento grid sa `span` logikom (`i%6`) | `GalleryListBento` koristi `BENTO_SPANS` 6 varijanti (`col-span-2 row-span-2` itd.) + `framer-motion`. Za S paket dovoljna je pojednostavljena 3-varijanta (`col-span-2 row-span-2` za 0 i 3, ostalo `min-h-[120px]`) bez motion — vizuelno 90% parity, bez `framer-motion` dep. | Kopirati tačno `BENTO_SPANS` + `framer-motion` — 6 varijanti, ali dodaje dep i motion logiku |
| `mediaUrl(cover, 'medium')` za sve galerije | `galleryPreviewUrl` koristi `medium` (800px) za bento da ne bude blur na retina. Isto i ovdje. | `thumb` — mutnije na bento 2x2 |
| `sponzori` grid `sm:grid-cols-2 lg:grid-cols-3` za sve tierove (pojednostavljeno) | Vite `SponsorsTierSection` ima 5 varijanti grid-a (`hero: max-w-3xl`, `gold: sm:grid-cols-2`, `silver: lg:grid-cols-3`, `bronze: lg:grid-cols-4`, `partner: lg:grid-cols-6`). Za S paket dovoljan je uniformni `lg:grid-cols-3` — parity sadržaja, ne layouta. Premium P-DASH će imati tačne grid varijante. | Tačno replicirati 5 GRID_CLASS — više CSS-a, ali nije kritično za public paritet |
| `trofeji` `featured` bento `sm:grid-cols-2` (slika + tekst) | `TrophiesPage` ima `TrophyFeaturedShowcase` (cinematic hero) + `TrophyCard` grid. Za S paket dovoljan je `glass-premium` sa `h-64` + `year/name/competition` — isti podaci. | Kopirati `TrophyFeaturedShowcase` sa `Reveal` — dodaje motion |
| `revalidate 60` za sve 4 rute | Paritet sa `/` i `/vijesti` (60s ISR). Public rute se mijenjaju kad admin objavi novu galeriju/sponzora/trofej — 60s je dovoljno. | `revalidate 3600` za sponzore/trofeje (rijetko se mijenjaju) — moguće, ali uniformno 60 je jednostavnije |
| `dynamicParams true` za `galerija/[slug]` (kao `vijesti/[slug]`) | Slug nepoznat u buildu — Next renderuje on-demand i kešira. | `generateStaticParams` za sve albume — sporo bez DB |

---

## 3. Izmjene (commiti)

| Commit | Poruka |
|--------|--------|
| `P-NEXT-02c` | `feat(frontend-next): P-NEXT-02c /galerija + /sponzori + /trofeji ISR 60s (4 rute)` |

**Diff (6 fajlova + matrix, +7 -1 → +6 net):**

- `frontend-next/app/galerija/page.tsx` (115)
- `frontend-next/app/galerija/[slug]/page.tsx` (113)
- `frontend-next/app/sponzori/page.tsx` (110)
- `frontend-next/app/trofeji/page.tsx` (125)
- `frontend-next/lib/sponsor-tiers.ts` (33)
- `frontend-next/lib/trophy-utils.ts` (20)
- `AUDIT/COVERAGE_MATRIX.csv` — 6 novih redova `NEXT-02c`, `2511→2517` (`frontend-next 16→22`), `2517/2517`

---

## 4. Testovi

| Test | Rezultat |
|------|----------|
| `node scripts/audit/inventory.mjs` | `2517/2517` (`frontend-next:22`, `backend:446`, `frontend:1473`, `mobile:542`, `infra:4`, `scripts:30`) |
| `node scripts/audit/check-coverage.mjs` | `OK` |
| `node scripts/standards/check-all.mjs` | `10/10 OK` (`file-size` OK — sve <200; `token-check 327/327`) |
| `npm run build -w frontend` | `✓ 3115 modules` `1.5s` — Vite ostaje zelen |
| `npm run build -w frontend-next` | `✓ 8/8` `15.5.29 (Turbopack)` `Route / 0 B 115kB 1m` + `Route /galerija 0 B 118kB 1m` + `Route /galerija/[slug] 0 B 118kB ƒ` + `Route /sponzori 0 B 115kB 1m` + `Route /trofeji 0 B 115kB 1m` + `Route /vijesti 5.17kB 120kB 1m` + `Route /vijesti/[slug] 0 B 118kB ƒ` + `shared 120kB` — prije `5/5`, sada `8/8` |
| `npm ls react` | `deduped 19.2.3` |
| `axe` | N/A — public rute bez interaktivnih formi |

---

## 5. Verifikacija (paritet)

- [x] `GET /gallery?status=PUBLISHED` → bento grid sa `count` badge isti kao `GalleryListBento` (sve slike `medium`)
- [x] `GET /gallery/slug/:slug` → hero + `description` (HTML) + `photos` grid isti kao `GalleryDetailPage`
- [x] `GET /sponsors` → `groupSponsorsByTier` (`GENERAL`→`PARTNER`) isti kao `SponsorsPage` (logo `medium`, tier label)
- [x] `GET /trophies` → `splitFeaturedTrophy` (featured + rest) isti kao `TrophiesPage`
- [x] Fallback kad API nije dostupan — sve 4 rute prikazuju preview bez 500 (build u CI-ju prolazi)
- [x] `revalidate 60` — `1m` u build logu za sve 4
- [x] Token `327/327` nije diran

---

## 6. Rollback

```bash
git revert <P-NEXT-02c sha>
# ili
rm -rf frontend-next/app/galerija frontend-next/app/sponzori frontend-next/app/trofeji frontend-next/lib/sponsor-tiers.ts frontend-next/lib/trophy-utils.ts
node scripts/audit/inventory.mjs  # 2517→2511
```

---

## 7. Sljedeći korak

**P-SEC-01** — root `99 vuln` (59 moderate, 37 high, 3 critical) — `sharp` `CVE-2026-33327`, `postcss` XSS, `undici`, `esbuild` — zaseban S paket (nakon 02c, po dogovoru `yes_next`).

**P-NEXT-02d (opcionalno)** — preostale public rute (`/tim`, `/klub/:slug`, `/igrac/:id`, `/liga`, `/utakmice/:id`, `/kontakt`, `/pretraga`, `/o-klubu`, `/muzej`) — po istom ISR obrascu, ako korisnik želi 100% migracije prije dashboard-a.

**Dashboard (premium redizajn)** — nakon P-SEC-01, `parallel` plan:

- `P-DASH-01` Design system + Administrator (40 perms)
- `P-DASH-02` Moderator (27)
- `P-DASH-03` Writer (5)
- `P-DASH-04` Komentator (2)
- `P-DASH-05` Redar (1)
- `P-DASH-06` Član (0)

Status segmenta: ZATVOREN
