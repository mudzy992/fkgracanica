# A-03 — ModeratorHome — PLAN (2026-11-18, grana `arena/290a6f13-fkgracanica` @ `2ad3ff1`)

> Planski dokument — bez koda. Slijedi template iz `ADMIN_PLAN_2026-11-17.md` §2. Implementacija tek nakon `ask_user approve`.

---

## Meta

| Polje | Vrijednost |
|-------|------------|
| Ruta | `/admin` (index `DashboardPage.tsx:11` → `ModeratorHome` kad `resolveStaffHome()==='moderator'`) |
| Fajl(ovi) | `pages/admin/homes/ModeratorHome.tsx` (155 lin) · `pages/admin/homes/HomeKpiGrid.tsx` (48 lin) · `pages/admin/homes/RoleHomeShell.tsx` (26 lin) · `hooks/index.ts:useNewsList/useGalleryList` (21/48) · `hooks/use-live-admin.ts:usePendingLiveReports` (12 lin) · `hooks/use-contact-admin.ts:useContactMessages` (21 lin) · `hooks/use-analytics.ts:useVisitorTotals` (10 lin) · `lib/action-errors.ts:runAction` · `lib/permissions.ts:hasPermission` · `lib/staff-home.ts:resolveStaffHome` · `locales/bs+en/common.json:admin.home.moderatorTitle/moderatorHint + admin.content.* + admin.visitors.*` |
| Rola/permisije | `moderator` — treba `news.read/approve`, `gallery.read/approve`, `live.read/approve`, `comms.read`, `analytics.read` (nijedna se danas ne provjerava u FE; BE štiti rute, FE samo skriva link u AdminHome ali ne ovdje) |
| API | `GET /news?status=PENDING` (`useNewsList('PENDING')`) · `GET /gallery?status=PENDING` (`useGalleryList('PENDING')`) · `GET /live/pending` (`usePendingLiveReports`) · `GET /contact?unreadOnly=true` (`useContactMessages({unreadOnly:true})` → `PaginatedResponse.meta.total`) · `GET /public-analytics/totals?days=30` (`useVisitorTotals(30)`) — 5 paralelnih query-a bez shared `enabled`/`staleTime` |
| Stanje grane | `arena/290a6f13-fkgracanica` @ `2ad3ff1` (A-02 zatvoren 44184118963 6/6, baseline 4/4/3/3, `check:all 10/10`, B-FE07 2307/2307, B-FE08 pauza) |

---

## 1) Šta radi danas (činjenično, bez ocjene)

**Render stablo `ModeratorHome.tsx:15-155`:**
```
RoleHomeShell(title=moderatorTitle, hint=moderatorHint, seo="Moderator")
  HomeKpiGrid(7 items: pendingNews, pendingGalleries, pendingLive, unreadInbox, web, mobile, total)
  h2 admin.content.awaitingApproval + queue <ul> (max 8, news→gallery→live redom, Link/Badge/Button Odobri)
  div grid 2 kolone:
    Card admin.visitors.title + 3 broja (web/mobile/total) + hint
    HomeQuickActions? NE — inline <div flex> sa 3 Linka: /admin/news?status=PENDING, /admin/live/pending, /admin/comms?tab=inbox
```

**`kpiItems:30-56`:** `newsCount = news.data?.length ?? 0` (isto gallery/live), `unread = contacts.data?.meta?.total ?? contacts.data?.length ?? 0`? Ne — `unread = inboxTotal` iz `pickTotal` koji već radi `meta.total ?? length`. `web/mobile/total = visitors.data?.web ?? 0` itd. `value = isLoading ? '…' : count`. Dakle loading = tri tačke, success/error/empty = `0`. `href` je **uvijek** postavljen (`/admin/news?status=PENDING`, `/admin/gallery?status=PENDING`, `/admin/live/pending`, `/admin/comms?tab=inbox`, `/admin/analytics?tab=visitors`) — nema provjere permisije.

