# F-01 — Users/Roles — PLAN (2026-11-19, grana `arena/290a6f13-fkgracanica` @ `1b4e722`)

> Planski dokument — bez koda. Slijedi template iz `ADMIN_PLAN_2026-11-17.md` §2. Implementacija tek nakon `ask_user approve`.

---

## Meta

| Polje | Vrijednost |
|-------|------------|
| Ruta | `/admin/users` (via `/admin/users?tab=users|roles`) — `app-routes.tsx` `<PermissionRoute>` + `UsersRolesPage` dispatcher `users.read`/`rbac.read` |
| Fajl(ovi) | `UsersPage.tsx` (194L) · `RolesPage.tsx` (187L) · `UsersRolesPage.tsx` (85L) · `hooks/index.ts` `useUsers`/`useRoles`/`usePermissions` · `UserAdminFormSheet.tsx` · `RolesAdminFormSheet.tsx` |
| Rola/permisije | `users.read` (Users), `rbac.read` (Roles), `users.create/update/delete`, `rbac.update` — tabovi `canUsers`/`canRoles` |
| API | `GET /users?page&search`, `GET /rbac/roles`, `GET /rbac/permissions`, `DELETE /users/:id`, `POST /rbac/roles/:id/permissions` |
| Stanje grane | `arena/290a6f13-fkgracanica` @ `1b4e722` (E-02 ZATVOREN 44543732097 6/6, E-03 44514760649 6/6, check:all 10/10, dead-guards 15/15) |

---

## 1) Šta radi danas (činjenično, bez ocjene)

**`UsersPage.tsx:30-194`:** `useUsers({page,search})` bez `staleTime/retry/refetchOnWindowFocus/overload`, `isLoading ? <Skeleton 5×h-12>` bez `aria-busy`, `AdminPageShell isError/isLoading` delegiran (shell ima `role=alert`/`aria-busy` ali `UsersPage` nema svoj `lastUpdated/Osvježi` + `isFetching/dataUpdatedAt`), `Novi` hardcode, `Nema korisnika.` hardcode, `Obrisati korisnika?` hardcode, `Aktivan/Neaktivan` hardcode, `Button` create/edit/delete bez `disabled isPending` global (osim `runAction`).

**`RolesPage.tsx:30-187`:** `useRoles()`/`usePermissions()` bez `staleTime`, `isLoading Skeleton` bez `aria-busy`, `isError` via `AdminPageShell` (isti gap), `Nova uloga`, `Nema uloga.`, `Obrisati ulogu?`, `Obriši`, `Sačuvaj dozvole` hardcode, `Switch` per permission bez `disabled isPending` detalja, `save()` bez `isPending` global lock osim `Sačuvaj dozvole`.

**`UsersRolesPage.tsx:1-85`:** `resolveTab(param,canUsers,canRoles)` + `useSearchParams ?tab=` + `tabs [{key,label: t('admin.users')}]` — `Button variant default/outline` bez `aria-pressed`/`role=tablist`, bez `defaultValue` fallback, bez `lastUpdated` na dispatcheru (delegira na embedded stranice).

**Stanja danas:**
- `loading` → `Skeleton` ali bez `aria-busy="true"` wrappera na tabu (shell ima ali ne per-tab `isFetching`)
- `error` → `AdminPageShell isError` → `role=alert` u shellu, ali `retry` nije `disabled isFetching` (nema `isFetching`)
- `success` → tabela bez `lastUpdated/Osvježi` per stranica
- `tabs` → `t('admin.users')` bez `defaultValue` fallback, bez `aria-pressed`

---

## 2) Šta bi trebala da radi (očekivano)

* **Korisnik:** admin sa `users.read`/`rbac.read` koji otvori `/admin/users?tab=users` za <1s mora vidjeti tabove + Skeleton `aria-busy` dok se učitava, `role=alert` + `retry disabled isFetching`, `lastUpdated/Osvježi` po tabu, `Novi/Nova uloga` i prazna stanja preko `t()` sa `defaultValue`, bez hardcode BS
* **Ugovor:** `staleTime 30_000` + `retry 1` + `refetchOnWindowFocus false` + `UseQueryOptions overload` kao `useFinanceSummary`/`useTicketingAdmin` (E-02/E-03), svaki tab sa `isFetching/dataUpdatedAt` + `Osvježi` `disabled`, tab tipke `t()` sa `defaultValue` + `role=tablist` `aria-pressed`

---

## 3) Propusti — klasifikacija

### P1 — blokator
**Nema P1.** Ruta štiti `users.read`/`rbac.read`, nema curenja, nema mutacije bez `hasPermission`.

### P2 — nekonzistentnost / loša praksa
**P2-1 — hookovi bez `staleTime/retry/refetchOnWindowFocus/overload`** — odstupa od E-02/E-03/B-02
**P2-2 — tabovi loading Skeleton bez `aria-busy="true"` wrappera** — nekonzistentno sa Finance/Ticketing homes
**P2-3 — error nema `role=alert` per-tab + retry `disabled isFetching`** — `AdminPageShell` ima ali bez `isFetching`
**P2-4 — nema `isFetching/dataUpdatedAt/lastUpdated/Osvježi` per stranica** — odstupa od svih homes/SeasonHub/E-02/E-03
**P2-5 — hardcode BS (`Novi`, `Nova uloga`, `Nema korisnika/u loga`, `Obrisati…`, `Aktivan`)** — FE-04c i18n ispod standarda
**P2-6 — tab buttons bez `aria-pressed`/`role=tablist`** — a11y ispod standarda

