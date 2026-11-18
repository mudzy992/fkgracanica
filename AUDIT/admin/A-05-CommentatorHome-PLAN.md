# A-05 — CommentatorHome + DeskList + LiveHero — PLAN (2026-11-18, grana `arena/290a6f13-fkgracanica` @ `ff111ed`)

> Planski dokument — bez koda. Slijedi template iz `ADMIN_PLAN_2026-11-17.md` §2. Implementacija tek nakon `ask_user approve`.

---

## Meta

| Polje | Vrijednost |
|-------|------------|
| Ruta | `/admin` (index `DashboardPage.tsx:14` → `CommentatorHome` kad `resolveStaffHome()==='commentator'`) — sekundarno `/admin/live/:id` i `/admin/matches/:id/report` preko `deskHref` |
| Fajl(ovi) | `pages/admin/homes/CommentatorHome.tsx` (113 lin) · `pages/admin/homes/CommentatorDeskList.tsx` (77 lin) · `pages/admin/homes/CommentatorLiveHero.tsx` (55 lin) · `pages/admin/homes/commentator-desk.ts` (126 lin) · `pages/admin/homes/HomeKpiGrid.tsx` (49 lin, nakon A-04) · `pages/admin/homes/HomeQuickActions.tsx` (28 lin) · `pages/admin/homes/RoleHomeShell.tsx` (26 lin) · `hooks/index.ts:useMatches/useMatch` (18/12 lin, bez options) · `hooks/use-match-realtime.ts` (68 lin) · `lib/match-status-label.ts`/`lib/match-report.ts` · `lib/permissions.ts:hasPermission` · `locales/bs+en/common.json:admin.home.commentatorTitle/commentatorHint/matchesError + admin.commentator.*` |
| Rola/permisije | `komentator` — BE seed `Komentator: ['live.manage','matches.manage']` (nema `news.*`/`gallery.*`/`analytics.*`) — FE danas ne provjerava ništa, `useMatches` fetcha bez `enabled` |
| API | `GET /matches` (`useMatches()` → `GET /matches`) · `GET /matches/:id` (`useMatch(liveId)` → `GET /matches/:id` kad `liveId` postoji) — 1+1 query-a; realtime `socket.io` `match:join`/`match:leave` + `match:score/status/event/comment/clock` via `useMatchRealtime(liveId)` |
| Stanje grane | `arena/290a6f13-fkgracanica` @ `ff111ed` (A-04 zatvoren 44266519241 6/6 + docs 44268376184 6/6, `check:all 10/10`, `WriterHome` 231L permission-gated + `useGalleryAdminList` options, `ModeratorHome` 347L, `AdminHome` 100%) |

---

## 1) Šta radi danas (činjenično, bez ocjene)

**Render stablo `CommentatorHome.tsx:15-113`:**
```
const {data, isLoading, isError, refetch} = useMatches() // GET /matches bez enabled/staleTime
matches = data ?? []
counts = deskCounts(matches) // {live, today, drafts, pending} preko pickLive/pickToday/pickNeedsReport/pickAwaitingApproval
live = pickLive(matches) // LIVE/HALFTIME
liveId = live[0]?.id
{data: liveDetail} = useMatch(liveId ?? '') // enabled: !!id
useMatchRealtime(liveId) // socket join/leave + 5 listenera
hero = liveDetail ?? live[0]
primary = primaryDeskMatch(matches) // live[0] ?? today[0] ?? upcoming[0]
today/pickToday[0], draft/pickNeedsReport[0], pending/pickAwaitingApproval[0]
actions: primary→openDesk, live[0]→publicLive (/live/:id), draft→report

if isError → <RoleHomeShell seo="Komentator" hint=commentatorHintShort> + <p>matchesError + Button retry void refetch()>
else → <RoleHomeShell seo="Komentator" hint=commentatorHint>
         HomeKpiGrid(4: live, today, drafts, pending) — value = isLoading ? '…' : counts.x, href = live[0]?deskHref:undefined itd.
         HomeQuickActions(actions) ako actions.length>0
         {hero ? <CommentatorLiveHero match={hero}> : null}
         <CommentatorDeskList matches={matches} isLoading={isLoading}>
```

