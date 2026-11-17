# Admin — planski pregled SVE osim javnih stranica i mobile (2026-11-17)

> **Scope ispravka:** nisi mislio samo dashboard-e, nego **cijeli admin** — sve što nije `frontend/src/pages/public/*` i `mobile/*`. Ovaj dokument zamjenjuje `DASHBOARD_PLAN_2026-11-17.md` kao master plan i ostaje **PLANSKI — bez koda** dok ne odobriš prvu stranicu.

- Javne stranice (`pages/public/*` — Museum, News, Tickets, itd.) — **IZVAN scope-a**
- Mobile (`mobile/*`) — **IZVAN scope-a**
- Sve ispod `pages/admin/*` — **U scope-u, dio po dio, sekvencijalno**

---

## 1) Potpuna lista admin površina — bukvalno sve (120 fajlova → 34 stranice)

> Izvor: `find frontend/src/pages/admin -name "*.tsx" ! -name "*.test.tsx"` — 120 fajlova. Grupisano po domenima kao u `.cursor/docs/matrices/*`. Svaka **stranica** = jedan planski dokument + jedan PR. Komponente/pomoćni fajlovi idu uz svoju stranicu.

### A — Ulaz / Homes / Status (6 površina)
| # | Stranica | Ruta | Glavni fajl(ovi) | Rola |
|---|----------|------|-----------------|------|
| A-01 | `DashboardPage` (dispatcher) | `/admin` | `DashboardPage.tsx` | sve |
| A-02 | `AdminHome` | `/admin` (admin) | `homes/AdminHome.tsx` + `HomeKpiGrid.tsx` + `HomeQuickActions.tsx` + `dashboard-kpi-config.ts` | admin |
| A-03 | `ModeratorHome` | `/admin` (moderator) | `homes/ModeratorHome.tsx` | moderator |
| A-04 | `WriterHome` | `/admin` (writer) | `homes/WriterHome.tsx` | writer |
| A-05 | `CommentatorHome` + `CommentatorDeskList` + `CommentatorLiveHero` | `/admin/commentator*` | `homes/CommentatorHome.tsx`, `CommentatorDeskList.tsx`, `CommentatorLiveHero.tsx` | commentator |
| A-06 | `PlatformStatusPage` + `PlatformStatusTeaser` | `/admin/platform-status` | `platform-status/PlatformStatusPage.tsx`, `PlatformStatusTeaser.tsx`, `PlatformStatusHero.tsx`, `PercentRing.tsx`, `StatusGroupCard.tsx` | admin |

### B — Takmičenje / Utakmice / Sezone (6 površina)
| # | Stranica | Glavni fajl(ovi) |
|---|----------|-----------------|
| B-01 | `SeasonHubPage` + `CalendarSeasonPage` | `competition-hub/SeasonHubPage.tsx`, `CalendarSeasonPage.tsx`, `SeasonRoundsPanel.tsx`, `competition-hub/SeasonHubPage.tsx` |
| B-02 | `CompetitionsAdminPage` | `CompetitionsAdminPage.tsx`, `CompetitionsAdminFormSheet.tsx` |
| B-03 | `ClubsAdminPage` / `PlayersAdminPage` | `ClubsAdminPage.tsx`, `ClubsAdminFormSheet.tsx`, `PlayersAdminPage.tsx`, `PlayersAdminFormSheet.tsx` |
| B-04 | `Match` — forme i live | `competition-hub/MatchFormSheet.tsx`, `MatchLineupSheet.tsx`, `MatchScoreInputs.tsx`, `MatchHighlightsEditor.tsx`, `MatchFinishedReadOnly.tsx`, `RoundMatchesPanel.tsx`, `RoundCascadeDeleteDialog.tsx`, `RoundFormSheet.tsx` |
| B-05 | `CommentatorPage` | `CommentatorPage.tsx` + `commentator/*` (ClockBar, ClockActions, TeamBoard, PenaltiesBoard, EventLog, ReportControls, StreamDialog) |
| B-06 | `MatchReportPage` | `MatchReportPage.tsx` |

