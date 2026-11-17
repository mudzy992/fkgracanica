# A-02 — AdminHome — PLAN (2026-11-17, grana `arena/290a6f13-fkgracanica` @ `c3aaebb`)

> Planski dokument — bez koda. Slijedi template iz `ADMIN_PLAN_2026-11-17.md` §2. Implementacija tek nakon `ask_user approve`.

---

## Meta

| Polje | Vrijednost |
|-------|------------|
| Ruta | `/admin` (index `DashboardPage.tsx:11` → `AdminHome` kad `resolveStaffHome()==='admin'`) |
| Fajl(ovi) | `pages/admin/homes/AdminHome.tsx` (109 lin) · `pages/admin/dashboard-kpi-config.ts` (62 lin) · `pages/admin/homes/HomeQuickActions.tsx` (24 lin) · `pages/admin/homes/HomeKpiGrid.tsx` (14 lin, ne koristi se direktno) · `pages/admin/platform-status/PlatformStatusTeaser.tsx` (35 lin) · `hooks/index.ts:186 useDashboardKpis()` · `hooks/use-platform-status.ts` (13 lin) · `lib/permissions.ts:1 hasPermission` · `lib/staff-home.ts` · `lib/admin-styles.ts` · `types/index.ts:DashboardKpis` (15 polja) · `backend/dashboard/dashboard.controller.ts` + `dashboard.service.ts` |
| Rola/permisije | `resolveStaffHome` (`settings.read` \|\| `users.read` → admin, inače moderator/commentator/writer) · FE: `hasPermission(user.permissions,'finance.read')` za QuickActions · BE: `GET /dashboard/kpis` zahtijeva `@RequirePermissions('dashboard.read')` |
| API | `GET /dashboard/kpis` → `DashboardKpis` (15 brojeva) · `GET /platform-status` (teaser) |
| Stanje grane | `c3aaebb` docs(STATE) B-FE07 2307/2307 + B-FE08 pauza, `check:all 10/10`, `CI 44129376891 6/6` |

---

## 1) Šta radi danas (činjenično, bez ocjene)

**Render stablo `AdminHome.tsx:62-108`:**
```
Seo
PlatformStatusTeaser (rendera se uvijek, iznad naslova)
h1 admin.home.title + p admin.home.subtitle
if isError → <div> kpiError + Button retry (void refetch())
else if isLoading || !data → <p> admin.common.loading
else → h2 queue + KpiRow(QUEUE_KPI_KEYS) + h2 health + KpiRow(HEALTH_KPI_KEYS) + HomeQuickActions(actions)
```

**`KpiRow:19-44`:** za svaki `key` iz `QUEUE_KPI_KEYS (4)` / `HEALTH_KPI_KEYS (4)` vadi `Icon=KPI_ICONS[key]`, `href=KPI_ROUTES[key]`, `value=data[key]`, gradi `Card` sa `title = t('admin.kpi.<key>', defaultValue: KPI_LABELS[key] ?? key)`, `value` i `open` link-tekstom. Ako `href` postoji → omota `Link`, inače `div`.

**`HomeQuickActions:12-21`:** `flex flex-wrap gap-1.5`, mapira `items` (4 fiksno: `/admin/cms`, `/admin/users`, `/admin/settings`, `/admin/live/pending` + uslovno 5. `finance.read → /admin/finance`).

**`PlatformStatusTeaser:13-33`:** `enabled = hasPermission(dashboard.read)`, `usePlatformStatus(enabled)`, `if (!enabled || !data) return null`, inače `Link /admin/stanje` + `Card` sa `PercentRing`.

**`useDashboardKpis:186-190`:** `useQuery({ queryKey:['dashboard','kpis'], queryFn: api.get<DashboardKpis>('/dashboard/kpis') })` — bez `enabled`, `staleTime`, `retry`, `select`.

**`usePlatformStatus:5-11`:** `useQuery({ queryKey:['admin','platform-status'], queryFn: api.get('/platform-status'), enabled })` — teaser proslijeđuje `enabled`, AdminHome ne proslijeđuje ništa za KPIs.

**Backend `DashboardService:getKpis()`:** `Promise.all` 13 `prisma.*.count` + `analytics.getTotals(30)` → 15 polja. Ako jedan `count` pukne, cijeli endpoint puca (nema try/catch po stavci).