**`queue:58-98`:** `newsItems = asArray(news.data).slice(0,5)`? Ne — `news(5)` u testu daje 5, ali kod je `const queue = [...news.data ?? [], ...gallery.data ?? [], ...live.data ?? []].slice(0,8)` (tačan kod: `const queue = ([]).concat(news,mapped gallery,mapped live).slice(0,8)` sa mapiranjem `{id,title,kind}`). `isQueueLoading = news.isLoading || gallery.isLoading || live.isLoading`. Ako `isQueueLoading` → `<p>admin.content.emptyQueue</p>` **istu** poruku kao za prazan queue (nema skeletona, nema razlike loading vs empty). Ako `queue.length===0 && !isQueueLoading` → isto `emptyQueue`. Inače `<ul>` + `queue.map(item => <li flex> <Link> + <Badge PENDING> + <Button Odobri>)`.

**`approve:100-125`:** `const [approveNews] = useUpdateNewsStatus(); const [approveGallery] = useUpdateGalleryStatus(); const {mutateAsync: approveLive} = useApproveMatchReport();` + `const runAction = (fn) => fn().catch(...)` iz `lib/action-errors.ts`. `handleApprove(item)` radi `if (kind==='news') runAction(()=>approveNews({id, status:'PUBLISHED'}))` itd. Nema `isPending`/`disabled` na dugmetu, nema `aria-busy`, nema `ActionErrorAlert` lokalno (ali globalna traka postoji u `bootstrap.tsx`).

**`hooks`:** svi bez `enabled`, `staleTime`, `retry`, `refetchOnWindowFocus`:
- `useNewsList('PENDING')` — `queryKey ['news','PENDING',undefined]`, `queryFn api.get('/news',{params:{status:'PENDING'}})` — bez `enabled/staleTime/retry`
- `useGalleryList('PENDING')` — `queryKey ['gallery','PENDING']`, `queryFn api.get('/gallery',{params:{status:'PENDING'}})` — bez `enabled/staleTime/retry`
- `usePendingLiveReports()` — `queryKey ['live','pending']`, `queryFn api.get('/live/pending')` — bez `enabled/staleTime/retry`
- `useContactMessages({unreadOnly:true})` → `usePaginatedQuery(['contact'],'/contact',{unreadOnly:'true'})` — `queryKey ['contact', {unreadOnly:'true'}]` — bez `enabled/staleTime/retry`, koristi generički paginated helper
- `useVisitorTotals(30)` — `queryKey ['analytics','visitors','totals',30]`, `queryFn api.get('/public-analytics/totals')` — bez `enabled/staleTime/retry` (svi posjetioci su javni, ali moderator ih ne mora vidjeti ako nema `analytics.read`)

**i18n:** `moderatorTitle/moderatorHint`, `admin.visitors.title`, `admin.content.awaitingApproval/pending/live/emptyQueue/newsQueue/livePending/commsInbox`, `admin.livePending` su u `bs/en common.json`. `HomeKpiGrid` prima `label = t('admin.kpi.pendingNews')` itd.? Ne — ModeratorHome gradi `label: t('admin.content.newsQueue')` ili `t('admin.visitors.web')` ručno, a `HomeKpiGrid` samo prikazuje `item.label`. KPI labels nisu iz `dashboard-kpi-config.ts`.

**Testovi:** `fe06-moderator-home.test.tsx` 11 testova (SEO, KPI brojevi, PENDING status, `…` loading 7×, posjete 120/80/200, 0 fallback, queue 8, approve news/gallery/live, quickActions 3 linka) + `fe06-moderator-home-variants.test.tsx` 9 testova (visitors ??0 varijante: undefined/null/{}/web-only/null-values/zero, queue ??0 varijante: undefined/null/loading). Oba mockaju `react-i18next` kao `t(k)=>k`, `Seo`, sve hookove, `commentator-desk matchTitle`.

---

## 2) Šta bi trebala da radi (očekivano — profesionalni standard za moderator home)

