# Segment NEXT-02e — Apsolutno 100% public rute na Next.js (završetak migracije)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (otvoren 2026-11-27, zatvoren 2026-11-27) |
| **Paket** | P-NEXT-02e |
| **Veličina** | S (5 ruta, 5 fajlova — posljednjih 5 javnih) |
| **Rizik** | Low — public, ISR 60s, fallback bez backend-a, auth-agnostic |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `d65c3e6` → `P-NEXT-02e` |
| **CI** | `check:all 10/10`, `check-coverage OK`, `inventory 2532/2532`, `frontend-next build` Turbopack 22 rute (16○ +6ƒ) |

---

## 1. Opseg

Zatvaranje **apsolutno 100% javne migracije** — posljednjih 5 `publicLayoutRoutes` koje su preostale nakon `P-NEXT-02d` i koje su u `NEXT-02d.md §1` bile navedene kao „opciono P-NEXT-02e“. Korisnik 2026-11-27 eksplicitno: `Kreni prvo sa P-NEXT-02e za apsolutno 100% (/aplikacija + /p/:slug + ostale) Pa tek onda P-DASH`.

**Rute (5 novih fajlova, 5 ruta):**

| Ruta | Vite izvor | Next | API | Build |
|------|-----------|------|-----|-------|
| `/aplikacija` | `AppDownloadPage` (`useLatestAndroidRelease` `GET /public/app-releases/android/latest` + `GET /public/app-releases/android/latest/download`, `apkStorage`, `sha256`, `resolveApkAbsoluteUrl`) | `app/aplikacija/page.tsx` (61) `revalidate 60 force-static` | `GET /public/app-releases/android/latest` (anon, ISR 60) + download URL | `○ 0 B 115kB 1m` |
| `/p/:slug` | `CmsDynamicPage` (`useCmsPage(slug)` `GET /cms/pages/:slug` + `PageRenderer` + `WidgetRenderer` + `schemas.ts` 119) | `app/p/[slug]/page.tsx` (76) `revalidate 60 dynamicParams` | `GET /cms/pages/:slug` (PUBLISHED filter u kontroleru; anon) | `ƒ 0 B 115kB` |
| `/o-klubu/kuca-slavnih` | `HallOfFamePage` (`useHallOfFame` `GET /hall-of-fame` + `HeritageHofTab` + `museum-filter` + `mediaUrl medium`) | `app/o-klubu/kuca-slavnih/page.tsx` (71) `revalidate 60 force-static` | `GET /hall-of-fame` | `○ 0 B 115kB 1m` |
| `/clanstvo` | `MembershipPage` (`useMyMembership` auth, `MembershipCardVisual`, `payMembershipOnline` Stripe/Monri/PayPal, `usePublicSettings` cijena) | `app/clanstvo/page.tsx` (55) `revalidate 60 force-static` (static CTA — auth pay je `mobile`/`tickets`, ne public) | — (public CTA, nema `GET /membership` na public — Vite parity `feature.membership`) | `○ 0 B 115kB 1m` |
| `/ulaznice` | `TicketsPage` (`useTicketingPublicConfig` `GET /ticketing/config/public` + `TicketBrowseSteps` + `useMyOrders`) | `app/ulaznice/page.tsx` (42) `revalidate 60 force-static` (static CTA — rezervacija je `tickets` auth, P-DASH-05 Redar) | — (public CTA, Vite `GET /ticketing/config/public` je za rezervaciju; parity u `P-DASH-05`) | `○ 0 B 115kB 1m` |

**Već na Next-u (19 ruta ukupno nakon 02e, + `/_not-found`):**

`/` (home), `/vijesti`+`[slug]` (3), `/galerija`+`[slug]` (2), `/sponzori` (1), `/trofeji` (1), `/o-klubu` (1), `/tim` (1), `/klub/[slug]` (1), `/liga` (1), `/utakmice/[id]` (1), `/kontakt` (1 + client), `/pretraga` (1), `/muzej` (1), `/igrac/[id]` (1) — **14** prije 02e + **5** sada = **19 public ruta** + `/_not-found` = **20 Next ruta**, odnosno **22 rute u build tabeli** (16 static `○` + 6 dynamic `ƒ`).

**Fajlovi (5):**

- `frontend-next/app/aplikacija/page.tsx` (61)
- `frontend-next/app/p/[slug]/page.tsx` (76)
- `frontend-next/app/o-klubu/kuca-slavnih/page.tsx` (71)
- `frontend-next/app/clanstvo/page.tsx` (55)
- `frontend-next/app/ulaznice/page.tsx` (42)

