# Segment DASH-08 — Analytics (analytics.read)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (2026-11-27) |
| **Paket** | P-DASH-08 |
| **Veličina** | S (1 nova, ~170 LOC, file <200) |
| **Rizik** | Low — read-only, 4 taba |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `8617cf8` → `P-DASH-08` |
| **CI** | `inventory 2573/2573`, `build 36 rute`, `check:all 10/10` |

---

## 1. Opseg

Analytics 4 taba (`team` · `h2h` · `player` · `visitors`) — `analytics.read`. Nastavak DASH-07 Finance.

**Fajl:**

| Fajl | LOC | Svrha |
|------|-----|-------|
| `frontend-next/app/admin/analitika/page.tsx` | ~170 | `GET /analytics/team?seasonId`, `GET /analytics/h2h?clubAId&clubBId`, `GET /analytics/players/:id`, `GET /public-analytics/{totals,trend,geo}?days=30` — tablist `role=tab`, `season/club/player` filteri, `lastUpdated/Osvježi`, `skeleton`/`alert` |

**Permisije:** `analytics.read` — čita sve panele, bez mutacije.

---

## 2. Odluke

| Odluka | Razlog |
|--------|--------|
| `analitika` kao jedna stranica sa 4 taba, ne 4 rute | Vite `AnalyticsPage 87` + 6 panela je tab-switch, ne routing — zadržavamo isti UX, 1 file <200 |
| `useQuery` per tab sa `enabled` + `staleTime 30s` | Konzistentno sa Vite `useTeamAnalytics/useH2H/usePlayerAnalytics` + finance, fetch samo aktivnog taba |
| `getApiUrl` + `getAuthHeader()` httpOnly | Isti pattern DASH-02..07, middleware štiti `/admin/*` |
| `lastUpdated` + `Osvježi` + `skeleton`/`alert` | Standard P-DASH |

---

## 3. Plan izvršenja

| Korak | Komanda | CI gate |
|-------|---------|---------|
| 0 | `AUDIT/segments/DASH-08.md` | `inventory` |
| 1 | `frontend-next/app/admin/analitika/page.tsx` | `build 36/36` |
| 2 | `inventory` + `build` | `2573/2573` |

---

## 4. Verifikacija

- [x] `analytics.read` vidi `/admin/analitika` — tabovi `team/h2h/player/visitors`
- [x] `team` → `GET /analytics/team?seasonId` + season Select, `lastUpdated` + `Osvježi`
- [x] `isLoading` → `skeleton aria-busy`, `isError` → `role=alert` + `Pokušaj ponovo`
- [x] `h2h` dva Selecta `clubA/B` → `GET /analytics/h2h`
- [x] `visitors` totals+trend+geo — `GET /public-analytics/*`
- [x] `inventory 2573/2573` `build 36/36` `check:all 10/10`

---

## 5. Rollback

```bash
rm -rf frontend-next/app/admin/analitika
node scripts/audit/inventory.mjs
```

---

## 6. Sljedeći korak

- `DASH-09` AuditPage

## 7. Implementacija

| Stavka | Vrijednost |
|--------|------------|
| **Commit** | `P-DASH-08` `feat(frontend-next): P-DASH-08 Analytics — analitika 4 taba` |
| **Fajl** | `frontend-next/app/admin/analitika/page.tsx` 97 LOC tablist `team/h2h/player/visitors`, `GET /analytics/*` + `/public-analytics/*`, season/club/player filteri, `lastUpdated/Osvježi` |
| **Nav** | već postojao `/admin/analitika analytics.read` — bez promjene |
| **Build** | `36 rute` (35→36) ✅ `inventory 2573 Novih 1` |
| **S** | <200 LOC (97) premium S |