**`kpiItems:68-92`:** svaki `value: isLoading ? '…' : counts.xxx` — `'…'` u `<p class="text-3xl">` kao kod Writer prije A-04; `href` je uslovno po postojanju utakmice (`live[0]?deskHref(live[0]):undefined`) — **nema provjere permisije** (`live.manage`/`matches.manage`).

**`HomeQuickActions`: ** 0-3 akcije, pushane bez `hasPermission` filtera. `deskHref(primary)` vraća `/admin/live/:id` ili `/admin/matches/:id/report` bez guard-a.

**`isError` early return `35-51`:** rendera `RoleHomeShell` + centrirani `matchesError` + `Button retry` — **nema `role="alert"`, nema `disabled={isFetching}`, nema `aria-busy`, nema `Seo` sačuvanog naslova? Jeste sačuvan jer je `RoleHomeShell` unutar early return, ali `HomeKpiGrid`/`DeskList` nestaju potpuno.

**`hooks/index.ts:useMatches` (142-152):** `useQuery({queryKey:['matches', seasonId, roundId], queryFn: api.get('/matches')})` — **bez** `enabled`, `staleTime`, `retry`, `refetchOnWindowFocus`, `select`. Identično `useMatch` (155-161) ima samo `enabled: !!id`, bez `staleTime/retry`.

**`CommentatorDeskList.tsx:35-77`:**
- `if isLoading → 3× Skeleton h-12` u `div p-4` — **ima skeleton ali nema `aria-busy="true"`**, nema razlike između loading i empty u testu osim `isLoading` booleana.
- `groups = groupDeskMatches(matches)` → filter po `pickLive/today/upcoming/reports`; `if groups.length===0 → <p>Nema utakmica za desk...` — ispravno empty.
- Inače `groups.map → section h2 + ul divide-y + DeskRow` — `DeskRow` prikazuje `ClubCrest`/`matchTitle`/`formatDateTime`/`reportHint`/`Badge`/`Link` `deskHref`/`deskCtaLabel`. **`ul` bez `aria-label`**, `Link` bez `aria-label`, `Badge` bez prevoda provjere.

**`CommentatorLiveHero.tsx:14-54`:** `Card` gradient `slate-900→slate-800` + `Badge` `animate-pulse` za LIVE + `liveOnDesk` + `ClubCrest` + `homeClub?.name ?? t('admin.match.homeTeam')` + `homeScore:awayScore` `tabular-nums` + 2 `Link` (`deskHref` + `/live/:id` blank). **Nema `isLoading` skeleton, nema `isError`, nema `aria-label` na linkovima**, `target="_blank"` sa `rel="noreferrer"` ispravno.

**`commentator-desk.ts:126`:** pure helperi — `isLiveDesk`, `needsReport`, `awaitingApproval`, `isTodayScheduled(now)`, `deskHref`, `deskCtaLabel`, `pickLive/Today/Upcoming/NeedsReport/AwaitingApproval`, `groupDeskMatches`, `primaryDeskMatch`, `deskCounts`, `matchTitle` — bez side-effecta, testirano u `fe06-commentator-home` preko mocka.

**`useMatchRealtime.ts:14-68`:** `useEffect([matchId, qc])` → `socket.emit('match:join')` + 5 `socket.on` (`match:event/comment/clock/score/status`) + `setQueryData` + cleanup `off`/`leave` — nema `enabled` po permisiji, nema `staleTime`, pretplata i kad nije komentator.

**Testovi `fe06-commentator-home.test.tsx:154`:** 8 testova — `matchesError` + retry, KPI 1/2/3/4, `…` loading 4×, brze akcije 3 linka, bez pick-a nema akcija/heroja, hero koristi `liveDetail` vs fallback, `realtimeIds` bez live ne pretplaćuje, `today` KPI link. Mockovi: `useMatches` → `state.matches`, `useMatch` → `state.detail`, `useMatchRealtime` → push id, `commentator-desk` mock vraća `state.counts`/`picks`.

---

