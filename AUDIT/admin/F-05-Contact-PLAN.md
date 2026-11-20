# F-05 — ContactAdminPage / ContactMessageSheet — PLAN (2026-11-20, grana `arena/290a6f13-fkgracanica` @ `ad16dfb`)

> Planski dokument — bez koda. Slijedi template iz `ADMIN_PLAN_2026-11-17.md` §2. Implementacija tek nakon `ask_user approve`.

---

## Meta

| Polje | Vrijednost |
|-------|------------|
| Rute | `/admin/contact` → `301 /admin/comms?tab=contact` + `/admin/comms` tab `contact` (`ContactAdminPage embedded`) · standalone i embedded |
| Fajl(ovi) | `ContactAdminPage.tsx` (173L) · `ContactMessageSheet.tsx` (58L) · `hooks/use-contact-admin.ts` `useContactMessages` (već 30k) |
| Rola/permisije | `contact.read` + `modules.contact` (`CommsAdminPage` tab guard), `contact.manage` implictno za `delete/markRead` |
| API | `GET /contact?page&search&unreadOnly`, `PATCH /contact/:id/read`, `PATCH /contact/read-all`, `DELETE /contact/:id` |
| Stanje grane | `arena/290a6f13-fkgracanica` @ `ad16dfb` (F-04 ZATVOREN `44633721564` 6/6, dead-guards 31/31, matrica 2334, check:all 10/10) |

---

## 1) Šta radi danas (činjenično, bez ocjene)

**`ContactAdminPage.tsx:18-40`:** `useState page/search/unreadOnly/selected` + `useContactMessages({page, search, unreadOnly})` — hook već ima `staleTime 30k retry1 refetchOnWindowFocus false + UseQueryOptions overload` (kao `useFinanceSummary`), destrukturira samo `{data,isLoading,isError,refetch}` bez `isFetching/dataUpdatedAt`. `markRead/markAllRead/remove` via `runAction`. `rows = data?.data ?? []`.

**`ContactAdminPage.tsx:46-55`:** `markAllAction = <Button disabled={markAllRead.isPending}>Označi sve pročitanim</Button>` bez `isFetching`, hardkod label bez `t()`.

**`ContactAdminPage.tsx:63-84`:** `Input placeholder={t('admin.usersAdmin.search')}` — koristi users ključ umjesto contact, `Button Samo nepročitane` hardkod bez `t()`, filter bar `border-b p-4` ali bez `aria-live` na tabeli.

**`ContactAdminPage.tsx:85-108`:** `AdminDataTable rows={rows} empty="Nema poruka."` hardkod bez `t()` `defaultValue` i bez `emptyRole`, `columns` headeri hardkod `Ime/Email/Naslov/Status/Datum` bez `t()`, `Badge variant` text `Pročitano/Novo` hardkod, `Button aria-label={t('actions.delete')}` ok ali bez `disabled isPending/isFetching` na delete.

**`ContactAdminPage.tsx:109`:** `{data?.meta && <AdminPagination meta={data.meta} page={page} onPageChange={setPage} />}` bez `isFetching/dataUpdatedAt` i bez `disabled isFetching`/`aria-live` (isto kao F-04 prije fixa, fiksano u `EmailLogPanel`).

**`ContactAdminPage.tsx:122-141`:** `if (embedded) return <>{dialog}{body}{sheet}</>` — embedded bypass-a `AdminPageShell` pa nema `isLoading→aria-busy Skeleton`, `isError→role=alert retry`, `lastUpdated/Osvježi`. Standalone `return <><Seo title={t('admin.contact')} />{dialog}<AdminPageShell isError/onRetry/title isLoading actions>{body}</AdminPageShell>{sheet}</>` — shell prima samo `isError/onRetry/isLoading/title/actions` bez `isFetching/dataUpdatedAt/onRefresh` pa nema `lastUpdated/Osvježi` ni `disabled isFetching` na retry/osvježi.

