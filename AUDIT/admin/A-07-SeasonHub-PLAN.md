# A-07 — SeasonHubPage + CalendarSeasonPage (B-01) — PLAN (2026-11-18, grana `arena/290a6f13-fkgracanica` @ `c1c11ec`)

> Planski dokument — bez koda. Slijedi template iz `ADMIN_PLAN_2026-11-17.md` §2. Implementacija tek nakon `ask_user approve`.

---

## Meta

| Polje | Vrijednost |
|-------|------------|
| Ruta | `/admin/seasons/:seasonId` → `CalendarSeasonPage` (`app-routes.tsx:124` `competitions/seasons/:seasonId` → `SeasonHubPage` alias), `/admin/seasons/:seasonId/competitions/:editionId` → `SeasonHubPage` (`app-routes.tsx:123-124`), `/admin/competitions` → `CompetitionsAdminPage` (navigacija) |
| Fajl(ovi) | `pages/admin/competition-hub/SeasonHubPage.tsx` (93 lin, 4117B) · `pages/admin/CalendarSeasonPage.tsx` (163 lin, 6171B) · `competition-hub/SeasonRoundsPanel.tsx` (168 lin) · `competition-hub/RoundMatchesPanel.tsx` (183 lin) · `competition-hub/RoundFormSheet.tsx` (89 lin) · `competition-hub/RoundCascadeDeleteDialog.tsx` (62 lin) · `hooks/use-rounds.ts` (76 lin) · `hooks/index.ts:useSeasons` (292) · `hooks/use-season-admin.ts` (deleteEdition) · `lib/season-utils.ts` (findEdition) · `lib/round-utils.ts` (roundLabel) · `router/app-routes.tsx:120-126` · `components/admin/AdminPageShell.tsx` (AdminDataTable) |
| Rola/permisije | `competitions.manage` (CalendarSeasonPage `canManage`), `competitions.manage || matches.manage` (SeasonHubPage `canManage`), `matches.manage` detaljnije u RoundMatchesPanel `canLive = live.manage`; rute gated `ModuleRoute moduleKey="modules.competitions"` (`app-routes.tsx:120`) — bez direktne `PermissionRoute` |
| API | `GET /seasons` (`useSeasons`), `GET /rounds?seasonId=` (`useRounds`), `GET /rounds/:id/delete-impact` (cascade), `DELETE /rounds/:id`, `GET /matches?seasonId=&roundId=` (`useMatches`), `DELETE /matches/:id`, `DELETE /seasons/:seasonId/competitions/:editionId` (`useDeleteSeasonCompetition`) |
| Stanje grane | `arena/290a6f13-fkgracanica` @ `c1c11ec` (A-06 zatvoren 44293970693 6/6 `check:all 10/10`, PlatformStatus 89L + 45L + 56L, `use-platform-status` staleTime30k, `bundle` 2094314/614027 OK) |

---

## 1) Šta radi danas (činjenično, bez ocjene)

**`SeasonHubPage.tsx:18-93`:**
```
const {seasonId, editionId} = useParams(); selectedRoundId = searchParams.get('roundId')
const {data: seasons, isLoading} = useSeasons() // bez staleTime/retry
canManage = hasPermission(competitions.manage) || hasPermission(matches.manage)
found = findEdition(seasons, editionId||seasonId) // CalendarSeason[] → edition
if isLoading → <Skeleton h-64 />                // bez aria-busy, bez error grane
if !found → <p>admin.seasonHub.notFound</p>    // tekst bez role=status/alert
return <Seo title={edition.name}/> + Breadcrumbs 4 nivoa + header Link back + h1 + Badge isActive/isLeague +
       grid lg:grid-cols-5: <Card><SeasonRoundsPanel seasonId=editionKey .../></Card> + <Card>{selectedRoundId ? <RoundMatchesPanel/> : <p>Odaberite kolo</p>}</Card>
```
`SeasonRoundsPanel` i `RoundMatchesPanel` se renderaju i kad `editionKey === ''` (prazan string) — `useRounds('')` je `enabled:false` pa vraća `undefined`, ali UI ne najavljuje da nema sezone.

