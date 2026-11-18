# A-06 — PlatformStatusPage + PlatformStatusTeaser + Hero/GroupCard — PLAN (2026-11-18, grana `arena/290a6f13-fkgracanica` @ `a6ca9ee`)

> Planski dokument — bez koda. Slijedi template iz `ADMIN_PLAN_2026-11-17.md` §2. Implementacija tek nakon `ask_user approve`.

---

## Meta

| Polje | Vrijednost |
|-------|------------|
| Ruta | `/admin/stanje` (index `app-routes.tsx:68` → `<PermissionRoute permission="dashboard.read"><PlatformStatusPage />`) — sekundarno `/admin` teaser `AdminHome.tsx:128` `<PlatformStatusTeaser />` (link `/admin/stanje`) |
| Fajl(ovi) | `pages/admin/platform-status/PlatformStatusPage.tsx` (50 lin) · `PlatformStatusTeaser.tsx` (33 lin) · `PlatformStatusHero.tsx` (35 lin) · `StatusGroupCard.tsx` (54 lin) · `PercentRing.tsx` (37 lin) · `group-meta.ts` (22 lin) · `types.ts` (10 lin) · `hooks/use-platform-status.ts` (11 lin) · `router/app-routes.tsx:21,68` · `locales/bs+en/common.json:admin.stanje*` (11 ključeva) |
| Rola/permisije | `dashboard.read` — FE ruta `PermissionRoute`, hook `enabled` samo u Teaseru (`hasPermission(user.permissions,'dashboard.read')`), `PlatformStatusPage` fetcha bez `enabled` (trenutno svaki admin koji dođe do rute, ali ruta je već gated) |
| API | `GET /platform-status` (`usePlatformStatus() → GET /platform-status`) — 1 query; backend `showcase/catalog-modules.ts` → `ShowcaseModule[]` + `overallPercent/counted/afterLaunch/counts` |
| Stanje grane | `arena/290a6f13-fkgracanica` @ `a6ca9ee` (A-05 zatvoren 44284677961 6/6 `check:all 10/10`, `CommentatorHome` 240L + `DeskList` 91L + `LiveHero` motion-safe, `bundle-budget` 613854, `file-size` 24L, `WriterHome` 231L, `ModeratorHome` 347L, `AdminHome` 100%) |

---

## 1) Šta radi danas (činjenično, bez ocjene)

**Render stablo `PlatformStatusPage.tsx:10-50`:**
```
const {data,isLoading,isError,refetch} = usePlatformStatus() // GET /platform-status bez staleTime/retry/options

if isError → <div flex-col center gap-4 py-12> + <p text-text-muted>{t('admin.stanjeError')}</p> + <Button outline onClick={() => void refetch()}>{t('admin.stanjeRetry')}</Button>
else → <> <Seo title={t('admin.stanje')} /> <div mb-6><h1 stanje/><p stanjeHint/></div> {isLoading||!data ? <Skeleton h-40 w-full/> : <div space-y-6><PlatformStatusHero data={data}/><div grid md2 xl4>{GROUP_KEYS.map → <StatusGroupCard label={t(labelKey)} modules={data.modules.filter(badge)} />}</div></div> }>
```

**`use-platform-status.ts:5-11`:** `useQuery({queryKey:['admin','platform-status'], queryFn: api.get<PlatformStatusPayload>('/platform-status'), enabled})` — prima `enabled=true` default, nema `staleTime`, `retry`, `refetchOnWindowFocus:false`. `PlatformStatusPage` zove `usePlatformStatus()` bez arg (enabled true), `PlatformStatusTeaser` zove `usePlatformStatus(enabled)` gdje `enabled = hasPermission(dashboard.read)`.

**`PlatformStatusHero.tsx:15-35`:** `Card` sa `PercentRing percent={data.overallPercent}` + caption `stanjeRingCaption` + 4 `Stat` (`stanjeCounted/counted`, `stanjeAfter/afterLaunch`, `stanjeReady/counts.ready`, `stanjeInProgress/counts.in_progress`) — bez `isLoading` prop-a, rendera samo kad `data` postoji.