* **Korisnik:** moderator koji za <30s mora **odobriti sadržaj na čekanju** (vijesti/galerija/live) i vidjeti **inbox + posjete**. Nije admin — ne smije vidjeti settings/users/finance, ali mora imati 1-klik approve bez odlaska u listu.
* **Ugovor:**
  * Queue (news/gallery/live) je **red odobrenja** — svaka stavka mora biti link ka uređivanju (`/admin/news/:id/edit`, `/admin/gallery/:id/edit`, `/admin/live/:id`) **samo ako** ima `news.read/gallery.read/live.read`, i `Odobri` dugme **samo ako** ima `news.approve/gallery.approve/live.approve`. Danas oba uvijek vidljiva.
  * KPI-evi su **brojači na čekanju** — `pendingNews`/`pendingGalleries`/`pendingLive`/`unreadInbox` moraju linkati ka filtriranoj listi **samo** uz dozvolu cilja; bez dozvole → `div` bez linka (kao AdminHome P1-1). Danas uvijek linkaju.
  * Posjete (`web/mobile/total`) su **zdravlje** — `analytics.read` ako nema → kartica bez linka ili skriven hint, ne smije cureti `/admin/analytics`.
  * QuickActions (3) su **prečice** — moraju poštovati istu permisiju kao KPI (newsPending → `news.read`, livePending → `live.read`, commsInbox → `comms.read`).
* **Ponašanje:**
  * `loading` → skeleton grid 4+3 (ne `'…'` u istom cardu) sa `aria-busy`, sačuvana visina; queue → 3× skeleton `<li>` umjesto `emptyQueue` teksta koji laže da je prazno dok se učitava.
  * `error` → `role="alert"` + poruka + `Retry` sa `isFetching`/`disabled`, **uz sačuvan** `Seo`/`h1`/`hint` (danas nema error stanja — error se pretvara u `0` pa moderator misli da nema posla).
  * `empty/0` → `0` je validno, ali `undefined` (BE vrati `null`) mora prikazati `—` ili `0` konzistentno; danas KPI i queue koriste `??0` ispravno, ali visitors i inbox isto — tu je OK, ali nema `—` za grešku.
  * `forbidden` (403 na `/news?status=PENDING`) → poruka „nedovoljno dozvola“ bez retry loop-a, bez curenja podataka iz prethodnog `data`.
  * `stale` → `lastUpdated` + `Osvježi` dugme (kao AdminHome) ili `refetchOnWindowFocus:false` + `staleTime 30s`.
* **A11y/i18n/perf:**
  * `Seo` title uvijek renderan, `h1` prvi u DOM-u (RoleHomeShell to poštuje — dobro).
  * Queue `<ul>` sa `aria-label="Red čekanja"` i svaki `Button Odobri` sa `aria-label="Odobri {title}"`, `tabular-nums` na brojevima.
  * `t()` sa `defaultValue` ili ključem koji postoji u obje locale (danas `t('admin.content.*')` postoji, ali `admin.visitors.*` treba provjeriti).
  * 5 query-a → 5 fetch-a na svaki mount, bez `staleTime` → nepotreban pritisak; treba `staleTime 30_000`, `retry 1`, `refetchOnWindowFocus:false`, i `enabled` po permisiji (kao AdminHome P2-6).

---

## 3) Propusti — klasifikacija

### P1 — blokator / sigurnosni / funkcionalni (mora odmah)

