# Tranzicijski plan — Vite → Next.js Turbo + Premium redizajn dashboarda

> Grana: `arena/290a6f13-fkgracanica` · Head: `9295dae` · Datum: `2026-11-26` · Status: **PLAN (čeka odobrenje prije P-NEXT-01)**
> Baseline: `2495/2495 (100%)` · `check:all 10/10` · `FINAL_AUDIT_2026-11-26.md` · CI `45899911288`

---

## 0. Cilj i tvrda ograničenja

**Cilj:** prelazak javnog sajta na **Next.js 15 + Turbopack** i potpuni **premium redizajn dashboarda po rolama**, uz **0 vidljivog poremećaja** za navijače i mobilnu aplikaciju.

**Tvrda pravila (nepregovaračka):**
1. **Javni sajt i mobilna aplikacija ostaju 100% funkcionalni i vizuelno identični** tokom cijele tranzicije — svaka promjena se verifikuje `playwright` screenshot diffom i `mobile` parity testom (`mob-batch89` FALLBACK_NAV ↔ MOBILE_TABS) prije switcha.
2. **Tokeni ostaju** — `frontend/src/index.css` (327 tokena, `token-check` 327/327) je jedini izvor istine za boje/razmake/tipografiju. Novi dizajn samo mapira tokene, ne uvodi hardkodirane vrijednosti.
3. **API ugovor se ne lomi** — `backend` ostaje NestJS 11 + Prisma 7, `/api/v1` prefiks, isti DTO-i. Frontend smije samo dodavati `next/image`, `next/font`, `next/link` wrapper-e.
4. **Inkrementalno, rutu po rutu** — Vite i Next koegzistiraju u CI-ju dok se ne verifikuje paritet. Nema big-bang PR-a.
5. **Svaki paket mora ostati `2495+X / 2495+X` i `CI 6/6 zelen`** — inače se ne merge-a.

---

## 1. Arhitektura prije / poslije

### Prije (sada)
```
frontend (Vite 8 + React 19 + Tailwind 4)  ─┐
                                            ├─► backend (NestJS /api/v1) ─► Postgres + Redis + SMTP
mobile (Expo 57)                          ─┘         │
                                                     └─► payments (Stripe/PayPal/Monri)
CI: build + test (backend,frontend)  ·  browser smoke  ·  e2e  ·  standards  ·  audit-gate
```

### Poslije (cilj)
```
frontend (Next.js 15 + App Router + Turbopack)  ─┐
  app/(public)/, app/(admin)/, app/api/proxy      ├─► backend (isti) ─► isti Postgres/Redis
  packages/ui (shadcn, zajednički za web i Next) ─┘         │
mobile (Expo 57 — netaknut, isti API)                        └─► isti payments
CI: build(Vite) + build(Next) + test + e2e + standards + audit-gate + lighthouse
```

**Zašto Next.js Turbo:**
- `Turbopack` 5-10x brži dev od Vite na 1473 frontend fajla
- `App Router` daje `loading.tsx`/`error.tsx`/`not-found.tsx` per segment (premium UX)
- `next/image` + `next/font` rješavaju CLS i LCP (audit `FE-06` bundle budget)
- `output: standalone` za Coolify (isti Docker kao sad)

---

## 2. Faze tranzicije

### Faza 0 — Pečat (završeno)
- `2495/2495`, `FINAL_AUDIT_2026-11-26.md`, `9295dae` push. Ovo je **baseline** za diff na svakom narednom PR-u.

### Faza 1 — Koegzistencija (2 sedmice, paket P-NEXT-01)
1. Kreirati `frontend-next/` (novi workspace `frontend-next` u `package.json` workspaces) sa `create-next-app --ts --tailwind --app --turbo`
2. Kopirati `index.css` tokene, `lib/theme.tsx`, `lib/permissions.ts`, `hooks/`, `components/ui/` (dedupe `react`/`react-dom` ostaje)
3. `next.config.mjs`:
   ```js
   experimental: { turbo: { } },
   transpilePackages: ['@repo/ui'],
   output: 'standalone',
   async rewrites() { return [{ source: '/api/:path*', destination: `${process.env.API_URL}/api/:path*` }] }
   ```
4. CI: `frontend:build (vite)` + `frontend-next:build (next)` paralelno, oba moraju biti zelena
5. Deploy: `www.fkgracanica.ba` = Vite, `next-preview.fkgracanica.ba` = Next (isti backend)

**Exit kriterij:** `next build` < 90s, `next lint` 0 grešaka, `playwright` `/` screenshot diff < 1% vs Vite.

### Faza 2 — Public rute, jednu po jednu (4 sedmice, paketi P-NEXT-02a…d)
| Red | Ruta | Rizik | Verifikacija |
|-----|------|-------|--------------|
| 1 | `/` (home) | Low | `playwright` + Lighthouse 95+ |
| 2 | `/vesti`, `/vesti/:slug` | Medium (SEO) | `next/metadata` vs stari `Seo` komponenta |
| 3 | `/utakmice`, `/uzivo/:id` | High (realtime) | Socket.IO `match:join` parity |
| 4 | `/galerija`, `/klub`, `/muzej`, `/sponzori` | Low | `axe` 0 critical |

