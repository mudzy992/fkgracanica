# E-03 — FinanceAdminPage — PLAN (2026-11-19, grana `arena/290a6f13-fkgracanica` @ `2338edb`)

> Planski dokument — bez koda. Slijedi template iz `ADMIN_PLAN_2026-11-17.md` §2. Implementacija tek nakon `ask_user approve`.

---

## Meta

| Polje | Vrijednost |
|-------|------------|
| Ruta | `/admin/finance` — `app-routes.tsx:147-148` `<PermissionRoute permission="finance.read"><Route path="finance" element={<FinanceAdminPage />} /></PermissionRoute>` unutar `<Route path="admin" element={<ProtectedRoute />}><Route element={<AdminLayout />}>` |
| Fajl(ovi) | `pages/admin/FinanceAdminPage.tsx` (67 lin) · `hooks/use-finance-summary.ts` (53 lin, `useFinanceSummary` + `downloadFinanceExport`) · `pages/admin/finance/FinanceFiltersForm.tsx` (95 lin) · `FinanceKpiGrid.tsx` (43 lin) · `FinanceBuckets.tsx` (68 lin) · `finance-labels.ts` (62 lin) · `FinanceProviderChip.tsx` (22 lin) |
| Rola/permisije | `finance.read` (ruta) — nema `canViewKpi` granularnosti kao homes; svi sa `finance.read` vide isti izvještaj (ulaznice + sezona + članstvo). BE štiti `GET /finance/summary` + `export.*` sa `finance.read` |
| API | `GET /finance/summary?from&to&provider&status` → `FinanceSummary` (`tickets/seasonPass/membership/totalSum/byProvider/byStatus`) preko `useFinanceSummary(applied)`; `GET /finance/export.{xlsx,pdf}` blob preko `downloadFinanceExport(kind, filters)` (kreira `<a>` + `URL.createObjectURL`) |
| Stanje grane | `arena/290a6f13-fkgracanica` @ `2338edb` (A-01 ZATVOREN 44507145383 6/6 + STATE 44508626336 6/6, A-07 6/6, B-02 6/6, B-03 6/6, B-04 6/6, B-05 6/6, check:all 10/10, dead-guards 6/6) |

---

## 1) Šta radi danas (činjenično, bez ocjene)

**`FinanceAdminPage.tsx:1-67`:**
```
const [draft, setDraft] = useState({from:`${year}-01-01`, to:localIsoDate(), provider:'', status:''});
const [applied, setApplied] = useState(draft);
const {data, isLoading, isError, refetch} = useFinanceSummary(applied);
return <>
  <Seo title={t('admin.finance')} />
  <h1>{t('admin.finance')}</h1><p> Pregled uplata ... {formatDay(applied.from)} – {formatDay(applied.to)}</p>
  <Button onClick={() => void downloadFinanceExport('xlsx', applied)}>Preuzmi Excel</Button>
  <Button onClick={() => void downloadFinanceExport('pdf', applied)}>Preuzmi PDF</Button>
  <FinanceFiltersForm draft/setDraft onApply={() => setApplied(draft)} />
  {isError ? <Button onClick={() => void refetch()}>{t('actions.retry')}</Button>
   : isLoading || !data ? <p>{t('admin.common.loading')}</p>
   : <><FinanceKpiGrid data={data} /><FinanceBuckets data={data} /><p>Članarine su procjena ...</p></>}
```

- `useFinanceSummary(applied)` — `useQuery` bez `staleTime/retry/refetchOnWindowFocus/enabled`, `queryKey ['finance','summary',filters]` direktno (nema overload)
- `downloadFinanceExport` — `api.get blob` → `createObjectURL` → `a.click()` → `revokeObjectURL`, bez try/catch, `void` poziv
- `FinanceFiltersForm` — `type=date` Od/Do + Select status + ProviderChip `aria-pressed` + submit `Prikaži` (t('admin.financeFilters.period')), nema pending/disabled, nema role=alert
- `FinanceKpiGrid`/`Buckets` — čisti render, `formatKm`/`formatDay`, `isFinanceProvider` guard za chip vs Badge

