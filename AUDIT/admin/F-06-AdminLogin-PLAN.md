# F-06 — AdminLoginPage — PLAN (2026-11-20, arena/290a6f13-fkgracanica @ ec72279)

## Meta
| Polje | Vrijednost |
|-------|------------|
| Ruta | `/admin/login` → redirect na `/prijava` |
| Fajl(ovi) | `frontend/src/pages/admin/AdminLoginPage.tsx` (8L) + `src/router/app-routes.tsx:32` (`<Route path="admin/login" element={<AdminLoginPage />} />`), `LoginPage` canonical na `/prijava` |
| Rola/permisije | `public` — legacy alias, bez `ProtectedRoute`/`PermissionRoute`, renderuje se i za anonimne i za prijavljene |
| API | nema — čisti client redirect |
| Stanje grane | `arena/290a6f13-fkgracanica` @ `ec72279` (F-05 zatvoren CI 44706520326 6/6) |

## 1) Šta radi danas (činjenično, bez ocjene)
- `AdminLoginPage.tsx:4-7` — `useLocation()` + `return <Navigate to="/prijava" replace state={location.state} />`. `replace` da ne dodaje history entry, `state` se prosljeđuje (npr. `from` nakon redirecta iz `ProtectedRoute`).
- `app-routes.tsx:32` — `<Route path="admin/login" element={<AdminLoginPage />} />` izvan `ProtectedRoute`, direktno ispod `<Route path="prijava" element={<LoginPage />} />`.
- `LoginPage` (`pages/public/LoginPage.tsx`) — canonical prijava, već pokriva auth, `role`/`aria`, i18n.
- Test `fe06-admin-widgets-part2.test.tsx:19-29` — `MemoryRouter initialEntries=['/admin/login']` → `Routes` + `Route /prijava` → assert `prijava` tekst — pokriva `Navigate` za prazan state, bez provjere `state`/`search` očuvanja.
- Nema `Seo`, nema fetch-a, nema `isLoading/isError`, nema `dataUpdatedAt`, nema `aria` atributa — redirect нема contenta.
- Nema curenja permisija — fajl ne poziva `hasPermission`, `useAuth`, `resolveStaffHome`.

## 2) Šta bi trebala da radi (očekivano — profesionalni standard)
- **Korisnik:** bilo ko ko otvori legacy `/admin/login` (bookmark, stari link, external referrer) — završava na `/prijava` za <1s, bez dodatnog klika, bez dupliciranog history entry-ja.
- **Ugovor:**
  - Obavezno: `replace` (ne `push`), očuvati `location.state` (da `LoginPage` može `navigate(state?.from ?? "/")` nakon uspješne prijave), bez rendera sadržaja, bez Seo duplikata, bez fetch-a.
  - Uslovno: očuvati i `location.search` ako je bio `?next=` ili `?redirect=` — ali projekt koristi `state.from` ( `ProtectedRoute` šalje `state: { from: location }`), pa je `search` na `/admin/login?...` malo vjerovatan. Ako postoji, treba ga proslijediti ili ignorisati bez greške.
- **Ponašanje:**
  - `isLoading/isError/empty` ne postoji — redirect je instant.
  - `role="alert"/aria-busy` irelevantno — nema async-a.
  - `Seo` nije potreban za redirect (nema contenta, nema `title` koji bi indeksirao `/admin/login`).
  - `t()` nije potreban — nema vidljivog teksta.
- **A11y/i18n/perf:** nema teksta → nema i18n; nema `Button` → nema a11y; `Navigate` je sync, nema N+1, nema `useEffect`.

## 3) Propusti — klasifikacija

### P1 — blokator / sigurnosni / funkcionalni
- **P1 — nema.** Redirect ne otkriva podatke, ne radi fetch, ne ovisi o permisiji. `location.state` se prosljeđuje korektno.

### P2 — nekonzistentnost / loša praksa (radi ali se ne radi tako)
- **P2-1 — `state` pokriven samo happy path-em.** Postojeći test provjerava samo `/admin/login` bez `state`, ne provjerava `state: { from: "/admin/users" }` očuvanje. Reprodukcija: `initialEntries=[{ pathname:"/admin/login", state:{ from:"/admin/users" }}]` — trenutni kod prosljeđuje, ali test ne dokazuje.
- **P2-2 — `search` se ne prosljeđuje.** Ako netko otvori `/admin/login?next=/admin/media`, `Navigate to="/prijava"` gubi `?next=`. Projekt standard je `state.from`, pa je rizik nizak, ali `location.search` bi se mogao proslijediti ako postoji (kao što `LoginPage` čita `search` za `?next=`). Nije blokator — konzistentnost.
- **P2-3 — nema eksplicitnog testa za `replace`.** Test ne provjerava da `Navigate` koristi `replace` (da back dugme ne vraća na `/admin/login`). Može se dokazati kroz `MemoryRouter` history, ali nije pokriven.

### P3 — UX/polish
- **P3-1 — komentar već postoji (`Legacy URL — jedinstvena prijava na /prijava`) — dovoljno.** Dodatni `Seo` ili fallback UI nisu potrebni za redirect.
- **P3-2 — nema `dataUpdatedAt`/`lastUpdated` — irelevantno.**

**Ocjena zrelosti:** 9/10 — trivijalan redirect, ispravno `replace+state`, bez sigurnosnih propusta; nedostaje samo `state`/`replace` test i razmatranje `search`.

