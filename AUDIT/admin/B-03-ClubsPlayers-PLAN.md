# B-03 — ClubsAdminPage / PlayersAdminPage — PLAN (2026-11-18, grana `arena/290a6f13-fkgracanica` @ `c4865d3`)

> Planski dokument — bez koda. Slijedi template iz `ADMIN_PLAN_2026-11-17.md` §2. Implementacija tek nakon `ask_user approve`.

---

## Meta

| Polje | Vrijednost |
|-------|------------|
| Ruta | `/admin/clubs` (`app-routes.tsx` `ModuleRoute moduleKey="modules.clubs"`), `/admin/players` (`modules.players`/`players.manage`) |
| Fajl(ovi) | `pages/admin/ClubsAdminPage.tsx` (133 lin, 4401B) · `pages/admin/ClubsAdminFormSheet.tsx` (108 lin, 3710B) · `pages/admin/PlayersAdminPage.tsx` (128 lin, 4303B) · `pages/admin/PlayersAdminFormSheet.tsx` (149 lin, 5102B) · `hooks/index.ts:useClubs` (131) / `usePlayers` (114) / `useOwnClub` (138) · `hooks/use-competition-admin.ts` (useCreate/Update/DeleteClub/Player) · `components/admin/AdminPageShell.tsx` · `lib/club-utils.ts` (`clubCrestPath`) / `lib/player-utils.ts` (`playerPositionLabel`) · `lib/media.ts` (`mediaUrl`) |
| Rola/permisije | `clubs.manage` (ClubsAdmin `canManage`), `players.manage` (PlayersAdmin `canManage`) — čitanje liste je `modules.clubs`/`modules.players`, mutacije gated `canManage ? actions : []`; rute gated `ModuleRoute`, nema direktne `PermissionRoute` |
| API | `GET /clubs` (`useClubs`), `GET /clubs/own` (`useOwnClub`), `GET /players?clubId=&activeOnly=` (`usePlayers`), `POST/PATCH/DELETE /clubs/:id`, `POST/PATCH/DELETE /players/:id` |
| Stanje grane | `arena/290a6f13-fkgracanica` @ `c4865d3` (B-02 ZATVOREN 44366839725 6/6, A-07 ZATVOREN, check:all 10/10, dead-guards 2/2) |

---

## 1) Šta radi danas (činjenično, bez ocjene)

**`ClubsAdminPage.tsx:22-133`:**
```
const canManage = hasPermission(clubs.manage)
const {data, isLoading, isError, refetch} = useClubs() // bez isFetching/dataUpdatedAt, bez staleTime/retry
const remove = useDeleteClub()
const [open,edit] = useState
onDelete = async (club) => confirm → if(ok) void runAction(remove.mutateAsync(club.id)) // isPending se ne koristi za disable, /* v8 ignore */ nema ali branch je reachable
return <><Seo title/> {dialog} <AdminPageShell isError={isError} onRetry={()=>void refetch()} title isLoading={isLoading} actions={canManage ? <Button Novi>}:> <AdminDataTable rows={data??[]} columns=[crest, name, city, stadium, own Badge, actions: edit/delete if canManage]> />
```
`AdminPageShell` prima `isError`/`isLoading` i interno renderuje `<DataError>` ili 5× `<Skeleton>`; nema `isFetching`/`dataUpdatedAt`/`lastUpdated`, nema `aria-busy` wrapper, nema `disabled` na akcijama, nema `empty` role.

**`PlayersAdminPage.tsx:22-128`:** identičan obrazac sa `usePlayers()` (bez staleTime), `canManage = hasPermission(players.manage)`, `onDelete` isto, kolone `[name+Badge inactive, position, number, club?.name, actions]`. `AdminPageShell isError/isLoading` isto.

