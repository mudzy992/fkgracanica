# Segment PREMIUM-01 — Premium Fan Zona (loyalty/shop/donacije)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (2026-11-27) |
| **Paket** | P-PREMIUM-01 |
| **Veličina** | S (1 fajl, 56 LOC) |
| **Rizik** | Low — static ISR, nema API mutacije |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `e40ee69` → `PREMIUM-01` |
| **CI** | `inventory 2555/2555`, `build 30 rute`, `check:all 10/10` |

---

## 1. Opseg

P-PREMIUM-01 — prvi premium modul nakon DASH-01..06 i SEC-03, paralelan sa SEC-03 (korisnik `parallel`).

**Fajl:** `frontend-next/app/premium/page.tsx` 56 — `revalidate 60 force-static` `metadata` `Premium Fan Zona` — 3 Carda `rounded-2xl shadow-premium` 44px touch: Loyalty (bodovi), Shop (dresovi), Donacije (omladinski pogon).

Nema backend mutacije; podaci su placeholder `Uskoro` — shop/loyalty API dolazi u `PREMIUM-02`.

---

## 2. Odluke

| Odluka | Razlog |
|--------|--------|
| Static ISR 60s, bez `GET /loyalty`/`/shop` | `backend` nema `loyalty`/`shop` module još — S mora biti mali i ne lomiti API ugovor; placeholder je dovoljan za premium preview |
| `premium` Card `rounded-2xl shadow-premium` kao DASH-01 | Konzistentan Design System, `token-check 327/327` ostaje |
| Paralelno sa SEC-03 | Korisnik `parallel` — SEC-03 (vite 8.4.0) i PREMIUM (fan zona) su nezavisni, oba S |

---

## 3. Izmjene

| Commit | Poruka |
|--------|--------|
| `P-PREMIUM-01` | `feat(frontend-next): P-PREMIUM-01 premium fan zona` |

Diff: `+1` fajl, `frontend-next 59→60`, `PREMIUM-01` 1 red.

---

## 4. Testovi

| Test | Rezultat |
|------|----------|
| `inventory` | `2555/2555` (`frontend-next:60`) |
| `build` | `✓ 30/30` `○ /premium 0 B 116kB 1m` `shared 123kB` `vite 8.4.0` |
| `check:all` | `10/10 OK` (`premium 56 <200`) |

---

## 5. Verifikacija

- [x] `/premium` ISR 60s renderuje 3 premium Carda, `Uskoro` badge
- [x] `build 30/30` (29→30, +premium)
- [x] `inventory 2555/2555` `check:all 10/10`

Status: ZATVOREN

---

## 6. Sljedeći korak

- `P-PREMIUM-02` — `loyalty` API + `shop` narudžba (4 sedmice)
- `P-SEC-04` — `next 16.4.6 + zod 4.6.6 + sharp 0.35.5` batch (nakon `tsc` fix)

Paralelno: SEC-03 i PREMIUM-01 su zatvoreni isti dan.