## 4) Dokazi (file:line)
- `AdminLoginPage.tsx:1 — import { Navigate, useLocation }` — koristi `Navigate` + `useLocation` korektno.
- `AdminLoginPage.tsx:4-7 — return <Navigate to="/prijava" replace state={location.state} />` — `replace` + `state` očuvanje.
- `app-routes.tsx:32 — <Route path="admin/login" element={<AdminLoginPage />} />` — izvan `ProtectedRoute`, public alias.
- `fe06-admin-widgets-part2.test.tsx:19-29 — it('preusmjerava na /prijava')` — samo happy path, bez `state`/`replace` assert-a.
- `LoginPage.tsx` (javni) — canonical, ne duplicira logiku.

## 5) Predloženi plan — bez koda
| Korak | Fajl | Promjena | Rizik |
|-------|------|----------|-------|
| 1 | `AUDIT/admin/F-06-AdminLogin-PLAN.md` | Kreirati ovaj plan (template §2), `ask_user` → `q_f06_yes` odobren 2026-11-20 | — |
| 2 | `frontend/src/pages/admin/AdminLoginPage.tsx` | **Bez promjene** — postojeći `Navigate replace state` je ispravan. Opcionalno: razmotriti `to={{ pathname:"/prijava", search: location.search }}` ako `location.search` postoji (nizak prioritet, `state.from` je primarni). Odluka: **ostaviti kako jeste** (konsistentno s P-obilježjem da je `/admin/login` legacy, a `LoginPage` čita `state`, ne `search`). | nizak |
| 3 | `frontend/src/pages/admin/fe06-admin-widgets-part2.test.tsx` ili `frontend/src/pages/admin/fe06-f06-admin-login.test.tsx` | Dodati/ proširiti test(ove): (a) `state` očuvanje — `initialEntries=[{pathname:"/admin/login", state:{from:"/admin/users"}}]` → `LoginPage` primi `location.state.from`; (b) `replace` — nakon `Navigate` history length ostaje 1 (back ne vraća). Oba `protected` bez koda promjene. | nizak |
| 4 | `AUDIT/COVERAGE_MATRIX.csv` | Dopisati `fe06-f06-admin-login.test.tsx` ako se kreira novi fajl, ili ažurirati `loc` za `fe06-admin-widgets-part2` (ostaje 109L) — matrica već pokriva fajl, `F-06` segment. | nizak |
| 5 | `AUDIT/STATE.md` | Upis `F-06 ✅ ZATVOREN CI 6/6` + `admin 31/31` zatvoreno, `Zadnji CI run` | — |
| 6 | `AUDIT/dead-guards.json` | Bez promjene — redirect nema `void refetch`/`disabled` grana, nema novih mrtvih zaštita. | — |
| 7 | `check:all 10/10` + `vite build` + `gh run watch` do 6/6 | Obavezno prije sljedećeg segmenta | — |

**Ne raditi:** dodavati `Seo`, `AdminPageShell`, `isLoading`, `t()` — redirect nema contenta; dodavati `hasPermission` — public alias; mijenjati rutu u `ProtectedRoute` — slomilo bi anonimne.

## 6) Alternativa (zašto ne drugačije)
- **Alternativa A: `Navigate to="/prijava" + search` (`to={{ pathname:"/prijava", search: location.search }}`).** Za: čuva `?next=` ako stari link koristi query. Protiv: projekt koristi `state.from`, `LoginPage` ne čita `?next=` primarno; dodavanje `search` bi dupliciralo logiku i moglo propagirati neželjene parametre. Odluka: **ne** — zadrži `state` samo.
- **Alternativa B: `useEffect navigate` umjesto `<Navigate>` (imperativ).** Za: nema. Protiv: `<Navigate replace>` je deklarativno, testabilno, nema `useEffect` cleanup-a. Odluka: **ne**.
- **Alternativa C: Ukloniti `AdminLoginPage` i staviti `<Route path="admin/login" element={<Navigate to="/prijava" replace />} />` direktno u ruter.** Za: manje fajlova. Protiv: gubi `state` očuvanje i komentar, testabilnost; fajl je već 8L, nije teret. Odluka: **ne** — zadrži fajl.

## 7) Kriterijumi gotovosti (DoD)
- [ ] `F-06-AdminLogin-PLAN.md` kreiran po template-u §2, `ask_user q_f06_yes` odobren
- [ ] `AdminLoginPage` — `replace` + `state` pokriveni testom (state očuvanje + replace)
- [ ] `check:all 10/10`, `tsc -b` čist, `vite build` ✓, `vitest --coverage` 99%+ (redirect 100%)
- [ ] `COVERAGE_MATRIX` + `STATE.md` ažurirani, `dead-guards` 31/31 ostaje, CI 6/6 zelen
- [ ] Nema PR prema `main`, push samo `arena/290a6f13-fkgracanica`, `gh run watch` 6/6

## 8) Otvorena pitanja (ask_user)
- **Q-F06-1 (ask_user q_f06_scope):** Da li odobravaš da `F-06` zatvori admin kao **bez koda** (samo test proširenje za `state`/`replace`), ili da se `search` ipak proslijedi (`location.search` → `/prijava?next=`)?
  - `q_f06_yes` — bez koda, samo test (odabrano 2026-11-20)
  - `q_f06_skip` — preskoči F-06, admin gotov na F-05
  - `q_f06_pause` — pauziraj
- **Q-F06-2 (q_next_segment):** Nakon F-06, ne pokretati novi segment automatski — čekati nalog.
  - `q_next_none` — odabrano 2026-11-20

## Sljedeće
- F-06 zatvara admin 31/31 → sljedeći po `ADMIN_PLAN_2026-11-17` nema (sve stranice pokrivene kroz A-02..F-05 mapiranje). Po odobrenju `q_next_none`, čeka se tvoj nalog za eventualni novi scope (public, mobile, ili drugi) — bez automatskog pokretanja.
