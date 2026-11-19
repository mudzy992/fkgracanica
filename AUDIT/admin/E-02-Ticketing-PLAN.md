# E-02 — TicketingAdminPage — PLAN (2026-11-19, grana `arena/290a6f13-fkgracanica` @ `09e8c3e`)

> Planski dokument — bez koda. Slijedi template iz `ADMIN_PLAN_2026-11-17.md` §2. Implementacija tek nakon `ask_user approve`.

---

## Meta

| Polje | Vrijednost |
|-------|------------|
| Ruta | `/admin/ticketing` — `app-routes.tsx` `<PermissionRoute permission="ticketing.manage">` unutar `AdminLayout` |
| Fajl(ovi) | `TicketingAdminPage.tsx` (55L) · `ticketing/TicketingOrdersTab.tsx` · `TicketingSeasonTab.tsx` · `TicketingSettingsTab.tsx` · `TicketingPaymentsTab.tsx` · `TicketingCategoriesEditor.tsx` · `PaymentProviderCard/Hints` · `hooks/use-ticketing-admin.ts` |
| Rola/permisije | `ticketing.manage` (ruta) — tabovi nemaju granularnije permisije, svi sa `ticketing.manage` vide sve (orders/season/settings/payments) |
| API | `GET /ticketing/orders`, `GET /ticketing/categories`, `PUT /ticketing/settings`, `GET /ticketing/payments` preko `useTicketingAdmin` hookova |
| Stanje grane | `arena/290a6f13-fkgracanica` @ `09e8c3e` (E-03 ZATVOREN 44516589894 6/6, A-01 44507145383 6/6, check:all 10/10, dead-guards 6/6) |

---

## 1) Šta radi danas (činjenično, bez ocjene)

**`TicketingAdminPage.tsx:1-55`:**
```
const [tab, setTab] = useState<Tab>(location.state?.tab ?? 'orders');
return <>
  <Seo title={t('admin.ticketing')} />
  <AdminPageShell title={t('admin.ticketing')} actions={TABS.map(Button)}>
    {tab==='orders' && <TicketingOrdersTab />}
    {tab==='season' && <TicketingSeasonTab />}
    ...
  </>
```
- 4 taba hardcoded `TABS` (`Narudžbe/Sezona/Postavke/Online plaćanje`) — `Button variant default/outline` bez `aria-pressed`, bez `role=tablist`
- `Seo/h1` sačuvani kroz sve tabove (u `AdminPageShell`), ali tab sadržaj nema `lastUpdated/Osvježi`, nema `role=alert`/`aria-busy` per-tab
- `TicketingOrdersTab` — `useTicketOrders` bez `staleTime/retry/refetchOnWindowFocus/enabled`, `isLoading → <p>loading</p>`, `isError → Button retry` bez `role=alert`, nema `isFetching/dataUpdatedAt`
- Ostali tabovi slično: `TicketingSettingsTab`/`PaymentsTab`/`SeasonTab` — plain `<p>Učitavanje…</p>` ili `t('admin.common.loading')` bez skeleta

**Stanja danas:**
- `loading` → `<p>loading</p>` bez `aria-busy`/`Skeleton`
- `error` → `Button retry` bez `role=alert` wrappera, bez `disabled isFetching`
- `success` → tabela/forme bez `lastUpdated/Osvježi`
- `Tabs` → hardcode BS (`Narudžbe`) — FE-04c ratchet bi pao, nema `t()` + `defaultValue`

---

## 2) Šta bi trebala da radi (očekivano)

* **Korisnik:** admin sa `ticketing.manage` koji otvori `/admin/ticketing` za <1s mora vidjeti tabove + sadržaj sa `Seo`, `aria-busy` skeletonom dok se učitava, `role=alert` + `retry disabled isFetching`, `lastUpdated/Osvježi` po tabu, bez hardcode BS
* **Ugovor:** `staleTime 30_000` + `retry 1` + `refetchOnWindowFocus false` + `UseQueryOptions overload` kao `useFinanceSummary`/`useSeasons` (E-03/A-07/B-02), svaki tab sa `isFetching/dataUpdatedAt` + `Osvježi` `disabled`, tab tipke `t()` sa `defaultValue`

---

## 3) Propusti — klasifikacija

### P1 — blokator
**Nema P1.** Ruta štiti `ticketing.manage`, nema curenja, nema mutacije bez dozvole.

### P2 — nekonzistentnost / loša praksa

**P2-1 — hookovi bez `staleTime/retry/refetchOnWindowFocus/overload`** — odstupa od E-03/A-07/B-02 standarda
**P2-2 — tabovi loading je `<p>loading</p>` bez `aria-busy` Skeleton** — nekonzistentno sa homes/Finance
**P2-3 — error nema `role=alert` + retry `disabled isFetching`** — odstupa od A-06/A-07/B-02
**P2-4 — nema `isFetching/dataUpdatedAt/lastUpdated/Osvježi`** — odstupa od svih homes/SeasonHub/Finance
**P2-5 — tab labele hardcode BS (`Narudžbe`)** — FE-04c `admin-no-hardcoded-text` 0 ratchet
**P2-6 — tab buttons bez `aria-pressed`/`role=tablist`** — a11y ispod standarda (nije P1 ali P2)