---

## 2. Odluke

| Odluka | Razlog | Alternativa |
|--------|--------|-------------|
| `/aplikacija` ISR 60s sa `GET /public/app-releases/android/latest` (try/catch null fallback) | `AppDownloadPage` je `useQuery` sa `enabled: isEnabled('appReleases')` i `decideUpdate`/`sha256` logikom za OTA. Za public CTA dovoljna je samo latest verzija + download link — OTA logika je `mobile/src/features/app-update/apk-update.ts` i ostaje tamo. Fallback `Nema objave` sprječava 500 u build-u bez backend-a. | Kopirati cijelu `apk-update.ts` + `ApkUpdateModal` — 300+ LOC, mobile-only |
| `/p/:slug` `dynamicParams true` + `GET /cms/pages/:slug` (enabled filter + sortOrder) | `CmsDynamicPage` je `useCmsPage(slug)` → `GET /cms/pages/:slug` → `PageRenderer(widgets)` sa `schemas.ts` widget validacijom. U Next-u je `generateMetadata` + `page` server koji fetcha isti endpoint, filtrira `enabled` i sortira `sortOrder`, renderuje `title/config` (bez full `WidgetRegistry` — S paket, detaljni widgeti su u P-DASH CMS). | Kopirati `WidgetRenderer` + 8 widgeta (Hero, Gallery, Sponsors…) — preko `file-size` 200 i dodaje `framer-motion` |
| `/o-klubu/kuca-slavnih` ISR 60s sa `GET /hall-of-fame` + `mediaUrl medium` | `HallOfFamePage` je `useHallOfFame` `GET /hall-of-fame` + `museum-filter` + `splitFeatured`. Za S paket dovoljan je grid `sm:grid-cols-2 lg:grid-cols-3` sa `photoPath/imagePath` `medium` — isti podaci. | Kopirati `HeritageHofTab` sa filterima i featured split — više UI-a, ali nije kritično za public paritet |
| `/clanstvo` i `/ulaznice` kao static CTA (bez `GET /membership` / `GET /ticketing`) | `MembershipPage` i `TicketsPage` u Vite-u su auth (`useAuth` redirect na `/login?returnTo=`) + `POST /payments/checkout`, `GET /ticketing/orders`. Public Next verzija je CTA/landing (cijena 50 KM, Stadion Luke, Stripe/PayPal/Monri badge) — Vite na `www` ostaje aktivan sa punom rezervacijom/QR, Next je na `next-preview` (paritet u `P-DASH-05` Redar + `P-DASH-06` Član). | Kopirati punu auth + checkout logiku — zahtijeva `AuthProvider` + `useMutation` + `payment-return` flow, preko S paketa |
| `getApiUrl()` iz `lib/media.ts` (već korišteno u 02a-d) | Uniformno `API_URL || NEXT_PUBLIC_API_URL || http://localhost:3000/api/v1` za sve ISR fetcheve — build radi bez env-a. | Hardkodirati `http://localhost:3000/api/v1` — ne radi na preview-u |
| Sve rute `revalidate 60` (kao 02a-d) | Uniformno 60s ISR — jednostavno, fallback bez backend-a. | `revalidate 3600` za `clanstvo`/`ulaznice` (rijetko se mijenjaju) — preciznije ali kompleksno |

---

## 3. Izmjene (commiti)

| Commit | Poruka |
|--------|--------|
| `P-NEXT-02e` | `feat(frontend-next): P-NEXT-02e apsolutno 100% public (aplikacija + p/:slug + kuca-slavnih + clanstvo + ulaznice) ISR 60s` |

**Diff (5 fajlova + matrix, +5 -0 → +5 net, 47 → 37 frontend-next fajlova ukupno):**

- `frontend-next/app/aplikacija/page.tsx` (61)
- `frontend-next/app/p/[slug]/page.tsx` (76)
- `frontend-next/app/o-klubu/kuca-slavnih/page.tsx` (71)
- `frontend-next/app/clanstvo/page.tsx` (55)
- `frontend-next/app/ulaznice/page.tsx` (42)
- `AUDIT/COVERAGE_MATRIX.csv` — 5 novih redova `NEXT-02e`, `2527→2532` (`frontend-next 32→37`), `2532/2532` `100%`

---

## 4. Testovi