**P1-1 — KPI i QuickActions linkovi ne poštuju permisiju cilja (isti kao AdminHome P1-1)**
* Gdje: `ModeratorHome.tsx:30-55 kpiItems` — `href` se postavlja bez provjere (`/admin/news?status=PENDING`, `/admin/gallery?status=PENDING`, `/admin/live/pending`, `/admin/comms?tab=inbox`, `/admin/analytics?tab=visitors`); `HomeKpiGrid.tsx:24-30` rendera `<Link>` kad `href` postoji; QuickActions `ModeratorHome.tsx:135-145` 3 fiksna `<Link>` bez provjere.
* Zašto P1: moderator danas ima sve pa ne curi, ali čim se suzi `gallery.read` ili `analytics.read`, home će linkati modul koji nema pravo da vidi. To je funkcionalni propust + UX zamka (403 nakon klika) i potencijalno otkrivanje postojanja modula. AdminHome je već zatvorio ovo sa `canViewKpi`/`ACTION_PERMISSIONS` — ModeratorHome kasni.
* Repro: makni `gallery.read` moderatoru, ostavi `news.read` — KPI `pendingGalleries` i dalje linka `/admin/gallery?status=PENDING` iako nema pristup; QuickActions isto.

**P1-2 — Queue `Odobri` dugme ne provjerava `approve` permisiju i nema `isPending`/`disabled`**
* Gdje: `ModeratorHome.tsx:100-125 handleApprove` + `queue.map:110 <Button onClick={()=>handleApprove(item)}>` — nema `canApprove = hasPermission(user.permissions,'news.approve')` itd., nema `disabled={isApproving}`, nema `aria-busy`.
* Zašto P1: moderator bez `live.approve` može vidjeti i kliknuti `Odobri` na live izvještaju, a BE će vratiti 403 — korisnik ne zna da nema dozvolu prije klika. Dupli klik može izazvati dupli `mutateAsync` bez feedbacka. To je autorizacioni i UX propust.
* Repro: ulogiran moderator sa `news.read` ali bez `news.approve` otvori `/admin` — `Odobri` na `Vijest 1` je enabled iako nema pravo.

**P1-3 — Nema error stanja — greška se pretvara u `0` i `emptyQueue` (tihi fail)**
* Gdje: `ModeratorHome.tsx:30-56` — `pendingNews = news.data?.length ?? 0`, `isLoading ? '…' : value`; nema `isError` grane; `queue:58-98` — `isQueueLoading ? emptyQueue : queue.length===0 ? emptyQueue : <ul>` — loading i empty dijele isti tekst, a error (npr. 403/500 na `/news?status=PENDING`) se tretira kao `data===undefined` → `0` i `emptyQueue`.
* Zašto P1: ako BE vrati 403 (nema `news.read`) ili 500, moderator vidi `0` i „Nema stavki na čekanju“ i misli da nema posla, a zapravo je fetch pao. To je funkcionalni propust — gubi se posao. AdminHome je već riješio sa `role="alert"` + `Retry` + `isFetching`.
* Repro: mock `useNewsList` vrati `{isError:true, error:{status:403}}` — ModeratorHome prikaže `0` umjesto `role="alert"` i `Pokušaj ponovo`.

### P2 — nekonzistentnost / loša praksa (radi ali se ne radi tako)

**P2-1 — 5 query-a bez `enabled`/`staleTime`/`retry`/`refetchOnWindowFocus` (isti kao AdminHome P2-6)**
* Gdje: `hooks/index.ts:25 useNewsList` + `48 useGalleryList` + `use-live-admin.ts:12 usePendingLiveReports` + `use-contact-admin.ts:10 useContactMessages` + `use-analytics.ts:85 useVisitorTotals` — svi `useQuery({queryKey, queryFn})` bez `staleTime`, `retry`, `enabled`.
* Zašto P2: svaki tab focus refetcha 5 endpointa (3 lista + inbox + analytics). Bez `staleTime 30_000` i `retry 1` nepotreban pritisak na DB; bez `enabled` po permisiji fetch-a i kad nema dozvolu.
* Dokaz: `hooks/index.ts:25-35`, `use-live-admin.ts:12-16`, `use-contact-admin.ts:10-15`, `use-analytics.ts:85-92`.

