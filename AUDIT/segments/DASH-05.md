# Segment DASH-05 — Redar 1 (admissions.scan)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (2026-11-27) |
| **Paket** | P-DASH-05 |
| **Veličina** | S (1 fajl, 81 LOC) |
| **Rizik** | Low — scan only, ne mutira ticketing osim validate |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `P-DASH-05` |
| **CI** | `inventory 2554/2554`, `build 28 rute`, `check:all 10/10` |

---

## 1. Opseg

Redar 1 (`admissions.scan` — obezbjeđenje, skenira QR; premium `44px touch` kao DASH-01).

**Fajl:** `frontend-next/app/admin/scan/page.tsx` 81 — input `qrCode`, `validate` (`POST /ticketing/validate`) i `inspect` (`POST /ticketing/inspect`), prikaz JSON rezultata, guard `hasPermission admissions.scan`.

Nav: `admin-nav` dodan `Ulaz` grupa `Skeniranje` (`admissions.scan`/`ticketing.manage`), `AdminLayout` filter proširen za `perms.length===0`.

---

## 2. Odluke

| Odluka | Razlog |
|--------|--------|
| Ručni unos QR (input) bez kamere | S — kamera `BarcodeDetector` je `mobile/src/features/ticketing/validate`; za Next je dovoljan manual fallback (kao Vite `TicketValidateScreen` manual) |
| `validate` vs `inspect` toggle | Backend ima oba: `validate` bilježi ulaz, `inspect` samo pregled bez bilježenja — Redar treba oba |
| `hasPermission` guard | Moderator (`ticketing.manage`) također može skenirati; Redar samo `admissions.scan` |

---

## 3. Izmjene

| Commit | Poruka |
|--------|--------|
| `P-DASH-05` | `feat(frontend-next): P-DASH-05 Redar 1 — scan QR` |

---

## 4. Testovi

| Test | Rezultat |
|------|----------|
| `build` | `○ /admin/scan 2.73kB` |
| `check:all` | `10/10 OK` |

---

## 5. Verifikacija

- [x] `POST /ticketing/validate {qrCode}` s `Authorization` — zelen overlay JSON, 401 bez perms
- [x] `POST /ticketing/inspect` — ne bilježi ulaz
- [x] Nav `Ulaz` vidljiv za Redar i Moderator

Status: ZATVOREN
