# HANDOFF — FK Gračanica

> Ažurirano: **2026-06-26** (Web Complete gate #1–#12 APPROVED)

---

## 1. Meta

| Polje | Vrijednost |
|-------|------------|
| **Aktivna faza** | **Web Complete** — Track 3 admin moduli |
| **Plan folder** | `.cursor/plans/fk-gracanica/21_web-complete/` |
| **Session handoff** | [21_web-complete/HANDOFF.md](./21_web-complete/HANDOFF.md) |
| **Gate log** | [21_web-complete/GATE_LOG.md](./21_web-complete/GATE_LOG.md) |
| **Paralelno (završeno / APPROVED)** | [24_public-identity-refactor/](./24_public-identity-refactor/), [23_responsive-premium-web/](./23_responsive-premium-web/) |

---

## 2. Status u jednoj rečenici

Admin moduli **#1–#12 su APPROVED** (uključujući unified competition hub i Live TV). Sljedeći segment po planu: **#13 Članstvo**.

---

## 3. Gate (Track 3)

| Modul | Status |
|-------|--------|
| 1–8 | APPROVED |
| 9–11 | APPROVED (Takmičenja hub) |
| 12 Live | APPROVED |
| 13+ | Nije gate-ovan |

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

1. Pročitaj [21_web-complete/HANDOFF.md](./21_web-complete/HANDOFF.md)
2. Korisnik bira: **#13 Članstvo** (preporučeno) ili #14 Ulaznice
3. Po završetku modula → `READY_FOR_REVIEW` u GATE_LOG → korisnik **APPROVED**

---

## 6. Reference

- [aplikacijski-plan.md](../../aplikacijski-plan.md)
- [21_web-complete/03_track-admin-modules.md](./21_web-complete/03_track-admin-modules.md)
- Matrice: `.cursor/docs/matrices/*/MATRIX.md`
