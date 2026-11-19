# F-02 — AuditPage — PLAN (2026-11-19, grana `arena/290a6f13-fkgracanica` @ `37632a3`)

> Planski dokument — bez koda. Slijedi template iz `ADMIN_PLAN_2026-11-17.md` §2. Implementacija tek nakon `ask_user approve`.

---

## Meta

| Polje | Vrijednost |
|-------|------------|
| Ruta | `/admin/audit` — `app-routes.tsx` `<PermissionRoute>` `audit.read` |
| Fajl(ovi) | `AuditPage.tsx` (98L) · `hooks/index.ts` `useAuditLog` · `lib/audit-action-labels.ts` · `lib/utils.ts` `formatDateTime` |
| Rola/permisije | `audit.read` — nema mutacija |
| API | `GET /audit?page&action&entity&from&to` (hook: `useAuditLog`) |
| Stanje grane | `arena/290a6f13-fkgracanica` @ `37632a3` (F-01 ZATVOREN 44593228339 6/6, E-02 44543732097 6/6, check:all 10/10, dead-guards 20/20) |

---

## 1) Šta radi danas (činjenično, bez ocjene)

**`AuditPage.tsx:1-98`:** `useState` za `action/entity/from/to/page` + `useAuditLog({page,action||undefined,...})` bez `staleTime/retry/refetchOnWindowFocus/overload`, `AdminPageShell isError/onRetry/isLoading` delegiran (shell ima `role=alert`/`aria-busy` ali `AuditPage` nema sopstveni `isFetching/dataUpdatedAt/lastUpdated/Osvježi`), filteri `Input` sa `t('admin.auditPage.action')` placeholder, tabela `AdminDataTable` sa `entries = data?.data ?? []` bez `empty` poruke, paginacija `Prethodna`/`Sljedeća` hardcode BS bez `t()` + `defaultValue`, `disabled={page<=1}`/`>=totalPages` ali bez `isFetching` lock, bez `aria-busy` skeleton za loading osim shell-a.

**Stanja danas:**
- `loading` → `AdminPageShell isLoading` → shell skeleton, ali nema `aria-busy="true"` wrapper na filterima/paginaciji
- `error` → shell `role=alert` ali bez `isFetching` disabled na retry
- `success` → tabela bez `lastUpdated/Osvježi`, bez `empty` CTA
- `empty` → prazna tabela bez poruke
- `pagination` → hardcode BS, bez i18n fallback

---

## 2) Šta bi trebala da radi (očekivano)

* **Korisnik:** admin sa `audit.read` koji otvori `/admin/audit` za <1s mora vidjeti filtere + tabelu sa `Skeleton aria-busy` dok se učitava, `role=alert` + `retry disabled isFetching`, `lastUpdated/Osvježi` iznad filtera, paginaciju preko `t()` sa `defaultValue`, bez hardcode BS, bez curenja `AdminPageShell` bez `dataUpdatedAt`.
* **Ugovor:** `staleTime 30_000` + `retry 1` + `refetchOnWindowFocus false` + `UseQueryOptions overload` kao `useFinanceSummary`/`useTicketingAdmin`/`useUsers`, svaka stranica sa `isFetching/dataUpdatedAt` + `Osvježi` `disabled`, `t()` sa `defaultValue` fallback + `empty` label.

---

## 3) Propusti — klasifikacija

### P1 — blokator
**Nema P1.** Ruta štiti `audit.read`, nema mutacija, nema curenja.

### P2 — nekonzistentnost / loša praksa
**P2-1 — `useAuditLog` bez `staleTime/retry/refetchOnWindowFocus/overload`** — odstupa od E-02/E-03/B-02/F-01 (svi imaju 30k+retry1+overload)
**P2-2 — nema `isFetching/dataUpdatedAt/lastUpdated/Osvježi` na stranici** — shell delegira ali nema per-page `dataUpdatedAt`/`isFetching` kao F-01/E-02
**P2-3 — paginacija `Prethodna`/`Sljedeća` hardcode BS** — FE-04c i18n ispod standarda, treba `t('admin.auditPage.previous', defaultValue:'Prethodna')`
**P2-4 — nema `empty` handling** — prazan `entries` prikazuje praznu tabelu bez poruke `Nema zapisa.`

