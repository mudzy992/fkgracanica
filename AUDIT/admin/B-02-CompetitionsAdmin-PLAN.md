# B-02 — CompetitionsAdminPage — PLAN (2026-11-18, grana `arena/290a6f13-fkgracanica` @ `ecba3ae`)

> Planski dokument — bez koda. Slijedi template iz `ADMIN_PLAN_2026-11-17.md` §2. Implementacija tek nakon `ask_user approve`.

---

## Meta

| Polje | Vrijednost |
|-------|------------|
| Ruta | `/admin/competitions` (`app-routes.tsx:118` `ModuleRoute moduleKey="modules.competitions"` + `PermissionRoute` indirektno) |
| Fajl(ovi) | `pages/admin/CompetitionsAdminPage.tsx` (171 lin, 7495B) · `pages/admin/CompetitionsAdminFormSheet.tsx` (151 lin, 5129B) · `hooks/use-competition-admin.ts` (useCreate/Update/DeleteCompetition) · `hooks/use-season-admin.ts` (useCreate/Update/DeleteSeason, useDeleteSeasonCompetition) · `hooks/index.ts:useCompetitions` / `useSeasons` (staleTime za seasons već 30k nakon A-07, competitions bez) · `components/admin/AdminPageShell.tsx` · `components/admin/AdminFormSheet.tsx` |
| Rola/permisije | `competitions.manage` (`canManage`) — čitanje lista je `modules.competitions`, mutacije gated `canManage ? actions : []`; rute gated `ModuleRoute`, nema direktne `PermissionRoute` na `/admin/competitions` (ok, modul gate) |
| API | `GET /competitions` (`useCompetitions`), `GET /seasons` (`useSeasons`), `DELETE /competitions/:id`, `DELETE /seasons/:id`, `POST/PATCH /competitions`, `POST/PATCH /seasons` (kroz FormSheet) |
| Stanje grane | `arena/290a6f13-fkgracanica` @ `ecba3ae` (A-07 ZATVOREN 44328034785 6/6, check:all 10/10, dead-guards 2/2, coverage 99.97%) |

---

## 1) Šta radi danas (činjenično, bez ocjene)

**`CompetitionsAdminPage.tsx:22-171`:**
```
const canManage = hasPermission(competitions.manage)
const {data: competitions, isLoading: cl} = useCompetitions() // bez isError/isFetching/refetch, bez staleTime/retry (useCompetitions nema)
const {data: seasons, isLoading: sl} = useSeasons() // sada ima staleTime30k retry1 (nakon A-07)
const deleteComp = useDeleteCompetition(); const deleteSeason = useDeleteSeason();
compList = competitions ?? []; seasonList = seasons ?? [];
return <><Seo title=.../> {dialog} <AdminPageShell isLoading={cl||sl} title actions={canManage? 2x Button}> 
  <h2>Sezone</h2> <AdminDataTable rows={seasonList} empty columns=[name, years, editions Badge, hub Link open, active Badge, ...(canManage? actions: edit/delete)] />
  <h2>Katalog</h2> <AdminDataTable rows={compList} empty columns=[name, slug, league Badge, ...(canManage? actions: edit/delete)] />
</AdminPageShell> <CompetitionsAdminFormSheet open/mode/edit.../> </>
onDeleteComp/Season: confirm → if(ok) void runAction(deleteX.mutateAsync(id)) // isPending se ne koristi za disable, /* v8 ignore next */ na if(ok)
```

**`AdminPageShell`:** prima `isLoading` (cl||sl) i renderuje `<Skeleton>` ili `<Alert>` interno? Provjeriti — ali stranica ne prosljeđuje `isError`/`isFetching`/`refetch` pa error grana ne postoji. `isLoading` je OR dva upita — ako jedan fetch-a a drugi je gotov, cijela stranica je loading (CLS).

**`CompetitionsAdminFormSheet.tsx:35-151`:**
```
const createComp/updateComp/createSeason/updateSeason = hooks
name/yearStart/yearEnd/isActive/isLeague + error state
useEffect reset polja na open/mode/edit
save: if mode===competition -> create/updateComp mutateAsync; else if season -> create/updateSeason mutateAsync; onOpenChange(false) na success; catch -> setError(message)
Button disabled={!name || createComp.isPending || createSeason.isPending} // ne pokriva updateX.isPending, ne pokriva prazan yearStart/yearEnd, mutacije paralelno
Input name placeholder nameRequired, Switch isLeague/isActive, Input number za yearStart/End bez min/max/validacije
```

