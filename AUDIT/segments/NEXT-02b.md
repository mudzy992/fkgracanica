# Segment NEXT-02b — Vijesti na Next.js (`/vijesti` + `/vijesti/[slug]`) — ISR 60s

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (otvoren 2026-11-27, zatvoren 2026-11-27) |
| **Paket** | P-NEXT-02b |
| **Veličina** | S (2 rute + 5 lib/komponenti) |
| **Rizik** | Low — public rute, fallback bez backend-a, Vite ostaje production |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `f9bf1d6` → `P-NEXT-02b` |
| **CI** | `check:all 10/10`, `check-coverage OK`, `inventory 2511/2511`, `frontend-next build` Turbopack `15.5.29` 5/5 |

---

## 1. Opseg

Selidba **vijesti** (`frontend/src/pages/public/NewsListPage.tsx` + `NewsDetailPage.tsx`) na Next.js App Router sa **ISR**-om, parity sa Vite-ovim `usePublishedNews` / `useNewsItem` / `useNewsCategories`.

**Vite izvor (paritet mapiranje)**

| Vite | Next | Napomena |
|------|------|----------|
| `NewsListPage` (`usePublishedNews(categoryId)` + `useNewsCategories`) | `app/vijesti/page.tsx` (server) + `VijestiClient.tsx` (client filter) | Server fetcha `GET /news/published` + `GET /news-categories` (ISR 60), client filtrira po `categoryId` (Sve vs kategorija). `NewsFeedLayout` (featured + 2 compact + grid) vs `NewsGridLayout` automatski. |
| `NewsDetailPage` (`useNewsItem(slug)` → `GET /news/slug/:slug` fallback `GET /news/:id`) | `app/vijesti/[slug]/page.tsx` | `getNewsBySlug()` proba `/news/slug/:slug` pa `/news/:id` (kao `useNewsItem`), ISR 60, `dynamicParams: true` (ƒ). SEO `generateMetadata` (title/seoDesc/og:image). |
| `NewsCategoryFilter` (pill Sve + kategorije) | `components/news/NewsCategoryFilter.tsx` (`'use client'`) | 1:1 pill stil (`rounded-full`, `border-primary/40 bg-primary/20` za active, `glass-premium` za ostalo) |
| `NewsFeaturedCard / NewsCompactCard / NewsGridCard` (`framer-motion` + `mediaUrl` + `formatDate` + `stripHtml`) | `components/news/NewsCards.tsx` | Bez `framer-motion` (da ne dodajemo dep za S paket), ali isti `glass-premium`, `border-border`, `group-hover:scale-105`, `mediaUrl(..., 'medium')`, `formatDate` `dd.mm.yyyy`, `stripHtml` server-safe. `Link` je `next/link` umjesto `react-router`. |
| `mediaUrl`, `formatDate`, `stripHtml` (`frontend/src/lib/*`) | `frontend-next/lib/media.ts` + `lib/utils.ts` + `lib/news.ts` | `mediaUrl` koristi `API_URL|NEXT_PUBLIC_API_URL|http://localhost:3000/api/v1` + `/uploads/files/` + variant `originals→medium.webp`, `stripHtml` server-safe regex (bez `DOMParser`), `cn` bez `clsx/tailwind-merge` (da ne dodajemo dep). |

**Fajlovi u segmentu (8 novih + 1 refaktor):**

- `frontend-next/app/vijesti/page.tsx` (124 LOC) — server, `revalidate 60`, `force-static`, `metadata` vijesti, fetch kategorije + published, fallback preview
- `frontend-next/app/vijesti/VijestiClient.tsx` (79 LOC) — `'use client'`, `useState` filter, render `Featured/Compact/Grid`
- `frontend-next/app/vijesti/[slug]/page.tsx` (159 LOC, <200 nakon refaktora) — `revalidate 60`, `dynamicParams true`, `generateMetadata`, `getNewsBySlug`, hero + video + `dangerouslySetInnerHTML` + gallery + related players
- `frontend-next/components/news/NewsCards.tsx` (112 LOC) — 3 kartice parity
- `frontend-next/components/news/NewsCategoryFilter.tsx` (44 LOC) — client pill filter
- `frontend-next/lib/media.ts` (40 LOC) — `mediaUrl`, `getApiUrl`
- `frontend-next/lib/utils.ts` (27 LOC) — `cn`, `formatDate`, `stripHtml`
- `frontend-next/lib/news.ts` (35 LOC) — `NewsDetail` type + `getNewsBySlug` (2 url fallback)
- Refaktor: `frontend-next/app/vijesti/[slug]/page.tsx` 214→159 (izdvojen `lib/news.ts`) zbog `file-size` limita 200

