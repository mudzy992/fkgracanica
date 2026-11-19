# F-03 — AnalyticsPage — PLAN (2026-11-19, grana `arena/290a6f13-fkgracanica` @ `37632a3`)

> Planski dokument — bez koda. Slijedi template iz `ADMIN_PLAN_2026-11-17.md` §2. Implementacija tek nakon `ask_user approve`.

---

## Meta

| Polje | Vrijednost |
|-------|------------|
| Ruta | `/admin/analytics` — `app-routes.tsx` `<PermissionRoute>` `analytics.read` (?) + `AnalyticsPage` |
| Fajl(ovi) | `AnalyticsPage.tsx` (88L) · `analytics/*` (6 panela: `AnalyticsTeamPanel`, `AnalyticsH2hPanel`, `AnalyticsPlayerPanel`, `AnalyticsVisitorsPanel`, `AnalyticsVisitorsTrendChart`, `AnalyticsGeoPanel`) · `hooks/use-analytics.ts` `useTeamAnalytics`/`useH2H`/`usePlayerAnalytics`/`useVisitorTrend`/`useVisitorTotals`/`useVisitorGeo` |
| Rola/permisije | `analytics.read` / `dashboard.read` — tabovi bez dodatnog guard-a |
| API | `GET /analytics/team?seasonId`, `GET /analytics/h2h?clubAId&clubBId`, `GET /analytics/players/:id`, `GET /public-analytics/trend?days`, `GET /public-analytics/totals?days`, `GET /public-analytics/geo?days` |
| Stanje grane | `arena/290a6f13-fkgracanica` @ `37632a3` (F-01 ZATVOREN 44593228339 6/6, F-02 PLAN spreman) |

---

## 1) Šta radi danas (činjenično, bez ocjene)

**`AnalyticsPage.tsx:1-88`:** `useState tab/seasonId` + `useSeasons()` (sa `staleTime 30k` — jedini koji ima) + `useTeamAnalytics(seasonId||undefined)` bez `staleTime/retry/overload`, tabovi `TABS [{id,labelKey}]` renderovani kao `Button variant ghost` bez `role=tablist`/`aria-pressed`/`aria-selected`, season `Select` samo za `team` tab, content switch: `h2h→AnalyticsH2hPanel`, `player→AnalyticsPlayerPanel`, `visitors→AnalyticsVisitorsPanel`, `team→ isError?Button retry : isLoading||!data ? <p>loading</p> : <AnalyticsTeamPanel data={data}>` — error/loading plain `<p>` bez `role=alert`/`aria-busy`, bez `lastUpdated/Osvježi`, bez `isFetching`.

**`AnalyticsTeamPanel.tsx:1-76`:** pure presentational, `data.played/wins/draws` + `form` + `recent` lista, koristi `t()` ali nema `empty` za `recent`.

**`AnalyticsVisitorsPanel.tsx:1-92`:** `useVisitorTotals(30)/useVisitorTrend(30)/useVisitorGeo(30)` — `isLoading ? <p>loading</p>` bez `aria-busy`/`role=alert`, `totals/geo/trend` bez `isFetching/lastUpdated`, bez error retry.

**`hooks/use-analytics.ts:33-123`:** `useTeamAnalytics`/`useH2H`/`usePlayerAnalytics`/`useVisitorTrend`/`useVisitorGeo` bez `staleTime/retry/overload` (osim `useVisitorTotals` koji ima 30k), `enabled` samo za `usePlayerAnalytics`/`useH2H`.

**Stanja danas:**
- `team` tab: `loading` → plain `<p>loading</p>` bez `aria-busy`, `error` → plain `Button` bez `role=alert`/`disabled isFetching`
- `visitors` tab: `loading` → plain `<p>` bez `aria-busy`, nema error handling
- tabovi: `Button` bez `aria-pressed`/`role=tablist` (kao F-01 prije fixa)
- nema `lastUpdated/Osvježi` per panel

---

## 2) Šta bi trebala da radi (očekivano)

* **Korisnik:** admin koji otvori `/admin/analytics` mora vidjeti tabove `role=tablist` sa `aria-pressed`, Skeleton `aria-busy` dok se `team` učitava, `role=alert` + `retry disabled isFetching` na grešku, `lastUpdated/Osvježi` iznad contenta, sezonski filter perzistentan, visitors/h2h/player paneli sa `aria-busy`/`role=alert` + `lastUpdated`, bez hardcode BS.
* **Ugovor:** `staleTime 30_000` + `retry 1` + `refetchOnWindowFocus false` + `UseQueryOptions overload` za sve `use*Analytics` hookove kao `useFinanceSummary`, tabovi `t()` sa `defaultValue` + `role=tablist` `aria-pressed` (kao F-01), svaki panel sa `isFetching/dataUpdatedAt` + `Osvježi` `disabled`.

---

## 3) Propusti — klasifikacija

### P1 — blokator
**Nema P1.** Ruta štiti `analytics.read`, nema mutacija, nema curenja.

### P2 — nekonzistentnost / loša praksa
**P2-1 — hookovi bez `staleTime/retry/overload`** — `useTeamAnalytics`, `useH2H`, `usePlayerAnalytics`, `useVisitorTrend`, `useVisitorGeo` odstupaju od `useVisitorTotals`/`useSeasons` koji imaju 30k
**P2-2 — `team` tab loading/error plain `<p>`/`Button` bez `aria-busy`/`role=alert`** — nekonzistentno sa F-01/E-02/E-03 (skeleton+alert)
**P2-3 — nema `isFetching/dataUpdatedAt/lastUpdated/Osvježi` ni na jednom tabu** — odstupa od svih homes/SeasonHub/F-01
**P2-4 — tabovi `Button` bez `role=tablist`/`aria-pressed`/`aria-selected`** — a11y ispod standarda (isto kao F-01 P2-6, fiksano u F-01)
**P2-5 — `AnalyticsVisitorsPanel` loading plain `<p>` bez `aria-busy`/`role=alert`, nema retry** — Visitors tab nema error handling
**P2-6 — `Select seasonId` bez `disabled isFetching`**