**Hookovi:**
- `useCompetitions()` — `useQuery(['competitions'], api.get('/competitions'))` — **bez** `staleTime/retry/refetchOnWindowFocus`, bez `options` overload, bez `enabled` gate.
- `useSeasons(options?)` — **ima** `staleTime30k retry1 refetch false` nakon A-07 — ok.
- `useDeleteCompetition/Season` — `mutateAsync` + invalidacija `['competitions']` / `['seasons']`, nema `isPending` disable na pozivaocu (stranica ne koristi `disabled`).

**Stanja danas:**
- `loading` → `AdminPageShell isLoading` (jedan skeleton za obje tabele), nema `aria-busy` na pojedinoj tabeli, nema odvojenog skeleta po sekciji.
- `error` → **ne postoji** `isError`/`role=alert`/`retry`; `AdminPageShell` ne dobija error, API pad prikazuje prazan `empty` ili ostaje skeleton.
- `empty` → `AdminDataTable empty` string (`emptySeasons`/`emptyCompetitions`) — ok, ali bez `role=status` na wrapperu.
- `forbidden` → akcije sakrivene (`canManage ? [] : []`), ali fetch se i dalje radi bez `enabled` po permisiji (čitanje je dozvoljeno za sve sa `modules.competitions`, ok).
- `mutacija pending` → dugmad `Edit/Obriši` u tabeli **nisu** `disabled`, korisnik može duplo kliknuti `Obriši` dok je `deleteComp.isPending`.

---

## 2) Šta bi trebala da radi (očekivano — profesionalni standard za katalog takmičenja)

* **Korisnik:** admin sa `competitions.manage` koji za <10s mora **vidjeti listu kalendarskih sezona** (sa brojem takmičenja i aktivnosti) i **katalog takmičenja** (liga vs ostalo), te **kreirati/uređivati/brisati** sezonu/takmičenje bez gubitka konteksta.
* **Ugovor:**
  * Čitanje: `modules.competitions` (ruta gate) — fetch uvijek, `staleTime 30s` da ne refetcha na svaki focus.
  * Mutacije: `competitions.manage` — akcije `disabled` dok `isPending`, `confirm` + `runAction` za grešku (već postoji).
  * 4 stanja po sekciji: `loading → skeleton aria-busy` (po tabeli, ne cijela stranica OR), `error → role=alert + retry disabled isFetching` (sačuvan `Seo/h1` + `AdminBreadcrumbs`), `empty → role=status sa CTA`, `success → tabela`.
* **Ponašanje:**
  * `isLoading` svake tabele → `Skeleton` sa `aria-busy="true"` i sačuvanim layoutom (kao `SeasonRoundsPanel` / `PlatformStatusPage`), ne jedan globalni `AdminPageShell isLoading` OR.
  * `isError` svake tabele → `role="alert"` + `Retry` `disabled={isFetching}` + sačuvan `Seo/h1` — danas error briše tabele i ne najavljuje screen readeru.
  * `!data` → `role="status"` prazno.
  * `onDelete` → dugmad `disabled={deleteComp.isPending || deleteSeason.isPending}` + `aria-busy`.
  * `useCompetitions` → `staleTime 30k`, `retry 1`, `refetchOnWindowFocus:false` konzistentno sa `useSeasons` (A-07) i `useMatches`/`useRounds`.
  * `Seo` title uvijek renderan (`t('admin.competitionsAdmin.metaTitle')` već postoji), `h1` iz `AdminPageShell title` mora ostati u DOM-u i na erroru.
* **A11y/i18n/perf:**
  * `AdminDataTable` prazno `empty` treba `role="status"`, akcije `aria-label` već imaju `t('actions.edit/delete')` — ok.
  * `t()` ključevi već postoje (`admin.competitionsAdmin.*`, `admin.competitionForm.*`, `actions.*`, `admin.common.yes/no`) — ne dodavati nove bez potrebe.
  * 1 fetch po `competitions`/`seasons` sa `staleTime` da se ne refetcha na svaki tab focus.
  * FormSheet: validacija `name` required + `yearStart <= yearEnd` + `disabled` pokriva sve 4 mutacije (`createComp/updateComp/createSeason/updateSeason`), `error` `role=alert`.

---

## 3) Propusti — klasifikacija

### P1 — blokator / sigurnosni / funkcionalni (mora odmah)

