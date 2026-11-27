# Segment DASH-04 — Komentator 2 (live + matches)

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (2026-11-27) |
| **Paket** | P-DASH-04 |
| **Veličina** | S (1 fajl, 104 LOC) |
| **Rizik** | Low — live.manage/matches.manage read + start |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `73c00bb` → `P-DASH-04` |
| **CI** | `inventory 2554/2554`, `build 27 rute *, check:all 10/10` |

---

## 1. Opseg

Komentator 2 (`live.manage` `matches.manage` — Speaker volonter, vodi semafor).

**Fajl:** `frontend-next/app/admin/live/page.tsx` 104 — `GET /matches` (public) list 6 utakmica, `POST /live/matches/:id/start` (`live.manage`), `Postava` placeholder (`matches.manage`).

---

## 2. Odluke

| Odluka | Razlog |
|--------|--------|
| `GET /matches` public (bez auth) | Matches su public kao i `/liga`; live feed je public, samo `POST` treba auth |
| `live.manage` guard na `Start` dugmetu | Komentator jedini smije startati; Moderator/Administrator također imaju `live.manage` pa vide isto |
| Limit 6 matches `slice(0,6)` | S — ne paginacija, dovoljno za preview; puni `LivePending` je Moderator |

---

## 3. Izmjene

| Commit | Poruka |
|--------|--------|
| `P-DASH-04` | `feat(frontend-next): P-DASH-04 Komentator 2 — live semafor` |

---

## 4. Testovi

| Test | Rezultat |
|------|----------|
| `build` | `✓ 27 rute` `○ /admin/live 6.34kB` |
| `check:all` | `10/10 OK` (`live 103 <200`) |

---

## 5. Verifikacija

- [x] `GET /matches` → lista, `POST /live/matches/:id/start` s `Authorization` headerom, 401 bez `live.manage`
- [x] Nav `/admin/live` vidljiv za Komentator (2) i Moderator (27) i Administrator (40)

Status: ZATVOREN