**Stanja danas:**
- `loading` → `<p>loading</p>` tekst, bez `aria-busy`/`Skeleton` grida, bez sačuvanog `Seo/h1`? Seo/h1 su sačuvani (izvan uslova) — ok, ali skeleton je tekst
- `error` → `<Button retry>` bez `role="alert"` wrappera, bez sačuvanog `Seo/h1` konteksta (ali h1 je sačuvan iznad), `void refetch()` bez `isFetching` disabled, nema heading `retry` disabled
- `success` → `KpiGrid` + `Buckets` + napomena procjena (hardcode BS tekst + i18n period)
- `empty` → nema — `byProvider/byStatus` prazno prikazuje `empty` red u tabeli (`financeBuckets.empty`), ali `data` sa 0 sum nije empty stanje stranice
- `forbidden` → `PermissionRoute` redirect, ne rendera FinancePage
- Hook nema `isFetching/dataUpdatedAt`, nema `staleTime`, nema `enabled` gate

**Testovi:** `fe06-finance-admin-page.test.tsx:49-107` 6 testova (SEO/heading/period, default from/provider, KpiGrid/Buckets/napomena, loading tekst, error retry, filter primjena+export) — mock `useFinanceSummary` + `FinanceFiltersForm` + `Seo`; nema skeleton/aria-busy/role=alert/lastUpdated/disabled/isFetching pokrivenosti. `fe06-finance-filters.test.tsx` 3t (Od/Do/status/provider chip).

---

## 2) Šta bi trebala da radi (očekivano — profesionalni standard za finance admin)

* **Korisnik:** admin/finance sa `finance.read` koji otvori `/admin/finance` za <1s mora vidjeti **filtere + KPI grid + buckete** sa svojim periodom, `Seo` naslovom, `aria-busy` skeletonom dok se učitava, `role=alert` greškom + retry `disabled isFetching`, `lastUpdated/Osvježi` sa `isFetching` indikacijom, bez bljeska praznog `loading` teksta, `Preuzmi Excel/PDF` uvijek vidljivim (ne skrivenim u error/loading), bez N+1 fetcha na svaki `draft` keystroke (samo `applied` pokreće query)
* **Ugovor:**
  * `GET /finance/summary` je jedini fetch — `staleTime 30_000` + `retry 1` + `refetchOnWindowFocus false` (standard A-07/B-02/B-03/B-04/B-05), `queryKey` stabilan po `applied` (ne `draft`)
  * `isLoading/isFetching/isError/data` moraju imati odvojene grane: `isError → role=alert + retry disabled isFetching`, `isLoading → aria-busy Skeleton grid (5× Card h-[118px] kao homes)`, `success → KpiGrid+Buckets` sa `dataUpdatedAt`/`Osvježi`
  * `Seo/h1` moraju biti sačuvani kroz sve grane (kao A-07/B-02 — h1 izvan `isError/isLoading` uslova, ne skrivati)
  * `downloadFinanceExport` je `void` blob helper — ne treba `lastUpdated` gate, ali `Preuzmi` dugmad ne smiju biti `disabled` u `isError` (ostaju vidljiva), eventualno `void` + `.catch` nije potreban jer je `<a>` preuzimanje, ali ne smije baciti neobrađen rejection u konzolu
* **Ponašanje:**
  * `isLoading → Skeleton` `aria-busy` (5× Card kao `KpiSkeletonGrid` u homes) — ne `<p>loading</p>`
  * `isError → <div role=alert>` + `Button retry` `disabled isFetching`, sačuvan `Seo/h1` + filteri (filteri su izvan error grane danas — ok)
  * `isFetching` → `Osvježi` dugme `disabled isFetching` + `aria-busy` na gridu, `dataUpdatedAt` → `lastUpdated` format `HH:mm:ss` (kao A-03/A-04)
  * `FinanceFiltersForm` — `onApply` ne smije triggerati novi fetch ako je `draft === applied` (danas `setApplied(draft)` uvijek kopira referencu, `string` filteri su primitivni pa `applied` shallow equal nije bitan — queryKey `['finance','summary', filters]` po objektu će refetch na svaku novu referencu čak i sa istim vrijednostima; treba `applied` memo ili bar `isFetching` disabled)
* **A11y/i18n/perf:**
  * `Seo title={t('admin.finance')}` sačuvan, `h1` `t('admin.finance')`, `t('actions.retry')` + `t('admin.common.loading')` postoje; `formatDay/formatKm` ok, ali `Preuzmi Excel/PDF` su hardcode BS — trebaju `t()` sa `defaultValue` (FE-04c ratchet zahtijeva `t()` + `defaultValue` za hardcode, inače `admin-no-hardcoded-text` pad)
  * `0 fetch` prije `applied` init, `staleTime` sprječava refetch na tab focus, `enabled` nije potreban jer `finance.read` garantuje pristup (PermissionRoute), ali `UseQueryOptions` overload je standard za testibilnost (kao A-07/B-02)