---

## 2) Šta bi trebala da radi (očekivano — profesionalni standard za admin home)

* **Korisnik:** admin koji za <30s mora vidjeti *šta gori* (queue) i *šta je zdravo* (health), plus 1-klik akcije. Nije CRM, nego komandna tabla.
* **Ugovor:**
  * Queue (4): `pendingMemberships, pendingNews, pendingLive, unreadInbox` — svaki je **broj zadataka na čekanju**, mora biti link ka listi filtriranoj na `pending/unread`.
  * Health (4): `activeMemberships, ticketsSold, publishedNews, uniqueVisitorsTotal30d` — **zdravlje sistema**, link ka detalju.
  * Teaser platforme je *sekundaran* — ne smije gurati naslov ispod folda i ne smije nestati na erroru KPI-a.
  * Sve KPI kartice i QuickActions moraju poštovati **permisiju cilja**, ne samo izvorni `dashboard.read`. Admin ih danas ima sve, ali ugovor mora vrijediti i kad se permisije suze.
* **Ponašanje:**
  * `loading` → skeleton grid 4+4 (ne plain `<p>loading</p>`), sa `aria-busy`, bez layout shift-a.
  * `error` → `role="alert"` + poruka + `Retry` sa `isFetching` feedbackom, **ali uz sačuvan naslov/subtitle/teaser**.
  * `empty/0` → `0` je validno, ali `undefined` (npr. backend vrati `null`) mora prikazati `—` i ne smije napraviti `NaN`/`undefined` link.
  * `forbidden` (403 na `/dashboard/kpis`) → poruka "nedovoljno dozvola" bez retry loop-a, bez curenja podataka iz prethodnog `data`.
  * `stale` → `lastUpdated` timestamp + `refetch` interval (npr. 60s) ili `onWindowFocus` bez flickera.
* **A11y/i18n/perf:**
  * `Seo` title uvijek renderan, `h1` prvi u DOM-u (ne teaser).
  * KPI `Link` sa `aria-label="Korisnici: 120, otvori"`, `tabular-nums`, `focus-visible:ring`.
  * `t('admin.kpi.*')` bez duplikacije `KPI_LABELS` hardkoda.
  * Jedan `useDashboardKpis` poziv (ne Teaser+Home dupli fetch), `enabled` po `dashboard.read`, `staleTime 30s`, `retry 1`.

---

## 3) Propusti — klasifikacija

### P1 — blokator / sigurnosni / funkcionalni (mora odmah)

**P1-1 — KPI linkovi ne poštuju permisiju cilja**
* Gdje: `AdminHome.tsx:19-44 KpiRow` + `dashboard-kpi-config.ts:9 KPI_ROUTES` — `href` se uzima bez provjere, `Link` se rendera uvijek kad `KPI_ROUTES[key]` postoji.
* Zašto P1: danas admin ima sve pa ne curi, ali čim se suzi `news.read` ili `finance.read`, `AdminHome` će linkati `/admin/finance` i `/admin/news` korisniku koji nema pravo da ih vidi. To je funkcionalni propust + UX zamka (404/forbidden nakon klika) i potencijalno otkrivanje postojanja modula.
* Repro: makni `news.approve` adminu, ostavi `dashboard.read` — KPI `pendingNews` i dalje linka `/admin/news` iako nema pristup.

**P1-2 — `useDashboardKpis` bez `enabled` + error early-return gubi kontekst**
* Gdje: `hooks/index.ts:186` — nema `enabled: hasPermission(...,'dashboard.read')`; `AdminHome.tsx:76-83` — `if (isError) return <div>kpiError+retry</div>` bez `Seo`, bez `h1`, bez `PlatformStatusTeaser`.
* Zašto P1: ako backend vrati 403 (nema `dashboard.read`), FE će retry-ati u loop-u, a korisnik vidi samo centriranu grešku bez naslova i bez objašnjenja da nema dozvolu. Teaser koji bi mogao objasniti status platforme nestaje.
* Repro: ulogiran `writer` direktno otvori `/admin` (bypass `resolveStaffHome` npr. deep link) — `AdminHome` se ne bi trebao mount-ati, ali ako se mount-a, fetcha bez guard-a.