**`CalendarSeasonPage.tsx:22-163`:**
```
const {seasonId} = useParams(); const {data: seasons, isLoading} = useSeasons()
canManage = hasPermission(competitions.manage)
season = seasons.find(s=>s.id===seasonId); rows = season.competitions
if isLoading → <Skeleton h-64 />   // bez aria-busy
if !season → <p>admin.calendar.seasonNotFound</p> // bez role
return <Seo title={season.name}/> + header back + h1 + Badge isActive + {canManage && <Button>Takmičenje</Button>} +
       <Card><AdminDataTable rows={rows} empty="Nema takmičenja" columns=[name,league,participants,hub:Link Upravljaj] + (canManage? actions: edit/delete) /></Card> + <SeasonEditionFormSheet/>
onDelete: confirm → void runAction(deleteEdition.mutateAsync({seasonId,editionId}))
```
`AdminDataTable` prima `rows` direktno, nema `isLoading`/`isError` prop — loading je već early return, error se ne prikazuje.

**`SeasonRoundsPanel.tsx:16-168`:**
```
const {data: rounds, isLoading} = useRounds(seasonId) // enabled:!!seasonId, bez staleTime/retry
remove = useDeleteRound()
onDelete: if _count.matches===0 → confirm → void runAction(remove.mutateAsync); else → api.get delete-impact → setCascadeRound/Impact → dialog
return: header <h3> + {canManage && <Button round>} + divide-y: {isLoading && <p>loading</p>} {!isLoading && !rounds.length && <p>empty</p>} {rounds.map → <div><Button onClick=>onSelectRound><span label/><span matches/></Button> + {canManage && <Pencil/><Trash>}} + <RoundFormSheet/> + <RoundCascadeDeleteDialog/>
```
Nema `isError` grane, nema `aria-busy`, `onDelete` cascade koristi direktni `api.get` bez `useRoundDeleteImpact` hook-a, `remove.isPending` se ne koristi za disable dugmadi (samo u dialogu), `void runAction` bez `.catch` ali `runAction` vraća alert globalno.

**`RoundMatchesPanel.tsx:21-183`:**
```
const {data, isLoading} = useMatches(seasonId, roundId) // useMatches ima staleTime30k ali bez enabled guard za prazan roundId? enabled je preko seasonId? Provjeri: useMatches(seasonId, roundId) → queryKey ['matches',seasonId,roundId||'all'] bez enabled guard za roundId, fetch i kad je prazan
rows = useRoundMatchesSorted(data)
canLive = hasPermission(live.manage)
remove = useDeleteMatch()
return: header <h3> + {canManage && <Button>Utakmica</Button>} + <AdminDataTable rows={rows} empty={isLoading?'Učitavanje...':'Nema'} rowClassName=isScheduledMatch?border-l-primary : columns=[match, status Badge, date, actions: Live/Report/Edit/Postava/Delete uslovno po canLive/canManage/finished/retro]>
```
`AdminDataTable` opet bez `isLoading`/`isError`, `empty` je string koji se mijenja sa `isLoading`, nema `role=alert`, `onDelete` nema `isPending` disable, `Live`/`Report` linkovi koriste `buttonVariants` ali bez `aria-label` za ikone.

**Hookovi:**
- `useSeasons` (hooks/index.ts:292): `useQuery({queryKey:['seasons'], queryFn: api.get('/seasons')})` — bez `staleTime/retry/refetchOnWindowFocus`, bez `enabled`.
- `useRounds` (use-rounds.ts:11): `useQuery({queryKey:['rounds',seasonId], queryFn: api.get('/rounds'), enabled:!!seasonId})` — bez `staleTime/retry`.
- `useRoundDeleteImpact` postoji ali se ne koristi u `SeasonRoundsPanel` (koristi `api.get` direktno).
- `useDeleteRound` ima `onSuccess` invalidacije za `rounds/matches/standings/statistics`, `useDeleteSeasonCompetition` slično.
- `useMatches` (hooks/index.ts): ima `staleTime30k retry1 refetch false` + `...options` overload, ali `RoundMatchesPanel` ga zove bez `enabled` pa fetch i kad `seasonId===''` (prazan).