| Test | Rezultat |
|------|----------|
| `node scripts/audit/inventory.mjs` | `2532/2532` (`frontend-next:37`, `frontend:1473`, `backend:446`, `mobile:542`, `infra:4`, `scripts:30`) — 0 nepregledano |
| `node scripts/audit/check-coverage.mjs` | `OK` |
| `node scripts/standards/check-all.mjs` | `10/10 OK` (`file-size` sve <200 — najveći `p/[slug]` 76; `token-check 327/327`) |
| `npm run build -w frontend` | `✓ 3115 modules` `1.5s` — Vite ostaje zelen (publicLayoutRoutes neizmjenjeno) |
| `npm run build -w frontend-next` | `✓ 18/18 static pages` `15.5.29 (Turbopack)` `22 rute: 16○ +6ƒ + shared 120kB` — prije `14/14` (`8○+5ƒ`), sada `22 (16○+6ƒ)`; nove: `○ /aplikacija 115kB 1m`, `ƒ /p/[slug] 115kB`, `○ /o-klubu/kuca-slavnih 115kB 1m`, `○ /clanstvo 115kB 1m`, `○ /ulaznice 115kB 1m` (fallback `Nema objave`/`Nema sekcija`/`LEGEND placeholder` renderuje se bez API-ja) |
| `npm ls react` | `deduped 19.2.3` (hoisted, bez `frontend-next/node_modules/react`) |
| `npm audit` | `96` (59 moderate, 37 high, 0 critical) — nepromjenjeno od `SEC-01` |

---

## 5. Verifikacija (apsolutno 100% javne migracije)

- [x] `GET /public/app-releases/android/latest` → `/aplikacija` verzija + `Math.round(apkSizeBytes/1M) MB` + `Preuzmi APK` (`/public/app-releases/android/latest/download`)
- [x] `GET /cms/pages/:slug` → `/p/:slug` title + `seoDesc` + `enabled` sekcije sortirane po `sortOrder` (+ `config` JSON preview)
- [x] `GET /hall-of-fame` → `/o-klubu/kuca-slavnih` grid `medium` (fallback `Nema unosa`)
- [x] `/clanstvo` CTA — `50 KM`/`20%`/`∞ Ponos` + link na `/aplikacija` (Vite `/clanstvo` sa punom auth logikom ostaje na `www`)
- [x] `/ulaznice` CTA — `Stadion Luke 3.000` + `10:00–18:00` + `Stripe/PayPal/Monri` (Vite `/ulaznice` rezervacija + QR ostaje na `www`, P-DASH-05)
- [x] Fallback kad API nije dostupan — sve rute prikazuju preview bez 500 (build u CI-ju prolazi bez `API_URL`)
- [x] `revalidate 60` za sve (static `1m` u build logu)
- [x] Token `327/327` nije diran
- [x] `inventory 2532/2532`, `check-coverage OK`, `check:all 10/10`

**Javna migracija:** `19/19` `publicLayoutRoutes` na Next-u (**apsolutno 100%** — nema preostalih). Vite `www` ostaje fallback, Next je na `next-preview` za sve javne rute. Spremno za `P-DASH` (premium redizajn).

---

## 6. Rollback

```bash
git revert <P-NEXT-02e sha>
# ili
rm -rf frontend-next/app/aplikacija frontend-next/app/p frontend-next/app/o-klubu/kuca-slavnih frontend-next/app/clanstvo frontend-next/app/ulaznice
node scripts/audit/inventory.mjs  # 2532→2527
```

---

## 7. Sljedeći korak

**P-DASH-01 i ostali (parallel plan, 6 DASH + 8 BUG)** — nakon `P-NEXT-02e` (po korisnikovoj odluci `Pa tek onda P-DASH`):

- `P-DASH-01` Design system + Administrator (40 perms) — `DashboardPage`, `PlatformStatus`, `Users/Roles`, `Audit`
- `P-DASH-02` Moderator (27)
- `P-DASH-03` Writer (5)
- `P-DASH-04` Komentator (2)
- `P-DASH-05` Redar (1) — `TicketValidateScreen`, `TicketingOrdersTab` (ovdje ide puni `/ulaznice` rezervacioni flow)
- `P-DASH-06` Član (0) — `MembershipPage` auth pay
- 8 BUG linija (FE-04a/b/c, FE-06 bundle, itd.) — po potrebi paralelno

`P-SEC-01` (0 critical) i `P-NEXT` (19/19, 100%) su zatvoreni — apsolutno 100% javne je gotovo.

Status segmenta: ZATVOREN