**`ContactMessageSheet.tsx:1-58`:** `AdminFormSheet open/onOpenChange title={message.subject ?? 'Kontakt poruka'}` hardkod fallback bez `t()`, `dt Od` hardkod bez `t()`, `Button Označi kao pročitano` hardkod bez `t()` i samo `disabled={isMarking}`.

**Stanja danas:**
- `isLoading` → shell skeleton `aria-busy` (standalone) ali embedded ostaje prazan body; nema `isFetching` na filterima/paginaciji
- `isError` → shell `role=alert` (standalone) ali embedded nema ništa; retry nije `disabled isFetching`
- `success` → tabela bez `lastUpdated/Osvježi`, bez `emptyRole`, bez `aria-live` na paginaciji
- `empty` → `Nema poruka.` hardkod
- `sheet` → `Kontakt poruka`/`Od`/`Označi kao pročitano` hardkod

---

## 2) Šta bi trebala da radi (očekivano)

* **Korisnik:** admin sa `contact.read` koji otvori `/admin/comms?tab=contact` (ili `/admin/contact` redirect) mora za <1s vidjeti filtere + tabelu sa `Skeleton aria-busy` dok se učitava (i u embedded), `role=alert` + `retry disabled isFetching` na grešku (i u embedded), `lastUpdated/Osvježi` iznad filtera (`dataUpdatedAt` + `Button disabled isFetching`), header-e preko `t()` sa `defaultValue`, `empty` preko `t()` sa `defaultValue` + `emptyRole="status"`, paginaciju `aria-live` + `disabled isFetching`, dugmad `Označi sve/Samo nepročitane` preko `t()` + `disabled isPending/isFetching`.
* **Ugovor:** kao F-04/E-02/E-03/B-02: svaka tabela/panel sa `isFetching/dataUpdatedAt` + `Osvježi` `disabled`, `isLoading→aria-busy Skeleton`, `isError→role=alert retry disabled`, `t()` sa `defaultValue` za svaki hardkod, `AdminPagination` sa `isFetching` disabled, sheet sa `t()` fallback.

---

## 3) Propusti — klasifikacija

### P1 — blokator
**Nema P1.** Ruta štiti `contact.read` (CommsAdmin), mutacije imaju `runAction` i `confirm`.

### P2 — nekonzistentnost / loša praksa
**P2-1 — `ContactAdminPage` destrukturira bez `isFetching/dataUpdatedAt`, shell bez `isFetching/dataUpdatedAt/onRefresh/lastUpdated`** — odstupa od `NotificationsPage`/`LivePendingPage`/`EmailLogPanel` (F-04) i `AuditPage` (F-02) koji su dobili `lastUpdated/Osvježi` + `disabled isFetching`
**P2-2 — `embedded` bypass-a shell pa nema ni `isLoading Skeleton` ni `isError role=alert`** — embedded u `CommsAdminPage` ostaje bez loading/error UI (isto kao `UsersPage` embedded prije F-01)
**P2-3 — hardkod BS `Označi sve pročitanim`, `Samo nepročitane`, `Nema poruka.`, headeri `Ime/Email/Naslov/Status/Datum`, `Pročitano/Novo`, `Kontakt poruka`, `Od`, `Označi kao pročitano`** — ispod FE-04c i18n standarda, treba `t('admin.contact.*', {defaultValue})`
**P2-4 — `Input placeholder` koristi `t('admin.usersAdmin.search')` umjesto contact ključa** — pogrešan namespace, treba `t('admin.contactPage.searchPlaceholder', defaultValue:'Pretraži')` ili slično
**P2-5 — `AdminDataTable empty="Nema poruka."` bez `t()` i bez `emptyRole`** — odstupa od Clubs/Players (`emptyRole="status"` + `t(defaultValue)`)
**P2-6 — `AdminPagination` bez `isFetching`/`dataUpdatedAt` i bez `disabled isFetching`/`aria-live`** — paginacija ne blokira dok se dohvaća, isto kao F-04 P2-2 prije fixa
**P2-7 — dugmad `markAllRead`/`delete` samo `disabled isPending` bez `isFetching`** — retry/osvježi obrazac zahtijeva `disabled={isPending||isFetching}` kao u F-04 Notifications
**P2-8 — `ContactMessageSheet` title fallback `'Kontakt poruka'` i `dt Od` hardkod** — i18n ispod standarda, sheet se koristi i u embedded i standalone