---

## 2) Šta bi trebala da radi (očekivano — profesionalni standard za sezonu/kola/utakmice)

* **Korisnik:** admin/competition manager koji za <15s mora **vidjeti kalendarsku sezonu**, **listu takmičenja u sezoni**, **kola u takmičenju** i **utakmice u kolu**, te **kreirati/uređivati/brisati** kolo/utakmicu bez gubitka konteksta.
* **Ugovor:**
  * `CalendarSeasonPage` je `competitions.manage` za mutacije, ali čitanje je `modules.competitions` (rute gated) — bez dodatnog `enabled` po permisiji je ok, ali akcije moraju biti `disabled` kad `isPending`.
  * `SeasonHubPage` je hub: lijevo kola, desno utakmice; `selectedRoundId` iz URL-a (`?roundId=`) je jedini izvor istine, deep link mora raditi i nakon reloada.
  * 4 stanja po panelu: `loading → skeleton aria-busy`, `error → role=alert + retry`, `empty → poruka sa CTA`, `success → lista`.
  * Brisanje kola sa `matchCount>0` mora pokazati `RoundCascadeDeleteDialog` sa impact brojevima (`matchCount`, `approvedReportCount`, `ticketCount`…) i zahtijevati eksplicitan `cascade` confirm — danas radi, ali `delete-impact` se dohvata `api.get` bez loading/error stanja.
* **Ponašanje:**
  * `isLoading` → `Skeleton` sa `aria-busy="true"` i sačuvanim layoutom (kao `KpiSkeletonGrid`), ne `p "Učitavanje..."`.
  * `isError` → `role="alert"` + `Retry` sa `disabled={isFetching}` i sačuvanim `Seo/Breadcrumbs/h1` (danas early return briše header).
  * `!found / !season` → `role="status"` prazno, ne `p` bez role.
  * `onDelete`/`onCascadeConfirm` → dugmad `disabled={isPending}` + `aria-busy`.
  * `useSeasons`/`useRounds` → `staleTime 30k`, `retry 1`, `refetchOnWindowFocus:false` konzistentno sa A-02..A-06.
* **A11y/i18n/perf:**
  * `Seo` title uvijek renderan, `h1` prvi u DOM-u (danas `isLoading` early return briše `Seo`).
  * `AdminDataTable` prazno `empty` treba `role="status"`, akcije `aria-label`.
  * `t()` ključevi već postoje (`admin.seasonHub.notFound`, `admin.calendar.seasonNotFound`, `admin.roundsPanel.*`, `admin.roundMatches.title`, `actions.back/edit/delete`) — ne dodavati nove bez potrebe.
  * 1 fetch po `seasonId`/`roundId` sa `staleTime` da se ne refetcha na svaki tab focus.

---

## 3) Propusti — klasifikacija

### P1 — blokator / sigurnosni / funkcionalni (mora odmah)

**P1-1 — `SeasonHubPage` i `CalendarSeasonPage` early return briše `Seo/Breadcrumbs/h1` na `isLoading` i nema `role=alert` ni `isError` grane**
* Gdje: `SeasonHubPage.tsx:27-29` `if isLoading return <Skeleton>` + `if !found return <p>`; `CalendarSeasonPage.tsx:37-38` isto.
* Zašto P1: admin na grešci/loading-u gubi navigaciju i SEO; screen reader ne najavljuje error; `AdminHome`/`ModeratorHome` pattern je sačuvan header + `role=alert` + `disabled isFetching`.
* Repro: mock `isLoading:true` → `queryByRole heading` null, `getByRole alert` null.
* Test cementira loše: nema testa za error stanje (postojeći `fe06-seasonhub-*` ne pokriva error).

**P1-2 — `useSeasons`/`useRounds` nemaju `staleTime/retry/refetchOnWindowFocus`, `useRounds` nema `UseQueryOptions` overload, `SeasonHubPage` ne prosljeđuje `enabled` po permisiji/module**
* Gdje: `hooks/index.ts:292` `useSeasons` bez opcija; `use-rounds.ts:11` `useRounds` bez `staleTime/retry`.
* Zašto P1: svaki tab focus refetcha `/seasons` i `/rounds` sa default `retry 3`; nekonzistentno sa `useMatches` (koji ima `staleTime30k`) i sa A-02..A-06 (`staleTime 30k retry1`).
* Dokaz: `use-rounds.ts:11-16`.

