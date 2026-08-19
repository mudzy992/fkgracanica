# HANDOFF — FK Gračanica

> Ažurirano: **2026-08-18** (kraj sesije Track 36 + gate scan)

---

## 1. Meta

| Polje | Vrijednost |
|-------|------------|
| **Datum** | 2026-08-18 |
| **Branch** | `main` @ `e15fd07` (pushed) |
| **Aktivni track** | [36_ops-ticketing-live](./36_ops-ticketing-live/HANDOFF.md) |
| **Uncommitted** | Gate QR lock (ulaz) — vidi Track 36 HANDOFF |
| **Prethodno** | Track 34/35 staff; 36 app release + LIVE |

---

## 2. Status u jednoj rečenici

Track 36 je na `origin/main`. **Gate scan lock nije commitovan** — sljedeća sesija: commit pa test na ulazu.

Detalji, fajlovi, rizici: [36_ops-ticketing-live/HANDOFF.md](./36_ops-ticketing-live/HANDOFF.md).

---

## 3. Produkcija

| Resurs | Vrijednost |
|--------|------------|
| Web | https://fkgracanica.ba101.top |
| API | https://fkgracanica.ba101.top/backend/api/v1 |
| Swagger | https://fkgracanica.ba101.top/backend/api/docs |
| Health | https://fkgracanica.ba101.top/backend/api/v1/health |

---

## 4. Sljedeći koraci

1. Commit/push gate scan (`admission-scan`, inspect, sticky overlay).
2. DB migrate `20260818190000_app_releases_live_notify` ako nije na prod.
3. EAS APK + native rebuild za in-app update.
4. Terenski test ulaza: VALID ostaje dok se ne skenira druga karta.

---

## 5. Pokretanje

```bash
./scripts/menu.sh   # 1 = rebuild docker
npm run dev:backend && npm run dev:frontend && npm run dev:mobile
```

---

## 6. Pravila

- Fajlovi ≤200 linija (config do 400)
- Logika → MATRIX + CHANGELOG
- Ne dirati mobile showcase intercept u `_layout.tsx`
- Bez commita osim na zahtjev