**`StatusGroupCard.tsx:33-54`:** `Card` sa `CardHeader` label + `modules.length` tabular-nums, `CardContent` → ako `modules.length` → `<ul><ModuleRow key=mod.id/></ul>` else `<p>{t('admin.stanjeEmpty')}</p>`. `ModuleRow` prikazuje `title`, `percent%`, `Bar` (`BAR_CLASS[badge]`), `summary`, `surfaces join`. `<ul>` bez `aria-label`, `li` bez guard-a za `percent` scope.

**`PercentRing.tsx:1-37`:** `svg -rotate-90` dva `circle` (border-subtle + currentColor) + center `p {percent}% tabular-nums`. `svg aria-hidden`, nema `role=progressbar` ni `aria-valuenow`.

**`PlatformStatusTeaser.tsx:9-33`:** `const enabled = hasPermission(dashboard.read); const {data}=usePlatformStatus(enabled); if(!enabled||!data) return null;` → `Link to="/admin/stanje" focus-visible:ring` sa `Card PercentRing size72 + stanje/stanjeTeaser`.

**`group-meta.ts:3-21`:** `GROUP_KEYS` 4 badge→labelKey, `SURFACE_LABELS` 3, `BAR_CLASS` 4.

**`Test fe06-platform-status-page.test.tsx:104`:** 5 testova — `isError` → `stanjeError` + retry + `queryByRole heading null` (cementira gubitak Seo/h1), `naslov SEO+heading`, `isLoading` → skeleton bez heroja, `!data` → skeleton, `data` → hero + 4 card-a filtrirano.

---

## 2) Šta bi trebala da radi (očekivano — profesionalni standard za status platforme)

* **Korisnik:** admin/product owner koji za <10s mora **vidjeti ukupnu spremnost** (`overallPercent`), koliko modula je `ready/in_progress/web_only/after_launch`, i **otvoriti katalog** po grupi. Teaser na `/admin` je shortcut do `/admin/stanje`.
* **Ugovor:**
  * `PlatformStatusPage` je **admin-only** (`dashboard.read`) — ruta već gated, hook treba `enabled` po istoj permisiji (kao Teaser) + `staleTime 30s`/`retry 1`/`refetchOnWindowFocus:false`.
  * 4 stanja: `loading → skeleton sa aria-busy`, `error → role=alert + retry disabled isFetching`, `empty/!data → skeleton ili empty` (danas `isLoading||!data` → 1 Skeleton h-40, treba grid skeleton), `success → Hero + 4 GroupCard`.
  * `Hero` je **brojač spremnosti** — `overallPercent` + 4 stat-a — treba `tabular-nums`, `aria-label`/`progressbar` za ring.
  * `GroupCard` je **grupisani katalog** — filter `badge`, svaki `<ul>` sa `aria-label`, `li` sa `percent` guard, empty `role=status`.
* **Ponašanje:**
  * `loading` → skeleton `Hero` + 4 `GroupCard` skeletona sa `aria-busy="true"` (kao `KpiSkeletonGrid`), sačuvana visina; danas 1 `Skeleton h-40 w-full`.
  * `error` → `role="alert"` + `admin.stanjeError` + `Retry` sa `disabled={isFetching}` uz **sačuvan** `Seo`/`h1`/`hint` i bez brisanja headera (danas early return briše `Seo` i `h1`).
  * `forbidden` (403 na `/platform-status`) → poruka bez retry loop-a, bez curenja prethodnog `data`.
  * `stale` → `lastUpdated` + `Osvježi` dugme ili `staleTime 30s` + `enabled`.
* **A11y/i18n/perf:**
  * `Seo` title uvijek renderan, `h1` prvi u DOM-u (danas `isError` nema Seo/h1).
  * `Retry` sa `aria-label`, `focus-visible:ring`, `disabled isFetching`.
  * `PercentRing` treba `role=progressbar` + `aria-valuenow` ili `aria-label`.
  * `StatusGroupCard ul` sa `aria-label={label}`, `Skeleton` sa `aria-busy`.
  * `usePlatformStatus` sa `staleTime 30_000`, `retry 1`, `refetchOnWindowFocus:false`.
  * 1 fetch na mount bez `staleTime` → nepotreban pritisak; treba share `queryKey`.

---

## 3) Propusti — klasifikacija

### P1 — blokator / sigurnosni / funkcionalni (mora odmah)