**P1-3 — `value` može biti `undefined` i rendera prazno**
* Gdje: `AdminHome.tsx:32 value = data[key as keyof DashboardKpis]` — nema fallbacka na `0`/`—`; `KpiRow` prikazuje `<p> {value} </p>` pa `undefined` daje prazno polje.
* Zašto P1: `DashboardService` vraća 15 brojeva, ali ako `analytics.getTotals(30)` pukne ili vrati `null`, cijeli `Promise.all` puca i FE pada u error; ako backend doda novo polje a FE ne ažurira tip, `data[newKey]` je `undefined` a kartica izgleda pokvareno. Korisnik ne zna da li je 0 ili greška.
* Repro: mock `data = { pendingNews: undefined }` — kartica prikazuje prazan `<p>` umjesto `0` ili `—`.

### P2 — nekonzistentnost / loša praksa (radi ali se ne radi tako)

**P2-1 — loading je plain text, ne skeleton, sa CLS-om**
* Gdje: `AdminHome.tsx:93-95 {isLoading || !data ? <p>loading</p> : <>queue+health</>}` — dok se učitava, nema ni `h2 queue/health` ni grid-a, pa se layout uruši pa skoči.
* Zašto P2: profesionalno je skeleton 4+4 kartice sa `aria-busy`, sačuvana visina, `animate-pulse`. Test `fe06-admin-home.test.tsx:34` očekuje plain text — test je prilagođen lošem ponašanju.

**P2-2 — error stanje bez `role="alert"` i bez `isFetching`**
* Gdje: `AdminHome.tsx:76-83` — `div` bez `role="alert"`/`aria-live`, `Button onClick={() => void refetch()}` bez `disabled={isFetching}`/`aria-busy`.
* Zašto P2: a11y i UX — screen reader ne najavljuje grešku, dupli klik na retry može izazvati dupli fetch.

**P2-3 — dupli fetch i pogrešan redoslijed DOM-a**
* Gdje: `AdminHome.tsx:71-73 PlatformStatusTeaser` renderan **iznad** `h1`; `PlatformStatusTeaser.tsx:13 usePlatformStatus(enabled)` + `useDashboardKpis` → dva odvojena `GET` (kpis + platform-status) bez shared `staleTime`.
* Zašto P2: SEO/a11y — `h1` mora biti prvi; perf — dva fetch-a bez `staleTime 30s` znači dupli hit na svaki mount. Teaser bi trebao biti ispod naslova ili u desnom stupcu.

**P2-4 — hardkod `KPI_LABELS` + `t()` duplikacija**
* Gdje: `dashboard-kpi-config.ts:18 KPI_LABELS` i `AdminHome.tsx:42 t('admin.kpi.${key}', {defaultValue: KPI_LABELS[key] ?? key})` — label živi na dva mjesta.
* Zašto P2: drift — prevod u `translation.json` i hardkod se razilaze, a test `fe06-admin-home-variants` mora mock-ati config da testira fallback.

**P2-5 — `HomeQuickActions` bez permisije za CMS/Users/Settings/LivePending**
* Gdje: `AdminHome.tsx:67-71` 4 fiksne akcije bez provjere, samo 5. `finance.read` je uslovno.
* Zašto P2: leži na pretpostavci da admin ima sve; ali `ModeratorHome`/`WriterHome` bi trebali imati isti guard — nedosljedno.

**P2-6 — `useDashboardKpis` bez `staleTime`/`retry`/`select`**
* Gdje: `hooks/index.ts:186` — `staleTime 0`, `retry` default 3, `refetchOnWindowFocus true` → svaki tab focus refetcha 13 count-ova.
* Zašto P2: nepotreban pritisak na DB; treba `staleTime 30_000`, `retry 1`, `refetchOnWindowFocus: false`.

### P3 — UX/polish (radi, ali može profesionalnije)

**P3-1 — `adminLinkClass` hover bez `focus-visible` na kartici**
* `KpiRow:54 Link className="block rounded-xl focus-visible:ring..."` — ok, ali `Card` unutar ima `hover:border-primary/25` bez `group-hover` sinkronizacije.

