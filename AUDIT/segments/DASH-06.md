# Segment DASH-06 — Član 0 (profil + javni CTA)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (2026-11-27) |
| **Paket** | P-DASH-06 |
| **Veličina** | S (1 fajl, 50 LOC) |
| **Rizik** | Low — 0 dozvola, read-only |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `P-DASH-06` |
| **CI** | `inventory 2554/2554`, `build 29 rute`, `check:all 10/10` |

---

## 1. Opseg

Član 0 (`Član` — nema dozvola, koristi javne rute `/clanstvo` `/ulaznice`).

**Fajl:** `frontend-next/app/admin/profil/page.tsx` 50 — prikaz `user.email`, `firstName/lastName`, `permissions` (0), linkovi na `/clanstvo` i `/ulaznice` (P-NEXT-02e static CTA).

Nav: `admin-nav` dodan `Račun` grupa `Moj profil` `perms: []` — `AdminLayout` filter sada `perms.length===0` → vidljivo za sve auth korisnike (Član vidi samo Račun).

---

## 2. Odluke

| Odluka | Razlog |
|--------|--------|
| `profil` pod `/admin` ali bez `perms` | Član nema `dashboard.read`, pa jedini način da vidi admin je `perms:[]`; middleware štiti `/admin/*` samo tokenom, ne perms — perms filter je UI, ne guard |
| Linkovi na public `/clanstvo` `/ulaznice` | P-NEXT-02e već isporučuje 100% public CTA; Član ne treba admin CRUD |
| 50 LOC | Najmanji S — samo Card + Button |

---

## 3. Izmjene

| Commit | Poruka |
|--------|--------|
| `P-DASH-06` | `feat(frontend-next): P-DASH-06 Član 0 — profil` |

---

## 4. Testovi

| Test | Rezultat |
|------|----------|
| `build` | `○ /admin/profil 1.11kB` |
| `check:all` | `10/10 OK` |

---

## 5. Verifikacija

- [x] Član (0) nakon `/prijava` vidi samo `Moj profil` u sidebaru (sve ostale grupe filtrirane)
- [x] `/admin/profil` prikazuje `0 (Član)` i dugmad na public rute

Status: ZATVOREN

---

## 6. P-DASH ukupno (01-06)

| Segment | Role | Perms | Fajlovi | Status |
|---------|------|-------|---------|--------|
| DASH-01 | Administrator | 40 | 15 | ZATVOREN |
| DASH-02 | Moderator | 27 | 3 | ZATVOREN |
| DASH-03 | Writer | 5 | 1+proširenje | ZATVOREN |
| DASH-04 | Komentator | 2 | 1 | ZATVOREN |
| DASH-05 | Redar | 1 | 1 | ZATVOREN |
| DASH-06 | Član | 0 | 1 | ZATVOREN |

**Next 19/19 public + 6 DASH = 100% Next.js parity za `frontend-next:59` fajlova, `2554/2554`, `check:all 10/10`.**