### C — Sadržaj / CMS / Mediji (7 površina)
| # | Stranica | Glavni fajl(ovi) |
|---|----------|-----------------|
| C-01 | `CmsHubPage` + `CmsPageBuilderPage` + `CmsPagesList` | `cms/CmsHubPage.tsx`, `CmsPageBuilderPage.tsx`, `CmsSortableSections.tsx`, `CmsMenuEditor.tsx`, `CmsMenuSortableList.tsx` + `cms/forms/*` (6 formi) |
| C-02 | `NewsAdminPage` + `NewsEditorPage` | `NewsAdminPage.tsx`, `news/NewsEditorPage.tsx`, `NewsEditorMain.tsx`, `NewsEditorMeta.tsx` |
| C-03 | `MediaPage` | `MediaPage.tsx` + `media/*` (AssetsGrid, BulkActionBar, UploadZone/Progress, Toolbar, FolderSheet) |
| C-04 | `GalleryAdminPage` + `GalleryEditorPage` | `GalleryAdminPage.tsx`, `gallery/GalleryEditorPage.tsx` |
| C-05 | `MuseumAdminPage` + `HeritageAdminPage` + `HallOfFameAdminPage` + `TimelineAdminPage` + `TrophiesAdminPage` | 5 fajlova |
| C-06 | `SponsorsAdminPage` | `SponsorsAdminPage.tsx` + `SponsorsAdminFormSheet.tsx` |
| C-07 | `NewsletterAdminPage` | `NewsletterAdminPage.tsx` |

### D — Klub / Hub (2 površine)
| # | Stranica | Glavni fajl(ovi) |
|---|----------|-----------------|
| D-01 | `ClubHubPage` | `club-hub/ClubHubPage.tsx`, `ClubsListPage.tsx`, `ClubHubPanel.tsx`, `ClubsCreateSheet.tsx`, `club-hub/tabs/*` (5 tabova) |
| D-02 | `AppReleasesAdminPage` | `app-releases/AppReleasesAdminPage.tsx`, `AppReleaseCreateForm.tsx` |

### E — Članstvo / Ulaznice / Finansije (4 površine)
| # | Stranica | Glavni fajl(ovi) |
|---|----------|-----------------|
| E-01 | `MembershipAdminPage` | `MembershipAdminPage.tsx` + `MembershipAdminFormSheet.tsx`, `MembershipDetailSheet.tsx` |
| E-02 | `TicketingAdminPage` | `TicketingAdminPage.tsx` + `ticketing/*` (4 taba + ProviderCard/Hints/Categories) + `TicketingOrderSheet.tsx` |
| E-03 | `FinanceAdminPage` | `FinanceAdminPage.tsx` + `finance/*` (KpiGrid, Buckets, FiltersForm, ProviderChip) |
| E-04 | `SettingsPage` | `SettingsPage.tsx` + `settings/*` (FieldRow, FieldGroupPanel, ModuleSection) + SEO/YouTube provjere |

### F — Korisnici / Dozvole / Sistem (6 površina)
| # | Stranica | Glavni fajl(ovi) |
|---|----------|-----------------|
| F-01 | `UsersPage` + `UsersRolesPage` + `RolesPage` | `UsersPage.tsx`, `UsersRolesPage.tsx`, `RolesPage.tsx` + `UserAdminFormSheet.tsx`, `RolesAdminFormSheet.tsx` |
| F-02 | `AuditPage` | `AuditPage.tsx` |
| F-03 | `AnalyticsPage` | `AnalyticsPage.tsx` + `analytics/*` (6 panela) |
| F-04 | `NotificationsPage` + `CommsAdminPage` + `EmailLogPanel` + `LivePendingPage` | 4 fajla |
| F-05 | `ContactAdminPage` + `ContactMessageSheet` | `ContactAdminPage.tsx` |
| F-06 | `AdminLoginPage` | `AdminLoginPage.tsx` |