**P1-3 — `SeasonRoundsPanel` brisanje koristi direktni `api.get` za `delete-impact` bez loading/error, dugmad nisu `disabled` dok `isPending`**
* Gdje: `SeasonRoundsPanel.tsx:28-42` `api.get<RoundDeleteImpact>` unutar `onDelete`, `catch` prikazuje generic confirm, ali nema `isPending` disable na `Trash`/`Pencil`, samo `RoundCascadeDeleteDialog isPending`.
* Zašto P1: korisnik može duplo kliknuti `Obriši` dok se `delete-impact` učitava, ili duplo `Obriši` kolo bez `isPending` guard-a; a11y nema `aria-busy`.
* Dokaz: `SeasonRoundsPanel.tsx:69-93` `Button` bez `disabled={remove.isPending}`.

### P2 — nekonzistentnost / loša praksa (radi ali se ne radi tako)

**P2-1 — `RoundMatchesPanel` prosljeđuje `seasonId=''` i `roundId=null` u `useMatches`, `AdminDataTable` empty je string koji se mijenja sa `isLoading`**
* Gdje: `SeasonHubPage.tsx:32` `editionKey = found?.edition.id ?? ''` → `SeasonRoundsPanel seasonId=''`, `RoundMatchesPanel seasonId=''`.
* Zašto P2: `useRounds('')` je `enabled:false` pa je ok, ali `useMatches('', '')` nema `enabled` guard za prazan `roundId` pa fetch `/matches?seasonId=&roundId=` nepotrebno; `empty` bi trebao biti odvojen od `isLoading` (`isLoading? Skeleton aria-busy : empty status`).

**P2-2 — `AdminDataTable` nema `isLoading` prop, koristi `empty` string za loading, nema `aria-busy` ni `role=status` za prazno**
* Gdje: `RoundMatchesPanel.tsx:48` `empty={isLoading?'Učitavanje...':'Nema...'}`.
* Zašto P2: loading i empty su različita stanja; skeleton sa `aria-busy` je standard (A-02..A-06).

**P2-3 — `useRoundDeleteImpact` hook postoji ali se ne koristi; `SeasonRoundsPanel` radi `api.get` direktno**
* Gdje: `use-rounds.ts:44` `useRoundDeleteImpact` definisan, ali `SeasonRoundsPanel.tsx:31` koristi `api.get`.
* Zašto P2: dupli fetch obrazac, nema `staleTime`/`retry`, testiranje teže.

**P2-4 — `SeasonHubPage`/`CalendarSeasonPage` `isLoading` Skeleton bez `aria-busy`, `!found` prazno bez `role=status`**
* Gdje: `SeasonHubPage.tsx:27` `Skeleton h-64` bez wrapper `aria-busy`.
* Zašto P2: screen reader ne zna da je loading.

**P2-5 — Nema `lastUpdated`/`Osvježi` kao Writer/Moderator/Commentator/PlatformStatus**
* Gdje: obje stranice nemaju `dataUpdatedAt` + `Button Osvježi`.
* Zašto P2: admin ne zna koliko je lista svježa; `staleTime 30s` bez dugmeta je ok, ali dugme je standard za A-02..A-06.

### P3 — UX/polish (radi, ali može profesionalnije)

**P3-1 — `SeasonRoundsPanel` `onSelectRound` prosljeđuje `setParams({})` za deselect — briše ostale query paramove**
* Već radi, ali `setParams` bez `replace:true` može dodati history entry.

**P3-2 — `RoundMatchesPanel` `Live`/`Report` linkovi koriste `buttonVariants` ali nemaju `aria-label` za ikone**
* `Radio`/`FileText` su dekorativni — ok, ali `aria-hidden` fali.

---

## 4) Dokazi (file:line)