### P3 — UX/polish
- `openMessage` automatski `markRead` bez `disabled` feedbacka na retku (trenutno `isPending` samo na sheet dugmetu)
- `search` nema debounce — svaka tipka radi fetch (kao `UsersPage` prije F-01 P3)

---

## 4) Dokazi (file:line)

* `ContactAdminPage.tsx:29` — `const {data,isLoading,isError,refetch} = useContactMessages(...)` bez `isFetching/dataUpdatedAt` — P2-1
* `ContactAdminPage.tsx:122-128` — `if (embedded) return <>{dialog}{body}{sheet}</>` bez `isLoading/isError` — P2-2
* `ContactAdminPage.tsx:49` — `Označi sve pročitanim` hardkod — P2-3
* `ContactAdminPage.tsx:70` — `Samo nepročitane` hardkod — P2-3
* `ContactAdminPage.tsx:78` — `placeholder={t('admin.usersAdmin.search')}` — P2-4
* `ContactAdminPage.tsx:94` — `empty="Nema poruka."` hardkod — P2-5
* `ContactAdminPage.tsx:109` — `<AdminPagination meta={data.meta} ... />` bez `isFetching` — P2-6
* `ContactAdminPage.tsx:52` — `disabled={markAllRead.isPending}` bez `isFetching` — P2-7
* `ContactMessageSheet.tsx:27` — `title={message.subject ?? 'Kontakt poruka'}` hardkod — P2-8
* `ContactMessageSheet.tsx:39` — `<dt>Od</dt>` hardkod — P2-8
* `ContactMessageSheet.tsx:51` — `Označi kao pročitano` hardkod — P2-8

---

## 5) Predloženi plan — bez koda

| Korak | Fajl | Promjena | Rizik | Test |
|-------|------|----------|-------|------|
| 1 | `ContactAdminPage.tsx` | destrukturiraj `{data,isLoading,isFetching,isError,dataUpdatedAt,refetch}` + `lastUpdated = dataUpdatedAt ? HH:mm : null` + proslijedi `isFetching/dataUpdatedAt/onRefresh` u `AdminPageShell` (standalone) i u embedded body (dodaj isti `lastUpdated/Osvježi` bar iznad filtera kao u `EmailLogPanel`) | srednji | novi |
| 2 | `ContactAdminPage.tsx` | embedded: dodaj `if (isLoading) -> <div aria-busy><Skeleton 5×h-12></div>`, `if (isError) -> <div role=alert><DataError retry disabled isFetching></div>` (kao `EmailLogPanel` standalone), ili delegiraj na shell-like fragment | srednji | — |
| 3 | `ContactAdminPage.tsx` | i18n: `t('admin.contact.markAllRead', defaultValue:'Označi sve pročitanim')`, `t('admin.contact.unreadOnly', defaultValue:'Samo nepročitane')`, `t('admin.contact.empty', defaultValue:'Nema poruka.')` + `emptyRole="status"`, headeri `t('admin.contact.header.*', defaultValue:'Ime/Email/Naslov/Status/Datum')`, `Badge` `t('admin.contact.read', defaultValue:'Pročitano')` / `t('admin.contact.new', defaultValue:'Novo')`, `placeholder t('admin.contact.searchPlaceholder', defaultValue:'Pretraži')` | nizak | — |
| 4 | `ContactAdminPage.tsx` | paginacija: `AdminPagination` sa `isFetching` disabled/aria-live + sačuvan `Seo/h1` (`t('admin.contactPage.title')` već postoji) | nizak | — |
| 5 | `ContactMessageSheet.tsx` | `t('admin.contactMessage.titleFallback', defaultValue:'Kontakt poruka')`, `t('admin.contactMessage.from', defaultValue:'Od')`, `t('admin.contactMessage.markRead', defaultValue:'Označi kao pročitano')` | nizak | — |
| 6 | `locales/bs+en/common.json` | dopuni `admin.contact.*` (markAllRead/unreadOnly/empty/header.* /read/new/searchPlaceholder) + `admin.contactMessage.*` (from/titleFallback/markRead) BS/EN + `en` mirror | nizak | — |
| 7 | `fe06-f05-contact.test.tsx` (novi, 8-10t) | loading `aria-busy` (standalone+embedded), error `role=alert` + retry `disabled isFetching`, empty `status` + t, header i18n defaultValue, badge read/new, paginacija disabled isFetching, lastUpdated/Osvježi, markAll disabled, sheet title/from/markRead | — | — |
| 8 | `AUDIT/COVERAGE_MATRIX.csv` | inventory | — | — |