> **Ukupno: 31 stranica (A-01..F-06) + ~90 pratećih komponenti/formi.** Svaka stranica = jedan plan. Redoslijed ispod nije abecedni nego **po riziku**.

### Predloženi redoslijed (profesionalni — od najvećeg rizika)
1. **A-02 AdminHome** — ulaz, permisije, KPI linkovi, error/loading
2. **A-01 DashboardPage** — dispatcher (mali ali kritičan)
3. **E-03 FinanceAdminPage** — novac, provideri, filteri
4. **E-02 TicketingAdminPage** — narudžbe, sezonske, plaćanja
5. **F-01 Users/Roles** — RBAC, curenje podataka
6. **F-02/F-03 Audit + Analytics** — operativni uvid
7. **B-05 CommentatorPage** — live, clock, race uslovi
8. **B-04 Match forme** — lineup, highlights, zaključavanje live-a
9. **C-02 NewsEditor** — YouTube/Tiptap sanitizacija
10. **C-03 MediaPage** — bulk akcije, upload queue
11. ...ostatak po domenima (C-01 CMS, C-04 Gallery, E-01 Membership, itd.)

Svaka stranica se radi **samostalno**: plan → ask_user → implementacija → `check:all 10/10` + `CI 6/6` → sljedeća.

---

## 2) Template analize za svaku stranicu (fiksno — bez ovoga nema koda)

```markdown
# <Oznaka> — <ImeStranice> — PLAN (datum, grana, sha)

## Meta
| Polje | Vrijednost |
|-------|------------|
| Ruta | `/admin/...` |
| Fajl(ovi) | `pages/admin/...tsx` + hook/lib/componente (lista) |
| Rola/permisije | `hasPermission(...)` / `resolveStaffHome` |
| API | `GET /...` (hook: `useX`) |
| Stanje grane | `arena/...` @ <sha> |

## 1) Šta radi danas (činjenično, bez ocjene)
- Render stablo, hookovi, uslovni branch-evi, navigacija
- Stanja: loading / error / empty / success / forbidden — šta se stvarno prikazuje (npr. plain `<p>loading</p>`)

## 2) Šta bi trebala da radi (očekivano — profesionalni standard)
- Ko je korisnik, koji zadatak završava za <30s
- Ugovor: obavezni vs uslovni KPI/polje po permisiji
- Ponašanje: skeleton (ne text), error `role="alert"` + retry, empty sa CTA, forbidden bez fetch-a/curenja
- A11y/i18n/perf: Seo title, aria, focus-visible, `t()` sa defaultValue, bez N+1 fetch-a

## 3) Propusti — klasifikacija
### P1 — blokator / sigurnosni / funkcionalni
- npr. link bez provjere permisije, gutanje greške, `data[key]` bez guard-a, mutacija bez `canUpdate`

### P2 — nekonzistentnost / loša praksa (radi ali se ne radi tako)
- npr. dupli fetch (Teaser+Home), `isLoading || !data` umjesto skeletona, hardkod KPI ključevi, `Link` bez aria-label, `t()` bez defaultValue, `useEffect` bez cleanup-a

### P3 — UX/polish
- npr. hover/focus, tabular-nums, redoslijed akcija po frekvenciji, spacing

## 4) Dokazi (file:line)
- `AdminHome.tsx:63 — hasPermission samo za finance u QuickActions, ali KpiRow linka i bez provjere`

## 5) Predloženi plan — bez koda
| Korak | Fajl | Promjena | Rizik |
|-------|------|----------|-------|
| 1 | `hooks/use-...ts` | retry/staleTime/enabled po permisiji | nizak |
| 2 | `pages/...tsx` | skeleton + alert + guard | srednji |

## 6) Alternativa (zašto ne drugačije)

## 7) Kriterijumi gotovosti (DoD)
- [ ] P1 zatvoren + test koji pada bez fixa
- [ ] 4 stanja + permisija pokriveni testom
- [ ] `check:all 10/10`, `tsc -b` čist, axe bez kršenja
- [ ] `COVERAGE_MATRIX` + `STATE.md` ažurirani

## 8) Otvorena pitanja (ask_user)
- Q1: ...
```

