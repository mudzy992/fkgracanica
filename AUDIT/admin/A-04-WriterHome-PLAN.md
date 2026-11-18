# A-04 — WriterHome — PLAN (2026-11-18, grana `arena/290a6f13-fkgracanica` @ `dc7ee14`)

> Planski dokument — bez koda. Slijedi template iz `ADMIN_PLAN_2026-11-17.md` §2. Implementacija tek nakon `ask_user approve`.

---

## Meta

| Polje | Vrijednost |
|-------|------------|
| Ruta | `/admin` (index `DashboardPage.tsx:13` → `WriterHome` kad `resolveStaffHome()==='writer'`) |
| Fajl(ovi) | `pages/admin/homes/WriterHome.tsx` (90 lin) · `pages/admin/homes/HomeKpiGrid.tsx` (49 lin, nakon A-03 sa `aria-label`) · `pages/admin/homes/HomeQuickActions.tsx` (28 lin) · `pages/admin/homes/RoleHomeShell.tsx` (26 lin) · `hooks/index.ts:useNewsList/useGalleryList` (staleTime30k/retry1 nakon A-03) · `hooks/use-content-admin.ts:useGalleryAdminList` (6 lin, bez options) · `lib/content-status-labels.ts:contentStatusLabel` · `lib/permissions.ts:hasPermission` · `lib/staff-home.ts:resolveStaffHome` · `locales/bs+en/common.json:admin.home.writerTitle/writerHint + admin.content.*` |
| Rola/permisije | `writer` — BE seed `Writer: ['news.manage','news.submit','gallery.manage','media.read','media.upload']` (nema `news.approve/gallery.approve`, nema `analytics.read`) — FE danas ne provjerava ništa |
| API | `GET /news?status=DRAFT` (`useNewsList('DRAFT')`) · `GET /news?status=PENDING` (`useNewsList('PENDING')`) · `GET /news?status=PUBLISHED` (`useNewsList('PUBLISHED')`) · `GET /gallery` (`useGalleryAdminList()` → `GET /gallery` bez status filtera) — 4 paralelna query-a bez shared `enabled`/`staleTime` za gallery |
| Stanje grane | `arena/290a6f13-fkgracanica` @ `dc7ee14` (A-03 zatvoren 44259619266 6/6 + docs 44261100690 6/6, `check:all 10/10`, `ModeratorHome.tsx` 347 lin sa skeleton/alert/retry, `hooks/useNewsList/useGalleryList` već imaju `UseQueryOptions` staleTime30k retry1) |

---

## 1) Šta radi danas (činjenično, bez ocjene)

**Render stablo `WriterHome.tsx:10-90`:**
```
RoleHomeShell(title=writerTitle, hint=writerHint, seo="Writer")
  HomeKpiGrid(4 items: drafts, pending, published, albums) — value = loading ? '…' : count
  HomeQuickActions(4 items: /admin/news/new, /admin/media, /admin/gallery/new, /admin/gallery)
  h2 unpublishedNews + <ul> (max 8, drafts+pending, Link + status label)
```

**`WriterHome.tsx:12-18` hooks:**
```ts
const drafts = useNewsList('DRAFT');
const pending = useNewsList('PENDING');
const published = useNewsList('PUBLISHED');
const albums = useGalleryAdminList();
// queue = [...(drafts.data ?? []), ...(pending.data ?? [])].slice(0, 8);
// loading = drafts.isLoading || pending.isLoading || published.isLoading || albums.isLoading;
```
- `useNewsList` nakon A-03 ima `staleTime 30_000, retry 1, refetchOnWindowFocus:false, ...options` — ali pozivi u WriterHome **ne proslijeđuju** `enabled` pa fetcha i kad nema `news.manage`.
- `useGalleryAdminList` u `hooks/use-content-admin.ts:6` je `useQuery({queryKey:['gallery','admin'], queryFn: asArray(api.get('/gallery'))})` — **bez** `options`, `staleTime`, `retry`, `enabled` — jedini hook bez A-03 ispravke.