### P3 — UX/polish
- `AnalyticsTeamPanel` recent lista nema `empty` poruku kad nema utakmica
- `AnalyticsVisitorsTrendChart` nema `empty` za prazan trend

---

## 4) Dokazi (file:line)

* `hooks/use-analytics.ts:33-42` — `useTeamAnalytics` bez `staleTime` — P2-1
* `AnalyticsPage.tsx:55-64` — tab `Button` bez `role=tablist` — P2-4
* `AnalyticsPage.tsx:70-78` — `isError ? Button : isLoading ? <p>` bez `aria-busy`/`role=alert` — P2-2
* `AnalyticsPage.tsx:24-30` — nema `dataUpdatedAt/lastUpdated` — P2-3
* `AnalyticsVisitorsPanel.tsx:8-12` — `isLoading ? <p>loading</p>` bez `aria-busy` — P2-5
* `AnalyticsPage.tsx:35-42` — `Select value={seasonId}` bez `disabled isFetching` — P2-6

---

## 5) Predloženi plan — bez koda

| Korak | Fajl | Promjena | Rizik | Test |
|-------|------|----------|-------|------|
| 1 | `hooks/use-analytics.ts` | `useTeamAnalytics(seasonId, options?)` + `useH2H(..., options?)` + `usePlayerAnalytics(..., options?)` + `useVisitorTrend(days, options?)` + `useVisitorGeo(days, options?)` `staleTime 30k retry1 refetchOnWindowFocus false` + `UseQueryOptions` overload | nizak | postojeći |
| 2 | `AnalyticsPage.tsx` | `TABS` i18n ok + `role=tablist` + `aria-pressed/aria-selected` (kao F-01 UsersRolesPage) + `isFetching/dataUpdatedAt` + `lastUpdated/Osvježi` bar + `isLoading→aria-busy Skeleton` + `isError→role=alert Button retry disabled isFetching` za `team` tab | srednji | novi 8t |
| 3 | `AnalyticsVisitorsPanel.tsx` | `isFetching/dataUpdatedAt` + `lastUpdated/Osvježi` + `isLoading→aria-busy Skeleton` + `isError→role=alert retry disabled` za totals/trend/geo (ili delegir → parent) | srednji | — |
| 4 | `AnalyticsPage.tsx` | `Select disabled={isFetching}` | nizak | — |
| 5 | `locales/bs+en/common.json` | dopuni ako treba (već `analyticsPage.allSeasons`, `analyticsTabs.*`, `analyticsPanel.*`) | nizak | — |
| 6 | `fe06-f03-analytics.test.tsx` (novi, 8t) | loading skeleton aria-busy, error role=alert + retry disabled, lastUpdated/Osvježi, tabovi aria-pressed, visitors panel loading | — | — |
| 7 | `AUDIT/COVERAGE_MATRIX.csv` | inventory | — | — |

**Šta se NE dira:** `AnalyticsTeamPanel`/`H2h`/`Player` pure render, `router`, `backend`.

---

## 6) Alternativa

* **Ne dirati Visitors panel error:** odbačeno — `useVisitorTotals`/`Trend`/`Geo` nemaju error UI, Visitors tab bi ostao bez `role=alert`
* **Ne dodavati tablist:** odbačeno — F-01 je pokazao da `role=tablist` + `aria-pressed` je minimum a11y za tabove

---

## 7) Kriterijumi gotovosti (DoD)

- [ ] P2-1..P2-6 zatvoreni + testovi koji padaju bez fixa
- [ ] 4 stanja pokrivena + tabovi `aria-pressed` + `role=alert`/`aria-busy` + `lastUpdated` + `Select disabled`
- [ ] `check:all 10/10`, `tsc -b` čist, `axe` bez kršenja
- [ ] `COVERAGE_MATRIX` + `STATE.md` + `CI 6/6`

---

## 8) Otvorena pitanja za tebe (ask_user prije koda)

**Q1 — `useTeamAnalytics/useH2H/usePlayerAnalytics/useVisitorTrend/useVisitorGeo staleTime 30k + retry1 + overload`:** Da li hookovi dobijaju `staleTime 30_000 retry1 refetchOnWindowFocus false + UseQueryOptions overload` kao `useVisitorTotals`/`useSeasons`, ili da ostanu bez cache prozora? Predlažem **da — 30k+retry1+overload**.

**Q2 — tabovi `role=tablist` + `aria-busy` + `role=alert` + `lastUpdated/Osvježi` + `Select disabled`:** Da li stranica treba `role=tablist` `aria-pressed` + `isLoading→aria-busy Skeleton` + `isError→role=alert retry disabled isFetching` + `lastUpdated/Osvježi` + `Select disabled isFetching` kao F-01/E-02, ili da ostane plain? Predlažem **da — tablist+skeleton+alert+lastUpdated+disabled**.

**Q3 — `AnalyticsVisitorsPanel` loading/error `aria-busy`/`role=alert` + `lastUpdated`:** Da li Visitors panel dobija `aria-busy` `Skeleton` + `role=alert` + `lastUpdated/Osvježi` kao `team` tab, ili da ostane plain `<p>` bez retry? Predlažem **da — aria-busy+alert+lastUpdated**.

> Ako odobriš ovaj plan (ili `approve_with_comments`), sljedeći korak je implementacija F-03 po tabeli — jedan commit, `gh run watch` do `6/6`.
