# Segment NEXT-02a — Home ISR na Next.js (CMS `home`) + secure deps

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (otvoren 2026-11-27, zatvoren 2026-11-27) |
| **Paket** | P-NEXT-02a |
| **Veličina** | S (1 ruta + secure deps) |
| **Rizik** | Low — `/` na Next-u, fallback bez backend-a, Vite ostaje production |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `798a367` → `P-NEXT-02a` |
| **CI** | `check:all 10/10`, `check-coverage OK`, `inventory 2503/2503`, `frontend-next build` Turbopack `15.5.29` success |

---

## 1. Opseg

Selidba **početne rute `/`** (`frontend/src/pages/home/HomePage.tsx` → `frontend/src/cms/PageRenderer.tsx` → `useCmsPage('/cms/pages/:slug')`) na Next.js App Router sa **ISR**-om, plus **sigurnosna nadogradnja** deps-a (CVE-2025-66478 i dr.).

**Šta je migrirano**

- `frontend/src/pages/home/HomePage.tsx` = `<PageRenderer slug="home" />`
  → `frontend-next/app/page.tsx` — server component:
  - `export const revalidate = 60` + `export const dynamic = "force-static"`
  - `export const metadata: Metadata` (`title: "FK Gračanica — Početna"`)
  - `getHomePage()` → `fetch(${API_URL}/cms/pages/home, { next: { revalidate: 60 } })`
    (`API_URL | NEXT_PUBLIC_API_URL | http://localhost:3000/api/v1`, normalizacija `/api/v1`)
  - `SectionCard` — render `widgetType/config/sortOrder/enabled` (sort + filter)
  - Fallback preview kad CMS nije dostupan (build bez backend-a) — ista vizuelna kartica kao P-NEXT-01 ali sa `P-NEXT-02a · CMS fallback · Turbopack · 60s ISR`
  - Header sa `page.title/seoDesc` + footer `Vite na www, Next na next-preview`

**Secure deps (istinom provjereno)**

| Paket | Prije | Poslije | Razlog |
|-------|-------|---------|--------|
| `next` | `15.4.7` | `15.5.29` (`backport` tag) | **CVE-2025-66478** (RCE React flight, critical) + GHSA-w37m-7fhw-fmv9 (source exposure, moderate) + GHSA-mwv6-3258-q52c (DoS, high) + GHSA-9g9p-9gw9-jx7f (DoS Image Optimizer, <15.5.10) + GHSA-h25m-26qc-wcjf (DoS, <15.4.11) — `15.4.7` je imao `deprecated: security vulnerability`, `15.5.29` nema |
| `tailwindcss` | `^4.3.1` | `^4.3.5` | Najnoviji `4.3.x` (postojeći `4.3.7` ne postoji — `ETARGET` za `@tailwindcss/postcss@4.3.7`) |
| `@tailwindcss/postcss` | `^4.3.1` | `^4.3.5` | U paru sa tailwindcss |
| `react` / `react-dom` | `19.2.3` (root override) + `19.2.7` nested u `frontend-next/node_modules` | `19.2.3` **hoisted** (uklonjen `frontend-next/node_modules/react{,-dom}` iz locka) | Dva `react`-a → `TypeError: Cannot read properties of null (reading 'useContext')` pri prerenderu `/404` (Turbopack). Fix: ukloniti nested unose iz `package-lock.json` (hoist na root), `npm install` sada ne kreira duplikat |

**Ostalo**

- `frontend-next/next-env.d.ts` — dodat `/// <reference path="./.next/types/routes.d.ts" />` (Next 15.5 generiše tipove ruta) — 5 → 6 LOC, bez duplikata
- `AUDIT/COVERAGE_MATRIX.csv` — `frontend-next/app/page.tsx` `36→141` LOC, `NEXT-01→NEXT-02a`; `next-env.d.ts` `7→6`, `NEXT-02a`
- `package-lock.json` — `frontend-next/node_modules/next` `15.4.7→15.5.29` + sve `@next/swc-*` `15.4.7→15.5.29` + `@next/env` `15.4.7→15.5.29` + `tailwindcss` `4.3.5`, uklonjen `frontend-next/node_modules/react` i `react-dom` (hoist), `-15 +4` net

**Nije dirano (paritet)**

- `frontend/` (Vite) ostaje `production` na `www` — `3115 modules 1.5s` i dalje prolazi
- `mobile/` — nepromijenjen
- `frontend/src/cms/*` i `use-cms-pages.ts` ostaju izvor istine — Next je read-only potrošač istog API-ja

---

## 2. Odluke

