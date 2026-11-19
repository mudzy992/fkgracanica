# A-01 — DashboardPage — PLAN (2026-11-19, grana `arena/290a6f13-fkgracanica` @ `6549689`)

> Planski dokument — bez koda. Slijedi template iz `ADMIN_PLAN_2026-11-17.md` §2. Implementacija tek nakon `ask_user approve`.

---

## Meta

| Polje | Vrijednost |
|-------|------------|
| Ruta | `/admin` `index` — `app-routes.tsx:66` `<Route index element={<DashboardPage />} />` unutar `<Route path="admin" element={<ProtectedRoute />}><Route element={<AdminLayout />}>` |
| Fajl(ovi) | `pages/admin/DashboardPage.tsx` (16 lin) · `lib/staff-home.ts` (13 lin, `resolveStaffHome`) · `lib/staff-access.ts` (`hasStaffAccess`) · `components/common/ProtectedRoute.tsx` (isLoading Skeleton + hasStaffAccess redirect) · `pages/admin/homes/*` (A-02..A-05, već zatvoreni) |
| Rola/permisije | Dispatcher — mapira `user.permissions` → `StaffHomeKind` (`admin` → `moderator` → `commentator` → `writer`). `ProtectedRoute` već štiti `/admin` na `isLoading`/`isAuthenticated`/`hasStaffAccess`; `DashboardPage` ne radi dodatni guard, delegira na homes koji sami imaju `permission-gated KPIs` (A-02..A-05 zatvoreni) |
| API | Nema — nema fetch; homes rade fetch (`useDashboardKpis`, `usePendingLiveReports`, itd. sa `staleTime 30k` zatvoreno u A-02..A-05) |
| Stanje grane | `arena/290a6f13-fkgracanica` @ `6549689` (B-05 ZATVOREN 44490030835 6/6 + docs 44491368957 6/6, A-07 6/6, B-02 6/6, B-03 6/6, B-04 6/6, check:all 10/10, dead-guards 5/5) |

---

## 1) Šta radi danas (činjenično, bez ocjene)

**`DashboardPage.tsx:1-16`:**
```
import { useAuth } from '../../lib/auth';
import { resolveStaffHome } from '../../lib/staff-home';
import { AdminHome } from './homes/AdminHome';
import { CommentatorHome } from './homes/CommentatorHome';
import { ModeratorHome } from './homes/ModeratorHome';
import { WriterHome } from './homes/WriterHome';
export function DashboardPage() {
  const { user } = useAuth();
  const kind = resolveStaffHome(user?.permissions);
  if (kind === 'moderator') return <ModeratorHome />;
  if (kind === 'commentator') return <CommentatorHome />;
  if (kind === 'writer') return <WriterHome />;
  return <AdminHome />;
}
```
- `useAuth()` → `user.permissions` (već garantovan `user !== null` jer `ProtectedRoute` prije rendera provjeri `isLoading` → Skeleton i `!isAuthenticated → /prijava` i `!hasStaffAccess → /clanstvo`)
- `resolveStaffHome` prioritet: `admin` (`settings.read` || `users.read`) → `moderator` (`news.approve`/`gallery.approve`/`live.approve`) → `commentator` (`live.manage`) → `writer` (fallback)
- Render stablo: jedan od 4 homes, bez wrappera, bez `Seo`, bez `AdminPageShell`, bez skeleton/error — homes sami rade `Seo` + `AdminPageShell` + `isFetching/role=alert/lastUpdated`
- `lib/staff-home.ts:4-13` — 6 grana, čista funkcija, bez fetcha

**`ProtectedRoute.tsx:6-26`:**
- `isLoading → <Skeleton h-8 w-48 centriran>`
- `!isAuthenticated → <Navigate to="/prijava" state={{from: location}} />`
- `!hasStaffAccess(user?.permissions) → <Navigate to="/clanstvo" />`
- `Outlet` → `AdminLayout` → `DashboardPage`