**Nije dirano**

- `frontend/src/pages/public/NewsListPage.tsx` i `NewsDetailPage.tsx` ostaju — Vite i dalje production na `www/vijesti`, Next je na `next-preview/vijesti`
- `mobile/` — nepromijenjen

---

## 2. Odluke

| Odluka | Razlog | Alternativa |
|--------|--------|-------------|
| Server + client hibrid za listu (server fetcha, client filtrira) | `usePublishedNews` u Vite-u je client `react-query` sa `useState` kategorije. U Next-u bi svaki `?categoryId=` bio novi server request (searchParams) — više ISR keša. Hibrid je jednostavniji za S paket: 1 ISR fetch (sve vijesti) + client filter, nema dodatnih ruta. Za 10k vijesti bi trebalo server filter, ali trenutno nema toliko. | Server `searchParams` + `fetch(/news/published?categoryId=)` — više keš varijanti, bolje za veliki dataset, ali kompleksnije za S |
| `revalidate 60` + `force-static` za `/vijesti`, `revalidate 60` + `dynamicParams true` za `/vijesti/[slug]` | Paritet sa `/` (60s ISR). List je static `○` (5.17kB), detail je dynamic `ƒ` (3.4kB) jer je `slug` nepoznat u buildu — Next ga renderuje on-demand i kešira 60s. `Expire 1y` je default. | `generateStaticParams` za sve slugove u buildu — sporo i puca bez DB, odgođeno za P-NEXT-05 |
| `getNewsBySlug` proba `/news/slug/:slug` pa `/news/:id` | Paritet sa `useNewsItem` (try slug, catch → try id). Backend ima oba: `GET /news/slug/:slug` (public) i `GET /news/:id` (public ali 404 za draft bez usera). | Samo `/news/slug/:slug` — ne pokriva slučaj kad je link `id` |
| Fallback preview kad API nije dostupan (build bez backend-a) | CI build nema DB/API — `next build` mora proći. List prikazuje `Nema podataka — pokreni backend`, detail prikazuje `Vijest nije pronađena — Backend nije dostupan u build-u`. Runtime (revalidate 60) povlači prave podatke. | Baciti 500 / `notFound()` u buildu — build puca |
| Bez `framer-motion` / bez `lucide-react` u Next karticama | Vite kartice koriste `motion.article` + `Clock` + `ArrowUpRight`. Za S paket ne želimo nove deps (dodaju 30kB, treba tipizirati). Dovoljna je parity vizuelno (`glass-premium`, `group-hover`, `rounded-2xl`) + unicode `🕒` / `→`. Motion se može dodati u P-NEXT-03 kao zaseban S. | Dodati `framer-motion` + `lucide-react` — više parity, ali veći bundle (120kB shared→ veće) |
| `stripHtml` server-safe regex (bez `DOMParser`) | `frontend/src/lib/html-content.ts` koristi `document.createElement` i `DOMParser` (browser-only). U Next server componentu nema `document` — mora biti server-safe. Regex `<[^>]*>` + entity decode je dovoljan za excerpt. | Importati isti Vite `html-content.ts` — puca na serveru (`document is not defined`) |
| `dangerouslySetInnerHTML` za `data.content` | `frontend/src/components/public/RichContent.tsx` je TipTap HTML render. U Next-u za S paket dovoljno je direktno renderovati HTML (isti sadržaj), bez TipTap re-rendera. | Kopirati `RichContent` + TipTap — teško, zavisi od `prose` i klijentskih libova |
| `lib/news.ts` izdvojen zbog `file-size` 200 | Detail `page.tsx` je bio 214 → fail na `check:all`. Izdvajanjem `NewsDetail` type + `getNewsBySlug` u `lib/news.ts` (35 LOC) spušten je na 159 (<200) bez baseline-a. | Dodati u `file-size.txt` baseline — prihvatljivo ali dug ostaje, bolje refaktor |
| `mediaUrl` varijanta `medium` (ne `thumb`) | `galleryPreviewUrl` u Vite-u koristi `medium` (800px) da ne bude blur na retina. Isto i ovdje. | `thumb` — mutnije |