**P1-1 — `PlatformStatusPage` error early return briše `Seo`/`h1` i nema `role=alert`/`isFetching`**
* Gdje: `PlatformStatusPage.tsx:14-21` — `if (isError) return <div><p>stanjeError</p><Button retry/></div>` bez `Seo`, bez `h1`, bez `role="alert"`, bez `disabled={isFetching}`.
* Zašto P1: admin na grešci gubi naslov i SEO, screen reader ne najavljuje error, `Retry` bez `isFetching` omogućava dupli fetch. Isti obrazac zatvoren u A-02..A-05 (`role=alert` + `disabled`).
* Repro: mock `isError:true` → `heading stanje` null, `getByText stanjeError` bez `role=alert`, klik retry dok `isFetching:true` ne disable.
* Test cementira loše: `fe06-platform-status-page.test.tsx:62-67 expect(heading null)` + bez `role=alert`.

**P1-2 — `usePlatformStatus` nema `staleTime`/`retry`/`refetchOnWindowFocus`, `PlatformStatusPage` nema `enabled` po permisiji**
* Gdje: `hooks/use-platform-status.ts:5-11` — `useQuery({queryKey, queryFn, enabled})` bez `staleTime/retry/refetchOnWindowFocus`; `PlatformStatusPage.tsx:12` zove bez `enabled`.
* Zašto P1: svaki tab focus refetcha `/platform-status` sa default `retry 3` i `staleTime 0`; nekonzistentno sa Teaserom koji ima `enabled` + sa A-02..A-05 (svi `staleTime 30k retry1 refetch false enabled`).
* Dokaz: `use-platform-status.ts:5`.

**P1-3 — Loading je 1 `Skeleton h-40` bez `aria-busy`, bez Hero/GroupCard skeleton grida**
* Gdje: `PlatformStatusPage.tsx:33 <Skeleton h-40 w-full/>` umjesto `HeroSkeleton` + `GroupCardSkeleton` grida.
* Zašto P1: CLS i a11y loš — `KpiSkeletonGrid aria-busy` je standard (A-02..A-05); jedan skeleton ne čuva layout grida 4.
* Test cementira loše: `fe06-platform-status-page.test.tsx:78 expect(skeleton).length 1`.

### P2 — nekonzistentnost / loša praksa (radi ali se ne radi tako)

**P2-1 — `usePlatformStatus` bez `options` overload (ne prima `UseQueryOptions`)**
* Gdje: `hooks/use-platform-status.ts:5 enabled=true` — ne prima `options?: UseQueryOptions` kao `useNewsList`/`useGalleryList` nakon A-04. Nema `...options`.
* Zašto P2: ne može se forward-ati `staleTime/retry/enabled` konzistentno; treba `usePlatformStatus(options?)` + `...options` spread.

**P2-2 — Loading state `isLoading || !data` spaja dva stanja, nema `isFetching`**
* Gdje: `PlatformStatusPage.tsx:33 {isLoading || !data ? <Skeleton/> : <div>...}` — spaja `isLoading` i `undefined data` (npr. `stale` + refetch).
* Zašto P2: profesionalno `isLoading ? skeleton : data ? content : empty` + `isFetching` za `Osvježi`.

**P2-3 — `PercentRing` nema `role=progressbar` / `aria-valuenow`**
* Gdje: `PercentRing.tsx:8 <svg aria-hidden>` + `p {percent}%`.
* Zašto P2: a11y — screen reader ne zna da je to progress. Treba `role=progressbar` + `aria-valuenow={percent}` ili `aria-label`.

**P2-4 — `StatusGroupCard ul` bez `aria-label`, `li` bez `key` guard?**
* Gdje: `StatusGroupCard.tsx:43 <ul>` bez `aria-label={label}`, `ModuleRow 10 <li>` bez test id-a.
* Zašto P2: screen reader ne zna da je to grupa `Spremno`/`U toku`.

**P2-5 — `PlatformStatusTeaser` nema `aria-busy`/`skeleton`, vraća `null` i bez `data` i bez `enabled`**
* Gdje: `PlatformStatusTeaser.tsx:13 if(!enabled||!data) return null;` — nema loading skeleton, nema error.
* Zašto P2: nije blokator jer je teaser na AdminHome (admin već ima KPI skeletons), ali konzistentno bi bio `null` dok `isLoading`?