* `SeasonHubPage.tsx:26-29` — `if isLoading return <Skeleton>` bez `Seo/h1/role=alert` — P1-1
* `CalendarSeasonPage.tsx:27-38` — isto — P1-1
* `hooks/index.ts:292-296` — `useSeasons` bez `staleTime/retry` — P1-2
* `hooks/use-rounds.ts:11-16` — `useRounds` bez `staleTime/retry/options` — P1-2
* `SeasonRoundsPanel.tsx:28-42` — `api.get delete-impact` direktno — P2-3, P1-3
* `SeasonRoundsPanel.tsx:69-93` — `Button` bez `disabled isPending` — P1-3
* `RoundMatchesPanel.tsx:22` — `useMatches(seasonId,roundId)` bez `enabled` guard za prazan — P2-1
* `RoundMatchesPanel.tsx:48` — `empty={isLoading?'...':'...'}` — P2-2

---

## 5) Predloženi plan — bez koda (šta će se dirati)

| Korak | Fajl | Promjena | Rizik | Test |
|-------|------|----------|-------|------|
| 1 | `frontend/src/hooks/index.ts` (`useSeasons`) + `frontend/src/hooks/use-rounds.ts` (`useRounds`) | Dodaj `UseQueryOptions` overload + `staleTime:30_000, retry:1, refetchOnWindowFocus:false, ...options`; `useSeasons(options?)`, `useRounds(seasonId, options?)` sa `enabled: !!seasonId && (options?.enabled ?? true)` | nizak | hook test: `enabled:false` ne fetch-a, `staleTime` |
| 2 | `frontend/src/hooks/use-rounds.ts` | Zamijeni direktni `api.get` u `SeasonRoundsPanel` sa `useRoundDeleteImpact(roundId)` hook-om (ili ostavi `api.get` ali sa `runAction` + `isFetching` disable) — predlažem **ostaviti `api.get` ali dodati `isPending` guard + `aria-busy`** da ne mijenjamo API; `useRoundDeleteImpact` ostaje za eventualno kasnije | nizak | — |
| 3 | `frontend/src/pages/admin/competition-hub/SeasonHubPage.tsx` | a) `const {data:seasons, isLoading, isError, isFetching, dataUpdatedAt, refetch} = useSeasons({})` sa `staleTime` b) Sačuvaj `Seo/Breadcrumbs/h1` i u `isLoading`/`isError` granama c) `isError → role=alert + Retry disabled={isFetching}` d) `isLoading → aria-busy Skeleton grid` e) `lastUpdated/Osvježi` ispod headera | srednji | mock `isError:true` → `role=alert` + heading ostaje |
| 4 | `frontend/src/pages/admin/CalendarSeasonPage.tsx` | Isto kao korak 3: `useSeasons` sa `isError/isFetching/dataUpdatedAt/refetch`, sačuvan `Seo/h1`, `role=alert`, `aria-busy`, `lastUpdated/Osvježi` | srednji | — |
| 5 | `frontend/src/pages/admin/competition-hub/SeasonRoundsPanel.tsx` | a) `const {data:rounds, isLoading, isError, isFetching, refetch} = useRounds(seasonId)` sa novim hookom b) `isError → role=alert` c) `isLoading → aria-busy Skeleton` d) `Button Trash/Edit disabled={remove.isPending}` e) `onDelete` `await` sa `runAction` već postoji — dodaj `disabled` | nizak | loading `aria-busy`, delete `disabled` |
| 6 | `frontend/src/pages/admin/competition-hub/RoundMatchesPanel.tsx` | a) `useMatches(seasonId, roundId, {enabled: !!seasonId && !!roundId})` b) `AdminDataTable` `empty` + odvojen `isLoading ? <Skeleton aria-busy> : empty status` c) `isError → role=alert` d) `remove.isPending` disable na delete | nizak | `enabled:false` ne fetch-a |
| 7 | `frontend/src/pages/admin/competition-hub/SeasonHubPage.tsx` + `CalendarSeasonPage.tsx` | Eventualno `Skeleton` wrapper `aria-busy="true"` kao `PlatformStatusPage` (5 skeletons vs 1) — ne dirati `AdminDataTable` internu logiku | nizak | — |
| 8 | `frontend/src/pages/admin/competition-hub/fe06-seasonhub-page.test.tsx` (novi) + `fe06-seasonhub-variants.test.tsx` | Dopuni testove za 4 stanja + permisije + a11y (`role=alert`, `aria-busy`, `disabled isPending`, `lastUpdated`) — ne briši postojeće `fe06-*` | — | `check:all 10/10` |
| 9 | `scripts/standards/baselines/file-size.txt` | Ako `SeasonHubPage.tsx`/`CalendarSeasonPage.tsx` pređu 200 lin (očekivano 93→~130, 163→~190) — ne treba baseline | — | `check:all` |
| 10 | `frontend/src/locales/bs+en/common.json` | Provjeri `admin.home.refresh/lastUpdated` već postoje — ne treba novi ključ | — | — |