**Šta se NE dira:** `hooks/use-contact-admin.ts` (već 30k+overload, kao `useFinanceSummary`), `CommsAdminPage` tabovi (već F-04), `router` redirect, `backend` (već `contact.read` + `modules.contact`).

---

## 6) Alternativa

* **Ne dirati embedded loading/error:** odbačeno — tada bi `CommsAdminPage` tab `contact` u embedded ostao jedini admin tab bez `aria-busy`/`role=alert`, ispod F-04 standarda
* **Ne dodavati lastUpdated/Osvježi u embedded:** odbačeno — `EmailLogPanel` (takođe embedded u Comms) ga ima i nakon F-04; kontakt bi bio nekonzistentan
* **Zaseban hook za sheet:** nepotrebno — sheet je čist presentational + `isMarking`

---

## 7) Kriterijumi gotovosti (DoD)

- [ ] P2-1..P2-8 zatvoreni + testovi koji padaju bez fixa
- [ ] 4 stanja pokrivena (standalone+embedded) + `role=alert`/`aria-busy` + `lastUpdated/Osvježi` + `Select`/`Input`/`Pagination` disabled + i18n `defaultValue`
- [ ] `check:all 10/10`, `tsc -b` čist, `axe` bez kršenja
- [ ] `COVERAGE_MATRIX` + `STATE.md` + `CI 6/6`

---

## 8) Otvorena pitanja za tebe (ask_user prije koda)

**Q1 — `isFetching/dataUpdatedAt/lastUpdated/Osvježi` + `aria-busy`/`role=alert` i za embedded i standalone:** Da li i `embedded` (`CommsAdminPage` tab) i standalone `AdminPageShell` dobijaju `isLoading→aria-busy Skeleton`, `isError→role=alert retry disabled isFetching` i `lastUpdated/Osvježi` (`dataUpdatedAt` + `Button disabled isFetching`) kao `EmailLogPanel`/`NotificationsPage` u F-04, ili da embedded ostane bez toga? Predlažem **da — oba, kao EmailLog**.

**Q2 — `t()` sa `defaultValue` za sve hardkodove (markAll/unreadOnly/empty/headeri/badge/sheet):** Da li headeri (`Ime/Email/Naslov/Status/Datum`), `Pročitano/Novo`, `Nema poruka.`, `Samo nepročitane`, `Označi sve/sheet` idu kroz `t('admin.contact.*', {defaultValue})` i `t('admin.contactMessage.*')` (BS/EN + fallback) kao F-04 `admin.commsTabs.*`/`admin.emailLog.*`, ili da ostanu hardkod? Predlažem **da — t(defaultValue)**.

**Q3 — `emptyRole + paginacija disabled isFetching + placeholder search`:** Da li `AdminDataTable empty` dobija `emptyRole="status"` + `t(defaultValue)` i `AdminPagination` `isFetching` disabled/`aria-live`, te `Input placeholder` `t('admin.contact.searchPlaceholder', defaultValue:'Pretraži')`, ili da ostane `Nema poruka.` hardkod i paginacija bez disabled? Predlažem **da — emptyRole/status + paginacija disabled + placeholder t(defaultValue)**.