**P1-1 — `CompetitionsAdminPage` nema `isError`/`isFetching`/`refetch`/`dataUpdatedAt` ni za `competitions` ni za `seasons` — nema `role=alert` ni `retry`, loading je `OR` cijele stranice**
* Gdje: `CompetitionsAdminPage.tsx:25-26` `const {data, isLoading: cl} = useCompetitions()` + `isLoading: sl` — samo `isLoading`, bez `isError/isFetching`.
* Zašto P1: admin na padu API-ja (`GET /competitions` 500) vidi prazno `emptySeasons`/`emptyCompetitions` ili beskonačan skeleton, screen reader ne najavljuje error; `AdminHome`/`SeasonHub` pattern je sačuvan `h1` + `role=alert` + `disabled isFetching`.
* Repro: mock `isError:true` za `useCompetitions` → `queryByRole('alert')` null, `getByText('Nema sezona')` prikazuje prazno umjesto greške.
* Dokaz: `AdminPageShell` prima samo `isLoading`, nema `isError` prop — error se ne može prikazati.

**P1-2 — `useCompetitions` nema `staleTime/retry/refetchOnWindowFocus` ni `UseQueryOptions` overload — nekonzistentno sa `useSeasons` (A-07) i `useMatches/useRounds`**
* Gdje: `hooks/index.ts:301-306` `useCompetitions()` bez opcija; `hooks/index.ts:309-318` `useSeasons` ima `staleTime30k retry1`.
* Zašto P1: svaki tab focus refetcha `/competitions` sa default `retry 3`; nekonzistentno sa A-02..A-07 (`staleTime 30k retry1`).
* Dokaz: `useCompetitions` nema `...options` spread.

**P1-3 — `Edit/Obriši` dugmad u obje tabele nisu `disabled` dok je `deleteComp/deleteSeason.isPending` — dupli klik briše duplo, `Trash` nema `aria-busy`**
* Gdje: `CompetitionsAdminPage.tsx:89-97` `Button ... onClick={() => void onDeleteSeason(r)}` bez `disabled`, slično `119-126` za `onDeleteComp`.
* Zašto P1: korisnik može duplo kliknuti `Obriši` dok je zahtjev u toku; a11y nema `aria-busy`. `SeasonRoundsPanel` (A-07) već ima `disabled={remove.isPending}`.
* Dokaz: `SeasonRoundsPanel.tsx:69` `disabled={remove.isPending}` vs `CompetitionsAdminPage.tsx:94` nema.

### P2 — nekonzistentnost / loša praksa (radi ali se ne radi tako)

**P2-1 — `AdminPageShell isLoading={cl || sl}` je OR — ako jedna tabela učitava, cijela stranica je skeleton (CLS), obje tabele dijele jedan loading state**
* Gdje: `CompetitionsAdminPage.tsx:45` `isLoading={cl || sl}`.
* Zašto P2: loading i error trebaju biti po sekciji (`seasons` tabela i `catalog` tabela odvojeno) sa `aria-busy` po tabeli, kao `SeasonHubPage` (lijevo/desno odvojeno) i `PlatformStatusPage` (grid).
* Predlog: `const {data: competitions, isLoading: cl, isError: ce, isFetching: cf, refetch: rc} = useCompetitions()` + isto za `seasons`, pa render svake tabele sa svojim `isLoading/isError`.

**P2-2 — `useCompetitions`/`useSeasons` se pozivaju bez `enabled` po `canManage` — ok za čitanje, ali nema `lastUpdated`/`Osvježi` kao A-02..A-07**
* Gdje: obje stranice nemaju `dataUpdatedAt` + `Button Osvježi`.
* Zašto P2: admin ne zna koliko je lista svježa; `staleTime 30s` bez dugmeta je ok, ali dugme je standard za A-02..A-07.
* Predlog: Q1 — da li dodati `lastUpdated/Osvježi` ispod headera kao `CalendarSeasonPage`?

**P2-3 — `CompetitionsAdminFormSheet` `Button disabled` pokriva samo `createComp/createSeason`, ne i `updateComp/updateSeason`, nema validacije `yearStart <= yearEnd` ni `role=alert` za `error`**
* Gdje: `CompetitionsAdminFormSheet.tsx:108-112` `disabled={!name || createComp.isPending || createSeason.isPending}` — fali `updateComp.isPending`/`updateSeason.isPending`; `save()` nema provjere `yearStart > yearEnd`; `error && <p>` bez `role=alert`.
* Zašto P2: editing sa `update` može duplo kliknuti, a nevalidan `yearStart/yearEnd` šalje 400 bez objašnjenja; a11y greška bez `role=alert` se ne najavljuje.
* Predlog: `disabled={!name.trim() || createComp.isPending || updateComp.isPending || createSeason.isPending || updateSeason.isPending || (mode==='season' && yearStart > yearEnd)}` + `error && <p role="alert">`.