**P2-6 — Nema `lastUpdated`/`Osvježi` kao Writer/Moderator/Commentator**
* Gdje: `PlatformStatusPage.tsx` nema `dataUpdatedAt` + `Button Osvježi` ispod headera.
* Zašto P2: admin ne zna koliko je status svjež; `staleTime 30s` bez dugmeta je ok, ali dugme je standard za home-ove.

### P3 — UX/polish (radi, ali može profesionalnije)

**P3-1 — `GroupCard` count `modules.length` bez `tabular-nums`?**
* Već ima `tabular-nums` — ok, ali header `flex-row items-baseline` mogao bi `aria-label`.

**P3-2 — `PlatformStatusHero` Stat bez `aria-label`**
* 4 Stat-a imaju `label` + `value tabular-nums` — dovoljno, ali `value` mogao `role=status`.

**P3-3 — `statusEmpty` tekst centriran?**
* `StatusGroupCard 51 <p text-sm text-muted>` — ok.

---

## 4) Dokazi (file:line)

* `PlatformStatusPage.tsx:14-21` — `if isError return` bez `Seo/h1/role=alert/disabled` — P1-1
* `PlatformStatusPage.tsx:12` — `usePlatformStatus()` bez `enabled` — P1-2
* `PlatformStatusPage.tsx:33` — `<Skeleton h-40 w-full>` bez `aria-busy`, 1 umjesto grida — P1-3, P2-2
* `hooks/use-platform-status.ts:5-11` — bez `staleTime/retry/refetchOnWindowFocus/options` — P1-2, P2-1
* `PercentRing.tsx:8` — `aria-hidden` bez `progressbar` — P2-3
* `StatusGroupCard.tsx:43` — `<ul>` bez `aria-label` — P2-4
* `fe06-platform-status-page.test.tsx:62-67` — `heading null` + bez `role=alert` — cementira P1-1

---

## 5) Predloženi plan — bez koda (šta će se dirati)

