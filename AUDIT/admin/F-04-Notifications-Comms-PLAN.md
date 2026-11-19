# F-04 — Notifications / Comms / EmailLog / LivePending — PLAN (2026-11-19, grana `arena/290a6f13-fkgracanica` @ `6f79d31`)

> Planski dokument — bez koda. Slijedi template iz `ADMIN_PLAN_2026-11-17.md` §2. Implementacija tek nakon `ask_user approve`.

---

## Meta

| Polje | Vrijednost |
|-------|------------|
| Rute | `/admin/notifications` (`NotificationsPage`) · `/admin/comms` (`CommsAdminPage` → tab `contact`/`newsletter`/`email-log`) · `/live/pending` (`LivePendingPage`) |
| Fajl(ovi) | `NotificationsPage.tsx` (88L) · `CommsAdminPage.tsx` (96L) · `EmailLogPanel.tsx` (68L) · `LivePendingPage.tsx` (70L) · `hooks/use-notifications.ts` `useNotifications` · `hooks/use-live-admin.ts` `usePendingLiveReports` |
| Rola/permisije | `notifications.read` / `contact.read`+`modules.contact` / `newsletter.read`+`modules.newsletter` / `settings.read` (email-log) / `live.approve` (live pending) — tabovi uslovni `hasPermission`+`isModuleEnabled` |
| API | `GET /notifications?unreadOnly&page` · `GET /email-log?page&limit` · `GET /live/pending` |
| Stanje grane | `arena/290a6f13-fkgracanica` @ `6f79d31` (F-03 ZATVOREN `44626096001` 6/6) |

---

## 1) Šta radi danas (činjenično, bez ocjene)

**`NotificationsPage.tsx:18-88`:** `useState page` + `useNotifications({page})` bez `staleTime/retry/overload` (hook nema), `AdminPageShell isError/onRetry isLoading` ali bez `isFetching/dataUpdatedAt/lastUpdated/Osvježi`, `items = data?.data ?? []` + `ul` sa `items.length===0 → <p>Nema obavještenja.</p>` + `Card` list + `AdminPagination` (meta). Akcije `markRead/markAll` via `runAction`. Nema `isFetching` na dugmad, nema `aria-busy` izvan shella (shell ga ima).

**`CommsAdminPage.tsx:32-96`:** `useSearchParams tab` + `useModuleFlags` + `hasPermission` za `contact`/`newsletter`/`email-log`, `tabs useMemo` sa hardkod labelama `Kontakt/Newsletter/Email log` bez `t()` `defaultValue`, `resolveTab` + `useEffect` sync `?tab=` (kao `UsersRolesPage` prije fixa), `AdminPageShell title+actions` sa `<div className="flex flex-wrap gap-2">` **bez** `role=tablist`/`aria-pressed`/`aria-selected`, `Button variant default/outline` bez `role=tab`.

**`EmailLogPanel.tsx:30-68`:** direktan `useQuery(['email-log',page], fn)` bez `staleTime/retry/overload`, `isLoading → <p className="p-4">loading</p>` bez `aria-busy`/`Skeleton`, nema `isError`/`role=alert`/`retry`, nema `isFetching/dataUpdatedAt/lastUpdated/Osvježi`, `empty="Nema grešaka."` hardkod bez `t()` `defaultValue`, `AdminDataTable` + `AdminPagination`.

**`LivePendingPage.tsx:13-70`:** `usePendingLiveReports()` već ima `staleTime 30k retry1 overload`, ali stranica destrukturira samo `data,isLoading,isError,refetch` bez `isFetching/dataUpdatedAt`, `AdminPageShell isError/onRetry title` bez `isLoading/isFetching/dataUpdatedAt/onRefresh/lastUpdated`, `AdminDataTable empty={isLoading ? loading : empty}` — loading kao empty `role=status` umjesto `aria-busy`, nema `isFetching` disabled na `Pregled`/`Odobri`.

**Hookovi danas:**
- `useNotifications` bez `staleTime/retry/overload` (ostalih `useNotifications` nema, `usePendingLiveReports` ima 30k)
- `EmailLogPanel` direktan `useQuery` bez wrappera

**Stanja danas:**
- Notifications: `isLoading` → shell skeleton `aria-busy`, `isError` → shell `role=alert` — OK, ali bez `lastUpdated/Osvježi` i bez `isFetching` na `markAll/markRead`
- Comms tabovi: bez `role=tablist`/`aria-pressed` (isto kao F-03 prije fixa)
- EmailLog: `isLoading` plain `<p>` bez `aria-busy`/skeleton, nema error
- LivePending: `isLoading` kao empty tekst, nema skeleton/ `aria-busy`, nema `lastUpdated`