**Hookovi:**
- `useClubs()` — `useQuery(['clubs'], api.get('/clubs'))` — **bez** `staleTime/retry/refetchOnWindowFocus`, bez `options` overload, bez `enabled`.
- `usePlayers(options?)` — `useQuery(['players', clubId, activeOnly], params)` — prima `clubId/activeOnly` ali **bez** `staleTime/retry/refetch`, bez `UseQueryOptions` overload (samo custom options, ne prosleđuje se u `useQuery`).
- `useOwnClub()` — `useQuery(['clubs','own'], api.get('/clubs/own'))` — bez `staleTime/retry`, bez overload.
- `useCreate/Update/DeleteClub/Player` — `mutateAsync` + invalidacija `['clubs']`/`['players']`/`['clubs','own']`, `isPending` postoji ali se ne koristi na pozivaocu za `disabled`.

**`ClubsAdminFormSheet.tsx:15-108`:**
```
const create/update = hooks
name/city/stadium/description/crestPath/isOwnClub + feedback
useEffect reset na open/edit (crestPath = edit.crestPath ?? edit.logoPath)
save: body {name, city||undefined, ...} → if(edit) update else create → onOpenChange(false) na success; catch → setFeedback(t('admin.common.saveFailed'))
Button disabled={!name || create.isPending || update.isPending}
```
Nema `!name.trim()`, nema validacije dužine, nema `role=alert` na feedback, `crestPath` fallback radi ali nema `aria-label` na MediaPicker, nema `disabled` za opis/stadium dok je pending.

**`PlayersAdminFormSheet.tsx:18-149`:**
```
const {data: clubs} = useClubs(); const {data: ownClub} = useOwnClub()
pos: GK/DEF/MID/FWD; firstName/lastName/clubId/position/number/photoPath/bio/isActive + feedback
useEffect reset: setClubId(edit?.clubId ?? fixedClubId ?? ownClub?.id ?? '')
save: body {firstName,lastName, clubId: fixedClubId||clubId||undefined, position, number: Number(number) or undefined, ...} → create/update → onOpenChange(false); catch → setFeedback('Spremanje nije uspjelo')
Button disabled={!firstName||!lastName||create.isPending||update.isPending}
```
Slični propusti: nema `trim`, nema validacije `number` min/max (1-99?), nema `role=alert`, nema `disabled` dok je `clubs` loading.

**Stanja danas:**
- `loading` → `AdminPageShell isLoading` renderuje 5× Skeleton (bez `aria-busy` na wrapperu, bez `lastUpdated`), akcije nisu disabled.
- `error` → `AdminPageShell isError` renderuje `<DataError>` sa `role=alert`? Provjeriti `DataError` — ima `role=alert`? Ako ima, ok, ali `Retry` nema `disabled={isFetching}` guard.
- `empty` → `AdminDataTable` `rows=[]` vraća `<p>Nema podataka</p>` bez `role=status`, bez CTA.
- `forbidden` → akcije sakrivene (`canManage ? actions : null`), ali fetch se i dalje radi bez `enabled` (čitanje je dozvoljeno, ok).
- `mutacija pending` → dugmad `Edit/Obriši` u tabeli **nisu** `disabled`, korisnik može duplo kliknuti `Obriši` dok je `remove.isPending`.

---

## 2) Šta bi trebala da radi (očekivano — profesionalni standard za katalog klubova/igrača)

* **Korisnik:** admin sa `clubs.manage` / `players.manage` koji za <10s mora **vidjeti listu klubova** (grb, grad, stadion, naš klub) i **listu igrača** (ime, pozicija, broj, klub, aktivan), te **kreirati/uređivati/brisati** klub/igrača bez gubitka konteksta, uz **jasne validacije** (ime obavezno, broj 1-99, grb opcioni).
* **Ugovor:**
  * Čitanje: `modules.clubs` / `modules.players` (ruta gate) — fetch uvijek, `staleTime 30s` da ne refetcha na svaki focus, `retry 1`.
  * Mutacije: `clubs.manage` / `players.manage` — akcije `disabled` dok `isPending`, `confirm` + `runAction` za grešku (već postoji).
  * 4 stanja: `loading → skeleton aria-busy` (sačuvan `Seo/h1` + `AdminBreadcrumbs`), `error → role=alert + retry disabled isFetching`, `empty → role=status sa CTA`, `success → tabela`.