**P2-4 — `AdminDataTable` nema `isLoading` prop, koristi `empty` string za loading — isto kao prije A-07 `RoundMatchesPanel`**
* Gdje: `CompetitionsAdminPage.tsx:55-66` `AdminDataTable rows={seasonList}` bez `isLoading`.
* Zašto P2: loading i empty su različita stanja; skeleton sa `aria-busy` je standard (A-07). Danas `AdminPageShell` skeleton sakriva obje tabele.

**P2-5 — `onDeleteComp/Season` ima `/* v8 ignore next */` za `if(ok)` — pokriva 2 statementa u registru `dead-guards` ali nema `disabled` pa je branch ipak dostižan (dupli klik)**
* Gdje: `CompetitionsAdminPage.tsx:38` `/* v8 ignore next */`.
* Zašto P2: dead-guards za `if(ok) void runAction` je opravdan samo ako je dugme `disabled` dok je pending — trenutno nije, pa je branch pokriven kroz UI. Dodati `disabled` pa ostaviti ignore, ili ukloniti ignore ako je pokriven testom.

### P3 — UX/polish (radi, ali može profesionalnije)

**P3-1 — `AdminPageShell` actions `+` dugmad koriste `size="sm"` bez `aria-label` za ikonu `Plus` — dekorativno je ok (`aria-hidden` fali) ali `h-4 w-4` je sitno za touch**
* Predlog: dodati `aria-hidden` na `Plus` ili povećati touch target.

**P3-2 — `seasonList.map` `editions` badge koristi `Badge variant="muted"` za `0` prikazuje `—` — ok, ali `competitions` tabela `league` badge za `false` prikazuje `Ostalo` (`muted`) — konzistentno sa `CalendarSeasonPage` (success vs muted) — nema izmjene.**

---

## 4) Dokazi (file:line)

* `CompetitionsAdminPage.tsx:25-26` — `useCompetitions/useSeasons` samo `isLoading` bez `isError/isFetching` — P1-1
* `hooks/index.ts:301-306` — `useCompetitions` bez `staleTime/retry/options` — P1-2
* `CompetitionsAdminPage.tsx:89-97`, `119-126` — `Button` edit/delete bez `disabled={deleteX.isPending}` — P1-3
* `CompetitionsAdminPage.tsx:45` — `isLoading={cl || sl}` OR — P2-1
* `CompetitionsAdminFormSheet.tsx:108-112` — `disabled` samo `create` — P2-3
* `CompetitionsAdminPage.tsx:38`, `43` — `/* v8 ignore next */` na `if(ok)` — P2-5

---

## 5) Predloženi plan — bez koda (šta će se dirati)

| Korak | Fajl | Promjena | Rizik | Test |
|-------|------|----------|-------|------|
| 1 | `frontend/src/hooks/index.ts` (`useCompetitions`) | Dodaj `UseQueryOptions` overload + `staleTime:30_000, retry:1, refetchOnWindowFocus:false, ...options` kao `useSeasons` (A-07) | nizak | hook test: `enabled:false` ne fetch-a, `staleTime` |
| 2 | `frontend/src/pages/admin/CompetitionsAdminPage.tsx` | a) `const {data: competitions, isLoading: cl, isError: ce, isFetching: cf, dataUpdatedAt: cu, refetch: rc} = useCompetitions()` + `const {data: seasons, isLoading: sl, isError: se, isFetching: sf, dataUpdatedAt: su, refetch: rs} = useSeasons()` b) Sačuvaj `Seo` + `AdminPageShell title` i u `isError` granama c) Po sekciji: `ce||se ? role=alert + Retry disabled={cf||sf}` : `cl ? aria-busy Skeleton` : `empty role=status` : `tabela` — **odvojeno** po tabeli (ne OR) d) `lastUpdated/Osvježi` ispod headera (`dataUpdatedAt` max od oba, `refetch` oba) | srednji | mock `isError:true` → `role=alert` + heading ostaje |
| 3 | `frontend/src/pages/admin/CompetitionsAdminPage.tsx` | `Edit/Trash` `disabled={deleteComp.isPending || deleteSeason.isPending}` + `aria-busy` na tabeli; `isPending` već postoji na hookovima | nizak | delete `disabled` |
| 4 | `frontend/src/pages/admin/CompetitionsAdminFormSheet.tsx` | a) `disabled` proširi na sve 4 mutacije + `!name.trim()` + `yearStart > yearEnd` za season b) `error && <p role="alert">` c) `Button` `disabled` pokriva i `update` | nizak | validacija `yearStart>yearEnd` disabled |
| 5 | `frontend/src/pages/admin/CompetitionsAdminFormSheet.tsx` | Eventualno `Input` za `yearStart/yearEnd` `aria-label` + `type="number"` već postoji | nizak | — |
| 6 | `frontend/src/pages/admin/fe06-b02-competitions.test.tsx` (novi) + `fe06-b02-competitions-variants.test.tsx` | Dopuni testove za 4 stanja po sekciji + permisije + a11y (`role=alert`, `aria-busy`, `disabled isPending`, `lastUpdated`) — ne briši postojeće `fe06-competitions*` | — | `check:all 10/10` |
| 7 | `scripts/standards/baselines/file-size.txt` | Ako `CompetitionsAdminPage.tsx` pređe 200 lin (171→~190) — ne treba baseline (ostane ispod 200) | — | `check:all` |
| 8 | `frontend/src/locales/bs+en/common.json` | Provjeri `admin.home.refresh/lastUpdated` + `admin.common.loadError` već postoje — ne treba novi ključ (eventualno `admin.competitionsAdmin.*` već postoje) | — | — |