**Stanja danas:**
- `loading` → `ProtectedRoute` Skeleton (pokriva DashboardPage; sam DashboardPage nema loading granu)
- `error` → nema — homes pokrivaju svoje greške (`role=alert` + retry disabled isFetching)
- `empty` → nema — homes imaju `emptyRole`
- `forbidden` → `ProtectedRoute` redirect, ne rendera DashboardPage
- `success` → jedan od 4 homes
- Testovi: `fe06-dashboard-ticketing-page.test.tsx:50-68` 4 testa `DashboardPage` (mock `resolveStaffHome` → `state.home`), `fe06-lib-core.test.ts:36-62` 6 testova `resolveStaffHome`, `fe07-batch07.test.ts` 2 shv smoke — ukupno 12 pokrivenih

---

## 2) Šta bi trebala da radi (očekivano — profesionalni standard za dispatcher)

* **Korisnik:** svaki staff (`admin`/`moderator`/`writer`/`commentator`) koji otvori `/admin` za <1s mora vidjeti **svoj home** sa svojim KPI-evima (permission-gated, skeleton `aria-busy`, `role=alert` na grešci, `lastUpdated/Osvježi`), bez bljeska pogrešnog homea
* **Ugovor:**
  * `ProtectedRoute` je jedini guard za auth/staff — `DashboardPage` ne duplira guard, samo rutira (obavezni: admin/moderator/commentator/writer; uslovno: nema)
  * Mapiranje mora biti determinističko i prioritetno (admin > moderator > commentator > writer), pokriveno jediničnim testom svake grane i integracionim testom svake rute
  * Nema fetcha u dispatcheru — `staleTime` je na homes (A-02..A-05), ne na `DashboardPage`
* **Ponašanje:**
  * `isLoading` → delegirano `ProtectedRoute` (centriran Skeleton) — `DashboardPage` ne rendera dok `user` nije spreman
  * `!isAuthenticated` / `!hasStaffAccess` → redirect (ne prazan writer)
  * `resolveStaffHome` pure → test 6/6 grana, nema side-effecta
  * Homes već imaju P1/P2 (skeleton, alert, disabled isFetching, lastUpdated) — dispatcher ne smije sakriti `Seo/h1`
* **A11y/i18n/perf:**
  * `Seo`标题 je u homes (dovoljno); `DashboardPage` ne treba dodatni `Seo` (ne duplira title)
  * `t()` nije potreban u dispatcheru (nema teksta)
  * 0 fetchova, 0 rerendera prije auth bootstrapa (memo ne treba — homes su teški, dispatcher je lagan)

---

## 3) Propusti — klasifikacija

### P1 — blokator / sigurnosni / funkcionalni (mora odmah)

**Nema P1.** `ProtectedRoute` već pokriva `isLoading`/`isAuthenticated`/`hasStaffAccess`; `resolveStaffHome` je pure i prioritetno; homes su zatvoreni A-02..A-05 (permission-gated, skeleton `aria-busy`, `role=alert`). Dispatcher ne cure podacima, ne fetch-a i ne guta grešku.

*Tipičan rizik koji bi bio P1 a nije potvrđen:* da `DashboardPage` direktno pozove `resolveStaffHome(undefined)` prije auth bootstrapa i prikaže `WriterHome` članu koji je staff — spriječeno `ProtectedRoute isLoading` granom (dokaz `ProtectedRoute.tsx:10`).

### P2 — nekonzistentnost / loša praksa (radi ali se ne radi tako)

**P2-1 — `DashboardPage` nema `Seo` niti eksplicitan fallback za neočekivan `kind` — oslanja se na homes i na final `return <AdminHome />` kao fallback**
* Gdje: `DashboardPage.tsx:10-15` — nema `Seo`, final `return <AdminHome />` je implicitni `admin` fallback (isto kao `if (kind==='admin')`), nije naveden eksplicitno
* Zašto P2: čitljivost i eksplicitnost prioritetne liste (admin > moderator > commentator > writer) — `else return <AdminHome />` bez komentara može zbuniti; `Seo` bi duplirao homes (`AdminHome` već ima `Seo title=t('admin.dashboard')`)
* Predlog: ostaviti bez `Seo` (homes pokrivaju), ali dodati komentar `// admin fallback` ili eksplicitni `if (kind==='admin')` + fallback `AdminHome` — bez promjene ponašanja

