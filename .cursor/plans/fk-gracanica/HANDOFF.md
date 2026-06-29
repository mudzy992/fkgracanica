# HANDOFF — FK Gračanica

> Ažurirano: **2026-06-29** (Web Complete #1–#14 APPROVED, #15 READY_FOR_REVIEW)

---

## 1. Meta

| Polje | Vrijednost |
|-------|------------|
| **Aktivna faza** | Web Complete — Track 3 admin moduli |
| **Plan folder** | `.cursor/plans/fk-gracanica/21_web-complete/` |
| **Session handoff** | [21_web-complete/HANDOFF.md](./21_web-complete/HANDOFF.md) |
| **Gate log** | [21_web-complete/GATE_LOG.md](./21_web-complete/GATE_LOG.md) |
| **Branch** | `main` @ `be03774` (uncommitted work — vidi session HANDOFF §12) |

---

## 2. Status u jednoj rečenici

**#1–#14 APPROVED** (ulaznice, Stripe, unified auth, članstvo online, multi-provider plaćanje, Moj račun ulaznice). **#15 Kontakt READY_FOR_REVIEW**. Sljedeće: smoke Kontakt → APPROVED → **#16 Newsletter**. **Commit + Docker rebuild** prije produkcije.

---

## 3. Gate (Track 3)

| Modul | Status |
|-------|--------|
| 1–12 | APPROVED |
| 13 Članstvo | APPROVED |
| 14 Ulaznice | APPROVED |
| 15 Kontakt | READY_FOR_REVIEW |
| 16+ | Nije gate-ovan |

**Izvor istine:** [21_web-complete/GATE_LOG.md](./21_web-complete/GATE_LOG.md)

---

## 4. Produkcija / deploy

| Resurs | URL |
|--------|-----|
| Javni web | https://fkgracanica.ba |
| API | https://fkgracanica.ba/backend/api/v1 |
| Admin | https://fkgracanica.ba/admin |

```bash
./scripts/docker-prod-build.sh && docker compose up -d
cd backend && npx prisma migrate deploy
```

**⚠️** Veliki uncommitted diff — deploy bez commita = stari image bez payments modula.

---

## 5. Sljedeći koraci

1. Smoke #15 Kontakt (forma + admin inbox)
2. Korisnik APPROVED u GATE_LOG
3. `git commit` cijelog Web Complete diffa
4. Docker rebuild + migrate
5. #16 Newsletter

Detalji: [21_web-complete/HANDOFF.md](./21_web-complete/HANDOFF.md)