---

## 3) Template implementacije (kroz fajlove — fiksni redoslijed)

**Faza 0 — Priprema**
1. `ask_user` za plan → `approve` / `approve_with_comments` / `pause`
2. Kreiraj `AUDIT/admin/<Oznaka>-PLAN.md` iz template-a
3. Radi na aktivnoj grani `arena/290a6f13-fkgracanica` (bez nove grane bez dozvole)

**Faza 1 — Podaci (hooks/lib)**
- `frontend/src/hooks/use-*.ts` — queryKey, staleTime, retry, select, enabled po permisiji
- `frontend/src/lib/permissions.ts` / `staff-home.ts` — guard, bez curenja
- `frontend/src/types/index.ts` — tipovi, null guard

**Faza 2 — Konfig (shared)**
- `dashboard-kpi-config.ts`, `finance-labels.ts`, `cms/*`, itd. — rute uslovno po permisiji, i18n

**Faza 3 — UI atomi**
- `components/ui/*` — Card/Skeleton/Button — ne duplirati
- `pages/admin/<domen>/*` — Grid, Toolbar, BulkBar — skeleton/error/empty

**Faza 4 — Stranica**
- Sastavi stanja: `isLoading -> skeleton`, `isError -> alert+retry`, `!data -> empty CTA`, `data -> content`, `forbidden -> poruka bez fetch-a`

**Faza 5 — Rute/i18n/a11y**
- `router/app-routes.tsx` — permissions na ruti
- `locales/*/translation.json` + `components/seo/Seo.tsx`

**Faza 6 — Testovi (prije push-a)**
- 4 stanja + permisija + a11y (role=alert, focus-visible)
- `check:all 10/10`, `tsc -b`, `vitest --coverage` lokalno

**Faza 7 — Dokumentacija + CI**
- `COVERAGE_MATRIX.csv`, `STATE.md`, `segments/*` → commit → `push origin arena/...` → `gh run watch` do `6/6`

> Atomarno po fajlu, ali jedan PR po stranici. Nikad bulk preko više stranica.

---

## 4) Template za svaki odgovor (šta svaki nalaz mora sadržati)

```markdown
### <Oznaka> <Ime> — nalaz (datum)

**Meta:** ruta, fajlovi, rana, permisije, API, CI run

**Sažetak (1 pasus):** Šta radi danas vs šta bi trebala — ocjena zrelosti (npr. 6/10)

**P1 (blokatori):** P1-1 file:line — zašto blokator — reprodukcija
**P2 (ne radi se tako):** P2-1 ...
**P3 (polish):** P3-1 ...

**Predloženi plan (bez koda):** tabela korak/fajl/promjena/rizik
**Bolje isplanirano (preko minimuma):** npr. spojiti Grid+Actions u Shell, enabled fetch, skeleton
**DoD:** checklist
**Otvorena pitanja:** Q1, Q2
**Sljedeće:** <Oznaka+1> čeka odobrenje
```

**Pravila kvaliteta:**
- Nema "sve je ok" bez `file:line` dokaza
- Svaki P1 ima reprodukciju + test koji pada bez fixa
- Svaka alternativa obrazložena
- Jedan PR = jedna stranica, `CI 6/6` obavezno
- Jezik bosanski/srpski, bez PR prema `main`, push samo na aktivnu granu

---

## Sljedeći korak

Ako odobravaš ovaj scope (`sve osim public/mobile = 31 stranica`) i template-e, krećem sa **A-02 AdminHome — PLAN** (samo plan, bez koda) kao prvim pravim dokumentom. Reci da li da ostavim redoslijed kako je gore ili da ti prvo isporučim `A-01 DashboardPage` (dispatcher, 8 linija — brz win) pa onda `AdminHome`.