---

## 2) Šta bi trebala da radi (očekivano)

* **Korisnik:** admin koji otvori `/admin/notifications` mora vidjeti `role=alert` + `retry disabled isFetching` na grešku, `aria-busy Skeleton` dok se učitava, `lastUpdated/Osvježi` iznad liste, paginacija `aria-live` + `disabled isFetching`, `markAll/markRead` `disabled isPending/isFetching`. `/admin/comms` tabovi `role=tablist` `aria-pressed` sa `t()` `defaultValue`. `EmailLog` `aria-busy`/`role=alert`/`lastUpdated` kao ostale tabele. `LivePending` `aria-busy` + `role=alert` + `lastUpdated` + `Odobri` `disabled isPending/isFetching`.
* **Ugovor:** `staleTime 30_000` + `retry 1` + `refetchOnWindowFocus false` + `UseQueryOptions overload` za `useNotifications` i `EmailLog` query kao `useTeamAnalytics`, tabovi `t()` sa `defaultValue` + `role=tablist` `aria-pressed`, svaka tabela/panel sa `isFetching/dataUpdatedAt` + `Osvježi` `disabled`.

---

## 3) Propusti — klasifikacija

### P1 — blokator
**Nema P1.** Rute štite permisije, nema curenja, mutacije imaju `can*` guard.

### P2 — nekonzistentnost / loša praksa
**P2-1 — `useNotifications` i `EmailLogPanel useQuery` bez `staleTime/retry/overload`** — odstupaju od `usePendingLiveReports`/`useTeamAnalytics` koji imaju 30k
**P2-2 — `NotificationsPage` bez `isFetching/dataUpdatedAt/lastUpdated/Osvježi`** — AdminPageShell prima `isFetching/dataUpdatedAt` ali stranica ne prosljeđuje (kao Audit/Analytics prije fixa)
**P2-3 — `CommsAdminPage` tabovi bez `role=tablist`/`aria-pressed`/`aria-selected` i bez `t()`** — a11y ispod standarda (isto kao F-01 P2-6, fiksano u F-01/F-03), hardkod `Kontakt`
**P2-4 — `EmailLogPanel` loading plain `<p>` bez `aria-busy`/`Skeleton`, nema `isError`/`role=alert`** — nekonzistentno sa svim ostalim admin tabelama
**P2-5 — `EmailLogPanel` hardkod `empty="Nema grešaka."` i `header`/`Badge` bez `t()`** — i18n ispod standarda (treba `defaultValue`)
**P2-6 — `LivePendingPage` destrukturira bez `isFetching/dataUpdatedAt`, shell bez `isLoading/isFetching/lastUpdated`, `empty` kao loading** — odstupa od `Roles/Users` i `Audit` shell obrasca

### P3 — UX/polish
- `NotificationsPage` `markAll/markRead` bez `disabled isPending` feedbacka na dugmadi
- `EmailLogPanel` nema `emptyRole`/`isError` retry
- `LivePendingPage` `Pregled` link bez `prefetch` i `Odobri` bez `confirm`

---

## 4) Dokazi (file:line)

* `hooks/use-notifications.ts:7-12` — `useNotifications` bez `staleTime` — P2-1
* `EmailLogPanel.tsx:30-38` — `useQuery(['email-log',page])` bez `staleTime` — P2-1
* `NotificationsPage.tsx:21` — `const {data,isLoading,isError,refetch} = useNotifications({page})` bez `isFetching/dataUpdatedAt` — P2-2
* `CommsAdminPage.tsx:86-94` — `<div className="flex flex-wrap gap-2">` bez `role=tablist` — P2-3
* `CommsAdminPage.tsx:42-44` — `label: 'Kontakt'` hardkod — P2-3
* `EmailLogPanel.tsx:38` — `if (isLoading) return <p>loading</p>` bez `aria-busy` — P2-4
* `EmailLogPanel.tsx:48` — `empty="Nema grešaka."` hardkod — P2-5
* `LivePendingPage.tsx:14` — `const {data,isLoading,isError,refetch} = usePendingLiveReports()` bez `isFetching/dataUpdatedAt` — P2-6
* `LivePendingPage.tsx:25` — `empty={isLoading ? loading : empty}` — P2-6

---

## 5) Predloženi plan — bez koda