## 2) Šta bi trebala da radi (očekivano — profesionalni standard za commentator home)

* **Korisnik:** komentator koji za <10s mora **otvoriti desk** (semafor) za LIVE/today/upcoming ili **predati izvještaj** za FINISHED DRAFT. Nije admin — ne smije vidjeti `news/gallery/finance/users`, samo `live` + `matches`.
* **Ugovor:**
  * KPI-evi su **brojači deska** — `live` (LIVE/HALFTIME), `today` (SCHEDULED danas), `drafts` (FINISHED DRAFT), `pending` (FINISHED PENDING_APPROVAL) — svaki mora linkati na desk **samo** uz `live.manage` ili `matches.manage`; bez dozvole → `div` bez linka (kao Writer/Moderator). Danas linka po postojanju utakmice bez provjere.
  * QuickActions su **1-klik akcije** — `Otvori desk` (primary), `Javni live` (`/live/:id`), `Izvještaj` (draft) — moraju poštovati istu permisiju; danas uvijek vidljive kad pick postoji.
  * Hero je **LIVE na desku** — `CommentatorLiveHero` prikazuje `homeScore:awayScore`, status, `Otvori desk` + `Javni live` (blank) — treba `aria-label` i skeleton kad `useMatch` učitava.
  * Desk lista je **grupisani pregled** — `groupDeskMatches` (live/today/upcoming/reports) sa `DeskRow` — treba `isLoading → skeleton` sa `aria-busy`, `isError → role=alert`, `empty → Nema utakmica`, svaki `ul` sa `aria-label`.
* **Ponašanje:**
  * `loading` → skeleton grid 4 sa `aria-busy`, sačuvana visina; `HomeKpiGrid` danas koristi `'…'` — treba `KpiSkeletonGrid` (kao A-04) sa `aria-busy="true"`.
  * `error` → `role="alert"` + `t('admin.home.matchesError')` + `Retry` sa `isFetching`/`disabled`, **uz sačuvan** `Seo`/`h1`/`hint` i `DeskList` skeleton?
  * `empty/0` → `0` je validno, `counts.live===0` bez `href` (div) — danas ispravno, ali bez `??0` guard za `deskCounts` ako `matches` undefined.
  * `forbidden` (403 na `/matches`) → poruka bez retry loop-a, bez curenja prethodnog `data`.
  * `stale` → `lastUpdated` + `Osvježi` dugme ili `staleTime 30s` + `refetchOnWindowFocus:false` + `enabled` po permisiji.
* **A11y/i18n/perf:**
  * `Seo` title uvijek renderan, `h1` prvi u DOM-u (RoleHomeShell poštuje).
  * KPI `Link` sa `aria-label`, `tabular-nums` (HomeKpiGrid već ima), `focus-visible:ring`.
  * `DeskList` `<ul>` sa `aria-label`, `Link` `Otvori desk` sa `aria-label`, `Badge` sa `aria-label`.
  * `t()` sa `defaultValue` gdje nedostaje.
  * 2 query-a (`useMatches` + `useMatch`) → 2 fetch-a na svaki mount bez `staleTime` → nepotreban pritisak; treba `staleTime 30_000`, `retry 1`, `refetchOnWindowFocus:false`, `enabled` po permisiji.
  * Realtime pretplata samo kad `liveId` i `live.manage` — danas bez guard-a.

---

## 3) Propusti — klasifikacija

### P1 — blokator / sigurnosni / funkcionalni (mora odmah)

**P1-1 — KPI i QuickActions linkovi ne poštuju permisiju cilja**
* Gdje: `CommentatorHome.tsx:68-92 kpiItems` — `href: live[0] ? deskHref(live[0]) : undefined` bez `hasPermission(perms,'live.manage')`/`'matches.manage'`; `actions` `36-44` push bez provjere.
* Zašto P1: komentator danas ima obje pa ne curi, ali čim se suzi `live.manage`, home će linkati `/admin/live/:id` iako nema pravo — isti obrazac kao A-04 P1-1, već zatvoren tamo. QuickActions `Otvori desk`/`Izvještaj` vodi na desk bez provjere.
* Repro: makni `live.manage` komentatoru — KPI `live` i dalje linka `/admin/live/m1` i `Otvori desk` je vidljiv.