**`kpiItems:26-48`:**
- `drafts: value = loading ? '…' : (drafts.data?.length ?? 0)` — isto za pending/published/albums.
- `href` je **uvijek** postavljen (`/admin/news` 3×, `/admin/gallery`) — nema provjere `news.manage`/`gallery.manage`.
- `hint` je `draftsHint/pendingHint/publishedHint/gallery` — postoji u `common.json`.

**`HomeQuickActions:49-57`:** 4 fiksna `Link`-a (`/admin/news/new`, `/admin/media`, `/admin/gallery/new`, `/admin/gallery`) bez provjere permisije. `HomeQuickActions.tsx` ne filtrira — samo mapira.

**`queue:58-88`:**
- `queue = [...(drafts.data ?? []), ...(pending.data ?? [])].slice(0, 8)` — redoslijed drafts→pending, bez sortiranja po `createdAt/updatedAt`, limit 8 magičan.
- Nema `isError`/`isFetching` grananja — ako bilo koji od `drafts/pending` vrati 403/500, `length ?? 0` daje `0` i `noDrafts` poruku, tihi fail.
- `loading` grana ne postoji za queue — `queue.length===0 ? <li>noDrafts : queue.map` prikazuje `noDrafts` i dok se učitava (loading daje `queue=[]` pa `noDrafts` + `'…'` u KPI — dvostruka poruka).
- Svaka stavka: `<Link to=/admin/news/:id/edit>` + `<span>{contentStatusLabel(item.status)}</span>` — bez `aria-label`, bez `role` na listi.

**`HomeKpiGrid.tsx` (nakon A-03):** ima `aria-label={`${label}: ${value}`}` na Linku, `tabular-nums`, `focus-visible:ring` — ispravno. Writer ga koristi ali `'…'` kao `value` nije broj pa `aria-label` postaje `"Nacrti: …"` — loše za screen reader.

**`locales/bs+en/common.json`:** `admin.home.writerTitle/writerHint`, `admin.content.drafts/pending/published/albums/unpublishedNews/noDrafts/newNews/mediaFolders/newAlbum/gallery/draftsHint/pendingHint/publishedHint` postoje. `admin.home.kpiError/refresh/lastUpdated/quickActions` postoje iz A-02/A-03.

**Testovi `fe06-role-homes.test.tsx:54-90` (WriterHome):**
- 4 testa: KPI brojevi + brze akcije, `'…'` loading 4×, prazni `0` + `noDrafts`, `undefined` → `0` (batch 34).
- Mockovi: `useNewsList: (status)=>({data: state.news[status], isLoading: state.loading})` — bez `isError/isFetching/dataUpdatedAt/refetch`; `useGalleryAdminList: ()=>({data:[{id:g1},{id:g2}], isLoading})` — bez `isError`.
- Cementira loše ponašanje: `expect(screen.getAllByText('…')).toHaveLength >=4` i nema `role="alert"` testa.

---

## 2) Šta bi trebala da radi (očekivano — profesionalni standard za writer home)

* **Korisnik:** writer koji za <30s mora **vidjeti svoj sadržaj na čekanju** (nacrti + predano) i **1-klikom nastaviti pisanje** (edit). Nije moderator — ne odobrava, ne vidi tuđe queue-eve, ne vidi analytics/inbox/live.
* **Ugovor:**
  * KPI-evi su **moj sadržaj** — `drafts/pending/published` su brojači vlastitih vijesti (BE danas vraća sve vijesti filtrirane po statusu, ne po autoru — writer vidi sve). `albums` je broj galerija. Svaki KPI mora linkati ka filtriranoj listi (`/admin/news`, `/admin/gallery`) **samo** uz `news.manage`/`gallery.manage`; bez dozvole → `div` bez linka (kao ModeratorHome P1-1).
  * Queue (`unpublishedNews`) je **lista za nastavak rada** — max 8, drafts→pending, svaka stavka linka `/admin/news/:id/edit` sa `contentStatusLabel`. Nema `Odobri` — writer samo uređuje. Ako nema stavki → `noDrafts` sa CTA „Nova vijest“.
  * QuickActions (4) su **kreiranje sadržaja** — `Nova vijest` (`news.manage`), `Mediji / mape` (`media.read`), `Novi album`/`Galerija` (`gallery.manage`) — moraju poštovati istu permisiju.