| Korak | Fajl | Promjena | Rizik | Test |
|-------|------|----------|-------|------|
| 1 | `frontend/src/hooks/use-platform-status.ts` | Pretvori u `usePlatformStatus(options?: UseQueryOptions<PlatformStatusPayload>)` — `useQuery({queryKey:['admin','platform-status'], queryFn, staleTime:30_000, retry:1, refetchOnWindowFocus:false, ...options})` + `enabled: options?.enabled ?? true` (kao `useNewsList`) | nizak | hook test: `enabled:false` ne fetch-a, `staleTime` |
| 2 | `frontend/src/pages/admin/platform-status/PlatformStatusPage.tsx` | a) `const {user}=useAuth(); const enabled = hasPermission(user?.permissions,'dashboard.read')` b) `const {data,isLoading,isError,isFetching,dataUpdatedAt,refetch}=usePlatformStatus({enabled})` c) `lastUpdated` string + `Osvježi` dugme (`admin.home.refresh/lastUpdated`) ispod `h1`/`hint` | srednji | bez `dashboard.read` ne fetch-a, nema `refetch` |
| 3 | `frontend/src/pages/admin/platform-status/PlatformStatusPage.tsx` `isError` | Zamijeni early return: uvijek renderaj `<> <Seo/><h1/><p hint/>{isError ? <div role="alert" aria-live="polite"><p stanjeError/><Button retry disabled={isFetching}>... | srednji | mock `isError:true` → `role=alert` + `heading` ostaje + `disabled isFetching` |
| 4 | `frontend/src/pages/admin/platform-status/PlatformStatusPage.tsx` `isLoading` | Umjesto 1 Skeletona: `isLoading ? <div aria-busy="true"><HeroSkeleton/><GroupSkeletonGrid count=4/></div>` — `HeroSkeleton` = `Skeleton h-40` + `GroupSkeletonGrid` 4× `Card Skeleton h-32` | nizak | loading skeleton `aria-busy`, `queryByText hero===null` |
| 5 | `frontend/src/pages/admin/platform-status/PercentRing.tsx` | Dodaj `role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={percent+ %}` na wrapper `div` (svg ostaje `aria-hidden`) | nizak | a11y test `getByRole('progressbar')` |
| 6 | `frontend/src/pages/admin/platform-status/StatusGroupCard.tsx` | `ul aria-label={label}` + `li` već ima `key`, empty `p role=status` | nizak | `getByLabelText(label)` |
| 7 | `frontend/src/pages/admin/platform-status/PlatformStatusTeaser.tsx` | Već permission-gated (`hasPermission dashboard.read`) — zadrži; eventualno dodaj `staleTime` preko hooka (automatski) — ne dirati logiku `null` |
| 8 | `frontend/src/pages/admin/platform-status/fe06-platform-status-page.test.tsx` + `fe06-platform-status-variants.test.tsx` (novi) | Dopuni testove za 4 stanja + permisije + a11y (`role=alert`, `aria-busy`, `progressbar`, `aria-label`, `lastUpdated`, `refetch`) — ne briši postojeće, dodaj `enabled`, `kpiError` s `heading`, `skeleton aria-busy`, `lastUpdated` | — | `check:all 10/10` |
| 9 | `scripts/standards/baselines/file-size.txt` | Ako `PlatformStatusPage.tsx` pređe 200 lin (očekivano ~120) — ne treba baseline, ali provjeri `check:all` | nizak | `check:all` |
| 10 | `frontend/src/locales/bs+en/common.json` | Provjeri `admin.home.refresh/lastUpdated` već postoje iz A-05 — ne treba novi ključ; `admin.stanje*` već 11 — ne dodavati | — | — |

**Šta se NE dira u ovom koraku:** `group-meta.ts` (22 lin konstante), `types.ts` (10 lin tip), `router/app-routes.tsx` (gating ostaje `dashboard.read`), `backend` showcase.

---

## 6) Alternativa (zašto ne drugačije)

* **Ne dodavati `enabled` po permisiji nego osloniti se na BE 403:** odbačeno — ruta već gated, ali hook bez `enabled` fetch-a i na 403 retry-a 3×; `enabled:false` je jeftiniji.
* **Ne skrivati `Seo/h1` na erroru nego early return:** odbačeno — gubitak naslova i SEO; skeleton-style sa sačuvanim headerom je standard (A-02..A-05).
* **1 Skeleton vs Grid skeleton:** 1 je brži ali je CLS — grid skeleton čuva layout 4 grupe + hero.
* **Ne dodavati `lastUpdated`:** moglo bi bez, ali `Writer/Moderator/Commentator` ga imaju pa je konzistentno.

---

## 7) Kriterijumi gotovosti (DoD)

- [ ] P1-1..P1-3 zatvoreni + testovi koji padaju bez fixa (`isError` → `role=alert` + naslov ostaje + `disabled isFetching`; `staleTime/retry/enabled` na hooku; loading `aria-busy` grid)
- [ ] P2-1..P2-6 zatvoreni: `UseQueryOptions` overload, `isLoading` grid, `PercentRing progressbar`, `ul aria-label`, `lastUpdated/Osvježi`
- [ ] `check:all 10/10`, `tsc -b` čist, `axe` bez kršenja na `/admin/stanje` (admin)
- [ ] `AUDIT/COVERAGE_MATRIX.csv` + `AUDIT/STATE.md` ažurirani, `CI 6/6` na `arena/290a6f13-fkgracanica`
- [ ] Nema promjene ponašanja za admina koji ima `dashboard.read` (62% + 4 grupe + teaser)

---

## 8) Otvorena pitanja za tebe (ask_user prije koda)

**Q1 — `lastUpdated`/`Osvježi`:** Da li `PlatformStatusPage` treba `Osvježi` dugme + `lastUpdated` (kao homes) ili samo `staleTime` bez dugmeta? Predlažem **dugme + lastUpdated** ispod hint-a.

**Q2 — `PercentRing` a11y:** Da li `PercentRing` treba `role=progressbar` sa `aria-valuenow` (screen reader najavljuje procenat) ili je dovoljan `aria-hidden` + tekst `{percent}%`? Predlažem **progressbar**.

**Q3 — Teaser `null` ponašanje:** Da li `PlatformStatusTeaser` na `/admin` treba ostati `null` kad nema `data` (kao danas) ili prikazati `Skeleton` dok `isLoading`? Predlažem **null** (ostaje kako je — teaser je shortcut, ne KPI).

> Ako odobriš ovaj plan (ili `approve_with_comments`), sljedeći korak je implementacija A-06 po tabeli iznad — jedan PR, `gh run watch` do `6/6`.