**P1-2 — `useMatches`/`useMatch` nemaju `enabled`/`staleTime`/`retry` i cure fetch bez dozvole**
* Gdje: `hooks/index.ts:142 useMatches` i `155 useMatch` — `useQuery({queryKey, queryFn})` bez `staleTime/retry/enabled/refetchOnWindowFocus` (za razliku `useNewsList` nakon A-04).
* Zašto P1: svaki tab focus refetcha `GET /matches` (cijelu kolekciju) sa default `retry 3` i `staleTime 0`; bez `enabled` fetch-a i kad nema `live.manage`/`matches.manage` — nekonzistentno sa Writer/Moderator.
* Dokaz: `hooks/index.ts:142-152`, `155-161`.

**P1-3 — Loading je `'…'` i nema `role=alert`/`isFetching` na erroru**
* Gdje: `CommentatorHome.tsx:74 value: isLoading ? '…' : counts.live` — `'…'` u cardu; `35-51 isError` early return nema `role="alert"` ni `disabled={isFetching}` na `Retry`.
* Zašto P1: `'…'` je CLS i a11y loš — skeleton je standard (A-04); error bez `role="alert"` ne najavljuje screen readeru, `Retry` bez `isFetching` omogućava dupli fetch.
* Test cementira loše: `fe06-commentator-home.test.tsx:66 expect(screen.getAllByText('…')).toHaveLength(4)`.

### P2 — nekonzistentnost / loša praksa (radi ali se ne radi tako)

**P2-1 — 2 query-a bez `enabled` po permisiji**
* Gdje: `CommentatorHome.tsx:18-22` — `useMatches()` i `useMatch(liveId ?? '')` bez `options: {enabled}`.
* Zašto P2: treba `enabled: hasPermission(perms,'live.manage')||hasPermission(perms,'matches.manage')` za `useMatches`, i `enabled: !!liveId && hasPermission(...)` za `useMatch`.

**P2-2 — Loading skeleton je parcijalan i bez `aria-busy`**
* Gdje: `CommentatorHome.tsx:74 isLoading ? '…'` nema `KpiSkeletonGrid`; `CommentatorDeskList.tsx:41-48 isLoading → 3× Skeleton` ima `Skeleton` ali `div` bez `aria-busy="true"` i bez `HomeKpiGrid` skeletona.
* Zašto P2: profesionalno je `KpiSkeletonGrid` 4 sa `aria-busy` (kao A-04) i `DeskList` `aria-busy` na listi.

**P2-3 — Error stanje bez `role=alert` i bez `isFetching`/`Retry` detalja**
* Gdje: `CommentatorHome.tsx:35-51` — `if isError return <RoleHomeShell + <p>matchesError + Button retry>` — nema `role="alert"`, nema `disabled={isFetching}`.
* Zašto P2: a11y i UX — screen reader ne najavljuje grešku, dupli klik na retry može izazvati dupli fetch. Writer/Moderator imaju `role=alert` + `disabled isFetching`.

**P2-4 — `CommentatorLiveHero` nema skeleton/error i nije permission-gated**
* Gdje: `CommentatorLiveHero.tsx:14-54` — prima `match: Match` bez `isLoading`/`isError` prop-a; `CommentatorHome.tsx:98 hero ? <CommentatorLiveHero>` prikazuje hero čim `live[0]` postoji, bez `liveDetail.isLoading` skeletona.
* Zašto P2: kad `useMatch(liveId)` učitava, hero treba `Skeleton` ili `aria-busy`, a ne prazno.

**P2-5 — `CommentatorDeskList` `ul` bez `aria-label`, `Link` bez `aria-label`**
* Gdje: `CommentatorDeskList.tsx:65 <ul className="divide-y ...">` — bez `aria-label={t('admin.commentator.deskLabel')}`; `DeskRow:27 <Link>Desk</Link>` bez `aria-label`.
* Zašto P2: a11y — screen reader ne zna da je to desk lista.