---

## 3) Propusti — klasifikacija

### P1 — blokator / sigurnosni / funkcionalni (mora odmah)

**Nema P1.** `finance.read` štiti rutu i API, nema curenja podataka, nema mutacije bez dozvole, nema `dangerouslySetInnerHTML`, nema admin-flag obrazaca, nema `void` mutacije koja gubi novac (samo GET + blob download). Greška se ne guta — prikazuje `retry`.

*Tipičan rizik koji bi bio P1 a nije potvrđen:* da `downloadFinanceExport` baca neobrađen rejection i ostavlja `blob:` URL leak — `revokeObjectURL` je pozvan nakon `click`, ali nema `try/finally`; za blob veličine <10MB leak je zanemariv, ne blokira.

### P2 — nekonzistentnost / loša praksa (radi ali se ne radi tako)

**P2-1 — `useFinanceSummary` nema `staleTime/retry/refetchOnWindowFocus/enabled` — odstupa od A-07/B-02/B-03/B-04/B-05 standarda (30k, retry 1, refetchOnWindowFocus false, UseQueryOptions overload)**
* Gdje: `hooks/use-finance-summary.ts:20-26` — `useQuery({queryKey, queryFn})` bez opcija
* Zašto P2: svaki tab focus refetcha finance summary (skupo, Excel/PDF generacija na BE čita `Payment`/`SeasonPass` agregate), nema `retry` guard, nema test `disabled` grane
* Predlog: dodati `staleTime: 30_000, retry: 1, refetchOnWindowFocus: false` + `UseQueryOptions` overload (`options?: Omit<UseQueryOptions<FinanceSummary>, 'queryKey'|'queryFn'>`) kao u `useSeasons/useRounds/useCompetitions/useClubs/usePlayers/useMediaFolders` — **bez promjene ponašanja osim cache prozora**

**P2-2 — `FinanceAdminPage` loading je `<p>loading</p>` tekst umjesto `aria-busy` Skeleton grida — nekonzistentno sa A-03/A-04/A-05/A-07/B-02 (KpiSkeletonGrid / skeleton `aria-busy`)**
* Gdje: `FinanceAdminPage.tsx:35-38` — `isLoading || !data ? <p>{t('admin.common.loading')}</p>`
* Zašto P2: nema `aria-busy`, nema vizualni placeholder blizak konačnom layoutu (5× Card), loše za percepciju brzine, `axe` ne nalazi kršenje ali je UX ispod homes standarda
* Predlog: `isLoading` → `<div aria-busy="true"><FinanceKpiSkeleton /></div>` (5× `Card h-[118px]` kao `AdminHome` `KpiSkeletonGrid`) + sačuvan `Seo/h1` (već sačuvan)

**P2-3 — `isError` nema `role="alert"` wrapper, nema `heading` retry `disabled isFetching`, nema `lastUpdated/Osvježi` — odstupa od A-06/A-07/B-02 (alert + disabled isFetching + lastUpdated)**
* Gdje: `FinanceAdminPage.tsx:33-36` — `{isError ? <Button onClick={() => void refetch()}>{t('actions.retry')}</Button> : ...}`
* Zašto P2: greška nije `role=alert`, nema `isFetching` disabled, nema `dataUpdatedAt`/`lastUpdated`, filteri su sačuvani ali retry je bez konteksta (korisnik ne zna da je `applied` period u grešci)
* Predlog: `isError` → `<div role="alert"><p>{t('common.loadError', defaultValue:'Greška pri učitavanju')}</p><Button disabled={isFetching} onClick={() => void refetch()}>{t('actions.retry')}</Button></div>` + `lastUpdated` ispod `h1` kao u `PlatformStatusPage` (ali za finance `dataUpdatedAt` max, ne treba per-section)

**P2-4 — Nema `isFetching/dataUpdatedAt`/`lastUpdated`/`Osvježi` — odstupa od A-03/A-04/A-05/A-06/A-07/B-02/B-03/B-04 (svi imaju `isFetching`/`dataUpdatedAt` + `Osvježi` `disabled isFetching` + `lastUpdated` `HH:mm`)**
* Gdje: `FinanceAdminPage.tsx:20` — `const {data, isLoading, isError, refetch} = useFinanceSummary(applied)` — nema `isFetching`, `dataUpdatedAt`
* Zašto P2: korisnik ne vidi kada je izvještaj osvježen, nema ručnog `Osvježi`, nema `isFetching` indikacije dok se `applied` refetcha nakon promjene filtera
* Predlog: destrukturirati `isFetching`/`dataUpdatedAt` iz `useFinanceSummary`, dodati `lastUpdated = dataUpdatedAt ? formatTime(dataUpdatedAt) : null` + `<Button variant="outline" disabled={isFetching} onClick={() => void refetch()}> {isFetching ? t('common.loading') : t('common.refresh', defaultValue:'Osvježi')}</Button>` pored `h1` (kao `AdminHome`/`SeasonHubPage`)