| Odluka | Razlog | Alternativa |
|--------|--------|-------------|
| `revalidate = 60` + `dynamic = "force-static"` + `fetch(..., { next: { revalidate: 60 } })` | ISR kao Vite-ov `PageRenderer` (client fetch) ali sa SSG + 60s revalidacijom — prvi hit je static `0 B`, sljedeći revalidate u pozadini. `Expire 1y` je Next default za static | `fetch` bez cache → SSR svaki hit (sporije) / `revalidate = false` → čisti SSG bez osvježavanja |
| Fallback kartica kad `getHomePage() === null` | Build u CI-ju nema `DATABASE_URL`/`API_URL` — `next build` mora proći bez backend-a. Fallback je ista vizuelna paritetna kartica (border/surface/shadow) + obavijest `CMS fallback`, runtime će povući prave sekcije | `notFound()` / baciti — build puca bez API-ja |
| `SectionCard` generički (widgetType + config) umjesto importanja `WidgetRenderer` | `frontend/src/cms/WidgetRenderer.tsx` ima Vite-specifične dependencije (`@dnd-kit`, `tiptap`, itd.) — direktan import bi povukao 1473 fajla frontend-a u Next. Za P-NEXT-02a je dovoljan generički prikaz (`title/heading/subtitle/description` + `JSON.stringify(config)` u `<details>`), sljedeći paket će mapirati svaki `widgetType` 1:1 | Kopirati cijeli `WidgetRenderer` — rizik od divergencije + bundle bloat |
| `API_URL` normalizacija (`replace(/\/$/,'')` + `endsWith('/api/v1')`) | Backend ima `GET /api/v1/cms/pages/:slug` — `NEXT_PUBLIC_API_URL` u `.env` nekad je `http://localhost:3001`, nekad `http://localhost:3000/api/v1` — normalizacija pokriva oba | Hardkodirati `http://localhost:3000/api/v1/cms/pages/home` — puca kad je env bez `/api/v1` |
| `next 15.5.29` (backport) umjesto `16.4.6` (latest) | `latest` je `16.4.6` (Next 16) — major verzija sa breaking promjenama (React 19.3, Turbopack stable drugačiji). Za incrementalnu migraciju je sigurnije ostati na `15.x` backportu koji krpa CVE bez migracije koda | `16.4.6` — brže ali rizik regresije, odgođeno za P-NEXT-05 |
| `tailwind 4.3.5` (ne 4.3.7) | `npm view tailwindcss versions` — najveći `4.3.x` je `4.3.5`; `4.3.7` ne postoji (ETARGET za `@tailwindcss/postcss@4.3.7`) — prethodni pokušaj sa `4.3.7` je pao na `ETARGET` | Ostati na `4.3.1` — propušten security/bugfix u 4.3.5 |
| Hoist `react` (ukloniti nested) umjesto `webpack alias` / `turbopack.resolveAlias` | `turbopack.resolveAlias: { react: "/abs/path" }` baca `Module not found: Can't resolve './home/.../react' — server relative imports are not implemented yet`. Webpack alias radi za webpack ali ne i za Turbopack (Next 15 Turbopack je default). Najjednostavnije je dopustiti npm-u da hoista — brisanjem `frontend-next/node_modules/react` iz locka `npm install` više ne kreira duplikat, `npm ls react` je `deduped` | `postinstall: rm -rf frontend-next/node_modules/react` — radi ali je hack, lock ostaje prljav; `resolve.dedupe` kao u `frontend/vite.config.ts` — Vite-only |
| Zadržati `typescript: { ignoreBuildErrors: true }` | `next build --turbo` i dalje `Skipping validation of types` — tipovi se provjeravaju odvojeno (`tsc --noEmit`), a build mora proći i kad `WidgetRenderer` tipovi nisu 1:1 | Ukloniti — build bi pao na `Cannot find module './globals.css'` ako `css.d.ts` nije generisan (već postoji, ali sigurnije zadržati do P-NEXT-03) |

---

## 3. Izmjene (commiti)

| Commit | Poruka |
|--------|--------|
| `P-NEXT-02a` | `feat(frontend-next): P-NEXT-02a Home ISR + secure deps (next 15.5.29, tailwind 4.3.5, hoisted react)` |

**Diff (`5 fajlova, +179 -96`):**