**P2-2 — `resolveStaffHome` provjerava `permissions ?? []` ali ne trimuje niti normalizuje velika/mala slova — konzistentno sa `hasPermission`/`hasStaffAccess` koje koriste `includes`, ali bi ` ' Settings.Read '`落户 bilo `writer`**
* Gdje: `lib/staff-home.ts:5-6` `const p = permissions ?? []; if (p.includes('settings.read'))`
* Zašto P2: nije bug danas (backend šalje lower-case bez razmaka), ali homes/ `hasPermission` imaju isti ugovor; nema potrebe za promjenom bez dokaza varijante u produkciji
* Predlog: ne dirati — dodati jedinični test za `undefined`/prazan niz (već postoji u `fe06-lib-core.test.ts:38`)

**P2-3 — `fe06-dashboard-ticketing-page.test.tsx` mockira `resolveStaffHome` pa ne testira stvarno mapiranje `permissions → kind → home` end-to-end**
* Gdje: `fe06-dashboard-ticketing-page.test.tsx:32` `vi.mock('../../lib/staff-home', () => ({ resolveStaffHome: () => state.home }))`
* Zašto P2: integracioni test preskače stvarnu funkciju; stvarno mapiranje pokriva `fe06-lib-core.test.ts` izolovano, ali ne i `DashboardPage` sa stvarnim `permissions`
* Predlog: dodati 4 testa u `fe06-a01-dashboard.test.tsx` sa stvarnim `resolveStaffHome` + `useAuth` mockom `permissions` (bez mocka `staff-home`), kao dopuna a ne zamjena — Q1

### P3 — UX/polish

**P3-1 — `ProtectedRoute` Skeleton je centriran `h-8 w-48` — homes imaju `KpiSkeletonGrid aria-busy` (8× Card h-[118px]) koji je vizualno bliži konačnom layoutu; dispatcher loading je kraći pa je razlika prihvatljiva, ne mijenjati**

---

## 4) Dokazi (file:line)

* `pages/admin/DashboardPage.tsx:1-16` — 16 lin, delegira na 4 homes, nema fetcha — P2-1
* `lib/staff-home.ts:4-13` — pure prioritet, nema staleTime — P2-2
* `components/common/ProtectedRoute.tsx:6-26` — `isLoading → Skeleton`, `hasStaffAccess → /clanstvo` — nema P1 na dispatcheru
* `pages/admin/fe06-dashboard-ticketing-page.test.tsx:50-68` — 4 testa ali mockira `staff-home` — P2-3
* `lib/fe06-lib-core.test.ts:36-62` — 6 testova `resolveStaffHome` — pokriva P2-2
* `pages/admin/homes/*` — A-02..A-05 zatvoreni 6/6 sa `staleTime 30k`, `role=alert`, `aria-busy`, `lastUpdated` — dispatcher nasljeđuje

---

## 5) Predloženi plan — bez koda (šta će se dirati)

| Korak | Fajl | Promjena | Rizik | Test |
|-------|------|----------|-------|------|
| 1 | `frontend/src/pages/admin/DashboardPage.tsx` | Eksplicitnost: `if (kind === 'admin') return <AdminHome />; return <AdminHome /> // fallback` + komentar `// admin je fallback, hasStaffAccess garantuje staff` — **bez promjene ponašanja**, samo čitljivost; ne dodavati `Seo` (homes ga imaju) | nizak | postojeći 4 testa moraju ostati zeleni |
| 2 | `frontend/src/lib/staff-home.ts` | Ne dirati logiku — dodati `/** prioritet: admin > moderator > commentator > writer */` komentar iznad funkcije ako nedostaje | nizak | `fe06-lib-core.test.ts` 6/6 ostaje |
| 3 | `frontend/src/pages/admin/fe06-a01-dashboard.test.tsx` (novi, 4t) | Integracioni dopunski: render `DashboardPage` sa **stvarnim** `resolveStaffHome` (bez mocka) + `useAuth` mock `{permissions: [...]}` → `admin/moderator/commentator/writer` svaki 1t (provjeri `data-testid` homes). Mock samo `useAuth` + homes (`AdminHome` itd.), ne `staff-home` | nizak | 4 stanja, prioritet admin > moderator (`['news.approve','settings.read'] → admin`) |
| 4 | `frontend/src/lib/fe06-lib-core.test.ts` (dopuna, +0-1t) | Dodati `expect(resolveStaffHome(undefined)).toBe('writer')` ako nedostaje (već 2) — neobavezno | nizak | — |
| 5 | `scripts/standards/baselines/file-size.txt` | `DashboardPage.tsx` 16→~18 lin ostaje ispod 200 — ne treba baseline | — | `check:all` |
| 6 | `AUDIT/COVERAGE_MATRIX.csv` | `inventory.mjs` regeneriše — `fe06-a01-dashboard` `pokriveno testom` | — | `check-coverage` |