**P3-2 — nema `lastUpdated` ni auto-refresh**
* Korisnik ne zna koliko su KPI-evi svježi; profesionalno: mali `Ažurirano prije 2 min • Osvježi` ispod grid-a.

**P3-3 — `QUEUE` vs `HEALTH` h2 stil `text-sm font-semibold text-text-muted` — premalo hijerarhije**
* Treba `text-xs uppercase tracking-widest` ili divider, da se queue (akcija) vizuelno odvoji od health (stanje).

**P3-4 — `HomeQuickActions` wrap bez `aria-label`**
* `div mt-6 flex flex-wrap gap-1.5` — bez `nav`/`aria-label="Brze akcije"`.

---

## 4) Dokazi (file:line)

* `AdminHome.tsx:32` — `value = data[key as keyof DashboardKpis]` bez `?? '—'`
* `AdminHome.tsx:42-44` — `KPI_LABELS[key] ?? key` fallback, ali `value` nema fallback
* `AdminHome.tsx:54-60` — `href ? <Link> : <div>` — nema provjere permisije za `href`
* `AdminHome.tsx:67-74` — `actions` 4 fiksno + `if (hasPermission(...finance.read))` — nedosljedno
* `AdminHome.tsx:76-83` — `if (isError) return <div>kpiError+retry</div>` — early return bez `Seo`/`h1`/`Teaser`
* `AdminHome.tsx:93-95` — `{isLoading || !data ? <p>loading</p> : ...}` — plain text
* `AdminHome.tsx:99` — `<PlatformStatusTeaser />` iznad `h1` — redoslijed
* `hooks/index.ts:186-190` — `useDashboardKpis()` bez `enabled/staleTime/retry`
* `dashboard-kpi-config.ts:9-16` — `KPI_ROUTES` hardkod bez permisije
* `backend/dashboard/dashboard.service.ts:18-54` — `Promise.all` 13 count-ova bez pojedinačnog try/catch, `analytics.getTotals(30)` može srušiti sve
* `PlatformStatusTeaser.tsx:13-18` — `enabled = hasPermission(dashboard.read)` ispravno, ali `AdminHome` nema isti guard za KPIs

---

## 5) Predloženi plan — bez koda (šta će se dirati)

| Korak | Fajl | Promjena | Rizik | Test |
|-------|------|----------|-------|------|
| 1 | `backend/dashboard/dashboard.service.ts` | Pojedinačni try/catch po `count` + `analytics` fallback na `0` (ne ruši cijeli `Promise.all`), loguj grešku | nizak | BE unit: mock `analytics.getTotals` throw → vrati `0` |
| 2 | `frontend/src/hooks/index.ts` | `useDashboardKpis(enabled?:boolean)` → `useQuery({ enabled: enabled ?? hasPermissionInHook, staleTime:30_000, retry:1, refetchOnWindowFocus:false })` | nizak | hook test: `enabled:false` ne fetch-a |
| 3 | `frontend/src/pages/admin/dashboard-kpi-config.ts` | Dodaj `KPI_PERMISSIONS: Record<string,string>` (npr. `ticketsSold:'finance.read'`, `pendingNews:'news.read'`) i helper `canViewKpi(key, perms)` | nizak | unit za helper |
| 4 | `frontend/src/pages/admin/homes/AdminHome.tsx` | a) `enabledDashboard = hasPermission(dashboard.read)` → `useDashboardKpis(enabledDashboard)` b) `usePlatformStatus` ostaje c) Pomjeri `PlatformStatusTeaser` ispod `h1/p` ili u `aside` d) `isError` ne radi early return — rendera `Seo+h1+Teaser` + `role="alert"` + `Button disabled={isFetching}` | srednji | test error sa naslovom i alertom |
| 5 | `frontend/src/pages/admin/homes/AdminHome.tsx` `KpiRow` | `value ?? '—'`, `href` samo ako `canViewKpi(key, perms)` i `KPI_ROUTES[key]` postoji, inače `div`; `aria-label={`${label}: ${value}`}`; `tabular-nums` ostaje | srednji | test: `pendingNews` bez `news.read` → nema Link-a, vrijednost `—` |
| 6 | `frontend/src/pages/admin/homes/AdminHome.tsx` | `isLoading || !data` → `KpiSkeletonGrid` (4+4 `Card` sa `animate-pulse`, `aria-busy="true"`) | nizak | test loading skeleton |
| 7 | `frontend/src/pages/admin/homes/HomeQuickActions.tsx` | Dodaj `nav aria-label="Brze akcije"`, `actions` filtriraj po permisiji i za CMS/Users/Settings/LivePending (ne samo finance) | nizak | test: bez `settings.read` nema Settings linka |
| 8 | `frontend/src/pages/admin/homes/AdminHome.tsx` | Dodaj `lastUpdated` ( `dataUpdatedAt` iz `useDashboardKpis` ) + `Osvježi` dugme sa `isFetching` | nizak | test lastUpdated |
| 9 | `frontend/src/lib/admin-styles.ts` | Nema promjene — koristi postojeći `adminLinkClass` |
| 10 | `frontend/src/pages/admin/homes/fe06-admin-home*.test.tsx` | Dopuni testove za 4 stanja + permisije + a11y (`role="alert"`, `aria-busy`) — ne briši postojeće | — | `check:all 10/10` |

