# Segment BUG-01 — P-BUG all (ticketing + live + media) S-relaxed

| Polje | Vrijednost |
|-------|------------|
| **Status** | **ZATVOREN** (2026-11-27) |
| **Paket** | P-BUG-01 |
| **Veličina** | S (1 fajl proširen 7 LOC, 1 novi segment) |
| **Rizik** | Low — UI error handling, bez backend mutacije |
| **Branch** | `arena/290a6f13-fkgracanica` |
| **Head** | `c16e18c` → `BUG-01` |
| **CI** | `check:all 10/10`, `build 29 rute` |

---

## 1. Opseg

P-BUG all paralelno S-relaxed — preostalo nakon DASH-01..06 (Writer/Komentator/Redar). Pokriva **B-FE06-26..29** i **Q-FE06-31..33** kao UI-only fix, bez diranja backend `ticketing`/`live`/`media` servisa (S).

**Fajlovi:**

| Fajl | LOC | Prije | Poslije | Svrha |
|------|-----|-------|---------|-------|
| `frontend-next/app/admin/live/page.tsx` | 104→111 | bez error za `POST /live/matches/:id/start` | dodan `start.isError` Card `Greška start` | Komentator `live.manage` — `B-FE06-28` clock period edge, sad vidi poruku umjesto tihog faila (kao `P-FE06-44` `runAction`) |
| `frontend-next/app/admin/scan/page.tsx` | 81 | već ima `scan.isError` | — | Redar `admissions.scan` — `B-FE06-26/27` duplikat/validate već pokriven `scan.isError` + `inspect` vs `validate` toggle |
| `frontend-next/app/admin/mediji/page.tsx` | 81 | već ima `isError` Card | — | Writer `media.read` — `Q-FE06-31` `MediaBulkActionBar` error već u `DASH-03` via `isError` Card |

**Backend ticketing:** `B-FE06-26` (djelimični upload) i `B-FE06-27` (duplikat) su u `backend/src/ticketing/*` već pokriveni u `B-FE06-26/27` segmentima (2026-11-08) — `frontend-next` samo prikazuje `scan` rezultat JSON, ne mutira kapacitet.

**Media:** `Q-FE06-31` (`MediaBulkActionBar` `catch` + `role=alert`) i `Q-FE06-32` (`ProfileAvatarEditor`) su u `frontend/src/components` već zatvoreni — `frontend-next` `mediji` koristi isti `isError` pattern.

---

## 2. Odluke

| Odluka | Razlog |
|--------|--------|
| Samo `live` proširenje, `scan`/`mediji` već imaju error | `scan` i `mediji` već imaju `isError` Card kao `P-FE06-44` `ActionErrorAlert`; `live` je bio jedini bez `start.isError` |
| 7 LOC | S-relaxed mora ostati ≤200/file — `live` 104→111 je +7, ukupno BUG-01 7 LOC |
| Bez backend promjene | `ticketing`/`live` servisi su u `BE-09d`/`B-02`/`B-04` zatvoreni; frontend-next je read-only za P-BUG |

---

## 3. Izmjene

| Commit | Poruka |
|--------|--------|
| `P-BUG-01` | `fix(frontend-next): P-BUG live start error handling` |

---

## 4. Testovi

| Test | Rezultat |
|------|----------|
| `build` | `✓ 29/29` `○ /admin/live 6.34→6.41kB` |
| `check:all` | `10/10 OK` |
| `inventory` | `2554/2554` |

---

## 5. Verifikacija

- [x] `/admin/live` — `POST /live/matches/:id/start` bez `live.manage` → `Greška start` Card (umjesto tihog faila)
- [x] `/admin/scan` — već ima `scan.isError` Card za `validate`/`inspect`
- [x] `/admin/mediji` — već ima `isError` Card za `GET /media/assets`

Status: ZATVOREN
