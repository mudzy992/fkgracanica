# Inventar — šta posjedujemo i gdje ide svaki segment

> Datum: `2026-11-26` · Head: `9295dae` · Matrica: `2495 fajlova` · `FINAL_AUDIT_2026-11-26.md`
> Svrha: da svaki fajl zna u koji paket tranzicije ide i da nema "izgubljenog" koda.

---

## 1. Trenutni inventar (iz `scripts/audit/inventory.mjs`)

```
Ukupno: 2495
  infra:    4  (.github/workflows/ci.yml, .githooks/*, backend/docker-entrypoint.sh)
  backend: 446 (src/* — 48 modula, 59 Prisma modela)
  frontend:1473 (src/* — 147 admin stranica + 25 public + showcase/home)
  mobile:   542 (src/* — 31 lib source + 248 mob-batch test + 263 komponente/ekrani)
  scripts:  30 (audit/*, standards/*)
Status: 1777 pokriveno testom / 432 popravljeno / 286 pregledano / 0 nepregledano
```

### 1.1 Backend — 446 fajlova po modulima

| Modul | Fajlova | Primjer | Paket |
|-------|---------|---------|-------|
| `auth`, `rbac`, `users` | 18 | `jwt.strategy.ts`, `rbac-seed.constants.ts` (6 rola) | **BE-02** → ostaje, ne seli se |
| `cms`, `news`, `gallery`, `media` | 52 | `cms-pages.service.ts`, `gallery.service.ts` | **BE-04** → ostaje |
| `clubs`, `players`, `competitions`, `rounds`, `matches`, `statistics` | 68 | `competitions.service.ts`, `matches.service.ts` | **BE-05** → ostaje |
| `live`, `realtime`, `newsletter`, `contact` | 42 | `live-clock-ops.service.ts`, `realtime.gateway.ts` | **BE-06** → ostaje |
| `membership`, `ticketing`, `payments`, `finance` | 48 | `paypal-ops.ts`, `ticketing.service.ts` | **BE-07** → ostaje |
| `dashboard`, `analytics`, `search`, `seo`, `showcase`, `museum`, `hall-of-fame`, `sponsors`, `trophies` | 64 | `dashboard.service.ts`, `search.service.ts` | **BE-08** → ostaje |
| `audit`, `settings`, `notifications`, `email-log`, `health`, `app-releases` | 38 | `audit.service.ts` | **BE-03/08** → ostaje |
| `common` (guards, filters, utils) | 34 | `permissions.guard.ts`, `pagination.util.ts` | **BE-01** → ostaje |
| `prisma` | 12 | `schema.prisma` (59 modela, Postgres) | ostaje |
| `test`, `jobs`, `cache` | 18 | `cache.module.ts` | ostaje |

> Backend se **ne seli** na Next — samo se dodaje `frontend-next` proxy. Svi BE fajlovi ostaju `popravljeno/pregledano`.

### 1.2 Frontend — 1473 fajla

| Grupa | Fajlova | Trenutni status | Paket |
|-------|---------|-----------------|-------|
| `pages/public` (javni sajt) | 25 + `home` | `popravljeno` / `pokriveno` (FE-03) | **P-NEXT-02a-d** (seli se 1:1 na Next `app/(public)`) |
| `pages/admin` (147 fajlova) | 147 | `popravljeno`/`pokriveno` (FE-04) | **P-DASH-02…06** (redizajn) |
| `components/ui` (shadcn) | 38 | `pokriveno` (FE-06, `sheet.test.tsx` itd.) | **P-DASH-01** (premium varijante) |
| `components/layout`, `components/admin` | 42 | `popravljeno` | **P-DASH-01** |
| `lib` (utils, api, permissions) | 28 | `pokriveno` (FE-06) | **P-NEXT-01** (dijeli se sa Next) |
| `hooks` | 18 | `pokriveno` | **P-NEXT-01** |
| `router` | 8 | `popravljeno` (F-04) | **P-NEXT-01** (postaje `app/` routing) |
| `test/doubles`, `e2e` | 120 | `pokriveno` | ostaju za Next |
| `index.css` (tokeni) | 1 | `FE-01` 327/327 | **ne dira se** — dijeli se |

**Javni sajt rute koje se sele:**
`/` → `app/(public)/page.tsx`
`/vesti`, `/vesti/:slug` → `app/(public)/vesti/`
`/utakmice`, `/uzivo/:id` → `app/(public)/utakmice/`
`/galerija`, `/klub`, `/muzej`, `/sponzori`, `/trofeji`, `/kontakt` → `app/(public)/...`
`/platforma` (showcase) → `app/(public)/platforma/`