**P2-2 — Loading je `'…'` u cardu i `emptyQueue` tekst koji laže**
* Gdje: `ModeratorHome.tsx:44 value = isLoading ? '…' : count` — `'…'` je string u `<p class="text-3xl">` pa skače visina; `ModeratorHome.tsx:68 {isQueueLoading ? <p>emptyQueue</p> : queue.length===0 ? <p>emptyQueue</p> : <ul>}` — loading i empty nerazlikljivi, nema skeletona, nema `aria-busy`.
* Zašto P2: profesionalno je skeleton 7× Card sa `animate-pulse` + `aria-busy="true"` (kao AdminHome P2-1) i queue skeleton 3× `<li>` sa `aria-busy`.
* Test je prilagođen lošem ponašanju: `fe06-moderator-home.test.tsx:38` očekuje `'…'` 7 puta.

**P2-3 — Error i forbidden bez `role="alert"` i bez `isFetching`**
* Gdje: nema `isError` grane nigdje; `Button Odobri` nema `disabled={isPending}`/`aria-busy`; nema `Retry` dugmeta.
* Zašto P2: a11y i UX — screen reader ne najavljuje grešku, dupli klik na approve može izazvati dupli fetch. AdminHome je već dodao `role="alert"` + `Button disabled={isFetching}`.
* Dokaz: `ModeratorHome.tsx:100-125` nema `isPending`, `ModeratorHome.tsx:30-56` nema `isError`.

**P2-4 — Queue spajanje bez sortiranja i bez deduplikacije, limit 8 je magičan broj**
* Gdje: `ModeratorHome.tsx:58-70 const queue = [...news, ...gallery, ...live].slice(0,8)` — redoslijed je news→gallery→live, ne hronološki; ako ista vijest ima i gallery i live (ne, ali ID-evi mogu kolizirati kao `n1`/`g1`/`l1` — nema kolizije), ali nema `key` sa `kind:` prefixom u testu (`queueLinks` filtera po `href`).
* Zašto P2: nije blokator ali je nekonzistentno — moderator očekuje hronološki red (npr. `createdAt` desc), a ne fiksni prioritet news. Ipak, za plan je P2 jer ne puca.
* Dokaz: `ModeratorHome.tsx:60-68`.

**P2-5 — `HomeKpiGrid` hardkod `label` bez `aria-label` i bez `tabular-nums` na vrijednosti?**
* Gdje: `HomeKpiGrid.tsx:18-32` — `<CardTitle>{item.label}</CardTitle>` i `<p class="text-3xl">{item.value}</p>` — nema `aria-label={`${label}: ${value}`}` na `Link`-u, nema `tabular-nums` guard (AdminHome ga je dodao).
* Zašto P2: a11y — screen reader čita samo broj bez konteksta; `Link` treba `aria-label`.
* Dokaz: `HomeKpiGrid.tsx:24-32`.

**P2-6 — `useContactMessages` koristi `meta.total` ali ModeratorHome ne prikazuje paginaciju niti `isError`**
* Gdje: `hooks/use-contact-admin.ts:10` — `usePaginatedQuery(['contact'],'/contact',{unreadOnly:'true'})` vraća `PaginatedResponse<ContactMessage>` sa `meta.total`; ModeratorHome čita `data?.meta?.total ?? data?.data?.length ?? 0` (kroz `pickTotal` helper) ali ako je `isError`, prikazuje `0` umjesto greške.
* Zašto P2: isti tihi fail kao P1-3, ali specifičan za inbox.
* Dokaz: `ModeratorHome.tsx:38-42`.

### P3 — UX/polish (radi, ali može profesionalnije)

**P3-1 — Nema `lastUpdated` ni `Osvježi` dugmeta (kao AdminHome P3-2)**
* Moderator ne zna koliko su KPI-evi svježi; profesionalno: mali `Ažurirano prije 2 min • Osvježi` ispod grid-a, sa `dataUpdatedAt` iz `useVisitorTotals`/`useNewsList`.

**P3-2 — `RoleHomeShell` hint je statičan, bez broja zadataka**
* `moderatorHint: "Queue za odobrenje. Settings i korisnike ne dirate."` — mogao bi prikazati `3 na čekanju` dinamički.