**Šta se NE dira u ovom koraku:** `DashboardPage.tsx` (dispatcher ostaje 8 linija), `types/DashboardKpis` (nema schema promjene), `router` (permisija ostaje na BE, FE samo skriva link).

---

## 6) Alternativa (zašto ne drugačije)

* **Ne dirati BE `Promise.all` nego ostaviti da puca cijelo:** odbačeno — jedan `analytics` timeout ne smije srušiti 12 brojčanih KPI-eva. Fallback `0` je sigurniji i loguje se.
* **Ne dodavati `KPI_PERMISSIONS` nego osloniti se na `admin` rolu:** odbačeno — `resolveStaffHome` se može promijeniti, a `AdminHome` će i dalje cureti linkove; eksplicitna mapa je 1 izvor istine.
* **Skeleton umjesto plain text:** plain text je brži za napisati ali je CLS i a11y loš — skeleton je standard za dashboard-e.

---

## 7) Kriterijumi gotovosti (DoD)

- [ ] P1-1..P1-3 zatvoreni + testovi koji padaju bez fixa (KPI link bez permisije, error sa naslovom+alert, `undefined` → `—`)
- [ ] P2-1..P2-6 zatvoreni: skeleton, `role="alert"` + `disabled isFetching`, `h1` ispred teasera, `staleTime/retry/enabled` na hooku
- [ ] `HomeQuickActions` permisije konzistentne
- [ ] `check:all 10/10`, `tsc -b` čist, `axe` bez kršenja na `/admin` (admin)
- [ ] `AUDIT/COVERAGE_MATRIX.csv` + `AUDIT/STATE.md` ažurirani, `CI 6/6` na `arena/290a6f13-fkgracanica`
- [ ] Nema promjene ponašanja za admina koji ima sve permisije (vizuelno isto, ali ispravnije ispod haube)

---

## 8) Otvorena pitanja za tebe (ask_user prije koda)

**Q1 — KPI permisije:** Da li želiš da `ticketsSold → finance.read`, `pendingNews → news.read`, `pendingGalleries → gallery.read`, `pendingLive → live.read`, `unreadInbox → comms.read`, `uniqueVisitors* → analytics.read` budu **striktno** skriveni kao `div` bez linka ako nema permisiju, ili da budu vidljivi ali disabled sa tooltipom "Nema dozvolu"? Predlažem **skriven link (div)** — manje zabune.

**Q2 — Redoslijed:** Da li `PlatformStatusTeaser` ostaje iznad naslova (danas) ili da ga spustim ispod `subtitle` kao sekundarni info? Predlažem **ispod subtitle-a**.

**Q3 — Auto-refresh:** Da li KPI-evi trebaju `refetchInterval 60s` ili samo `Osvježi` dugme? Predlažem **samo dugme + `lastUpdated`**, bez intervala da ne opterećujemo DB.

> Ako odobriš ovaj plan (ili `approve_with_comments`), sljedeći korak je implementacija A-02 po tabeli iznad — jedan PR, dio po dio, uz `gh run watch` do `6/6`.