**P2-5 — `Preuzmi Excel/PDF` su hardcode BS (`Preuzmi Excel`), `Pregled uplata...` + `Članarine su procjena...` su hardcode — FE-04c `admin-no-hardcoded-text` ratchet bi pao za novi fajl bez `t()` + `defaultValue`**
* Gdje: `FinanceAdminPage.tsx:27-31` — `>Preuzmi Excel<`, `>Preuzmi PDF<`, `Pregled uplata...`, `Članarine su procjena...`
* Zašto P2: i18n konzistentnost (BS/EN), `admin-no-hardcoded-text` baseline je 0 (FE-04c zatvoren) — novi hardcode bi probio ratchet
* Predlog: zamijeniti sa `t('admin.financeExport.xlsx', defaultValue:'Preuzmi Excel')` + `t('admin.financeExport.pdf', defaultValue:'Preuzmi PDF')` + `t('admin.finance.intro', defaultValue:'Pregled uplata...', {from: formatDay(...)})` + `t('admin.finance.membershipNote', defaultValue:'Članarine su procjena...')` — dodati BS/EN ključeve u `common.json`

**P2-6 — `FinanceFiltersForm` nema `role=alert` za grešku, nema `isPending`/`disabled` — ali nema mutacije pa je P2, ne P1**
* Gdje: `FinanceFiltersForm.tsx:15-93` — nema `isError` granu (filteri su lokalni state, greška je na parentu)
* Zašto P2: nije blokator jer filteri ne rade fetch samostalno, ali `Prikaži` dugme nema `disabled isFetching` da spriječi dvostruki `setApplied` dok se `isFetching` vrti
* Predlog: ne dirati osim ako se dodaje `isFetching` prop iz parenta — tada `Button type="submit" disabled={isFetching}`

### P3 — UX/polish

**P3-1 — `applied` vs `draft` referenca — `setApplied(draft)` kreira novu referencu svaki put čak i ako je `draft === applied` po vrijednosti → `queryKey ['finance','summary', applied]` će refetch iako se filteri nisu promijenili (npr. dvostruki klik `Prikaži`)**
* Predlog: `onApply` guard `if (shallowEqual(draft, applied)) return` ili `useMemo` za `applied` — low rizik, ostaviti za sada, pokriveno `isFetching` disabled

**P3-2 — `downloadFinanceExport` nema `try/catch` ni `finally` za `revokeObjectURL` — ako `api.get` baci, URL se ne kreira pa nema leaka, ali greška je neobrađena (void u onClick) — `ActionErrorAlert` (P-FE06-44) ne hvata ovaj blob tok**
* Predlog: dodati `.catch(() => toast.error(...))` ili `try { ... } catch { ... } finally { if (url) revoke }` — polish, ne blokira

---

## 4) Dokazi (file:line)

* `pages/admin/FinanceAdminPage.tsx:20` — `useFinanceSummary` bez `isFetching/dataUpdatedAt` — P2-4
* `hooks/use-finance-summary.ts:20-26` — `useQuery` bez `staleTime/retry/refetchOnWindowFocus/enabled` — P2-1
* `pages/admin/FinanceAdminPage.tsx:33-38` — `isError ? <Button retry>` bez `role=alert` + `isLoading || !data ? <p>loading</p>` bez `aria-busy` — P2-2/P2-3
* `pages/admin/FinanceAdminPage.tsx:27-31` — `Preuzmi Excel/PDF` hardcode — P2-5
* `pages/admin/FinanceAdminPage.tsx:40-48` — `KpiGrid/Buckets + procjena` bez `lastUpdated/Osvježi` + bez `isFetching` disabled — P2-4
* `pages/admin/finance/FinanceFiltersForm.tsx:54-93` — nema `role=alert`/`isPending` — P2-6
* `pages/admin/finance/fe06-finance-admin-page.test.tsx:49-107` — 6 testova ali bez `aria-busy`/`role=alert`/`lastUpdated`/`disabled` pokrivenosti — P2-2/P2-3/P2-4
* `router/app-routes.tsx:147-148` — `PermissionRoute finance.read` — nema P1 curenja