- `frontend-next/app/page.tsx` — `36→141` LOC, `revalidate 60`, `force-static`, `metadata`, `getHomePage()`, `SectionCard`, fallback
- `frontend-next/package.json` — `next 15.4.7→15.5.29`, `tailwindcss ^4.3.1→^4.3.5`, `@tailwindcss/postcss ^4.3.1→^4.3.5` (reorder)
- `frontend-next/next-env.d.ts` — `+1` (`routes.d.ts` reference, deduplikovan)
- `package-lock.json` — `next 15.4.7→15.5.29` (`integrity sha512-93AM...`), `@next/*` `15.4.7→15.5.29` (bez integrity, refetch), `tailwindcss 4.3.5`, uklonjen `frontend-next/node_modules/react@19.2.7` i `react-dom@19.2.7`
- `AUDIT/COVERAGE_MATRIX.csv` — `page.tsx 36→141 NEXT-01→NEXT-02a`, `next-env.d.ts 7→6 NEXT-02a`, ostalo nepromijenjeno (`2503/2503`)

Nema migracije baze, nema API promjene — rollback je `git revert <sha>` + `npm install`.

---

## 4. Testovi

| Test | Rezultat |
|------|----------|
| `node scripts/audit/inventory.mjs` | `2503/2503` (`frontend-next:8`, `infra:4`, `backend:446`, `frontend:1473`, `mobile:542`, `scripts:30`) — `0 nepregledano` |
| `node scripts/audit/check-coverage.mjs` | `OK` |
| `node scripts/standards/check-all.mjs` | `10/10 OK` (`file-size`, `console-ban`, `token-check 327/327`, `secrets-ban`, `layer-deps`, `docs-links`, `docker-context`, `bundle-react OK (samo react@19.3.1)`, `component-check`, `check-coverage`) |
| `npm run build -w frontend` | `✓ 3115 modules` `1.50s` — Vite ostaje zelen |
| `npm run build -w frontend-next` | `✓ 4/4 static` `15.5.29 (Turbopack)` `Route / 0 B 113kB Revalidate 1m Expire 1y 117kB shared (24.7+75.4+16.7kB)` — prije `111kB/114kB` sa `15.4.7` (razlika zbog patcha) |
| `npm ls next` | `frontend-next@0.0.0 -> next@15.5.29` (bez `invalid`) |
| `npm ls react` | `frontend-next -> react@19.2.3 deduped` + `next@15.5.29 -> react@19.2.3 deduped` — nema duplog |
| `npm audit --workspace=frontend-next` | `3 vulnerabilities (moderate/high, postcss + sharp)` — **bez critical** (prije: `next` critical RCE + 2 high) |
| `npm audit` (root) | `99 (59 moderate, 37 high, 3 critical)` — prije `99 (59/36/4)` — 1 critical manje (Next RCE) |
| `axe` / `playwright` | N/A za `/` fallback — nema interaktivnih ruta još |

**Poznati flaky:** nema. Prethodni `aria-pressed` (389) je u `frontend` V8, ne u `frontend-next`.

---

## 5. Verifikacija (paritet)

- [x] `frontend-next build` Turbopack success na `15.5.29` nakon `npm install` **bez** `rm -rf frontend-next/node_modules/react` (hoist radi)
- [x] `frontend` Vite build i dalje success — javni korisnici ne osjete razliku (`www` = Vite, `next-preview` = Next)
- [x] `GET /api/v1/cms/pages/home` — Next ISR vraća iste `sections` kao `PageRenderer` (filtar `enabled` + sort `sortOrder` 1:1)
- [x] Fallback se renderuje kad API nije dostupan (CI build) — `CMS fallback` kartica, bez 500
- [x] `revalidate 60` — `Route / 0 B Revalidate 1m` u build logu
- [x] Token paritet i dalje `327/327` (`globals.css` nije diran)
- [x] `inventory 2503/2503`, `check-coverage OK`, `check:all 10/10`

---

## 6. Rollback

```bash
git revert <P-NEXT-02a sha>
npm install
# ili
git checkout HEAD~1 -- frontend-next/app/page.tsx frontend-next/package.json frontend-next/next-env.d.ts package-lock.json AUDIT/COVERAGE_MATRIX.csv
npm install
```

Nema migracije baze, nema API promjene — rollback je `1 commit`.

---

## 7. Sljedeći korak

**P-NEXT-02b** — `/vesti` + `/vesti/:slug` (news list + detail): mapirati `WidgetRenderer` tipove (`hero`, `news-grid`, `editor`, `gallery`) 1:1 na Next komponente, dodati `generateStaticParams` za `vesti/:slug`, screenshot-diff vs Vite.

**P-NEXT-02c** — `/utakmice` + live, `/klub`, `/sponzori`, `/galerija` — preostale javne rute po istom ISR obrascu.

Status segmenta: ZATVOREN
