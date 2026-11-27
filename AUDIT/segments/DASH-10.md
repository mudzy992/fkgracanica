# Segment DASH-10 — PlatformStatus (health platforme)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (2026-11-27) |
| **Paket** | P-DASH-10 |
| **Veličina** | S (1 nova alias, ~12 LOC, file <200) |
| **Rizik** | Low — read-only, alias postojećeg |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `6ca7a58` → `P-DASH-10` |
| **CI** | `inventory 2575/2575`, `build 38 rute`, `check:all 10/10` |

---

## 1. Opseg

PlatformStatus health (`GET /platform-status`, `PercentRing`, `StatusGroupCard`). U Vite `/admin/platform-status`, u Next implementiran kao `/admin/stanje` u `P-DASH-01` (158 LOC `PercentRing` `overallPercent` `modules`). DASH-10 dodaje alias `/admin/platform-status` radi 1:1 pokrivanja rute D-10 bez duplikacije koda.

**Fajlovi:**

| Fajl | LOC | Svrha |
|------|-----|-------|
| `frontend-next/app/admin/stanje/page.tsx` | 158 | već postoji — `P-DASH-01` zatvoren, `GET /platform-status` |
| `frontend-next/app/admin/platform-status/page.tsx` | ~12 | alias `redirect('/admin/stanje')` — pokriva `/admin/platform-status` D-10 |

**Permisije:** `dashboard.read` (kao stanje) — `hasPermission('dashboard.read')` u nav.

---

## 2. Odluke

| Odluka | Razlog |
|--------|--------|
| alias redirect, ne duplikat komponente | `stanje` već 158 LOC pokriva 100% D-10 funkcionalnosti (health, queue, job status); duplikat bi bio 2× održavanje, redirect je 12 LOC premium S |
| `/admin/stanje` ostaje kanonska ruta | `admin-nav` već koristi `Stanje platforme → /admin/stanje dashboard.read`, lokalizovano; `platform-status` je tehnička alias za DASH plan kompatibilnost |

---

## 3. Plan izvršenja

| Korak | Komanda | CI gate |
|-------|---------|---------|
| 0 | `AUDIT/segments/DASH-10.md` | `inventory` |
| 1 | `frontend-next/app/admin/platform-status/page.tsx` | `build 38/38` |
| 2 | `inventory` + `build` | `2575/2575` |

---

## 4. Verifikacija

- [x] `/admin/stanje` radi `GET /platform-status` `PercentRing` — već `P-DASH-01` zatvoren
- [x] `/admin/platform-status` redirecta na `/admin/stanje` (ili rendera isto)
- [x] oba `dashboard.read` `skeleton`/`alert`
- [x] `inventory 2575/2575` `build 38/38`

---

## 5. Rollback

```bash
rm -rf frontend-next/app/admin/platform-status
node scripts/audit/inventory.mjs
```

---

## 6. Sljedeći korak

- Završetak `P-DASH` svih 11 površina `D-00..D-10` — audit zatvaranje

## 7. Implementacija

| Stavka | Vrijednost |
|--------|------------|
| **Commit** | `P-DASH-10` `feat(frontend-next): P-DASH-10 PlatformStatus alias (S 2 LOC)` |
| **Fajl** | `frontend-next/app/admin/platform-status/page.tsx` 2 LOC `redirect('/admin/stanje')` — alias D-10, kanonska `/admin/stanje` ostaje 158 LOC `P-DASH-01` |
| **Build** | `38 rute` (37→38) ✅ `inventory 2575 Novih 1` |
| **S** | <200 LOC (2) premium S — lista D-00..D-10 (11 površina) 100% pokrivena |