**P2-6 — `useMatchRealtime` pretplata bez `enabled` po permisiji**
* Gdje: `CommentatorHome.tsx:22 useMatchRealtime(liveId)` — bez `hasPermission` guard-a; `use-match-realtime.ts:14` nema `enabled` param.
* Zašto P2: socket join i za korisnika bez `live.manage` — curenje pretplate.

**P2-7 — KPI `href` uslovna po postojanju utakmice ali ne i po permisiji, i `counts` bez `??0` guard za `matches` undefined**
* Gdje: `commentator-desk.ts:100 deskCounts` — `pickLive(matches).length` bez `matches ?? []` guard? Ali `CommentatorHome.tsx:19 matches = data ?? []` pa je safe; ipak `counts` bi trebalo imati `??0`.
* Zašto P2: nije blokator ali nekonzistentno sa `WriterHome` `??0` patternom.

### P3 — UX/polish (radi, ali može profesionalnije)

**P3-1 — Nema `lastUpdated` ni `Osvježi` dugmeta (kao Writer/Moderator)**
* Komentator ne zna koliko su utakmice svježe; profesionalno: `Ažurirano u HH:MM • Osvježi` ispod KPI-a.

**P3-2 — `RoleHomeShell` hint je statičan, bez broja uživo**
* `commentatorHint: "Semafor, događaji i predaja izvještaja. Bez kalendara i takmičenja."` — mogao bi prikazati `1 uživo • 2 danas`.

**P3-3 — `DeskList` grupe `Uživo/Danas/Predstojeće/Izvještaji` bez `aria-label` na `section`**
* `group.label` je h2 ali `section` bez `aria-label` — mogao bi imati `aria-labelledby`.

**P3-4 — `LiveHero` gradient `slate-900→slate-800` bez `prefers-reduced-motion` guard za `animate-pulse` na badge-u**
* `Badge animate-pulse` za LIVE treba `motion-safe:animate-pulse`.

---

## 4) Dokazi (file:line)

* `CommentatorHome.tsx:18-22` — `useMatches()` + `useMatch(liveId ?? '')` bez `enabled/staleTime/retry` — P1-2, P2-1
* `CommentatorHome.tsx:35-51` — `if isError return <RoleHomeShell + p + Button>` bez `role=alert` i bez `disabled isFetching` — P1-3, P2-3
* `CommentatorHome.tsx:68-92` — `kpiItems` `value: isLoading ? '…' : counts` + `href: live[0]?deskHref:undefined` bez permisije — P1-1, P1-3
* `CommentatorHome.tsx:36-44` — `actions.push` bez `hasPermission` — P1-1
* `CommentatorHome.tsx:98-103` — `{hero ? <CommentatorLiveHero> : null}` bez `isLoading` skeleton — P2-4
* `hooks/index.ts:142-152` — `useMatches` bez `staleTime/retry/enabled` — P1-2
* `hooks/index.ts:155-161` — `useMatch` bez `staleTime/retry` — P1-2
* `CommentatorDeskList.tsx:41-48` — `isLoading → 3× Skeleton` bez `aria-busy` — P2-2
* `CommentatorDeskList.tsx:65` — `<ul>` bez `aria-label` — P2-5
* `CommentatorDeskList.tsx:27` — `<Link>Desk</Link>` bez `aria-label` — P2-5
* `CommentatorLiveHero.tsx:14-32` — `Badge animate-pulse` bez `motion-safe` — P3-4
* `fe06-commentator-home.test.tsx:66` — `expect(screen.getAllByText('…')).toHaveLength(4)` — cementira P1-3

---

## 5) Predloženi plan — bez koda (šta će se dirati)

