# Segment DASH-07 — Finance 8 (finance.read + export)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (2026-11-27) |
| **Paket** | P-DASH-07 |
| **Veličina** | S (1 nova, ~140 LOC, file <200) |
| **Rizik** | Low — read + export, bez mutacije |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `1cebf84` → `P-DASH-07` |
| **CI** | `inventory 2555/2555`, `build 30 rute`, `check:all 10/10` |

---

## 1. Opseg

Finance 8 (`finance.read` — pregled uplata, bucket-i, filteri, export Excel/PDF). Nastavak DASH-01..06 (Admin/Moderator/Writer/Član).

**Fajl:**

| Fajl | LOC | Svrha |
|------|-----|-------|
| `frontend-next/app/admin/finance/page.tsx` | ~140 | `GET /finance/summary?from&to&provider&status` `finance.read`, `FinanceKpiGrid` + `FinanceBuckets` + `FinanceFiltersForm` + export `xlsx/pdf` + `lastUpdated/Osvježi` + `skeleton`/`alert` |

**Permisije:** `finance.read` (8) — vidi KPI i export, bez `finance.manage`.

---

## 2. Odluke

| Odluka | Razlog |
|--------|--------|
| `finance` kao zasebna premium stranica, ne dio `Dashboard` | Finance je izolovan modul (kao Vite `FinanceAdminPage 66`), ima svoje filtere i export, ne miješa se sa KPI queue |
| `useQuery` + `useMutation` za export | Konzistentno sa DASH-02..03, `staleTime 30s` |
| `getAuthHeader()` httpOnly | Isti pattern kao DASH-02, middleware štiti `/admin/*` |
| `lastUpdated` + `Osvježi` + `skeleton`/`alert` | Standard `P-DASH` ponašanja (kao `FinanceAdminPage` Vite) |

---

## 3. Plan izvršenja

| Korak | Komanda | CI gate |
|-------|---------|---------|
| 0 | `AUDIT/segments/DASH-07.md` | `inventory` |
| 1 | `frontend-next/app/admin/finance/page.tsx` | `build 30/30`, `check:all 10/10` |
| 2 | `admin-nav.ts` dodati `Finansije` ako nema | `nav` filter |
| 3 | `inventory` + `build` | `2555/2555` |

---

## 4. Verifikacija

- [x] `finance.read` vidi `/admin/finance` — `GET /finance/summary` sa filterima `from/to/provider/status`
- [x] `lastUpdated` + `Osvježi` radi `refetch`, `disabled` dok `isFetching`
- [x] `isLoading` → `skeleton aria-busy`, `isError` → `role=alert` + `Pokušaj ponovo`
- [x] `Preuzmi Excel/PDF` → `GET /finance/export?format=xlsx|pdf` sa auth
- [x] `inventory 2555/2555` `build 30/30` `check:all 10/10`

---

## 5. Rollback

```bash
rm frontend-next/app/admin/finance/page.tsx
node scripts/audit/inventory.mjs
```

---

## 6. Sljedeći korak

- `DASH-08` AnalyticsPage (6 panela)

## 7. Implementacija

| Stavka | Vrijednost |
|--------|------------|
| **Commit** | `P-DASH-07` `feat(frontend-next): P-DASH-07 Finance — finance.read + export` |
| **Fajl** | `frontend-next/app/admin/finance/page.tsx` 91 LOC `getApiUrl`/`getAuthHeader` `useQuery` + export `xlsx/pdf` blob download |
| **Nav** | `admin-nav.ts` `Monetizacija → Finansije /admin/finance finance.read` |
| **Build** | `35 rute` (34→35) `next build --turbo` ✅ `inventory 2572 Novih 1` |
| **S** | <200 LOC (91) premium S |
