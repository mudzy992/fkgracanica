# Dashboard — planski pregled dio po dio (2026-11-17)

> Status: **PLANSKI RUN — bez implementacije**. Ovaj dokument je ugovor o radu: lista svih dashboard stranica, template analize, template implementacije i template odgovora. Svaka naredna stranica se radi **zasebno, sekvencijalno, uz ask_user**.

---

## 1) Lista svih dashboard stranica — bukvalno svih (izvor: `frontend/src/pages/admin`)

> Kriterij: stranica koja je **ulazna tačka role** ili **agregira KPI/health/queue/status** i služi za orijentaciju, ne za CRUD jednog entiteta. CRUD liste (npr. `UsersPage`, `NewsAdminPage`) nisu ovdje — one su `admin module` i idu u zaseban audit ako bude potreban.

### Grupa D-0 — Dispatcher
| # | Stranica | Putanja | Fajl | Rola | Svrha danas |
|---|----------|---------|------|------|-------------|
| D-00 | `DashboardPage` | `/admin` (index) | `pages/admin/DashboardPage.tsx` (8 lin) | sve | `resolveStaffHome(permissions) -> Moderator/Commentator/Writer/AdminHome` |

### Grupa D-1 — Role Home dashboardi (ulazne stranice po roli)
| # | Stranica | Putanja | Fajl | Rola | Svrha danas |
|---|----------|---------|------|------|-------------|
| D-01 | `AdminHome` | `/admin` (admin) | `pages/admin/homes/AdminHome.tsx` (109 lin) | `admin` | KPI queue (4) + health (4) + `PlatformStatusTeaser` + `HomeQuickActions` (CMS, users, settings, live pending + uslovno finance) |
| D-02 | `ModeratorHome` | `/admin` (moderator) | `pages/admin/homes/ModeratorHome.tsx` (154 lin) | `moderator` | Moderatorski queue + health varijanta, drugačiji KPI set/akcije |
| D-03 | `WriterHome` | `/admin` (writer) | `pages/admin/homes/WriterHome.tsx` (89 lin) | `writer` | Writer queue (vijesti/cms) |
| D-04 | `CommentatorHome` | `/admin` (commentator) | `pages/admin/homes/CommentatorHome.tsx` (112 lin) | `commentator` | Live/commentator status, link ka desk-u |
| D-05 | `CommentatorDeskList` | `/admin/commentator` | `pages/admin/homes/CommentatorDeskList.tsx` | `commentator` | Lista deskova/zaduženja |
| D-06 | `CommentatorLiveHero` | — (widget) | `pages/admin/homes/CommentatorLiveHero.tsx` | `commentator` | Hero za live — često korišten unutar CommentatorHome |

**Shell/pomoćni:**
| # | Komponenta | Fajl | Napomena |
|---|------------|------|----------|
| S-01 | `RoleHomeShell` | `pages/admin/homes/RoleHomeShell.tsx` | Omotač za role home |
| S-02 | `HomeKpiGrid` | `pages/admin/homes/HomeKpiGrid.tsx` | Grid za KPI kartice |
| S-03 | `HomeQuickActions` | `pages/admin/homes/HomeQuickActions.tsx` | Brze akcije |
| S-04 | `dashboard-kpi-config` | `pages/admin/dashboard-kpi-config.ts` | `KPI_LABELS / KPI_ICONS / KPI_ROUTES / QUEUE_KPI_KEYS / HEALTH_KPI_KEYS` |

### Grupa D-2 — Operativni dashboardi (KPI/analytics/status)
| # | Stranica | Putanja | Fajl | Rola | Svrha danas |
|---|----------|---------|------|------|-------------|
| D-07 | `FinanceAdminPage` | `/admin/finance` | `pages/admin/FinanceAdminPage.tsx` (66 lin) + `finance/FinanceKpiGrid.tsx`, `FinanceBuckets.tsx`, `FinanceFiltersForm.tsx`, `FinanceProviderChip.tsx` | `finance.read` | Finansijski KPI, buckmeti, filteri, provider chip |
| D-08 | `AnalyticsPage` | `/admin/analytics` | `pages/admin/AnalyticsPage.tsx` (87 lin) + `analytics/*Panel.tsx` (6 fajlova) | `admin` | Posjete, H2H, tim, igrač, geo, trend |
| D-09 | `AuditPage` | `/admin/audit` | `pages/admin/AuditPage.tsx` (97 lin) | `admin` | Audit log pregled |
| D-10 | `PlatformStatusPage` | `/admin/platform-status` | `pages/admin/platform-status/PlatformStatusPage.tsx` + `PlatformStatusTeaser.tsx`, `PlatformStatusHero.tsx`, `PercentRing.tsx`, `StatusGroupCard.tsx` | `admin` | Health platforme, queue, job status |

> **Ukupno: 11 dashboard površina (D-00..D-10) + 4 shell/config fajla.** Ako želiš proširiti na **hub dashboard-e** (`ClubHubPage`, `SeasonHubPage`, `CmsHubPage`), dodajemo ih kao D-11..D-13 u narednom koraku — ali tada to više nije "dashboard" nego "module hub".