* **Ponašanje:**
  * `isLoading` → `AdminPageShell` skeleton sa `aria-busy="true"` (kao B-02 per-section ili shell), `isError` → `role=alert` + `Retry disabled={isFetching}` sa sačuvanim `Seo/h1`.
  * `!data` → `role=status` prazno sa porukom `Nema klubova / Nema igrača`.
  * `onDelete` → dugmad `disabled={remove.isPending}` + `aria-busy` na tabeli.
  * `useClubs`/`usePlayers`/`useOwnClub` → `staleTime 30k`, `retry 1`, `refetchOnWindowFocus:false`, `UseQueryOptions` overload konzistentno sa `useCompetitions`/`useSeasons`/`useMatches`.
  * `Seo` title uvijek renderan, `h1` iz `AdminPageShell title` mora ostati u DOM-u i na erroru (već radi preko shell).
  * `lastUpdated/Osvježi` ispod headera (`dataUpdatedAt` + `Button disabled isFetching`) kao B-02 i A-02..A-07.
* **A11y/i18n/perf:**
  * `AdminDataTable` prazno `empty` treba `role=status`, akcije `aria-label` već imaju `t('actions.edit/delete')` — ok.
  * `t()` ključevi već postoje (`admin.clubsList.title`, `admin.players`, `admin.club.*`, `admin.playerForm.*`, `actions.*`) — ne dodavati nove bez potrebe.
  * 1 fetch po `clubs`/`players` sa `staleTime` da se ne refetcha na svaki tab focus.
  * FormSheet: validacija `name.trim()` required, `firstName/lastName.trim()`, `number` 1-99, `disabled` pokriva sve mutacije, `error` `role=alert`.

---

## 3) Propusti — klasifikacija

### P1 — blokator / sigurnosni / funkcionalni (mora odmah)

**P1-1 — `useClubs`/`usePlayers`/`useOwnClub` nemaju `staleTime/retry/refetchOnWindowFocus` ni `UseQueryOptions` overload — nekonzistentno sa `useCompetitions` (B-02) i `useSeasons`/`useRounds` (A-07)**
* Gdje: `hooks/index.ts:114-143` — `useClubs` (131) i `usePlayers` (114) i `useOwnClub` (138) bez `staleTime`/`retry`.
* Zašto P1: svaki tab focus refetcha `/clubs` i `/players` sa default `retry 3`; nekonzistentno sa B-02/A-07 (`staleTime 30k retry1`). `usePlayers` već prima `options?: {clubId, activeOnly}` ali ne prosleđuje `UseQueryOptions`.
* Dokaz: `useClubs` nema `...options` spread.

**P1-2 — `ClubsAdminPage`/`PlayersAdminPage` `Edit/Obriši` dugmad nisu `disabled` dok je `remove.isPending` — dupli klik briše duplo, nema `aria-busy`**
* Gdje: `ClubsAdminPage.tsx:88-102` `Button ... onClick={()=> void onDelete(r)}` bez `disabled`, slično `PlayersAdminPage.tsx:88-102`.
* Zašto P1: korisnik može duplo kliknuti `Obriši` dok je zahtjev u toku; a11y nema `aria-busy`. `CompetitionsAdminPage` (B-02) već ima `disabled={deleteX.isPending}`, `SeasonRoundsPanel` (A-07) isto.
* Dokaz: `ClubsAdminPage.tsx:99` `aria-label={t('actions.delete')}` bez `disabled`.

**P1-3 — `AdminPageShell` error retry nema `disabled={isFetching}` guard — korisnik može spamati `Pokušaj ponovo` dok je fetch u toku**
* Gdje: `AdminPageShell.tsx:42-47` `isError ? <DataError onRetry={onRetry}>` — `DataError` prima `onRetry` ali shell ne prosljeđuje `isFetching`/`disabled`.
* Zašto P1: na sporoj mreži korisnik može 10× kliknuti retry, svaki poziva `refetch()`. B-02/A-07 imaju `disabled={isFetching}` na retry.
* Dokaz: `ClubsAdminPage.tsx:23` `const {data, isLoading, isError, refetch} = useClubs()` — bez `isFetching`, pa se ne može proslijediti.

### P2 — nekonzistentnost / loša praksa (radi ali se ne radi tako)