**P3-3 — Queue `<ul>` bez `aria-label="Red čekanja"` i `Badge` bez `aria-label`**
* `ModeratorHome.tsx:85 <ul className="space-y-2">` — bez `aria-label`; `<Badge>PENDING</Badge>` bez prevoda (`admin.content.pending`).

**P3-4 — Visitors Card Hint je statičan `admin.visitors.hint` bez `days=30` interpolacije**
* Danas `hint: t('admin.visitors.hint')` — mogao bi biti `Posljednjih 30 dana` sa `{{days}}`.

---

## 4) Dokazi (file:line)

* `ModeratorHome.tsx:30-56` — `kpiItems` sa `href` bez provjere permisije, `value: isLoading ? '…' : count` (P1-1, P2-2)
* `ModeratorHome.tsx:58-70` — `queue = [...news, ...gallery, ...live].slice(0,8)` bez sortiranja (P2-4)
* `ModeratorHome.tsx:68` — `{isQueueLoading ? <p>emptyQueue</p> : queue.length===0 ? <p>emptyQueue</p> : <ul>}` — loading==empty (P2-2, P1-3)
* `ModeratorHome.tsx:85` — `<ul className="space-y-2">` bez `aria-label` (P3-3)
* `ModeratorHome.tsx:100-125` — `handleApprove` bez `canApprove` provjere, `<Button onClick>` bez `disabled={isPending}` (P1-2, P2-3)
* `ModeratorHome.tsx:135-145` — 3 QuickActions `<Link>` bez permisije (P1-1)
* `hooks/index.ts:25-35` — `useNewsList` bez `enabled/staleTime/retry` (P2-1)
* `hooks/index.ts:48-56` — `useGalleryList` bez `enabled/staleTime/retry` (P2-1)
* `hooks/use-live-admin.ts:12-16` — `usePendingLiveReports` bez `enabled/staleTime/retry` (P2-1)
* `hooks/use-contact-admin.ts:10-15` — `useContactMessages` bez `enabled/staleTime/retry` (P2-1, P2-6)
* `hooks/use-analytics.ts:85-92` — `useVisitorTotals` bez `enabled/staleTime/retry` (P2-1)
* `HomeKpiGrid.tsx:24-32` — `<Link>` bez `aria-label`, `<p>` bez `tabular-nums` guard (P2-5)
* `fe06-moderator-home.test.tsx:38` — `expect(screen.getAllByText('…')).toHaveLength(7)` — test cementira loše ponašanje (P2-2)
* `fe06-moderator-home-variants.test.tsx:38-90` — visitors `??0` varijante pokrivene, ali nema error testa (P1-3)

---

## 5) Predloženi plan — bez koda (šta će se dirati)