**Redoslijed po riziku (prijedlog):**
1. **D-01 AdminHome** — najposjećenije, najviše P1/P2 rizika (dozvole, error/loading, KPI linkovi)
2. **D-07 FinanceAdminPage** — novac, permisije, filteri
3. **D-08 AnalyticsPage** — najviše panela, nekonzistentni loading/empty/error
4. **D-02..D-04 Role homes** — poređenje konzistentnosti
5. **D-09/D-10 Audit + PlatformStatus** — operativni uvid

Svaka stranica = **jedan planski dokument + jedan implementacioni PR** (nikad bulk).

---

## 2) Template analize za svaku stranicu (kako izgleda plan)

> Ovo je fiksni sadržaj koji svaki `D-XX` plan mora imati. Bez ovoga nema odobrenja za kod.

```markdown
# D-XX — <ImeStranice> — plan (datum, grana)

## Meta
| Polje | Vrijednost |
|-------|------------|
| Ruta | `/admin/...` |
| Fajl(ovi) | `pages/admin/...tsx` + pripadni hook/lib/componente |
| Rola/permisije | `hasPermission(...)` / `resolveStaffHome` |
| API | `GET /...` (hook: `useX`) |
| Stanje grane | `arena/...` @ <sha> |

## 1) Šta radi danas (činjenično, bez ocjene)
- Ulaz/izlaz, render stablo, hookovi (`useDashboardKpis`, `useFinance...`), uslovni branch-evi
- Stanja: loading / error / empty / success / forbidden — šta se stvarno rendera
- Navigacija: kuda vode KPI kartice, quick actions

## 2) Šta bi trebala da radi (očekivano ponašanje — profesionalni standard)
- Svrha: ko je korisnik, koji zadatak završava za <30s
- Ugovor: koji KPI-evi su obavezni, koji su uslovni po permisiji
- Ponašanje: loading skeleton (ne plain text), error sa retry + porukom, empty sa CTA, forbidden bez curenja podataka
- A11y/i18n/perf: `Seo` title, `aria`, `focus-visible`, `t()` ključevi, bez N+1 fetch-a

## 3) Propusti — klasifikacija
### P1 — blokator / sigurnosni / funkcionalni (mora odmah)
- npr. KPI link vodi i bez permisije, error guta bez `role="alert"`, `hasPermission` ne pokriva `finance.read` na kartici, curenje podataka iz `data[key]` bez guard-a

### P2 — nekonzistentnost / loša praksa (radi ali se ne radi tako)
- npr. `isLoading || !data` prikazuje plain `<p>loading</p>` umjesto skeletona, `refetch` bez `isFetching` indikatora, `QUEUE_KPI_KEYS` hardkod vs backend, dupli `useDashboardKpis` u Teaser+Home, `Link` bez `aria-label`, `t()` bez `defaultValue`

### P3 — UX/polish (radi, ali profesionalnije može)
- npr. hover/focus stil, `tabular-nums` konzistentnost, `PlatformStatusTeaser` iznad naslova vs ispod, `HomeQuickActions` redoslijed po frekvenciji

## 4) Dokazi (file:line)
- `AdminHome.tsx:63 hasPermission check samo za finance, ali KpiRow linka i bez provjere`
- `useDashboardKpis.ts:12 nema `staleTime`/`retry`` itd.

## 5) Predloženi plan — bez koda (šta će se dirati)
| Korak | Fajl | Promjena | Rizik |
|-------|------|----------|-------|
| 1 | `hooks/use-dashboard-kpis.ts` | dodati `retry`, `staleTime`, `select` | nizak |
| 2 | `pages/admin/homes/AdminHome.tsx` | skeleton + `role=alert` + guard za svaki KPI link | srednji |
| ... | ... | ... | ... |

## 6) Alternativa (zašto ne raditi drugačije)
- npr. "ne dirati `dashboard-kpi-config.ts` jer je shared" vs "konsolidovati"

## 7) Kriterijumi gotovosti (Definition of Done)
- [ ] P1 zatvoren + test koji pada bez fixa
- [ ] loading/error/empty/forbidden pokriveni testom
- [ ] `check:all 10/10`, `tsc -b` čist, `a11y` axe bez kršenja
- [ ] `inventory` + `COVERAGE_MATRIX` ažurirani

## 8) Otvorena pitanja za tebe (ask_user)
- Q1: Da li `finance` kartica smije biti vidljiva bez `finance.read`?
- Q2: Da li `PlatformStatusTeaser` ostaje na AdminHome?
```

---

## 3) Template implementacije (kako ide kroz svaki fajl — redoslijed je bitan)

> Implementacija je uvijek **jedna stranica = jedan PR**, nikad bulk. Redoslijed je fiksan da se ne preskače sigurnost.

**Faza 0 — Priprema (bez koda)**
1. `ask_user` za D-XX plan → dobiješ `approve` / `approve_with_comments` / `pause`
2. Kreiraj `AUDIT/dashboard/D-XX-<ime>-PLAN.md` iz template analize
3. `git checkout -b` (već na `arena/290a6f13-fkgracanica`, ne pravi novu granu bez dozvole — radi na aktivnoj)