**P2-1 — `AdminPageShell isLoading` renderuje 5× Skeleton bez `aria-busy` wrappera, nema `lastUpdated`/`Osvježi` kao B-02/A-07**
* Gdje: `AdminPageShell.tsx:49-57` `isLoading ? <div className="space-y-3">5× Skeleton` — bez `aria-busy`, bez `lastUpdated`; `ClubsAdminPage.tsx:42` nema `dataUpdatedAt`.
* Zašto P2: screen reader ne zna da je tabela u loadingu; admin ne zna svježinu podataka. B-02 ima `lastUpdated/Osvježi` per-section.
* Predlog: Q1 — da li dodati `lastUpdated/Osvježi` ispod headera kao `CompetitionsAdminPage`?

**P2-2 — `AdminDataTable` prazno stanje nema `role=status`, koristi `<p>Nema podataka</p>` bez semantike**
* Gdje: `AdminPageShell.tsx:84` `if (!rows.length) return <p className="p-6 text-center">` — bez `role`.
* Zašto P2: a11y prazno treba `role=status`. B-02 ima `role=status` za prazno.

**P2-3 — `ClubsAdminFormSheet`/`PlayersAdminFormSheet` `Button disabled` koristi `!name` umjesto `!name.trim()`, nema validacije `number` opsega (1-99) ni `role=alert` za `feedback`**
* Gdje: `ClubsAdminFormSheet.tsx:104` `disabled={!name || create.isPending || update.isPending}` — `!name` prolazi za `"   "`; `PlayersAdminFormSheet.tsx:170` `disabled={!firstName || !lastName ...}` — isto; `number` se šalje kao `Number(number)` bez provjere `1-99`; `feedback && <p className="text-sm text-danger">` bez `role=alert`.
* Zašto P2: korisnik može poslati prazan string sa razmacima, BE vraća 400; a11y greška bez `role=alert` se ne najavljuje. B-02 FormSheet već ima `!name.trim()` + `yearStart>yearEnd` + `role=alert`.
* Predlog: `disabled={!name.trim() || ...}` + `number` validacija + `feedback && <p role="alert">`.

**P2-4 — `PlayersAdminFormSheet` `clubId` select nema `isLoading`/`isError` handling za `useClubs` — ako `clubs` još učitava, select je prazan bez poruke**
* Gdje: `PlayersAdminFormSheet.tsx:26` `const {data: clubs} = useClubs()` — bez `isLoading`, `clubOptions` je `[]` dok se učitava.
* Zašto P2: na sporoj mreži korisnik vidi prazan `EntitySelect` bez skeletona. B-02/A-07 imaju `aria-busy` za select loading.

**P2-5 — `usePlayers` prima `options?: {clubId, activeOnly}` ali ne podržava `UseQueryOptions` (enabled, staleTime) — ne može se gate-ati po permisiji**
* Gdje: `hooks/index.ts:114` `usePlayers(options?: {clubId?: string; activeOnly?: boolean})` — nema `UseQueryOptions` overload.
* Zašto P2: nekonzistentno sa `useCompetitions`/`useSeasons` koji imaju overload; nema `enabled` gate ako bi trebalo (ali čitanje je dozvoljeno, pa je ok, ali za konzistenciju treba).

### P3 — UX/polish (radi, ali može profesionalnije)

**P3-1 — `ClubsAdminPage` actions `+ Novi` dugme koristi `size="sm"` bez `aria-hidden` na `Plus` ikoni — sitno za touch, ali `Plus` već ima implicitno dekorativno**
* Predlog: dodati `aria-hidden` na `Plus` (B-02 već ima `aria-hidden`).

**P3-2 — `PlayersAdminPage` `playerPositionLabel` i `Badge inactive` su ok, ali `club?.name` fallback `—` je ok — nema izmjene.**

---

## 4) Dokazi (file:line)