Svaka ruta: **Vite ostaje fallback** dok `next-preview` ne prođe `e2e` + ručni QA. Switch je `rewrites` u Coolify, ne DNS.

### Faza 3 — Design System (2 sedmice, paket P-DASH-01)
- Izdvojiti `packages/ui` (shadcn): `Button`, `Card`, `Sheet`, `DataTable`, `Skeleton`, `Command` (⌘K)
- Tokeni ostaju, ali komponente dobijaju `variant: premium` (zaobljeniji, više sjene, veći touch target 44px — audit `AA` 4.5:1)
- `AdminLayout` premium: sidebar (collapsible) + topbar (`lastUpdated` + `Osvježi` + `aria-live`) + `CommandPalette`

**Exit:** `component-check` 290 vs raw 0 ostaje 0%, `token-check` 327/327, `axe` 0 critical na novom layoutu.

### Faza 4 — Dashboard po rolama, rolu po rolu (6-8 sedmica, paketi P-DASH-02…06, veličina S)
Svaka rola = 1 PR (vidi `INVENTORY_PLAN.md` §3). Redoslijed po tvom odabiru `all_roles_parallel` — prvo `Writer`+`Komentator` (najveći daily traffic), paralelno `Admin`/`Moderator`/`Redar`. Svaki PR ima feature flag `dashboardPremium.{role}=false` default, pali se tek nakon QA.

### Faza 5 — Premium Fan & Commerce (4 sedmice, paket P-PREMIUM-01)
Moj FK portal, loyalty, shop, donacije, newsletter automation — novi moduli, ne migriraju postojeće.

### Faza 6 — Gašenje Vite (1 sedmica)
Kad je `frontend-next` 100% i `next-preview` 2 sedmice bez incidenta: `frontend/` se arhivira u `frontend-vite-backup/`, `frontend-next/` se preimenuje u `frontend/`. `package-lock.json` se regeneriše.

---

## 3. Test strategija po fazi

| Nivo | Alat | Kada |
|------|------|------|
| **Unit** | `vitest` 5353 frontend + 3375 mobile | svaki PR, `check:all` gate |
| **Visual** | `playwright` screenshot + `percy`/`chromatic` diff | svaka public ruta |
| **A11y** | `axe` (browser mock + axe) | svaki dashboard PR |
| **E2E** | `playwright` kritični tokovi (login → create news → approve → public) | `e2e` job |
| **Mobile paritet** | `mobile` `mob-batch89` + `maestro` | svaki public PR |
| **Perf** | `lighthouse` CI (LCP < 2.5s, CLS < 0.1) | Faza 2+ |
| **API ugovor** | `prisma validate` + `approved-public-routes` invariant | svaki PR |

---

## 4. Rizici i rollback

| Rizik | Mitigacija | Rollback |
|-------|------------|----------|
| Next build spor / Turbopack bug | Koegzistencija, Vite ostaje production | `git revert P-NEXT-01`, DNS ostaje Vite |
| SEO pad (meta, sitemap) | `next/metadata` 1:1 vs stari `Seo`, `next-sitemap` diff | revert rute |
| Realtime socket ne radi na Next | `socket.io-client` isti, test `match:join/leave` u `e2e` | Vite fallback |
| RBAC rupa novi dashboard | `PermissionRoute` + `RequirePermissions` ostaju, `rbac-seed` test | flag off |
| Bundle regresija (+5%) | `bundle-budget` gate + `bundle-react` dedupe | revert `packages/ui` |

---

## 5. Timeline (procjena uz S pakete)

```
W1-2 : P-NEXT-01 (setup)
W3-6 : P-NEXT-02a-d (public rute)
W7-8 : P-DASH-01 (design system)
W9-16: P-DASH-02…06 (5 rola, 1 PR/sedmica)
W17-20: P-PREMIUM-01 (fan & commerce)
W21  : Gašenje Vite + FINAL_AUDIT v2
```

Ukupno **~21 sedmica** uz 1 PR/sedmica, svaki `≈ 80-120 LOC` + testovi.

---

## 6. Definition of Done za cijelu tranziciju

- [ ] `next build --turbo` < 90s, `next lint` 0
- [ ] Sve public rute na Next, `playwright` diff 0, Lighthouse 95+
- [ ] Svih 5 funkcionalnih dashboarda premium, `axe` 0 critical/serious
- [ ] `2495+X / 2495+X` (X = novi Next fajlovi), `check:all 10/10`, `CI 6/6` na svakom PR-u
- [ ] `AUDIT/FINAL_AUDIT_NEXT.md` sa novim `lighthouse` + `bundle` + `audit` snapshotom
- [ ] `docs/MOBILE.md` + `docs/FRONTEND.md` ažurirani za Next

---

*Ovaj plan je ulaz za `P-PLAN-01`. Sljedeći dokument `INVENTORY_PLAN.md` mapira tačno koji fajl ide u koji paket.*