**Faza 1 — Podaci (hooks/lib)**
1. `frontend/src/hooks/use-dashboard-kpis.ts` (ili `use-finance-*`, `use-analytics-*`) — `queryKey`, `staleTime`, `retry`, `select`, `enabled` po permisiji
2. `frontend/src/lib/permissions.ts` / `staff-home.ts` — guard provjera, bez curenja
3. `frontend/src/types/index.ts` — `DashboardKpis` tip, null guard

**Faza 2 — Konfig (shared)**
4. `frontend/src/pages/admin/dashboard-kpi-config.ts` — `KPI_ROUTES` uslovno po permisiji, `KPI_LABELS` i18n

**Faza 3 — UI atomizacija**
5. `components/ui/card.tsx` / `skeleton.tsx` — ne duplirati stil
6. `pages/admin/homes/HomeKpiGrid.tsx` / `HomeQuickActions.tsx` / `PlatformStatusTeaser.tsx` — loading skeleton, error alert, empty CTA

**Faza 4 — Stranica**
7. `pages/admin/homes/AdminHome.tsx` (ili `FinanceAdminPage.tsx`, `AnalyticsPage.tsx`) — sastavi stanja: `isLoading -> skeleton`, `isError -> alert+retry`, `!data -> empty`, `data -> KpiRow + QuickActions`, `forbidden -> redirect ili poruka bez fetch-a`
8. `pages/admin/DashboardPage.tsx` — samo dispatcher, bez logike

**Faza 5 — Rute/i18n/a11y**
9. `router/app-routes.tsx` — `permissions` na ruti, ne samo u komponenti
10. `locales/*/translation.json` — `admin.home.*`, `admin.kpi.*`, `actions.retry`
11. `components/seo/Seo.tsx` — title po roli

**Faza 6 — Testovi (obavezno prije push-a)**
12. `*.test.tsx` — 4 stanja: loading, error+retry, empty, success (KPI vrijednost + link), + permisija (sa/bez `finance.read`), + a11y (`role=alert`, `focus-visible`)
13. `npm run check:all` (10/10), `tsc -b`, `vitest --coverage` — lokalno zeleno

**Faza 7 — Dokumentacija + CI**
14. `AUDIT/COVERAGE_MATRIX.csv`, `AUDIT/STATE.md`, `AUDIT/segments/*` — upis
15. `git commit` + `git push origin arena/290a6f13-fkgracanica` + `gh run watch` do `6/6`

> Svaki fajl se commita **atomarno** unutar istog PR-a, ali review je po fajlu — nikad "sve odjednom bez objašnjenja".

---

## 4) Template za svaki odgovor (šta tvoj odgovor mora sadržati)

> Svaki put kad završim D-XX, odgovor ima **isti kostur** — da možeš uporediti stranice.

```markdown
### D-XX <Ime> — nalaz (datum)

**Meta:** ruta, fajlovi, rana, permisije, API, CI run

**Sažetak (1 pasus):** Šta stranica radi danas vs šta bi trebala — ocjena zrelosti (npr. 6/10, dobro osmišljeno ali se ne radi tako)

**P1 (blokatori):**
- P1-1: <naslov> — file:line — zašto je sigurnosni/funkcionalni blokator — kako reproducirati

**P2 (nekonzistentnost/loša praksa):**
- P2-1: ...

**P3 (polish):**
- P3-1: ...

**Predloženi plan (bez koda):** tabela korak/fajl/promjena/rizik

**Bolje isplanirano (moj prijedlog preko minimuma):**
- npr. spojiti `HomeKpiGrid` + `HomeQuickActions` u `RoleHomeShell`, uvesti `useDashboardKpis({ enabled: hasPermission })` da se ne fetch-a bez dozvole, dodati `skeleton` umjesto `isLoading || !data` plain teksta

**Kriterijumi gotovosti:** checklist

**Otvorena pitanja za tebe:** Q1, Q2 (ask_user)

**Sljedeće:** D-YY — čeka odobrenje
```

**Pravila kvaliteta za svaki odgovor:**
- Nema "sve je ok" bez dokaza `file:line`
- Svaki P1 mora imati reprodukciju i test koji bi pao
- Svaki prijedlog mora imati alternativu i zašto je odbačena
- Brzina nebitna — svaki D-XX mora imati `check:all 10/10` i `CI 6/6` prije nego krene sljedeći
- Jezik: bosanski/srpski, bez PR prema `main`, push samo na aktivnu granu, CI se provjerava stvarnim runom

---

## Sljedeći korak

Predlažem da **prvi pravi planski dokument bude D-01 AdminHome** (najkritičniji dashboard) po ovom template-u. Ako odobriš listu i template-e, kreiram `AUDIT/dashboard/D-01-AdminHome-PLAN.md` i vraćam ga na review **bez koda**.

Ako želiš da dodam `ClubHubPage/SeasonHubPage/CmsHubPage` u listu, reci pa proširujem prije D-01.