### P3 — UX/polish
- Filteri `Input` nemaju `aria-label`, paginacija `span {page}/{total}` nema `aria-live`
- Nema debounce na `action/entity` filterima — svaka tipka radi fetch (kao UsersPage search)

---

## 4) Dokazi (file:line)

* `hooks/index.ts:312-324` — `useAuditLog` bez `staleTime` — P2-1
* `AuditPage.tsx:16-27` — `useAuditLog` bez `isFetching/dataUpdatedAt` — P2-2
* `AuditPage.tsx:51-58` — `Prethodna`/`Sljedeća` hardcode — P2-3
* `AuditPage.tsx:35-44` — `AdminDataTable rows={entries}` bez `empty` — P2-4
* `AuditPage.tsx:18-24` — filter `t('admin.auditPage.action')` placeholder ok, ali paginacija bez t()

---

## 5) Predloženi plan — bez koda

| Korak | Fajl | Promjena | Rizik | Test |
|-------|------|----------|-------|------|
| 1 | `hooks/index.ts` | `useAuditLog(params, options?)` `staleTime 30k retry1 refetchOnWindowFocus false` + `UseQueryOptions` overload | nizak | postojeći |
| 2 | `AuditPage.tsx` | `isFetching/dataUpdatedAt` + `lastUpdated/Osvježi` bar iznad filtera + `role=alert` error per-shell + `aria-busy Skeleton` per page + `empty` label `t('admin.auditPage.empty', defaultValue:'Nema zapisa.')` | srednji | novi 6t |
| 3 | `AuditPage.tsx` | paginacija `t('admin.auditPage.previous', defaultValue:'Prethodna')` + `next` + `disabled` `isFetching` + `aria-live` | nizak | — |
| 4 | `locales/bs+en/common.json` | `auditPage.previous/next/empty` BS/EN | nizak | — |
| 5 | `fe06-f02-audit.test.tsx` (novi, 6t) | loading skeleton aria-busy, error role=alert + retry disabled, empty, lastUpdated/Osvježi, pagination i18n | — | — |
| 6 | `AUDIT/COVERAGE_MATRIX.csv` | inventory | — | — |

**Šta se NE dira:** `audit-action-labels.ts`, `AdminPageShell`, `router` (već `audit.read`), `backend`.

---

## 6) Alternativa

* **Ne dodavati lastUpdated per-page:** odbačeno — `dataUpdatedAt` je per-query, ne globalno za shell (kao F-01)
* **Ne dirati paginaciju i18n:** odbačeno — hardcode BS ispod FE-04c standarda

---

## 7) Kriterijumi gotovosti (DoD)

- [ ] P2-1..P2-4 zatvoreni + testovi koji padaju bez fixa
- [ ] 4 stanja pokrivena + `lastUpdated/Osvježi` + `role=alert`/`aria-busy` + `empty` + paginacija i18n
- [ ] `check:all 10/10`, `tsc -b` čist, `axe` bez kršenja
- [ ] `COVERAGE_MATRIX` + `STATE.md` + `CI 6/6`

---

## 8) Otvorena pitanja za tebe (ask_user prije koda)

**Q1 — `useAuditLog staleTime 30k + retry1 + overload`:** Da li hook dobija `staleTime 30_000 retry1 refetchOnWindowFocus false + UseQueryOptions overload` kao E-02/E-03/F-01, ili da ostane bez cache prozora? Predlažem **da — 30k+retry1+overload**.

**Q2 — `lastUpdated/Osvježi` + `role=alert` + `aria-busy` + `empty`:** Da li stranica treba `isError→role=alert + retry disabled isFetching` i `isLoading→aria-busy Skeleton` + `lastUpdated/Osvježi` + `empty` poruku kao F-01/E-02, ili da ostane plain shell? Predlažem **da — alert+disabled+skeleton+lastUpdated+empty**.

**Q3 — paginacija i18n `previous/next` + `empty`:** Da li hardcode `Prethodna`/`Sljedeća` prelaze na `t('admin.auditPage.previous/next', defaultValue)` sa BS/EN + `empty` label, ili da ostanu hardcode? Predlažem **da — i18n+empty**.

> Ako odobriš ovaj plan (ili `approve_with_comments`), sljedeći korak je implementacija F-02 po tabeli — jedan commit, `gh run watch` do `6/6`.