* **Ponašanje:**
  * `loading` → skeleton grid 4 sa `aria-busy`, sačuvana visina; queue → 3× skeleton `<li>` umjesto `noDrafts` teksta koji laže da je prazno dok se učitava.
  * `error` → `role="alert"` + poruka + `Retry` sa `isFetching`/`disabled`, **uz sačuvan** `Seo`/`h1`/`hint` (danas nema error stanja — error se pretvara u `0` pa writer misli da nema nacrta).
  * `empty/0` → `0` je validno, ali `undefined` mora prikazati `0` konzistentno (danas OK sa `??0`).
  * `forbidden` (403 na `/news?status=DRAFT` ako se oduzme `news.manage`) → poruka bez retry loop-a, bez curenja podataka iz prethodnog `data`.
  * `stale` → `lastUpdated` + `Osvježi` dugme (kao ModeratorHome) ili `refetchOnWindowFocus:false` + `staleTime 30s` (već na `useNewsList`/`useGalleryList`).
* **A11y/i18n/perf:**
  * `Seo` title uvijek renderan, `h1` prvi u DOM-u (RoleHomeShell to poštuje — dobro).
  * KPI `Link` sa `aria-label`, `tabular-nums` (HomeKpiGrid već ima), `focus-visible:ring` — već ispravno.
  * Queue `<ul>` sa `aria-label="Red čekanja"` i svaki `Link` sa jasnim `title`, `ul` ne smije dijeliti `noDrafts` tekst za loading i empty.
  * `t()` sa `defaultValue` ili ključem koji postoji u obje locale (danas postoji).
  * 4 query-a → 4 fetch-a na svaki mount, bez `staleTime` za gallery → nepotreban pritisak; treba `staleTime 30_000`, `retry 1`, `refetchOnWindowFocus:false`, i `enabled` po permisiji (kao ModeratorHome P2-1) — `useGalleryAdminList` nema ništa od toga.

---

## 3) Propusti — klasifikacija

### P1 — blokator / sigurnosni / funkcionalni (mora odmah)

**P1-1 — KPI i QuickActions linkovi ne poštuju permisiju cilja**
* Gdje: `WriterHome.tsx:27-48 kpiItems` — `href` se postavlja bez provjere (`/admin/news` 3×, `/admin/gallery`); `HomeKpiGrid` rendera `<Link>` kad `href` postoji; `HomeQuickActions` `WriterHome.tsx:49-57` 4 fiksna `<Link>` bez provjere.
* Zašto P1: danas writer ima `news.manage`+`gallery.manage` pa ne curi, ali čim se suzi `gallery.manage`, home će linkati `/admin/gallery/new` i `/admin/gallery` iako nema pristup. To je funkcionalni propust i UX zamka (403 nakon klika) — isti obrazac kao ModeratorHome P1-1, već zatvoren tamo.
* Repro: makni `gallery.manage` writeru, ostavi `news.manage` — KPI `albums` i dalje linka `/admin/gallery` i QuickActions `Novi album` je vidljiv.

**P1-2 — Nema error stanja — greška se pretvara u `0` i `noDrafts` (tihi fail)**
* Gdje: `WriterHome.tsx:27-48` — `value: loading ? '…' : (data?.length ?? 0)` nema `isError` grane; `WriterHome.tsx:64-88` — `queue.length===0 ? noDrafts : <ul>` — loading (`queue=[]`) i error (`data===undefined`) i empty dijele isti tekst.
* Zašto P1: ako BE vrati 403 (nema `news.manage`) ili 500, writer vidi `0` i „Nema nacrta“ i misli da nema posla, a zapravo je fetch pao. To je funkcionalni propust — gubi se posao. ModeratorHome je već riješio sa `role="alert"` + `Retry`.
* Repro: mock `useNewsList('DRAFT')` vrati `{isError:true}` — WriterHome prikaže `0` umjesto `role="alert"` i `Pokušaj ponovo`.