### P3 — UX/polish
- `location.state.tab` inicijalizacija bez `useEffect` sync na `location` promjenu — tab ne reaguje na back/forward

---

## 4) Dokazi (file:line)

* `TicketingAdminPage.tsx:11-14` — hardcode `Narudžbe` — P2-5
* `TicketingAdminPage.tsx:28-35` — `Button onClick setTab` bez `aria-pressed` — P2-6
* `ticketing/TicketingOrdersTab.tsx:20` — `useTicketOrders` bez `staleTime` — P2-1
* `ticketing/TicketingOrdersTab.tsx:35` — `isLoading || !data ? <p>loading</p>` — P2-2
* `ticketing/TicketingOrdersTab.tsx:33` — `isError ? <Button retry>` bez `role=alert` — P2-3
* `ticketing/*` — nema `isFetching/dataUpdatedAt` — P2-4

---

## 5) Predloženi plan — bez koda

| Korak | Fajl | Promjena | Rizik | Test |
|-------|------|----------|-------|------|
| 1 | `hooks/use-ticketing-admin.ts` | `staleTime 30k retry1 refetchOnWindowFocus false + UseQueryOptions overload` kao E-03 | nizak | postojeći |
| 2 | `TicketingAdminPage.tsx` | `TABS` i18n `t('admin.ticketingTab.orders', defaultValue:'Narudžbe')` + `role=tablist` + `aria-pressed` | nizak | — |
| 3 | `ticketing/TicketingOrdersTab.tsx` (+ ostali tabovi) | `isFetching/dataUpdatedAt` + `lastUpdated/Osvježi` + `role=alert` + `aria-busy Skeleton` + `retry disabled isFetching` — sačuvan `Seo/h1` | srednji | novi 8t |
| 4 | `locales/bs+en/common.json` | `ticketingTab.*` BS/EN ključevi + defaultValue | nizak | — |
| 5 | `fe06-e02-ticketing.test.tsx` (novi, 8t) | loading skeleton aria-busy, error role=alert + retry disabled, lastUpdated/Osvježi, tabovi aria-pressed | — | — |
| 6 | `AUDIT/COVERAGE_MATRIX.csv` | inventory | — | — |

**Šta se NE dira:** `TicketingOrderSheet` (poseban sheet), `PaymentProviderCard` (čisti render), `router` (već `ticketing.manage`), `backend`.

---

## 6) Alternativa

* **Ne dirati tabove jedan po jedan:** odbačeno — svaki tab ima isti P2, bolje odjednom kao celina
* **Ne dodavati AdminPageShell per-tab lastUpdated:** odbačeno — lastUpdated je per-query, ne globalno za shell

---

## 7) Kriterijumi gotovosti (DoD)

- [ ] P2-1..P2-6 zatvoreni + testovi koji padaju bez fixa
- [ ] 4 stanja pokrivena + tabovi `aria-pressed` + `role=alert`/`aria-busy` + `lastUpdated`
- [ ] `check:all 10/10`, `tsc -b` čist, `axe` bez kršenja
- [ ] `COVERAGE_MATRIX` + `STATE.md` + `CI 6/6`

---

## 8) Otvorena pitanja za tebe (ask_user prije koda)

**Q1 — `useTicketingAdmin` staleTime 30k + retry1 + overload:** Da li hookovi dobijaju `staleTime 30_000 retry1 refetchOnWindowFocus false + UseQueryOptions overload` kao E-03/A-07/B-02, ili da ostanu bez cache prozora? Predlažem **da — 30k+retry1+overload**.

**Q2 — tabovi `role=alert` + `aria-busy` + `lastUpdated/Osvježi` + `retry disabled isFetching`:** Da li svaki tab treba `isError → role=alert + retry disabled isFetching` i `isLoading → aria-busy Skeleton` + `lastUpdated/Osvježi` kao Finance/SeasonHub, ili da ostane plain `<p>loading</p>` + plain retry? Predlažem **da — alert+disabled+skeleton+lastUpdated**.

**Q3 — i18n tab labele + `aria-pressed`:** Da li hardcode `Narudžbe/Sezona/Postavke/Online plaćanje` prelaze na `t('admin.ticketingTab.*', defaultValue)` sa BS/EN + `role=tablist` + `aria-pressed`, ili da ostanu hardcode bez a11y? Predlažem **da — i18n+aria-pressed**.

> Ako odobriš ovaj plan (ili `approve_with_comments`), sljedeći korak je implementacija E-02 po tabeli — jedan commit, `gh run watch` do `6/6`.