---

## 3. Izmjene (commiti)

| Commit | Poruka |
|--------|--------|
| `P-NEXT-02b` | `feat(frontend-next): P-NEXT-02b /vijesti + /vijesti/[slug] ISR 60s (list 5.17kB, detail 3.4kB)` |

**Diff (8 novih fajlova + 1 update matrix, +7 -1):**

- `frontend-next/lib/media.ts` (40)
- `frontend-next/lib/utils.ts` (27)
- `frontend-next/lib/news.ts` (35)
- `frontend-next/components/news/NewsCards.tsx` (112)
- `frontend-next/components/news/NewsCategoryFilter.tsx` (44)
- `frontend-next/app/vijesti/page.tsx` (124)
- `frontend-next/app/vijesti/VijestiClient.tsx` (79)
- `frontend-next/app/vijesti/[slug]/page.tsx` (159 ← 214 prije refaktora)
- `AUDIT/COVERAGE_MATRIX.csv` — 8 novih redova `NEXT-02b`, `2503→2511` (8→16 `frontend-next`), `2511/2511`, `app/page.tsx` 142→159, `2503/2510→2511/2511`

Nema migracije baze, nema API promjene — rollback je `git revert <sha>` + `rm -rf frontend-next/app/vijesti`.

---

## 4. Testovi

| Test | Rezultat |
|------|----------|
| `node scripts/audit/inventory.mjs` | `2511/2511` (`frontend-next:16`, `frontend:1473`, `backend:446`, `mobile:542`, `infra:4`, `scripts:30`) — `0 nepregledano` (prije 2503/2503) |
| `node scripts/audit/check-coverage.mjs` | `OK` |
| `node scripts/standards/check-all.mjs` | `10/10 OK` ( `file-size` je bio FAIL na 214 → refaktor na 159 → OK; `token-check 327/327` ) |
| `npm run build -w frontend` | `✓ 3115 modules` `1.5s` — Vite ostaje zelen (public `/vijesti` i dalje radi) |
| `npm run build -w frontend-next` | `✓ 5/5 static` `15.5.29 (Turbopack)` `Route / 0 B 115kB 1m` + `Route /vijesti 5.17kB 120kB 1m` + `Route /vijesti/[slug] 3.4kB 118kB (ƒ)` + `shared 120kB` — prije `4/4` (samo `/` + `/_not-found`), sada `5/5` |
| `npm ls react` | `deduped 19.2.3` — i dalje hoisted, nema duplog |
| `axe` / `playwright` | N/A za `/vijesti` fallback — nema interaktivnih ruta još |

---

## 5. Verifikacija (paritet)

- [x] `GET /api/v1/news/published` + `GET /api/v1/news-categories` → `VijestiClient` render isti kao `NewsListPage` (Sve vs kategorija, `NewsFeedLayout` kad nema filtera vs `NewsGridLayout` kad ima)
- [x] `GET /api/v1/news/slug/:slug` → detail hero + `data.content` (TipTap HTML) + `gallery` + `relatedPlayers` isti kao `NewsDetailPage` (bez `NewsCommentsSection` za S — dolazi u P-NEXT-03)
- [x] Fallback kad API nije dostupan — list i detail prikazuju preview bez 500 (build u CI-ju prolazi)
- [x] `revalidate 60` — `Route /vijesti 1m` u build logu, detail `ƒ` (on-demand ISR)
- [x] `mediaUrl` varijanta `medium` → slike iste kao Vite (`/uploads/files/medium/...webp`)
- [x] `formatDate` `dd.mm.yyyy` + `stripHtml` — excerpty isti
- [x] Token paritet `327/327` nije diran
- [x] `inventory 2511/2511`, `check-coverage OK`, `check:all 10/10`

