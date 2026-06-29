# HANDOFF — FK Gračanica

> Ažurirano: **2026-06-29** (Web Complete #1–#13 APPROVED, #14 READY_FOR_REVIEW)

---

## 1. Meta

| Polje | Vrijednost |
|-------|------------|
| **Aktivna faza** | Web Complete — Track 3 admin moduli |
| **Plan folder** | `.cursor/plans/fk-gracanica/21_web-complete/` |
| **Session handoff** | [21_web-complete/HANDOFF.md](./21_web-complete/HANDOFF.md) |
| **Gate log** | [21_web-complete/GATE_LOG.md](./21_web-complete/GATE_LOG.md) |
| **Branch** | `main` @ `be03774` (uncommitted work — vidi session HANDOFF §11) |

---

## 2. Status u jednoj rečenici

**#1–#13 APPROVED**; **#14 Ulaznice READY_FOR_REVIEW** (postavke, Stripe online, unified auth, članstvo online + auto-aktivacija). Sljedeće: smoke test → APPROVED → **#15 Kontakt**.

---

## 3. Gate (Track 3)

| Modul | Status |
|-------|--------|
| 1–12 | APPROVED |
| 13 Članstvo | APPROVED (+ online join/pending UX u kodu) |
| 14 Ulaznice | READY_FOR_REVIEW |
| 15+ | Nije gate-ovan |

**Izvor istine:** [21_web-complete/GATE_LOG.md](./21_web-complete/GATE_LOG.md)

---

## 4. Produkcija / deploy

| Resurs | URL |
|--------|-----|
| Web | https://fkgracanica.ba101.top |
| API | https://fkgracanica.ba101.top/backend/api/v1 |
| Swagger | https://fkgracanica.ba101.top/backend/api/docs |
| Socket | `wss://fkgracanica.ba101.top/realtime` |

```bash
./scripts/docker-prod-build.sh && docker compose up -d
cd backend && npx prisma migrate deploy && npx prisma generate
```

---

## 5. Nova sesija — start ovdje

1. Pročitaj [21_web-complete/HANDOFF.md](./21_web-complete/HANDOFF.md) (§12 copy-paste prompt)
2. Smoke #14 (ulaznice + članstvo Stripe + auth)
3. Korisnik **APPROVED** u GATE_LOG → **#15 Kontakt**

---

## 6. Reference

- [aplikacijski-plan.md](../../aplikacijski-plan.md)
- [21_web-complete/03_track-admin-modules.md](./21_web-complete/03_track-admin-modules.md)
- Matrice: `.cursor/docs/matrices/*/MATRIX.md`