**Admin rute koje se redizajniraju:**
`/admin` (dashboard) + `/admin/news`, `/gallery`, `/competitions`, `/clubs`, `/live`, `/ticketing`, `/membership`, `/finance`, `/media`, `/cms`, `/users`, `/roles`, `/analytics`, `/audit`, `/settings`, `/app-releases`, `/notifications`

### 1.3 Mobile — 542 fajla

| Grupa | Fajlova | Status | Paket |
|-------|---------|--------|-------|
| `src/lib` source (31) | `api.ts`, `html-text.ts`, `search-nav.ts`, `slugify.ts`, `permissions.ts`, `push.ts`, `realtime.ts`, `youtube-embed.ts`... | `pokriveno` (P-MOB) | **ne seli se**, ali se koristi kao izvor istine za paritet (`mob-batch89`) |
| `src/lib` test (248) | `mob-batch01…248.test.ts` | `pokriveno` | ostaju |
| `src/components` (263) | `Home*`, `League*`, `Live*`, `Membership*`, `News*` | `pokriveno` | ostaju |
| `app/` (Expo Router, 57 ekrana) | `app/(tabs)`, `app/staff` | `pokriveno` | ostaju |

> Mobilna ostaje **netaknuta**. Svaki Next PR mora proći `mobile` parity check.

### 1.4 Roles & Dashboards — 6 rola → 5 funkcionalnih dashboarda

| Rola | Dozvole (skraćeno) | Trenutni Home | Fajl | LOC | Paket |
|------|-------------------|---------------|------|-----|-------|
| **Administrator** | `ALL (41)` | `AdminHome.tsx` | 232 | `popravljeno` | **P-DASH-05** |
| **Moderator** | `dashboard.read, news/gallery/sponsors/trophies, cms/media, matches, live.approve, analytics...` (27) | `ModeratorHome.tsx` | 348 | `popravljeno` | **P-DASH-04** |
| **Writer** | `news.manage, news.submit, gallery.manage, media` | `WriterHome.tsx` | 232 | `popravljeno` | **P-DASH-02** |
| **Komentator** | `live.manage, matches.manage` | `CommentatorHome.tsx` + `CommentatorDeskList.tsx` + `LiveHero` | 280+55 | `popravljeno` | **P-DASH-03** |
| **Redar** | `admissions.scan` | nema Home (samo skener) | — | — | **P-DASH-06** |
| **Član** | `[]` (javna) | nema dashboard (javni sajt) | — | — | **P-PREMIUM-01** (Moj FK) |

KPI po roli (`dashboard-kpi-config.ts`):
- `Admin`: svih 15 KPI
- `Moderator`: `pendingNews, pendingGalleries, pendingLive, unreadInbox, activeMemberships, ticketsSold...`
- `Writer`: `pendingNews, publishedNews`
- `Komentator`: `matches, pendingLive`
- `Redar`: nema KPI, samo skener stats

---

## 2. Plan po paketima — koji fajl ide gdje

### Paket P-NEXT-01 — Setup (novi fajlovi, nema selidbe postojećih)
**Novi fajlovi:**
- `frontend-next/package.json`, `next.config.mjs`, `tsconfig.json`, `app/layout.tsx`, `app/globals.css` (import `../frontend/src/index.css`)
- `packages/ui/package.json` (ako se izdvaja)
**Dijeljeni (symlink/copy, ne move):** `frontend/src/index.css`, `frontend/src/lib/theme.tsx`, `frontend/src/lib/permissions.ts`
**CI novi job:** `frontend-next:build`

### Paket P-NEXT-02a — Home `/` (seli 8 fajlova)
`frontend/src/pages/home/*`, `frontend/src/pages/public/HomePage.tsx`, `frontend/src/components/home/*` (16 fajlova) → `frontend-next/app/(public)/page.tsx` + `components/home/*`
**Verifikacija:** `playwright` home, `axe` na home, `mobile` home parity

### Paket P-NEXT-02b — Vijesti (seli 12 fajlova)
`frontend/src/pages/public/News*`, `frontend/src/lib/html-content*`, `frontend/src/components/news/*` → `app/(public)/vesti/`
**Verifikacija:** SEO `metadata`, `htmlToParagraphs` parity (`mob-batch248`)

### Paket P-NEXT-02c — Utakmice/Live (seli 18 fajlova)
`frontend/src/pages/public/Live*`, `frontend/src/pages/public/Match*`, `frontend/src/lib/live-clock.ts`, `realtime.ts` → `app/(public)/uzivo/`
**Verifikacija:** `socket.io` e2e, `LiveClock` unit