### P3 — UX/polish
- `search` debounce nema — svaka tipka radi fetch; može `useDebouncedValue`
- `RolesPage` `Switch` nema `aria-label` po permisiji

---

## 4) Dokazi (file:line)

* `hooks/index.ts:250-270` — `useUsers`/`useRoles`/`usePermissions` bez `staleTime` — P2-1
* `UsersPage.tsx:78-82` — `isLoading ? <Skeleton>` bez `aria-busy` — P2-2
* `UsersPage.tsx:170-180` — `AdminPageShell isError/isLoading` bez `isFetching`/`lastUpdated` — P2-3/P2-4
* `UsersPage.tsx:47-55` — `Novi` hardcode — P2-5
* `RolesPage.tsx:170-180` — `Nova uloga` hardcode — P2-5
* `UsersRolesPage.tsx:62-73` — `Button onClick setTab` bez `aria-pressed` — P2-6

---

## 5) Predloženi plan — bez koda

| Korak | Fajl | Promjena | Rizik | Test |
|-------|------|----------|-------|------|
| 1 | `hooks/index.ts` | `useUsers(params, options?)` + `useRoles(options?)` + `usePermissions(options?)` `staleTime 30k retry1 refetchOnWindowFocus false` + `UseQueryOptions` overload | nizak | postojeći |
| 2 | `UsersRolesPage.tsx` | `TABS` i18n `t('admin.usersTab.users', defaultValue:'Korisnici')` + `role=tablist` + `aria-pressed/aria-selected` | nizak | — |
| 3 | `UsersPage.tsx` + `RolesPage.tsx` | `isFetching/dataUpdatedAt` + `lastUpdated/Osvježi` + `role=alert` + `aria-busy Skeleton` + `retry disabled isFetching` + `global disabled isPending` — sačuvan `Seo/h1` + `embedded` | srednji | novi 8t |
| 4 | `locales/bs+en/common.json` | `usersTab.*`, `usersEmpty`, `rolesEmpty`, `userCreate`, `roleCreate`, `active/inactive` BS/EN + defaultValue | nizak | — |
| 5 | `fe06-f01-users-roles.test.tsx` (novi, 8t) | loading skeleton aria-busy, error role=alert + retry disabled, lastUpdated/Osvježi, tabovi aria-pressed, i18n defaultValue | — | — |
| 6 | `AUDIT/COVERAGE_MATRIX.csv` | inventory | — | — |

**Šta se NE dira:** `UserAdminFormSheet`/`RolesAdminFormSheet` (poseban sheet, već `canCreate/canUpdate`), `router` (već `users.read`/`rbac.read`), `backend`.

---

## 6) Alternativa

* **Ne dirati embedded vs shell odvojeno:** odbačeno — `UsersPage` embedded i shell dijele isti `isFetching`/`lastUpdated`
* **Ne dodavati lastUpdated per-tab:** odbačeno — `dataUpdatedAt` je per-query, ne globalno za shell

---

## 7) Kriterijumi gotovosti (DoD)

- [ ] P2-1..P2-6 zatvoreni + testovi koji padaju bez fixa
- [ ] 4 stanja pokrivena + tabovi `aria-pressed` + `role=alert`/`aria-busy` + `lastUpdated` + `global disabled`
- [ ] `check:all 10/10`, `tsc -b` čist, `axe` bez kršenja
- [ ] `COVERAGE_MATRIX` + `STATE.md` + `CI 6/6`

---

## 8) Otvorena pitanja za tebe (ask_user prije koda)

**Q1 — `useUsers/useRoles staleTime 30k + retry1 + overload`:** Da li hookovi dobijaju `staleTime 30_000 retry1 refetchOnWindowFocus false + UseQueryOptions overload` kao E-02/E-03, ili da ostanu bez cache prozora? Predlažem **da — 30k+retry1+overload**.

**Q2 — tabovi `role=alert` + `aria-busy` + `lastUpdated/Osvježi` + `retry disabled isFetching` + `global disabled isPending`:** Da li svaka stranica treba `isError→role=alert + retry disabled isFetching` i `isLoading→aria-busy Skeleton` + `lastUpdated/Osvježi` kao Ticketing/Finance, ili da ostane plain shell? Predlažem **da — alert+disabled+skeleton+lastUpdated+global disabled**.

**Q3 — i18n tab labele + hardcode BS + `aria-pressed`:** Da li hardcode `Novi`/`Nova uloga`/`Nema…`/`Aktivan` prelaze na `t('admin.usersTab.*', defaultValue)` sa BS/EN + `role=tablist` + `aria-pressed`, ili da ostanu hardcode bez a11y? Predlažem **da — i18n+aria-pressed**.

> Ako odobriš ovaj plan (ili `approve_with_comments`), sljedeći korak je implementacija F-01 po tabeli — jedan commit, `gh run watch` do `6/6`.
