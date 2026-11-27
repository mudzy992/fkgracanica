# Segment DASH-09 — Audit (audit.read)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (2026-11-27) |
| **Paket** | P-DASH-09 |
| **Veličina** | S (1 nova, ~110 LOC, file <200) |
| **Rizik** | Low — read-only, paginacija + filteri |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `f6b33cd` → `P-DASH-09` |
| **CI** | `inventory 2574/2574`, `build 37 rute`, `check:all 10/10` |

---

## 1. Opseg

Audit log pregled (`audit.read`) — filteri `action/entity/from/to`, paginacija, `lastUpdated/Osvježi`.

**Fajl:**

| Fajl | LOC | Svrha |
|------|-----|-------|
| `frontend-next/app/admin/audit/page.tsx` | ~110 | `GET /audit?page&action&entity&from&to` `audit.read`, 4 filtera + tabela 4 kolone + paginacija `Prethodna/Sljedeća` + `skeleton`/`alert` |

**Permisije:** `audit.read` — read-only.

---

## 2. Odluke

| Odluka | Razlog |
|--------|--------|
| Jedna stranica sa filterima+paginacijom, ne shell | Vite `AuditPage 97` je jedan file sa `AdminPageShell+AdminDataTable`, zadržavamo S veličinu |
| `useQuery` + `URLSearchParams` | Konzistentno DASH-07/08, `staleTime 30s` |
| `getAuthHeader()` httpOnly | middleware štiti `/admin/*` |
| `aria-live="polite"` na paginaciji + `role=alert` | a11y kao Vite |

---

## 3. Plan izvršenja

| Korak | Komanda | CI gate |
|-------|---------|---------|
| 0 | `AUDIT/segments/DASH-09.md` | `inventory` |
| 1 | `frontend-next/app/admin/audit/page.tsx` | `build 37/37` |
| 2 | `inventory` + `build` | `2574/2574` |

---

## 4. Verifikacija

- [x] `audit.read` vidi `/admin/audit` — `GET /audit` sa `page/action/entity/from/to`
- [x] filteri `action/entity/from/to` rade `setPage(1)` + refetch
- [x] `isLoading` → `skeleton aria-busy`, `isError` → `role=alert` + `Pokušaj ponovo`
- [x] paginacija `Prethodna/Sljedeća` `disabled` na granicama + `isFetching`, `aria-live polite`
- [x] `lastUpdated` + `Osvježi`
- [x] `inventory 2574/2574` `build 37/37`

---

## 5. Rollback

```bash
rm -rf frontend-next/app/admin/audit
node scripts/audit/inventory.mjs
```

---

## 6. Sljedeći korak

- `DASH-10` PlatformStatus

## 7. Implementacija

| Stavka | Vrijednost |
|--------|------------|
| **Commit** | `P-DASH-09` `feat(frontend-next): P-DASH-09 Audit — audit.read + paginacija` |
| **Fajl** | `frontend-next/app/admin/audit/page.tsx` 55 LOC `GET /audit?page&action&entity&from&to`, 4 filtera + tabela 4 kolone + paginacija + `lastUpdated/Osvježi` |
| **Nav** | već postojao `/admin/audit audit.read` — bez promjene |
| **Build** | `37 rute` (36→37) ✅ `inventory 2574 Novih 1` |
| **S** | <200 LOC (55) premium S |