**Šta se NE dira:** `RoundCascadeDeleteDialog`, `RoundFormSheet`, `backend` `catalog-modules.ts`, `router` gating (`ModuleRoute`), `SeasonEditionFormSheet` direktno (osim FormSheet validacije).

---

## 6) Alternativa (zašto ne drugačije)

* **Ne dodavati `enabled` po permisiji za čitanje:** odbačeno — `modules.competitions` već gate-a rutu, ali `useCompetitions` bez `staleTime` fetch-a i na svaki focus; `enabled` nije potreban za čitanje, ali `staleTime` jeste.
* **Ne skrivati `Seo/h1` na erroru:** odbačeno — gubitak naslova i SEO; pattern sačuvanog headera je standard A-02..A-07.
* **Jedan globalni `AdminPageShell isLoading` OR vs po sekciji:** OR je CLS i briše obje tabele za jednu — odvojeno je bolje, kao `SeasonHubPage` lijevo/desno.
* **FormSheet validacija `yearStart <= yearEnd`:** može i bez, ali BE vraća 400 — bolje disable na FE da korisnik ne šalje nevalidno.

---

## 7) Kriterijumi gotovosti (DoD)

- [ ] P1-1..P1-3 zatvoreni + testovi koji padaju bez fixa (`isError → role=alert` + naslov ostaje + `disabled isFetching`; `staleTime/retry` na `useCompetitions`; delete `disabled isPending` + `aria-busy`)
- [ ] P2-1..P2-5 zatvoreni: `UseQueryOptions` overload, `isLoading` `aria-busy` po sekciji, `lastUpdated/Osvježi`, FormSheet `disabled` + `role=alert`
- [ ] `check:all 10/10`, `tsc -b` čist, `axe` bez kršenja na `/admin/competitions` (admin)
- [ ] `AUDIT/COVERAGE_MATRIX.csv` + `AUDIT/STATE.md` ažurirani, `CI 6/6` na `arena/290a6f13-fkgracanica`
- [ ] Nema promjene ponašanja za admina sa `competitions.manage` (lista sezona/katalog + hub linkovi + forme)

---

## 8) Otvorena pitanja za tebe (ask_user prije koda)

**Q1 — `lastUpdated`/`Osvježi`:** Da li `CompetitionsAdminPage` treba `Osvježi` dugme + `lastUpdated` (kao SeasonHub/CalendarSeason) ili samo `staleTime` bez dugmeta? Predlažem **dugme + lastUpdated** ispod headera (`dataUpdatedAt` max od oba upita).

**Q2 — `delete` `disabled`:** Da li `Edit/Obriši` u obje tabele trebaju biti `disabled` dok je bilo koji `delete` pending (`deleteComp || deleteSeason`), ili odvojeno po tipu? Predlažem **odvojeno**: `season` akcije `disabled={deleteSeason.isPending}`, `catalog` `disabled={deleteComp.isPending}`.

**Q3 — `FormSheet` validacija:** Da li dodati `yearStart <= yearEnd` disable + poruku (`Validacija: početna godina ne može biti veća od krajnje`) ili ostaviti BE 400? Predlažem **disable + poruka** na FE.

> Ako odobriš ovaj plan (ili `approve_with_comments`), sljedeći korak je implementacija B-02 po tabeli iznad — jedan PR, `gh run watch` do `6/6`.