**Šta se NE dira:** `ProtectedRoute` (isLoading/auth/staff guard već ispravan), `homes/*` (A-02..A-05 zatvoreni), `auth` bootstrap, `router` gating, `backend` (nema API na dispatcheru), `News*`/`Gallery*`/`Media*` (B-04/B-05).

---

## 6) Alternativa (zašto ne drugačije)

* **Ne dodavati `Seo` u `DashboardPage`:** odbačeno — homes imaju `Seo` sa različitim naslovima (`admin.dashboard` vs specifični KPI naslovi); dispatcher `Seo` bi duplirao title i brisao specifični
* **Ne dodavati `isLoading` granu u `DashboardPage`:** odbačeno — `ProtectedRoute` već rendera Skeleton prije `Outlet`; dodatni Skeleton u dispatcheru bi bio dead code (nikad prikazan kad je `user` garantovan)
* **Ne mijenjati `resolveStaffHome` logiku (trim/lowercase):** odbačeno — backend i `hasPermission` koriste lower-case bez razmaka; stvarna varijanta nije dokazana, a promjena bi mogla maskirati backend bag
* **Jedan globalni test fajl vs 4 odvojena:** jedan fajl `fe06-a01-dashboard.test.tsx` sa 4 `it` je dovoljan (dispatcher je 16 lin); ne treba `file-size` split

---

## 7) Kriterijumi gotovosti (DoD)

- [ ] P2-1..P2-3 zatvoreni + testovi koji padaju bez fixa (eksplicitni fallback komentar + 4 integraciona testa sa stvarnim `resolveStaffHome` koji padaju ako se prioritet promijeni)
- [ ] 4 `kind` grane pokrivene testom (`admin`/`moderator`/`commentator`/`writer`), plus `undefined → writer` i `admin > moderator` prioritet
- [ ] `check:all 10/10`, `tsc -b` čist, `axe` bez kršenja na `/admin` (homes već 6/6)
- [ ] `AUDIT/COVERAGE_MATRIX.csv` + `AUDIT/STATE.md` ažurirani, `CI 6/6` na `arena/290a6f13-fkgracanica`
- [ ] Nema promjene ponašanja za admin/moderator/writer/commentator na `/admin` (homes nepromijenjeni, `ProtectedRoute` netaknut)

---

## 8) Otvorena pitanja za tebe (ask_user prije koda)

**Q1 — `DashboardPage` integracioni testovi sa stvarnim `resolveStaffHome` vs mock:** Da li želiš da `fe06-a01-dashboard.test.tsx` testira stvarno mapiranje `permissions → kind → home` (4t sa `useAuth` mockom `permissions` bez mocka `staff-home`), ili da ostane postojeći mock (`resolveStaffHome: () => state.home`) koji samo provjerava render? Predlažem **stvarno mapiranje dopunski** (4t) pored postojećeg — bez brisanja `fe06-dashboard-ticketing-page.test.tsx`.

**Q2 — `DashboardPage` eksplicitni `admin` branch:** Da li `DashboardPage.tsx` treba eksplicitni `if (kind === 'admin') return <AdminHome />` prije finalnog fallbacka sa komentarom, ili ostaviti `return <AdminHome />` kao implicitni admin/fallback kao danas? Predlažem **eksplicitni branch + fallback komentar** — bez promjene ponašanja, samo čitljivost.

**Q3 — `DashboardPage` `Seo`:** Da li `DashboardPage` treba vlastiti `Seo title={t('admin.dashboard')}` prije delegiranja, ili da `Seo` ostane samo u homes kao danas (homes već imaju svoj title)? Predlažem **bez `Seo` u dispatcheru** — homes pokrivaju, nema dupliranja.

> Ako odobriš ovaj plan (ili `approve_with_comments`), sljedeći korak je implementacija A-01 po tabeli iznad — jedan commit, `gh run watch` do `6/6`.