* `hooks/index.ts:114-143` — `usePlayers/useClubs/useOwnClub` bez `staleTime/retry/options` — P1-1
* `ClubsAdminPage.tsx:88-102` — `Button` edit/delete bez `disabled={remove.isPending}` — P1-2
* `PlayersAdminPage.tsx:88-102` — isto — P1-2
* `AdminPageShell.tsx:42-47` — `DataError` bez `isFetching` disabled — P1-3
* `hooks/index.ts:131-136` — `useClubs` nema `...options` — P1-1
* `ClubsAdminPage.tsx:23` — `useClubs()` samo `isLoading` bez `isFetching/dataUpdatedAt` — P2-1
* `AdminPageShell.tsx:84` — `if (!rows.length) return <p>` bez `role=status` — P2-2
* `ClubsAdminFormSheet.tsx:104` — `disabled={!name || ...}` — P2-3
* `PlayersAdminFormSheet.tsx:170` — `disabled={!firstName||!lastName||...}` — P2-3
* `PlayersAdminFormSheet.tsx:26` — `useClubs()` bez `isLoading` u FormSheet — P2-4

---

## 5) Predloženi plan — bez koda (šta će se dirati)

| Korak | Fajl | Promjena | Rizik | Test |
|-------|------|----------|-------|------|
| 1 | `frontend/src/hooks/index.ts` (`useClubs`, `usePlayers`, `useOwnClub`) | Dodaj `UseQueryOptions` overload + `staleTime:30_000, retry:1, refetchOnWindowFocus:false, ...options` kao `useCompetitions` (B-02) i `useSeasons` (A-07). Za `usePlayers` sačuvaj `clubId/activeOnly` param + `options` spread (`Omit queryKey/queryFn`). `useOwnClub` isto. | nizak | hook test: `enabled:false` ne fetch-a, `staleTime` |
| 2 | `frontend/src/pages/admin/ClubsAdminPage.tsx` + `PlayersAdminPage.tsx` | a) `const {data, isLoading, isError, isFetching, dataUpdatedAt, refetch} = useClubs()` / `usePlayers()` + `useOwnClub` ne treba b) Sačuvaj `Seo` + `AdminPageShell title` i u `isError` granama (shell već čuva) c) Dodaj `lastUpdated/Osvježi` ispod headera (`dataUpdatedAt` + `Button disabled isFetching` refetch) kao B-02 d) `Edit/Trash` `disabled={remove.isPending}` + `aria-busy` na tabeli | srednji | mock `isError:true` → `role=alert` + heading ostaje, `isFetching` disabled |
| 3 | `frontend/src/components/admin/AdminPageShell.tsx` | a) Dodaj `isFetching?: boolean` prop i proslijedi `disabled={isFetching}` na `DataError` retry dugme b) Dodaj `aria-busy` wrapper na skeleton (`<div aria-busy="true">`) c) Dodaj `role=status` na prazno `<p>` (ali prazno je u `AdminDataTable`, pa popraviti tamo) | nizak | shell test |
| 4 | `frontend/src/components/admin/AdminPageShell.tsx` (`AdminDataTable`) | Dodaj `role="status"` na prazno `p` (`<p role="status" className="p-6 text-center">`) | nizak | empty `role=status` |
| 5 | `frontend/src/pages/admin/ClubsAdminFormSheet.tsx` | a) `disabled` proširi na `!name.trim()` + pokriva i `create/update` (već pokriva) b) `feedback && <p role="alert">` c) Eventualno `Input` `aria-label` već ok | nizak | validacija `name.trim()` disabled |
| 6 | `frontend/src/pages/admin/PlayersAdminFormSheet.tsx` | a) `disabled` proširi na `!firstName.trim() || !lastName.trim()` + `create/update` + `number` validacija `1-99` (ako `number` prazan ok, ako popunjen mora biti 1-99) b) `feedback && <p role="alert">` c) `clubOptions` loading state? Opcionalno `aria-busy` na `EntitySelect` dok `isLoading` | nizak | validacija `firstName.trim()` disabled |
| 7 | `frontend/src/pages/admin/fe06-b03-clubs-players.test.tsx` (novi) | Dopuni testove za 4 stanja po stranici + permisije + a11y (`role=alert`, `aria-busy`, `disabled isPending`, `lastUpdated`) — ne briši postojeće `fe06-clubs*`/`fe06-players*` | — | `check:all 10/10` |
| 8 | `scripts/standards/baselines/file-size.txt` | Ako `ClubsAdminPage.tsx`/`PlayersAdminPage.tsx` pređu 200 lin (133→~160, 128→~160) — ne treba baseline (ostane ispod 200) | — | `check:all` |
| 9 | `frontend/src/locales/bs+en/common.json` | Provjeri `admin.home.refresh/lastUpdated` + `admin.common.loadError` već postoje — ne treba novi ključ (eventualno `admin.clubsList.*` već postoji) | — | — |