**P1-3 — `useGalleryAdminList` nema `enabled`/`staleTime`/`retry` i nije konzistentan sa `useNewsList`/`useGalleryList`**
* Gdje: `hooks/use-content-admin.ts:6-11` — `useQuery({queryKey:['gallery','admin'], queryFn: api.get('/gallery')})` bez `staleTime/retry/enabled/refetchOnWindowFocus`; `hooks/index.ts:48 useGalleryList` nakon A-03 ima sve 4 opcije.
* Zašto P1: writer će refetch-ati `/gallery` na svaki tab focus (default `refetchOnWindowFocus:true`, `staleTime 0`, `retry 3`) dok `useNewsList` neće — nekonzistentno i pritisak na DB; bez `enabled` fetch-a i kad nema `gallery.manage`.
* Dokaz: `use-content-admin.ts:6`, `hooks/index.ts:48-60`.

### P2 — nekonzistentnost / loša praksa (radi ali se ne radi tako)

**P2-1 — 4 query-a bez `enabled` po permisiji (3× `useNewsList` + 1× `useGalleryAdminList`)**
* Gdje: `WriterHome.tsx:12-15` — svi `useNewsList` i `useGalleryAdminList` bez `options: {enabled}`.
* Zašto P2: svaki mount fetch-a 4 endpointa i kad nema dozvolu; treba `enabled: hasPermission(perms,'news.manage')` za 3 news query-a i `enabled: hasPermission(perms,'gallery.manage')` za albums (kao ModeratorHome korak 5).

**P2-2 — Loading je `'…'` u cardu i `noDrafts` tekst koji laže za queue**
* Gdje: `WriterHome.tsx:32 value = loading ? '…' : count` — `'…'` je string u `<p class="text-3xl">` pa skače visina i `aria-label` je pogrešan; `WriterHome.tsx:64-72 h2 + ul` — nema skeletona, nema `aria-busy`, nema razlike loading vs empty.
* Zašto P2: profesionalno je skeleton 4× Card sa `animate-pulse` + `aria-busy="true"` (kao ModeratorHome) i queue skeleton 3× `<li>` sa `aria-busy`.
* Test cementira loše: `fe06-role-homes.test.tsx:74 expect(screen.getAllByText('…'))`.

**P2-3 — Error i forbidden bez `role="alert"` i bez `isFetching`/`Retry`**
* Gdje: nema `isError` grane nigdje; `HomeQuickActions` nema `disabled`.
* Zašto P2: a11y i UX — screen reader ne najavljuje grešku. ModeratorHome je dodao `role="alert"` + `Button disabled={isFetching}`.

**P2-4 — Queue spajanje bez sortiranja i bez `key` prefixa, limit 8 magičan**
* Gdje: `WriterHome.tsx:16 const queue = [...(drafts.data ?? []), ...(pending.data ?? [])].slice(0, 8)` — redoslijed je drafts→pending, ne hronološki; `key={item.id}` može kolizirati ako isti ID postoji u draft i pending (ne bi trebao, ali je moguće nakon promjene statusa u race-u).
* Zašto P2: nije blokator ali je nekonzistentno — writer očekuje hronološki red; i `key` treba biti `${status}-${id}` ili `id` je dovoljan jer su različiti statusi ali isti `id` ne može biti u oba istovremeno — ipak P2.

**P2-5 — `HomeQuickActions` bez `aria-label` filtriranja po permisiji**
* Gdje: `WriterHome.tsx:49-57` — 4 akcije fiksno, bez `hasPermission(perms, 'gallery.manage'/'media.read'/'news.manage')` filtera.
* Zašto P2: writer uvijek ima sve 3, ali ugovor mora vrijediti i kad se suzi.

**P2-6 — Queue `<ul>` bez `aria-label` i status bez `aria-label`**
* Gdje: `WriterHome.tsx:65 <ul className="divide-y ...">` — bez `aria-label={t('admin.content.queueLabel')}`; `<span>{contentStatusLabel}</span>` bez prevoda u `aria-label`.
* Zašto P2: a11y — screen reader ne zna da je to red čekanja.