### Paket P-NEXT-02d — Galerija/Klub/Muzej/Sponzori (seli 20 fajlova)
`frontend/src/pages/public/Gallery*`, `Club*`, `Museum*`, `Sponsors*`, `Trophies*` → `app/(public)/...`
**Verifikacija:** `axe`, `bundle`

### Paket P-DASH-01 — Design System (mijenja 38 fajlova)
`frontend/src/components/ui/*` (38) + `frontend/src/components/layout/AdminLayout.tsx` + `frontend/src/lib/theme.tsx`
**Ne dira:** `index.css`
**Verifikacija:** `component-check` 0% raw, `token-check` 327, `axe` 0 critical

### Paket P-DASH-02 — Writer Studio (mijenja 6 fajlova, dodaje 4)
Mijenja: `WriterHome.tsx`, `NewsEditorPage.tsx`, `NewsAdminPage.tsx`, `GalleryEditorPage.tsx`, `MediaPickerDialog.tsx`, `RichTextEditor.tsx`
Dodaje: `app/(admin)/writer/*`, `components/writer/Autosave.tsx`, `VersionHistory.tsx`
**Verifikacija:** `fe06-writer-home` 17t → 30t, `news.submit` e2e, `axe` na editoru

### Paket P-DASH-03 — Commentator Desk Pro (mijenja 8 fajlova)
Mijenja: `CommentatorHome.tsx`, `CommentatorLiveHero.tsx`, `CommentatorDeskList.tsx`, `LiveClock*`, `LiveStreamPlayer.tsx`, `LiveScoreboard.tsx`
Dodaje: `components/live/OfflineQueue.ts`, `KeyboardShortcuts.tsx`
**Verifikacija:** `live.manage` e2e, offline test, `socket` reconnect

### Paket P-DASH-04 — Moderator Command (mijenja 5 fajlova)
Mijenja: `ModeratorHome.tsx`, `GalleryAdminPage.tsx`, `NewsAdminPage.tsx` (moderator view), `SponsorsAdminPage.tsx`, `CmsHubPage.tsx`
**Verifikacija:** `gallery.approve`, `news.approve` e2e

### Paket P-DASH-05 — Admin Tower (mijenja 7 fajlova)
Mijenja: `AdminHome.tsx`, `DashboardPage.tsx`, `FinanceAdminPage.tsx`, `UsersRolesPage.tsx`, `AnalyticsPage.tsx`, `AuditPage.tsx`, `SettingsPage.tsx`
**Verifikacija:** `dashboard-kpi` 55t, `finance` 203t, `audit` e2e

### Paket P-DASH-06 — Redar Gate (novi + mobile)
Novi: `app/(admin)/admissions/page.tsx` (web), `mobile/app/(staff)/scan.tsx` premium
Mijenja: `ticketing-status.ts`, `qr.util.ts`
**Verifikacija:** `admissions.scan` e2e, QR offline, `maestro` skener

### Paket P-PREMIUM-01 — Fan & Commerce (novi 20 fajlova)
Novi: `app/(public)/moj-fk/*`, `app/(admin)/shop/*`, `app/(admin)/donations/*`, `components/loyalty/*`, `components/shop/*`
Novi BE: `shop`, `donations`, `loyalty` moduli (3 nova Prisma modela)
**Verifikacija:** `membership` + `ticketing` e2e + `Monri` webhook

---

## 3. Matrica rizika po paketu

| Paket | Rizik | Razlog | Mitigacija |
|-------|-------|--------|------------|
| P-NEXT-01 | Low | Novi app, ne dira prod | CI oba builda |
| P-NEXT-02a-d | Medium-High | Javni SEO/realtime | Screenshot diff + `next-preview` 2 sedmice |
| P-DASH-01 | Medium | Vidljiv dizajn | `axe` + `component-check` + flag |
| P-DASH-02…06 | Medium | RBAC | `PermissionRoute` test + flag off default |
| P-PREMIUM-01 | High | Novac | `Monri` sandbox + `finance` e2e |

---

## 4. Šta NE diramo u ovoj tranziciji

- `backend` — ostaje NestJS, nema migracije na Next API routes
- `mobile` — ostaje Expo, nema prelaska na Next
- `prisma/schema.prisma` — nema novih migracija osim P-PREMIUM-01 (shop/donations/loyalty)
- `index.css` tokeni — nema novih boja van palete

---

*Sljedeći dokument `IMPLEMENTATION_GUIDE.md` opisuje kako svaki paket mora izgledati (checklista, testovi, branch, CI).*