**Šta se NE dira:** `RoundCascadeDeleteDialog` (62 lin), `RoundFormSheet` (89 lin), `backend` `catalog-modules.ts`, `router` gating (`ModuleRoute`), `SeasonEditionFormSheet`.

---

## 6) Alternativa (zašto ne drugačije)

* **Ne dodavati `enabled` po permisiji za čitanje:** odbačeno — `modules.competitions` već gate-a rutu, ali `useSeasons` bez `staleTime` fetch-a i na svaki focus; `enabled` nije potreban za čitanje, ali `staleTime` jeste.
* **Ne skrivati `Seo/h1` na erroru:** odbačeno — gubitak naslova i SEO; pattern sačuvanog headera je standard A-02..A-06.
* **Zamijeniti `api.get delete-impact` sa `useRoundDeleteImpact`:** može, ali trenutni `api.get` je imperative `onClick` — `useQuery` bi bio `enabled` na `cascadeRound` i zahtijevao `staleTime`; ostavljamo `api.get` uz `runAction` alert.
* **1 Skeleton vs aria-busy grid:** 1 je brži ali je CLS — aria-busy sačuvan header je bolji.

---

## 7) Kriterijumi gotovosti (DoD)

- [ ] P1-1..P1-3 zatvoreni + testovi koji padaju bez fixa (`isError → role=alert` + naslov ostaje + `disabled isFetching`; `staleTime/retry` na hookovima; delete `disabled isPending` + `aria-busy`)
- [ ] P2-1..P2-5 zatvoreni: `UseQueryOptions` overload, `isLoading` `aria-busy`, `AdminDataTable` empty odvojeno, `lastUpdated/Osvježi`
- [ ] `check:all 10/10`, `tsc -b` čist, `axe` bez kršenja na `/admin/competitions` i `/admin/seasons/:seasonId` (admin)
- [ ] `AUDIT/COVERAGE_MATRIX.csv` + `AUDIT/STATE.md` ažurirani, `CI 6/6` na `arena/290a6f13-fkgracanica`
- [ ] Nema promjene ponašanja za admina sa `competitions.manage` (lista sezona/kola/utakmica + hub + teaser)

---

## 8) Otvorena pitanja za tebe (ask_user prije koda)

**Q1 — `lastUpdated`/`Osvježi`:** Da li `SeasonHubPage` i `CalendarSeasonPage` trebaju `Osvježi` dugme + `lastUpdated` (kao homes/PlatformStatus) ili samo `staleTime` bez dugmeta? Predlažem **dugme + lastUpdated** ispod headera.

**Q2 — `delete-impact` loading:** Da li `SeasonRoundsPanel` brisanje treba prikazati globalni `alert` dok se `delete-impact` učitava (trenutno `confirm` sa generičkom porukom) ili je dovoljan `disabled` na `Trash` + `aria-busy`? Predlažem **disabled + aria-busy**, bez dodatnog skeletona.

**Q3 — `AdminDataTable` empty vs loading:** Da li `RoundMatchesPanel` treba odvojen `Skeleton aria-busy` za `isLoading` umjesto `empty="Učitavanje..."` stringa? Predlažem **da** (odvojeno).

> Ako odobriš ovaj plan (ili `approve_with_comments`), sljedeći korak je implementacija A-07 po tabeli iznad — jedan PR, `gh run watch` do `6/6`.