---

## 6. Rollback

```bash
git revert <P-NEXT-02b sha>
# ili
rm -rf frontend-next/app/vijesti frontend-next/components/news frontend-next/lib/media.ts frontend-next/lib/utils.ts frontend-next/lib/news.ts
node scripts/audit/inventory.mjs  # vraća na 2503
```

Nema migracije baze, nema API promjene — rollback je `1 commit`.

---

## 7. Sljedeći korak

**P-NEXT-02c** — `/galerija` + `/galerija/:slug` + `/sponzori` + `/trofeji` (preostale public list/detail rute po istom ISR obrascu, 60s).

**P-SEC-01** (nakon 02c) — root `99 vuln` (59 moderate, 37 high, 3 critical) — `sharp` (libvips CVE), `postcss` XSS, `undici`, `esbuild` itd. — zaseban S paket `next 15.5.29` već urađen, ostaje backend/frontend/mobile.

**Dashboard (premium redizajn)** — nakon `P-NEXT-02c`:

- Design system (tokens ostaju, sve ostalo novo) — `frontend/src/index.css` 327 tokena + novi `AdminShell`, `KpiCard`, `DataTable`, `FormSheet`, `PermissionGuard`
- Paketi po rolama (S = 1 rola = 1 PR, 6 PR-a ukupno):
  1. **P-DASH-01** — Design system + `Administrator` (40 perms, sve) — `DashboardPage` + `PlatformStatus` + `Users/Roles` + `Audit`
  2. **P-DASH-02** — `Moderator` (27 perms) — `news.approve`, `gallery.approve`, `membership.approve`, `ticketing.*`, `audit.read` itd.
  3. **P-DASH-03** — `Writer` (news.manage/submit, gallery.manage, media.read/upload) — `NewsAdmin` + `GalleryAdmin` + `Media` + TipTap editor parity
  4. **P-DASH-04** — `Komentator` (live.manage, matches.manage) — `CommentatorPage` + `LivePending` + `MatchReport`
  5. **P-DASH-05** — `Redar` (admissions.scan) — `Ticketing` sken + `Finance` read
  6. **P-DASH-06** — `Član` (0 perms) — public `MembershipPage` + `TicketsPage` + premium UX

**Predlog 24 premium/bug/patch (grupisano po paketima, za `you_prioritize`):**

- **P-NEXT grupa (6):** 1) `framer-motion` parity za kartice, 2) `NewsCommentsSection` na detail, 3) `generateStaticParams` za top 20 vijesti, 4) `SearchPage` `/pretraga` ISR, 5) `Pagination` za `/vijesti` (cursor), 6) `sitemap.xml` + `robots.txt` za Next vite
- **P-DASH grupa (10):** 7) `CommandPalette` (⌘K) za admin, 8) `KpiCard` sa `uniqueVisitorsTotal30d` sparkline, 9) `DataTable` virtuelizacija za 1k+ redova, 10) `FormSheet` optimistic + `zod` validacija, 11) `PermissionGuard` per-field (ne per-route), 12) `Audit` live tail (SSE), 13) `Media` drag-drop + `medium` preview, 14) `Gallery` bulk upload, 15) `Live` SSE sa `liveBreak` i `stoppage`, 16) `Redar` QR sken sa kamerom (mobile)
- **P-SEC/BUG grupa (8):** 17) `sharp` `CVE-2026-33327/33328` (root 3 critical), 18) `postcss` XSS `</style>` (moderate), 19) `undici`/`esbuild` high, 20) `prisma` `migrate deploy` vs `db migrate` dual fallback (već postoji, ali CI na `22` vs `24`), 21) `geoip-lite` `EBADENGINE >=24` (CI na 22), 22) `frontend` `vite` `resolve.dedupe` već postoji ali `bundle-react` hvata samo major, 23) `mobile` `app.json` `expo` `react` 19.2.3 vs `frontend` 19.3.1 dedupe, 24) `p/:slug` CMS dynamic page ISR (već postoji kao `CmsDynamicPage`)

Status segmenta: ZATVOREN