| Korak | Fajl | Promjena | Rizik | Test |
|-------|------|----------|-------|------|
| 1 | `frontend/src/hooks/index.ts` | `useMatches(seasonId?, roundId?, options?: UseQueryOptions<Match[]>)` + `useMatch(id, options?)` — dodaj `staleTime:30_000, retry:1, refetchOnWindowFocus:false, ...options` (kao `useNewsList`) + `enabled: !!id && (options?.enabled ?? true)` za `useMatch` | nizak | hook test: `enabled:false` ne fetch-a |
| 2 | `frontend/src/pages/admin/homes/CommentatorHome.tsx` | a) `const {user}=useAuth(); perms=user?.permissions;` b) `enabledMatches = hasPermission(perms,'live.manage') \|\| hasPermission(perms,'matches.manage')` c) `useMatches(undefined, undefined, {enabled: enabledMatches})` i `useMatch(liveId ?? '', {enabled: !!liveId && enabledMatches})` d) `useMatchRealtime(liveId, {enabled: enabledMatches})` (ili guard `if (!enabledMatches) return;` u hooku) | srednji | test: bez `live.manage` ne fetch-a, nema `realtimeIds` |
| 3 | `frontend/src/pages/admin/homes/CommentatorHome.tsx` `COMMENTATOR_KPI_PERMISSIONS` | Mapa `live:'live.manage', today:'matches.manage', drafts:'live.manage', pending:'live.manage'` — `href` samo ako `hasPermission(perms, map[key]) && pick...` inače `undefined` → `HomeKpiGrid` `div` | srednji | test: bez `live.manage` live KPI nema Link |
| 4 | `frontend/src/pages/admin/homes/CommentatorHome.tsx` `QUICK_PERMISSIONS` | Mapa `'/admin/live/:id':'live.manage', '/live/:id':'live.manage', '/admin/matches/:id/report':'matches.manage'` — `actions.filter(hasPermission)` | srednji | test: bez `matches.manage` nema `Izvještaj` |
| 5 | `frontend/src/pages/admin/homes/CommentatorHome.tsx` `loading` | `isKpiLoading = isLoading` → `isKpiLoading ? <KpiSkeletonGrid count={4}>` umjesto `'…'`; `aria-busy="true"`; ukloni `'…'` iz `kpiItems` (value je `number`) | nizak | test: loading skeleton `aria-busy`, `queryByText('…')===null` |
| 6 | `frontend/src/pages/admin/homes/CommentatorHome.tsx` `isError` | Ako `isError` → renderaj `role="alert"` + `t('admin.home.matchesError')` + `Button Retry` sa `disabled={isFetching}` (uz sačuvan `RoleHomeShell`/`h1`), ne early-return koji briše KPI/DeskList? Predlažem **skeleton-style**: `isError ? alert+retry` umjesto KPI-a, ali `RoleHomeShell` uvijek sačuvan + `HomeKpiGrid` zamijenjen alertom (kao Writer) | srednji | test: mock `isError:true` → `role=alert` + naslov ostaje |
| 7 | `frontend/src/pages/admin/homes/CommentatorHome.tsx` `lastUpdated` | `matchesUpdatedAt = dataUpdatedAt` iz `useMatches` + `lastUpdated` string + `Osvježi` dugme sa `isFetching` (refetch `useMatches` + `useMatch`) — kao Writer | nizak | test lastUpdated |
| 8 | `frontend/src/pages/admin/homes/CommentatorLiveHero.tsx` | Dodaj `isLoading` prop? Alternativno `CommentatorHome` rendera `HeroSkeleton` kad `liveDetail.isLoading` → ne dirati `LiveHero` direktno; dodaj `LiveHeroSkeleton` u `CommentatorHome` i `aria-busy` | nizak | test: `liveDetail.isLoading` → skeleton |
| 9 | `frontend/src/pages/admin/homes/CommentatorDeskList.tsx` | a) Dodaj `aria-busy="true"` na `div` skeletona b) `<ul aria-label={t('admin.commentator.deskLabel')}>` c) `DeskRow Link` sa `aria-label={deskCtaLabel + matchTitle}` d) `Empty` `role=status`? | nizak | a11y test |
| 10 | `frontend/src/hooks/use-match-realtime.ts` | Dodaj `options?: {enabled?: boolean}` param — ako `enabled===false` ne `emit('match:join')` i ne registruje `on` | nizak | test: `enabled:false` ne poziva `socket.emit` |
| 11 | `frontend/src/pages/admin/homes/fe06-commentator-home.test.tsx` + `fe06-commentator-home-variants.test.tsx` (novi) | Dopuni testove za 4 stanja + permisije + a11y (`role=alert`, `aria-busy`, `aria-label`, `lastUpdated`, `refetch`) — ne briši postojeće, dodaj `enabled`, `kpiError`, `skeleton`, `lastUpdated` | — | `check:all 10/10` |
| 12 | `scripts/standards/baselines/file-size.txt` | Ako `CommentatorHome.tsx` predje 200 lin (očekivano ~240) — dodaj u baseline | nizak | `check:all` |