| Korak | Fajl | Promjena | Rizik | Test |
|-------|------|----------|-------|------|
| 1 | `frontend/src/hooks/index.ts` | `useNewsList(status, categoryId, options?)` i `useGalleryList(status, options?)` — dodaj `enabled`, `staleTime:30_000`, `retry:1`, `refetchOnWindowFocus:false` (kao `useDashboardKpis`) | nizak | hook test: `enabled:false` ne fetch-a |
| 2 | `frontend/src/hooks/use-live-admin.ts` | `usePendingLiveReports(options?)` — isti `enabled/staleTime/retry` | nizak | hook test |
| 3 | `frontend/src/hooks/use-contact-admin.ts` | `useContactMessages(params, options?)` — proslijedi `...options` u `usePaginatedQuery` + `staleTime/retry` default | nizak | hook test |
| 4 | `frontend/src/hooks/use-analytics.ts` | `useVisitorTotals(days, options?)` — dodaj `enabled/staleTime/retry` | nizak | hook test |
| 5 | `frontend/src/pages/admin/homes/ModeratorHome.tsx` | a) `const perms = useAuth().user?.permissions` + `enabledNews = hasPermission(perms,'news.read')` itd. za svih 5 query-a → `useNewsList('PENDING', undefined, {enabled: enabledNews})` b) `enabled` gate za gallery/live/inbox/visitors | srednji | test: bez `news.read` ne fetch-a, KPI bez linka |
| 6 | `frontend/src/pages/admin/homes/ModeratorHome.tsx` `kpiItems` | `href` samo ako `hasPermission(perms, KPI_PERMISSIONS[key])` (nova mapa `MODERATOR_KPI_PERMISSIONS`: `pendingNews:'news.read'`, `pendingGalleries:'gallery.read'`, `pendingLive:'live.read'`, `unreadInbox:'comms.read'`, `visitors:'analytics.read'`) — inače `href: undefined` → `HomeKpiGrid` rendera `div` | srednji | test: bez `analytics.read` visitors nema Link |
| 7 | `frontend/src/pages/admin/homes/ModeratorHome.tsx` `queue` | a) `canApproveNews = hasPermission(perms,'news.approve')` itd. b) `<Button disabled={!canApprove \|\| isApproving} aria-label={t('admin.content.approveLabel', {title})}>` c) `isApproving` iz `useUpdateNewsStatus().isPending` (treba `isPending` iz mutacije) | srednji | test: bez `news.approve` dugme disabled, `aria-label` postoji |
| 8 | `frontend/src/pages/admin/homes/ModeratorHome.tsx` `isError` | Ako bilo koji od 5 query-a ima `isError` → renderaj `role="alert"` + `t('admin.home.kpiError')` + `Button Retry` sa `disabled={isFetching}` (kao AdminHome), **uz sačuvan** `RoleHomeShell`/`h1`/`KpiGrid` skeleton | srednji | test: mock `isError:true` → `role="alert"` + naslov ostaje |
| 9 | `frontend/src/pages/admin/homes/ModeratorHome.tsx` `loading` | `isLoading ? <HomeKpiSkeletonGrid 7>` umjesto `'…'`; queue `isQueueLoading ? <QueueSkeleton 3>` umjesto `emptyQueue` teksta; `aria-busy="true"` na gridu | nizak | test: loading skeleton sa `aria-busy` |
| 10 | `frontend/src/pages/admin/homes/HomeKpiGrid.tsx` | Dodaj `aria-label={`${label}: ${value}`}` na `Link`, `tabular-nums` ostaje, `focus-visible:ring` već postoji | nizak | a11y test |
| 11 | `frontend/src/pages/admin/homes/ModeratorHome.tsx` `QuickActions` | Filtriraj 3 akcije po permisiji (`news.read` → newsQueue, `live.read` → livePending, `comms.read` → commsInbox); dodaj `nav aria-label={t('admin.home.quickActions')}` | nizak | test: bez `comms.read` nema inbox linka |
| 12 | `frontend/src/pages/admin/homes/ModeratorHome.tsx` `lastUpdated` | Dodaj `dataUpdatedAt` iz `useVisitorTotals`/`useNewsList` (najnoviji) + `Osvježi` dugme sa `isFetching` (kao AdminHome) | nizak | test lastUpdated |
| 13 | `frontend/src/locales/bs+en/common.json` | Dodaj `admin.content.approveLabel: "Odobri {{title}}"`, `admin.home.queueLabel: "Red čekanja"`, `admin.visitors.hintDays: "Posljednjih {{days}} dana"` ako nedostaju; `admin.home.refresh/lastUpdated/quickActions` već postoje iz A-02 | nizak | i18n test |
| 14 | `frontend/src/pages/admin/homes/fe06-moderator-home*.test.tsx` | Dopuni testove za 4 stanja + permisije + a11y (`role="alert"`, `aria-busy`, `aria-label`) — ne briši postojeće, samo dodaj | — | `check:all 10/10` |

