# HANDOFF — FK Gračanica

> Ažurirano: **2026-08-17**

---

## 1. Meta

| Polje | Vrijednost |
|-------|------------|
| **Datum** | 2026-08-17 |
| **Branch** | `main` |
| **Aktivni track** | [34_mobile-to-100](./34_mobile-to-100/HANDOFF.md) — leftover public + P2 |
| **Prethodno** | Track 30 League/Clubs max; 32 web 100%; 33 after_launch 1–8 |
| **Matrica** | `.cursor/docs/matrices/showcase-audit/` |
| **Canvas** | Cursor canvas `mobile-completeness` (lokalno, nije u gitu) |

---

## 2. Status u jednoj rečenici

Web/admin 100%. Mobile P0+P1 + gallery pager / heritage UX / live socket. Sljedeći: leftover public + P2 staff.

---

## 3. Produkcija

| Resurs | Vrijednost |
|--------|------------|
| Web | https://fkgracanica.ba101.top |
| Preview | https://fkgracanica.ba101.top/platforma |
| API | https://fkgracanica.ba101.top/backend/api/v1 |
| Swagger | https://fkgracanica.ba101.top/backend/api/docs |
| Health | https://fkgracanica.ba101.top/backend/api/v1/health |

Flag `feature.showcaseMode` default OFF.

---

## 4. Sljedeći koraci

1. **Track 34 leftover** — login, tickets-buy, contact, tickets-browse.
2. **P2 staff** — dashboard, gallery-manage, orders, list images.
3. **P04** — Stripe na `tickets-buy`; Play Store (33 faza 9).
4. Canvas % ručno.

---

## 5. Pokretanje

```bash
./scripts/menu.sh   # 1 = rebuild docker
# ili
./scripts/docker-prod-build.sh && docker compose up -d
```

---

## 6. Pravila

- Fajlovi ≤200 linija (config do 400)
- Logika → MATRIX + CHANGELOG
- `npm ci` u Dockeru = `frontend/package-lock.json`
- Ne dirati mobile showcase intercept u `_layout.tsx`
- Bez commita osim na zahtjev
