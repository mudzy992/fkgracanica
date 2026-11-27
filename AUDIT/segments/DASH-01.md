# Segment DASH-01 — Admin foundation premium + middleware + Dashboard/PlatformStatus

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (otvoren 2026-11-27, zatvoren 2026-11-27) |
| **Paket** | P-DASH-01 |
| **Veličina** | S-relaxed (15 fajlova, ~700 LOC — premium Design System + auth + admin layout + 2 stranice) |
| **Rizik** | Low-Med — httpOnly cookie, middleware, Turbopack build, bez backend mutacije |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `9c743c6` → `P-DASH-01` |
| **CI** | `check:all 10/10`, `check-coverage OK`, `inventory 2547/2547`, `frontend-next build` Turbopack 23 rute |

---

## 1. Opseg

Premium **Design System + auth + AdminLayout + Dashboard/PlatformStatus** — temelj za paralelne DASH-02..06 (Moderator→Član). Korisnik 2026-11-27: `premium` (novi premium UI `rounded-2xl shadow-premium 44px touch variant:premium`), `middleware` (httpOnly `fk_access_token` + `middleware.ts /admin/* → /prijava`), `admin_first` (Administrator 40 → … → Član 0), `s_relaxed` (~200 LOC/PR, file <200).

**Fajlovi (15 novih + 2 izmijenjena):**

| Fajl | LOC | Svrha |
|------|-----|-------|
| `frontend-next/middleware.ts` | 25 | `matcher /admin/:path*`, `fk_access_token` → `/prijava?next=` |
| `frontend-next/lib/auth.tsx` | 113 | `AuthProvider` `fetchMe` `/auth/me`, `login/logout`, `localStorage fk_user` |
| `frontend-next/lib/permissions.ts` | 9 | `hasPermission/hasAnyPermission` |
| `frontend-next/lib/utils.ts` | 29 | `cn` `clsx+twMerge` (premium) |
| `frontend-next/components/ui/button-variants.ts` | 27 | `cva` `variant:premium/default/outline/ghost/danger` `rounded-xl` `h-11` |
| `frontend-next/components/ui/button.tsx` | 16 | `forwardRef` |
| `frontend-next/components/ui/card.tsx` | 36 | `rounded-2xl border-subtle shadow-premium backdrop-blur` |
| `frontend-next/components/ui/skeleton.tsx` | 16 | `bg-surface-deep` |
| `frontend-next/components/admin/admin-nav.ts` | 37 | `ADMIN_NAV_GROUPS 4 grupe 10 listova perms` |
| `frontend-next/components/admin/AdminLayout.tsx` | 101 | `sidebar rounded-2xl premium mobile 44px` |
| `frontend-next/app/admin/layout.tsx` | 25 | `QueryClientProvider+AuthProvider+AdminLayout` |
| `frontend-next/app/admin/page.tsx` | 113 | `Dashboard KPI 15 GET /dashboard/kpis stale30s` |
| `frontend-next/app/admin/stanje/page.tsx` | 158 | `PlatformStatus GET /platform-status PercentRing` |
| `frontend-next/app/prijava/page.tsx` | 92 | `AuthProvider wrapper premium Card login` |
| `frontend-next/app/api/auth/login/route.ts` | 27 | `POST proxy /auth/login Set-Cookie httpOnly lax 900/604800` |
| `frontend-next/app/api/auth/logout/route.ts` | 18 | `POST clear cookies` |
| `frontend-next/package.json` / `package-lock.json` | — | `clsx tailwind-merge cva lucide @tanstack/react-query` |

**Izmjene:** `frontend-next/lib/utils.ts` prešao sa `filter(Boolean).join` na `twMerge(clsx)`; `package.json` + deps.

---

## 2. Odluke