**Šta se NE dira u ovom koraku:** `commentator-desk.ts` (126 lin ostaje, čista logika), `RoleHomeShell.tsx` (26 lin), `types/Match` (nema schema promjene), `router/app-routes.tsx` (permisija ostaje na BE), `DashboardPage.tsx` dispatcher.

---

## 6) Alternativa (zašto ne drugačije)

* **Ne dodavati `enabled` po permisiji nego osloniti se na BE 403:** odbačeno — FE bi retry-ao (`retry 3` default) i prikazivao `0` umjesto poruke; `enabled:false` je jeftiniji i spriječava curenje `GET /matches` (velik payload).
* **Ne skrivati KPI link kao `div` nego disabled `Link` sa tooltipom „Nema dozvolu“:** odbačeno — disabled link je a11y zamka; `div` bez linka je isti obrazac kao A-04 (konzistentno).
* **Skeleton umjesto `'…'`:** `'…'` je brži ali je CLS i a11y loš — skeleton je standard za dashboard-e (A-04 već ima `KpiSkeletonGrid`).
* **Ne dodavati `lastUpdated`/`Osvježi`:** moglo bi bez, ali Writer ga već ima pa je konzistentno za komentatora koji čeka LIVE.

---

## 7) Kriterijumi gotovosti (DoD)

- [ ] P1-1..P1-3 zatvoreni + testovi koji padaju bez fixa (KPI bez permisije → nema Link-a; `isError` → `role=alert` sa naslovom; `useMatches` sa `enabled/staleTime/retry`)
- [ ] P2-1..P2-7 zatvoreni: `staleTime 30s`/`retry 1`/`enabled` na 2 hooka, skeleton sa `aria-busy`, `role=alert` + `disabled isFetching`, `DeskList` `aria-label`, `LiveHero` skeleton, `useMatchRealtime` `enabled`
- [ ] `HomeKpiGrid`/`HomeQuickActions` permisije konzistentne
- [ ] `check:all 10/10`, `tsc -b` čist, `axe` bez kršenja na `/admin` (commentator)
- [ ] `AUDIT/COVERAGE_MATRIX.csv` + `AUDIT/STATE.md` ažurirani, `CI 6/6` na `arena/290a6f13-fkgracanica`
- [ ] Nema promjene ponašanja za komentatora koji ima sve permisije (`live.manage+matches.manage` → 4 KPI, 3 akcije, hero, lista)

---

## 8) Otvorena pitanja za tebe (ask_user prije koda)

**Q1 — KPI permisije:** Da li `live/drafts/pending → live.manage`, `today → matches.manage` budu **striktno skriveni kao `div` bez linka** ako nema permisiju? Predlažem **skriven link (div)** — kao Writer.

**Q2 — QuickActions permisije:** Da li `Otvori desk → live.manage`, `Javni live → live.manage`, `Izvještaj → matches.manage` budu **filtrirani** bez permisije? Predlažem **filtrirani**.

**Q3 — Hero loading:** Da li `CommentatorLiveHero` treba `Skeleton` kad `useMatch(liveId)` učitava, ili da ostane prazan? Predlažem **HeroSkeleton** (`Card` + `animate-pulse`) dok se detalj učitava.

**Q4 — lastUpdated:** Da li KPI-evi trebaju `Osvježi` dugme + `lastUpdated` (kao Writer) ili samo bez? Predlažem **dugme + lastUpdated**, bez intervala.

> Ako odobriš ovaj plan (ili `approve_with_comments`), sljedeći korak je implementacija A-05 po tabeli iznad — jedan PR, dio po dio, uz `gh run watch` do `6/6`.