---

## 5) Predloženi plan — bez koda (šta će se dirati)

| Korak | Fajl | Promjena | Rizik | Test |
|-------|------|----------|-------|------|
| 1 | `frontend/src/hooks/use-finance-summary.ts` | `useFinanceSummary(filters, options?)` overload — `staleTime 30_000` + `retry 1` + `refetchOnWindowFocus false` + `Omit<UseQueryOptions, 'queryKey'|'queryFn'>` kao `useSeasons`/`useCompetitions`/`useClubs` (A-07/B-02/B-03) — **bez promjene ponašanja osim cache prozora** | nizak | postojeći 6 testova moraju ostati zeleni |
| 2 | `frontend/src/pages/admin/FinanceAdminPage.tsx` | Destrukturirati `isFetching/dataUpdatedAt` iz `useFinanceSummary(applied)` + `lastUpdated` (`dataUpdatedAt ? formatTime`) + `Osvježi` `Button disabled={isFetching}` pored `h1` (kao `SeasonHubPage`/`PlatformStatusPage`) + `isError` → `<div role="alert">` sačuvan `Seo/h1` + `Button retry disabled={isFetching}` + `isLoading` → `aria-busy` `FinanceKpiSkeletonGrid` (5× Card `h-[118px]`) umjesto `<p>loading</p>` — **Seo/h1 ostaju sačuvani kroz sve grane** | srednji | postojeći 6 testova + novi 4t moraju pasti bez fixa (alert/aria-busy/lastUpdated/disabled) |
| 3 | `frontend/src/pages/admin/FinanceAdminPage.tsx` | i18n hardcode → `t()` sa `defaultValue`: `Preuzmi Excel/PDF` + `Pregled uplata...` + `Članarine su procjena...` → `admin.financeExport.*` + `admin.finance.intro/membershipNote` (BS/EN `common.json`) — da ne probije `admin-no-hardcoded-text` 0 ratchet | nizak | `admin-no-hardcoded-text` 2/2 mora ostati zelen |
| 4 | `frontend/src/pages/admin/finance/fe06-e03-finance.test.tsx` (novi, 6t) | **Dopunski** 6t: `isLoading → skeleton aria-busy` (1t), `isError → role=alert + retry disabled isFetching sačuvan Seo/h1` (2t), `success → lastUpdated + Osvježi disabled isFetching` (2t), `Preuzmi Excel/PDF sačuvani kroz error/loading` (1t) — mock `useFinanceSummary` sa `isFetching/dataUpdatedAt` kao `fe06-b02`/`fe06-a07` | nizak | 6 stanja, `hasPermission` nije potreban (ruta štiti), `isFetching` disabled provjera |
| 5 | `frontend/src/pages/admin/FinanceAdminPage.tsx` / `finance-labels.ts` | Dodati `formatTime` helper ili reuse postojeći `formatDay` + novi `formatTime` (HH:mm) za `lastUpdated` — ne dirati `formatKm`/`localIsoDate` | nizak | — |
| 6 | `scripts/standards/baselines/file-size.txt` | `FinanceAdminPage.tsx` 67→~110 lin ostaje ispod 200 — ne treba baseline (max 120 u A-07 je 256L sa 2 fajla, ovdje 1 fajl) | — | `check:all` |
| 7 | `AUDIT/COVERAGE_MATRIX.csv` | `inventory.mjs` regeneriše — `fe06-e03-finance` `pokriveno testom` | — | `check-coverage` |

**Šta se NE dira:** `FinanceKpiGrid/Buckets/FinanceProviderChip/finance-labels` (čisti render, `formatKm`/`isFinanceProvider` već testirani), `FinanceFiltersForm` (nema `isFetching` prop u ovoj iteraciji — ostaje van error grane, P3), `router`/`permissions` (već `finance.read`), `backend` (nema API promjene), `downloadFinanceExport` blob tok (ostaje `void`, bez `ActionErrorAlert` u ovoj iteraciji).

---

## 6) Alternativa (zašto ne drugačije)