### P3 — UX/polish (radi, ali može profesionalnije)

**P3-1 — Nema `lastUpdated` ni `Osvježi` dugmeta (kao ModeratorHome)**
* Writer ne zna koliko su KPI-evi svježi; profesionalno: mali `Ažurirano u HH:MM • Osvježi` ispod grid-a, sa `dataUpdatedAt` iz najnovijeg query-a.

**P3-2 — Queue nema CTA kad je prazno**
* `noDrafts: "Nema nacrta ni predaja."` je pasivna poruka; mogla bi imati `Link Nova vijest` kao CTA.

**P3-3 — Visitors/Inbox/Live sjekcija ne postoji — ispravno za writer, ali hint je statičan**
* `writerHint: "Samo sadržaj: vijesti i galerija. Objavu radi moderator."` — ok, ali mogao bi prikazati `3 na čekanju` dinamički.

**P3-4 — `published` KPI je „zdravlje“ ali bez `tabular-nums` guard na `'…'`**
* `'…'` nije broj pa `tabular-nums` nema smisla — treba skeleton umjesto `'…'`.

---

## 4) Dokazi (file:line)

* `WriterHome.tsx:12-18` — 4 query-a bez `enabled` (`useNewsList` 3× + `useGalleryAdminList`) — P1-3, P2-1
* `WriterHome.tsx:27-48` — `kpiItems` sa `href` bez provjere permisije, `value: loading ? '…' : count` — P1-1, P2-2, P1-2
* `WriterHome.tsx:49-57` — 4 QuickActions `<Link>` bez permisije — P1-1, P2-5
* `WriterHome.tsx:16` — `queue = [...drafts, ...pending].slice(0,8)` bez sortiranja — P2-4
* `WriterHome.tsx:64-72` — `queue.length===0 ? noDrafts : queue.map` — loading==empty, bez `aria-label` — P1-2, P2-2, P2-6
* `WriterHome.tsx:65` — `<ul>` bez `aria-label` — P2-6
* `hooks/use-content-admin.ts:6-11` — `useGalleryAdminList` bez `staleTime/retry/enabled/refetchOnWindowFocus` — P1-3
* `hooks/index.ts:18-35` — `useNewsList` ima `staleTime/retry` ali Writer ga ne koristi sa `enabled` — P2-1
* `HomeKpiGrid.tsx:24-32` — `aria-label` postoji ali `'…'` ga kvari — P2-2
* `fe06-role-homes.test.tsx:74` — `expect(screen.getAllByText('…'))` — test cementira loše — P2-2
* `fe06-role-homes.test.tsx:4-20` — mock bez `isError/isFetching/dataUpdatedAt/refetch` — P1-2, P2-3

---

## 5) Predloženi plan — bez koda (šta će se dirati)