**Šta se NE dira:** `ClubHubPage`/`ClubsListPage`/`ClubHubPanel` (D-01 klubski hub), `ClubPlayersTab` itd., `backend` `clubs.service`/`players.service`, `router` gating (`ModuleRoute`), `MediaPicker`/`EntitySelect` interno.

---

## 6) Alternativa (zašto ne drugačije)

* **Ne dodavati `enabled` po permisiji za čitanje:** odbačeno — `modules.clubs`/`players` već gate-a rutu, ali `useClubs` bez `staleTime` fetch-a i na svaki focus; `enabled` nije potreban za čitanje, ali `staleTime` jeste. Overload sa `enabled` je za konzistenciju i buduće gate-anje.
* **Ne dirati `AdminPageShell` nego ručno u svakoj stranici kao B-02 per-section:** odbačeno — za single-table stranice shell-ov `isError/isLoading` je dovoljan i manje koda; B-02 je per-section jer ima 2 tabele, ovdje je 1 tabela pa je shell dovoljan uz dopunu `isFetching`/`aria-busy`.
* **Ne dodavati `lastUpdated`:** može, ali B-02/A-07 standard je `lastUpdated/Osvježi`, pa je konzistentno dodati.
* **FormSheet validacija `name.trim()`:** može i bez, ali BE vraća 400 za prazan string sa razmacima — bolje disable na FE.

---

## 7) Kriterijumi gotovosti (DoD)

- [ ] P1-1..P1-3 zatvoreni + testovi koji padaju bez fixa (`staleTime/retry` na `useClubs/usePlayers/useOwnClub`; delete `disabled isPending` + `aria-busy`; `isFetching` disabled na retry)
- [ ] P2-1..P2-5 zatvoreni: `UseQueryOptions` overload, `isLoading` `aria-busy` + `lastUpdated/Osvježi`, `role=status` prazno, FormSheet `trim` + `role=alert` + `number` validacija
- [ ] `check:all 10/10`, `tsc -b` čist, `axe` bez kršenja na `/admin/clubs` i `/admin/players` (admin)
- [ ] `AUDIT/COVERAGE_MATRIX.csv` + `AUDIT/STATE.md` ažurirani, `CI 6/6` na `arena/290a6f13-fkgracanica`
- [ ] Nema promjene ponašanja za admina sa `clubs.manage`/`players.manage` (lista klubova/igrača + forme)

---

## 8) Otvorena pitanja za tebe (ask_user prije koda)

**Q1 — `lastUpdated`/`Osvježi`:** Da li `ClubsAdminPage` i `PlayersAdminPage` trebaju `Osvježi` dugme + `lastUpdated` (kao CompetitionsAdmin/SeasonHub) ili samo `staleTime` bez dugmeta? Predlažem **dugme + lastUpdated** ispod headera (`dataUpdatedAt` + `Button disabled isFetching`).

**Q2 — `delete` `disabled`:** Da li `Edit/Obriši` u obje tabele trebaju biti `disabled` dok je `remove.isPending` (odvojeno po stranici: `Clubs` `disabled={deleteClub.isPending}`, `Players` `disabled={deletePlayer.isPending}`) ili globalno? Predlažem **odvojeno po stranici** (svaka stranica svoj `remove`).

**Q3 — `FormSheet` validacija:** Da li dodati `firstName.trim()/lastName.trim()/name.trim()` + `number` 1-99 disable + `role=alert` na `feedback` ili ostaviti BE 400? Predlažem **trim + number 1-99 + role=alert** na FE.

> Ako odobriš ovaj plan (ili `approve_with_comments`), sljedeći korak je implementacija B-03 po tabeli iznad — jedan PR, `gh run watch` do `6/6`.