| Korak | Fajl | Promjena | Rizik | Test |
|-------|------|----------|-------|------|
| 1 | `hooks/use-notifications.ts` | `useNotifications(params, options?)` `staleTime 30k retry1 refetchOnWindowFocus false` + `UseQueryOptions<PaginatedResponse<NotificationItem>> overload` | nizak | postojeći |
| 2 | `EmailLogPanel.tsx` | izdvojiti `useEmailLog(page, options?)` ili direktno dodati `staleTime 30k retry1` + `isFetching/dataUpdatedAt` + `lastUpdated/Osvježi` + `isLoading→aria-busy Skeleton` + `isError→role=alert retry disabled` + i18n `empty`/`header` sa `defaultValue` | srednji | novi 6t |
| 3 | `NotificationsPage.tsx` | `isFetching/dataUpdatedAt` + `lastUpdated/Osvježi` bar + proslijedi `isFetching/dataUpdatedAt/onRefresh` u `AdminPageShell` + `markAll/markRead` `disabled` kad `isPending/isFetching` + paginacija `aria-live` `disabled isFetching` | srednji | novi |
| 4 | `CommsAdminPage.tsx` | `role=tablist` + `Button role=tab aria-selected/aria-pressed` + `t()` sa `defaultValue` za label-e (`admin.commsTabs.*`) | nizak | — |
| 5 | `LivePendingPage.tsx` | destrukturiraj `isFetching/dataUpdatedAt` + `AdminPageShell isLoading/isFetching/dataUpdatedAt/onRefresh` + `lastUpdated` + `Odobri` `disabled isPending/isFetching` + `empty` i18n `defaultValue` | srednji | — |
| 6 | `locales/bs+en/common.json` | dopuni `admin.commsTabs.*`, `admin.emailLog.empty`, `admin.notifications.*` ako treba (već postoji većina) | nizak | — |
| 7 | `fe06-f04-notifications-comms.test.tsx` (novi, 8-10t) | notifications loading aria-busy, error role=alert+retry disabled, lastUpdated/Osvježi, comms tablist aria-pressed, emailLog loading/error/lastUpdated, livePending aria-busy/alert/lastUpdated | — | — |
| 8 | `AUDIT/COVERAGE_MATRIX.csv` | inventory | — | — |

**Šta se NE dira:** `NewsletterAdminPage`/`ContactAdminPage` (drugi segmenti), `realtime` socket, `router`, `backend`.

---

## 6) Alternativa

* **Ne dirati EmailLogPanel error:** odbačeno — panel bi ostao jedini admin panel bez `role=alert`, ispod standarda F-01/E-02
* **Ne dodavati tablist u Comms:** odbačeno — `UsersRolesPage` i `AnalyticsPage` su pokazali da je `role=tablist` minimum a11y za tabove
* **Zaseban hook za email-log umjesto inline `useQuery`:** predloženo kao opcija u koraku 2 — odluka na implementaciji (inline sa `staleTime` je dovoljno ako se ne ponavlja)

---

## 7) Kriterijumi gotovosti (DoD)

- [ ] P2-1..P2-6 zatvoreni + testovi koji padaju bez fixa
- [ ] 4 stanja pokrivena + tabovi `aria-pressed` + `role=alert`/`aria-busy` + `lastUpdated` + `Select`/`Pagination` disabled
- [ ] `check:all 10/10`, `tsc -b` čist, `axe` bez kršenja
- [ ] `COVERAGE_MATRIX` + `CI 6/6`

---

## 8) Otvorena pitanja za tebe (ask_user prije koda)

**Q1 — `useNotifications` + `EmailLog` `staleTime 30k + retry1 + overload`:** Da li hookovi dobijaju `staleTime 30_000 retry1 refetchOnWindowFocus false + UseQueryOptions overload` kao `useTeamAnalytics`/`usePendingLiveReports`, ili da ostanu bez cache prozora? Predlažem **da — 30k+retry1+overload**.

**Q2 — `Notifications` + `LivePending` + `EmailLog` `aria-busy`/`role=alert` + `lastUpdated/Osvježi` + `disabled isFetching`:** Da li stranice dobijaju `isLoading→aria-busy Skeleton` + `isError→role=alert retry disabled isFetching` + `lastUpdated/Osvježi` + `pagination/disabled` kao F-01/F-03, ili da ostanu plain? Predlažem **da — skeleton+alert+lastUpdated+disabled**.

**Q3 — `CommsAdminPage` tabovi `role=tablist` + `t()` i18n:** Da li comms tabovi dobijaju `role=tablist` `aria-pressed/aria-selected` + `t(defaultValue)` kao `UsersRolesPage`/`AnalyticsPage`, ili da ostanu `div flex` hardkod? Predlažem **da — tablist+i18n**.

> Ako odobriš ovaj plan (ili `approve_with_comments`), sljedeći korak je implementacija F-04 po tabeli — jedan commit, `gh run watch` do `6/6`.