| Korak | Fajl | Promjena | Rizik | Test |
|-------|------|----------|-------|------|
| 1 | `frontend/src/hooks/use-content-admin.ts` | `useGalleryAdminList(options?: UseQueryOptions<GalleryItem[]>)` — dodaj `staleTime:30_000, retry:1, refetchOnWindowFocus:false, ...options` kao `useNewsList/useGalleryList` (A-03) | nizak | hook test: `enabled:false` ne fetch-a |
| 2 | `frontend/src/pages/admin/homes/WriterHome.tsx` | a) `const {user}=useAuth(); perms=user?.permissions` b) `enabledNews = hasPermission(perms,'news.manage')`, `enabledGallery = hasPermission(perms,'gallery.manage')` c) `useNewsList('DRAFT', undefined, {enabled: enabledNews})` ×3, `useGalleryAdminList({enabled: enabledGallery})` | srednji | test: bez `news.manage` ne fetch-a, KPI bez linka |
| 3 | `frontend/src/pages/admin/homes/WriterHome.tsx` `WRITER_KPI_PERMISSIONS` | Nova mapa `drafts:'news.manage', pending:'news.manage', published:'news.manage', albums:'gallery.manage'` — `href` samo ako `hasPermission(perms, map[key])` inače `undefined` → `HomeKpiGrid` rendera `div` | srednji | test: bez `gallery.manage` albums nema Link |
| 4 | `frontend/src/pages/admin/homes/WriterHome.tsx` `QUICK_PERMISSIONS` | Mapa `'/admin/news/new':'news.manage', '/admin/media':'media.read', '/admin/gallery/new':'gallery.manage', '/admin/gallery':'gallery.manage'` — `quickItems.filter(hasPermission)`; `HomeQuickActions` prima filtrirane | srednji | test: bez `media.read` nema media linka |
| 5 | `frontend/src/pages/admin/homes/WriterHome.tsx` `loading` | `isKpiLoading = drafts.isLoading \|\| pending.isLoading \|\| published.isLoading \|\| albums.isLoading` → `isKpiLoading ? <KpiSkeletonGrid count={4}>` umjesto `'…'`; `aria-busy="true"`; ukloni `'…'` iz `kpiItems` (value je uvijek `number`) | nizak | test: loading skeleton sa `aria-busy` |
| 6 | `frontend/src/pages/admin/homes/WriterHome.tsx` `isError` | `isKpiError = drafts.isError \|\| pending.isError \|\| published.isError \|\| albums.isError`; `isKpiFetching = drafts.isFetching \|\| ...` → ako `isKpiError` renderaj `role="alert"` + `t('admin.home.kpiError')` + `Button Retry` sa `disabled={isKpiFetching}` (uz sačuvan `RoleHomeShell`/`h1`) | srednji | test: mock `isError:true` → `role="alert"` + naslov ostaje |
| 7 | `frontend/src/pages/admin/homes/WriterHome.tsx` `queue` | a) `isQueueLoading = drafts.isLoading \|\| pending.isLoading` b) `isQueueError = drafts.isError \|\| pending.isError` c) `queueFetching = drafts.isFetching \|\| pending.isFetching` — ako `isQueueError` → `role="alert"` + `Retry` (refetch drafts+pending) uz `disabled={queueFetching}` d) ako `isQueueLoading` → `<QueueSkeleton>` e) inače `<ul aria-label={t('admin.content.queueLabel')}>` sa `queue.length===0 ? noDrafts : queue.map` | srednji | test: queue error → alert, loading → skeleton |
| 8 | `frontend/src/pages/admin/homes/WriterHome.tsx` `QueueSkeleton` + `KpiSkeletonGrid` | Dodaj lokalne `KpiSkeletonGrid` (4) i `QueueSkeleton` (3) kao u ModeratorHome (Card + animate-pulse) — ne duplirati u shared ako je samo Writer/Moderator koriste | nizak | a11y test `aria-busy` |
| 9 | `frontend/src/pages/admin/homes/WriterHome.tsx` `lastUpdated` | `kpiUpdatedAt = Math.max(drafts.dataUpdatedAt, pending.dataUpdatedAt, published.dataUpdatedAt, albums.dataUpdatedAt)` + `lastUpdated` string + `Osvježi` dugme sa `isKpiFetching`/`queueFetching` (refetch svih 4) — kao ModeratorHome | nizak | test lastUpdated |
| 10 | `frontend/src/locales/bs+en/common.json` | Provjeri postoje li `admin.content.queueLabel`, `admin.home.refresh/lastUpdated`; ako ne — dodaj `queueLabel: "Red čekanja"` (već postoji iz A-03) | nizak | i18n test |
| 11 | `frontend/src/pages/admin/homes/fe06-role-homes.test.tsx` + `fe06-writer-home.test.tsx` (novi) | Dopuni testove za 4 stanja + permisije + a11y (`role="alert"`, `aria-busy`, `aria-label`) — ne briši postojeće `fe06-role-homes.test.tsx` Writer slice, dodaj `fe06-writer-home.test.tsx` sa `enabled`, `kpiError`, `queueError`, `skeleton`, `lastUpdated`, `refetch` | — | `check:all 10/10`, `vitest --coverage` |
| 12 | `scripts/checks/file-size.mjs` + `file-size.txt` | Ako `WriterHome.tsx` predje limit (npr. 348 lin kao Moderator) — podigni baseline za +~120 lin | nizak | `check:all` |