**Šta se NE dira u ovom koraku:** `RoleHomeShell.tsx` (ostaje 26 linija), `types` (nema schema promjene), `router/app-routes.tsx` (permisija ostaje na BE), `DashboardPage.tsx` dispatcher (već pokriva `resolveStaffHome`).

---

## 6) Alternativa (zašto ne drugačije)

* **Ne dodavati `enabled` po permisiji nego osloniti se na BE 403:** odbačeno — FE bi retry-ao u loop-u (default `retry 3`) i prikazivao `0` umjesto poruke; `enabled:false` je jeftiniji i spriječava curenje 5 fetch-a.
* **Ne skrivati KPI link kao `div` nego disabled `Link` sa tooltipom „Nema dozvolu“:** odbačeno — disabled link je a11y zamka (fokusira se a ne radi); `div` bez linka je isti obrazac kao AdminHome P1-1 (konzistentno).
* **Skeleton umjesto `'…'`:** `'…'` je brži za napisati ali je CLS i a11y loš — skeleton je standard za dashboard-e (AdminHome već ima `KpiSkeletonGrid`).
* **Ne dodavati `lastUpdated`/`Osvježi`:** moglo bi bez, ali AdminHome ga već ima pa je konzistentno i korisno za moderatora koji čeka novi sadržaj.

---

## 7) Kriterijumi gotovosti (DoD)

- [ ] P1-1..P1-3 zatvoreni + testovi koji padaju bez fixa (KPI bez permisije → nema Link-a; `Odobri` bez `approve` → disabled; `isError` → `role="alert"` sa naslovom)
- [ ] P2-1..P2-6 zatvoreni: `staleTime 30s`/`retry 1`/`enabled` na 5 hookova, skeleton sa `aria-busy`, `role="alert"` + `disabled isFetching`, queue skeleton
- [ ] `HomeKpiGrid` `aria-label` + `QuickActions` permisije konzistentne
- [ ] `check:all 10/10`, `tsc -b` čist, `axe` bez kršenja na `/admin` (moderator)
- [ ] `AUDIT/COVERAGE_MATRIX.csv` + `AUDIT/STATE.md` ažurirani, `CI 6/6` na `arena/290a6f13-fkgracanica`
- [ ] Nema promjene ponašanja za moderatora koji ima sve permisije (vizuelno isto, ali ispravnije ispod haube — 7 KPI, queue 8, approve radi)

---

## 8) Otvorena pitanja za tebe (ask_user prije koda)

**Q1 — KPI permisije:** Da li `pendingNews → news.read`, `pendingGalleries → gallery.read`, `pendingLive → live.read`, `unreadInbox → comms.read`, `visitors → analytics.read` budu **striktno skriveni kao `div` bez linka** ako nema permisiju, ili da budu vidljivi ali disabled sa tooltipom „Nema dozvolu“? Predlažem **skriven link (div)** — kao AdminHome.

**Q2 — Approve permisije:** Da li `Odobri` dugme treba biti **skriveno** kad nema `news.approve`/`gallery.approve`/`live.approve`, ili **disabled sa `aria-label`**? Predlažem **disabled + aria-label** — moderator vidi da postoji akcija ali nema dozvolu (manje zabune nego skrivanje).

**Q3 — Queue redoslijed:** Da li queue ostaje `news→gallery→live` (danas) ili da ga sortiram hronološki po `createdAt` ako BE vrati datum? Predlažem **ostaviti današnji redoslijed** (bez sortiranja) — BE ne vraća `createdAt` u svim tipovima konzistentno, a 8 je mali broj.

**Q4 — Auto-refresh:** Da li KPI-evi trebaju `refetchInterval 60s` ili samo `Osvježi` dugme? Predlažem **samo dugme + `lastUpdated`**, bez intervala (kao AdminHome).

> Ako odobriš ovaj plan (ili `approve_with_comments`), sljedeći korak je implementacija A-03 po tabeli iznad — jedan PR, dio po dio, uz `gh run watch` do `6/6`.