* **Ne dodavati `AdminPageShell` wrapping:** odbačeno — `FinanceAdminPage` već ima `Seo/h1` + `KpiGrid/Buckets` kao homes, ali nema `dataUpdatedAt/onRefresh` shell; `AdminPageShell` bi duplirao `KpiGrid` skeleton (shell već ima `aria-busy` grid) — bolje direktno `aria-busy` + `lastUpdated/Osvježi` kao `SeasonHubPage` (manje churn, isti UX)
* **Ne mijenjati `FinanceFiltersForm` da prima `isFetching`:** odbačeno — filteri su lokalni `draft/applied` state, parent `isFetching` bi samo `disabled` submit; može u sljedećoj iteraciji, ne blokira P1
* **Ne dodavati `enabled` gate po `hasPermission`:** odbačeno — ruta već `PermissionRoute finance.read`, nema potrebe za `enabled: hasPermission(...)` kao u homes (homes imaju `dashboard.read` granularno, finance je jedan permission)
* **Ne dirati `downloadFinanceExport` try/catch:** odbačeno — blob `void` je van `ActionErrorAlert` sistema (P-FE06-44), dodavanje `catch` bi zahtijevalo `useState error` + `role=alert` za export — polish za sljedeći krug

---

## 7) Kriterijumi gotovosti (DoD)

- [ ] P2-1..P2-6 zatvoreni + testovi koji padaju bez fixa (explicitni `staleTime` + `aria-busy` skeleton + `role=alert` + `lastUpdated/Osvježi` + `disabled isFetching` koji padaju ako se vrati `<p>loading</p>`)
- [ ] 4 `kind` grane pokrivene testom (`loading`/`error`/`success` + `isFetching` true/false), plus `lastUpdated` format i `Seo/h1` sačuvan kroz `isError`/`isLoading`
- [ ] `check:all 10/10`, `tsc -b` čist, `axe` bez kršenja na `/admin/finance` (mock `admin.finance` + `finance.read`)
- [ ] `AUDIT/COVERAGE_MATRIX.csv` + `AUDIT/STATE.md` ažurirani, `CI 6/6` na `arena/290a6f13-fkgracanica`
- [ ] Nema promjene ponašanja za `finance.read` na `/admin/finance` (KpiGrid/Buckets nepromijenjeni, `downloadFinanceExport` blob nepromijenjen, `FinanceFiltersForm` netaknut osim eventualno `disabled` submit)

---

## 8) Otvorena pitanja za tebe (ask_user prije koda)

**Q1 — `useFinanceSummary` staleTime 30k + retry 1 + refetchOnWindowFocus false:** Da li želiš da `useFinanceSummary` dobije `staleTime 30_000` + `retry 1` + `refetchOnWindowFocus false` + `UseQueryOptions` overload kao `useSeasons`/`useCompetitions`/`useClubs`/`useMediaFolders` (A-07/B-02/B-03/B-04), ili da ostane bez cache prozora (svaki tab focus refetcha)? Predlažem **da — 30k + retry 1 + overload** — bez promjene ponašanja osim cache-a, standard za sve admin liste.

**Q2 — `FinanceAdminPage` isError sačuvan Seo/h1 + role=alert + retry disabled isFetching + isLoading skeleton aria-busy:** Da li `FinanceAdminPage` treba `isError → <div role=alert>` sačuvan `Seo/h1` + `Button retry disabled={isFetching}` i `isLoading → <div aria-busy><SkeletonGrid 5× Card></div>` umjesto `<p>loading</p>`, kao `SeasonHubPage`/`CompetitionsAdminPage`/`PlatformStatusPage`, ili da ostane plain `<p>loading</p>` + plain `<Button retry>` bez `role=alert`/`aria-busy`/`disabled`? Predlažem **da — alert+disabled+skeleton aria-busy** — UX ispod homes standarda.

**Q3 — `FinanceAdminPage` lastUpdated/Osvježi + i18n hardcode → t() sa defaultValue:** Da li `FinanceAdminPage` treba `lastUpdated` (`dataUpdatedAt → HH:mm`) + `Osvježi` `Button disabled={isFetching}` pored `h1` (kao `SeasonHubPage`/`PlatformStatusPage`) i da `Preuzmi Excel/PDF` + `Pregled uplata...` + `Članarine su procjena...` pređu na `t('admin.financeExport.*', defaultValue:'Preuzmi ...')` sa BS/EN ključevima (da ne probije `admin-no-hardcoded-text` 0), ili da ostane bez `lastUpdated/Osvježi` i sa hardcode BS? Predlažem **da — lastUpdated/Osvježi + i18n sa defaultValue** — ratchet i UX.

> Ako odobriš ovaj plan (ili `approve_with_comments`), sljedeći korak je implementacija E-03 po tabeli iznad — jedan commit, `gh run watch` do `6/6`.