**Šta se NE dira u ovom koraku:** `RoleHomeShell.tsx` (26 lin ostaje), `types` (nema schema promjene), `router/app-routes.tsx` (permisija ostaje na BE, FE samo skriva link), `DashboardPage.tsx` dispatcher, `HomeKpiGrid/HomeQuickActions` (ne mijenjaju se osim što dobijaju filtrirane items).

---

## 6) Alternativa (zašto ne drugačije)

* **Ne dodavati `enabled` po permisiji nego osloniti se na BE 403:** odbačeno — FE bi retry-ao u loop-u (default `retry 3`, sada `retry 1` na `useNewsList` ali `useGalleryAdminList` još ima 3) i prikazivao `0` umjesto poruke; `enabled:false` je jeftiniji i spriječava curenje 4 fetch-a. Konzistentno sa A-03.
* **Ne skrivati KPI link kao `div` nego disabled `Link` sa tooltipom „Nema dozvolu“:** odbačeno — disabled link je a11y zamka (fokusira se a ne radi); `div` bez linka je isti obrazac kao AdminHome/ModeratorHome (konzistentno).
* **Skeleton umjesto `'…'`:** `'…'` je brži ali je CLS i a11y loš — skeleton je standard za dashboard-e (AdminHome/ModeratorHome već imaju `KpiSkeletonGrid`).
* **Ne dodavati `lastUpdated`/`Osvježi`:** moglo bi bez, ali ModeratorHome ga već ima pa je konzistentno i korisno za writera koji čeka objavu.

---

## 7) Kriterijumi gotovosti (DoD)

- [ ] P1-1..P1-3 zatvoreni + testovi koji padaju bez fixa (KPI bez permisije → nema Link-a; `isError` → `role="alert"` sa naslovom; `useGalleryAdminList` sa `enabled/staleTime/retry`)
- [ ] P2-1..P2-6 zatvoreni: `staleTime 30s`/`retry 1`/`enabled` na 4 hooka, skeleton sa `aria-busy`, `role="alert"` + `disabled isFetching`, queue skeleton + `aria-label`
- [ ] `HomeKpiGrid`/`HomeQuickActions` permisije konzistentne, `QuickActions` filtriran
- [ ] `check:all 10/10`, `tsc -b` čist, `axe` bez kršenja na `/admin` (writer)
- [ ] `AUDIT/COVERAGE_MATRIX.csv` + `AUDIT/STATE.md` ažurirani, `CI 6/6` na `arena/290a6f13-fkgracanica`
- [ ] Nema promjene ponašanja za writera koji ima sve permisije (`news.manage+gallery.manage+media.read` → 4 KPI, queue 8, brze akcije 4 linka)

---

## 8) Otvorena pitanja za tebe (ask_user prije koda)

**Q1 — KPI permisije:** Da li `drafts/pending/published → news.manage`, `albums → gallery.manage` budu **striktno skriveni kao `div` bez linka** ako nema permisiju, ili disabled sa tooltipom? Predlažem **skriven link (div)** — kao ModeratorHome.

**Q2 — QuickActions permisije:** Da li `Nova vijest → news.manage`, `Mediji → media.read`, `Novi album/Galerija → gallery.manage` budu **filtrirani (skriveni)** bez permisije? Predlažem **filtrirani**.

**Q3 — Queue redoslijed:** Da li queue ostaje `drafts→pending` (danas) ili da ga sortiram hronološki po `createdAt/updatedAt` ako BE vrati datum? Predlažem **ostaviti današnji redoslijed** (BE ne vraća konzistentno datum u oba tipa).

**Q4 — Auto-refresh / lastUpdated:** Da li KPI-evi trebaju `Osvježi` dugme + `lastUpdated` (kao ModeratorHome) ili samo bez? Predlažem **dugme + lastUpdated**, bez intervala.

> Ako odobriš ovaj plan (ili `approve_with_comments`), sljedeći korak je implementacija A-04 po tabeli iznad — jedan PR, dio po dio, uz `gh run watch` do `6/6`.