| Odluka | Razlog | Alternativa |
|--------|--------|-------------|
| `premium` UI (ne Vite 1:1 kopija) — `rounded-2xl shadow-premium backdrop-blur` `variant:premium` | Korisnik eksplicitno `novi premium UI`; Vite `frontend/src/index.css 327 tokena` ostaje, Next dobija premium nadogradnju | Kopija Vite 1:1 — brže ali bez premium |
| `httpOnly fk_access_token` + `middleware.ts` | Sigurnije od `localStorage` tokena; Next middleware radi redirect prije rendera ` /admin/* → /prijava?next=` | `localStorage` kao u Vite `useAuth` — XSS rizik |
| `admin_first` 40→27→5→2→1→0 | Administrator vidi sve (Dashboard 15 KPI + PlatformStatus + Users), ostali se dodaju paralelno | `all_roles_parallel` bez reda — teže za review |
| `S-relaxed` 80-200 LOC (file <200) | S paket mora ostati mali; `Dashboard 113 + Stanje 158 + AdminLayout 101` = ~372 u jednom PR | Monolit 40 perms u jednom PR >500 LOC — nepregledno |
| `AuthProvider` u `app/admin/layout.tsx` + `app/prijava` wrapper (ne global `app/layout.tsx`) | Admin i prijava dijele auth, public rute ostaju bez providera (ISR, bez JS) | Global provider u `app/layout.tsx` — opterećuje public build |
| `getApiUrl()` za `GET /dashboard/kpis` i `/platform-status` | Isti helper kao 02a-e, radi bez env-a, `cache:no-store` za admin | Hardcode `localhost:3000` |
| `useSearchParams` → `useEffect window.location.search` za `next` | `useSearchParams` zahtijeva `Suspense` boundary u Next 15, `useEffect` je jednostavniji S | `Suspense` wrapper — više koda |

---

## 3. Izmjene (commiti)

| Commit | Poruka |
|--------|--------|
| `P-DASH-01` | `feat(frontend-next): P-DASH-01 Admin foundation premium (middleware httpOnly + AdminLayout + Dashboard + Stanje)` |

**Diff:** 15 novih + 2 modifikovana + matrix `2547/2547` (`frontend-next 37→52`), `DASH-01` 15 redova.

---

## 4. Testovi

| Test | Rezultat |
|------|----------|
| `node scripts/audit/inventory.mjs` | `2547/2547` (`frontend-next:52`) — 0 nepregledano |
| `npm --workspace=frontend-next run build --turbo` | `✓ 23/23` `15.5.29 Turbopack 8.3s` `○ 14 + ƒ 7 + Middleware 39.3kB` `shared 123kB` — `0 B /admin 5.53kB` ` /admin/stanje 5.87kB` ` /prijava 2.9kB` |
| `npm run check:all` | `10/10 OK` ( `file-size` najveći `stanje 158 <200`, `token-check 327/327`, `bundle-react 19.3.1` ) |
| `npm ls react` | `hoisted 19.3.1` |
| `check-coverage` | `OK — matrica pokriva sve; nema zatvorenog segmenta s nepregledanim` |

---

## 5. Verifikacija

- [x] `middleware.ts` `matcher /admin/:path*` — bez `fk_access_token` → `302 /prijava?next=/admin` (httpOnly `lax` `secure` u prod)
- [x] `POST /api/auth/login` `Set-Cookie fk_access_token=…; HttpOnly; Path=/; SameSite=Lax; Max-Age=900/604800` + `fk_refresh_token`
- [x] `POST /api/auth/logout` briše oba cookie-ja
- [x] `GET /dashboard/kpis` (15 KPI) — `dashboard.read` — `Kontrolna tabla` grid 4×2 + skeleton + error `Pokušaj ponovo` + `Osvježi` `lastUpdated`
- [x] `GET /platform-status` — `PlatformStatus` `overallPercent` `PercentRing` `counts` `modules 4` + skeleton/error
- [x] `AdminLayout` premium `rounded-2xl shadow-premium` `44px touch` `mobile drawer` `4 grupe`
- [x] `Prijava` `AuthProvider` wrapper ne baca `useAuth must be within` na build-u
- [x] `build 23/23` bez `useContext null` (hoisted react)
- [x] `inventory 2547/2547` `check:all 10/10`

---

## 6. Rollback

```bash
git revert <P-DASH-01 sha>
# ili
rm -rf frontend-next/app/admin frontend-next/app/prijava frontend-next/app/api/auth frontend-next/components/admin frontend-next/components/ui frontend-next/middleware.ts frontend-next/lib/auth.tsx frontend-next/lib/permissions.ts
git checkout HEAD -- frontend-next/lib/utils.ts frontend-next/package.json package-lock.json
node scripts/audit/inventory.mjs
```

---

## 7. Sljedeći korak

P-DASH-02..06 paralelno (po `admin_first`):

- `P-DASH-02` Moderator 27 — `news.manage` `gallery.manage` `sponsors.manage`…
- `P-DASH-03` Writer 5
- `P-DASH-04` Komentator 2
- `P-DASH-05` Redar 1 — `tickets` `TicketValidateScreen` (puni `/ulaznice` flow)
- `P-DASH-06` Član 0 — `membership` `payMembershipOnline`

Svaki S-relaxed ≤200 LOC/file, `publish:canPublish` na Vite Dashboard → Next `dashboard.read`.

Status segmenta: ZATVOREN
