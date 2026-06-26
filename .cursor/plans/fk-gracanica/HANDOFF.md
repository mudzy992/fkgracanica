# HANDOFF — FK Gračanica

> Ažurirano: **2026-06-26** (Responsive + Premium Web redizajn)

---

## 1. Meta

| Polje | Vrijednost |
|-------|------------|
| **Branch** | `main` (lokalno mnogo uncommitted promjena) |
| **Zadnji commit (origin)** | `48b119c` — production roadmap P1–P8 |
| **Aktivna faza** | **Responsive + Premium Web** (Track 23) |
| **Plan folder** | `.cursor/plans/fk-gracanica/23_responsive-premium-web/` |
| **Session handoff** | [23_responsive-premium-web/HANDOFF.md](./23_responsive-premium-web/HANDOFF.md) |
| **Paralelno** | Web Complete Track 3 — [21_web-complete/HANDOFF.md](./21_web-complete/HANDOFF.md) |

---

## 2. Status u jednoj rečenici

Track 1–3 implementiran lokalno; **Vijesti** i **Media** su `READY_FOR_REVIEW` u GATE_LOG — korisnik nije mogao testirati zbog `t?.find is not a function` (fix u `as-array.ts`, build prolazi); **čeka se redeploy + korisnikov APPROVED** prije CMS modula.

---

## 3. Gate (Track 3) — trenutno stanje

| Modul | Status | Napomena |
|-------|--------|----------|
| Vijesti | `READY_FOR_REVIEW` | Fix deployan lokalno, nije potvrđen od korisnika |
| Media | `READY_FOR_REVIEW` | Isto |
| CMS → Dashboard | — | **Blokirano** dok Vijesti + Media nisu `APPROVED` |

**Izvor istine:** [21_web-complete/GATE_LOG.md](./21_web-complete/GATE_LOG.md)

**Nova sesija:** Pročitaj `21_web-complete/HANDOFF.md` + korisnikovu poruku sa `APPROVED`/`REVISE`.

---

## 4. Produkcija / deploy

| Resurs | URL |
|--------|-----|
| Web | https://fkgracanica.ba101.top |
| API | https://fkgracanica.ba101.top/backend/api/v1 |
| Swagger | https://fkgracanica.ba101.top/backend/api/docs |
| Health | https://fkgracanica.ba101.top/backend/api/v1/health |
| Socket | `wss://fkgracanica.ba101.top/realtime` |

```bash
./scripts/setup-upload-dir.sh
./scripts/sync-docker-locks.sh          # nakon novih npm deps (TipTap)
./scripts/docker-prod-build.sh && docker compose up -d
cd backend && npx prisma migrate deploy # 20260625065200_news_extended
```

---

## 5. Env

- Root `.env` (ignoriran u gitu)
- Kritično: `DATABASE_URL`, `JWT_*`, `REDIS_URL`, `UPLOAD_PATH`, `VITE_API_URL`, `ADMIN_*`
- `SOCKET_IO_PATH=/socket.io` u kontejneru

---

## 6. Pokretanje (dev)

```bash
npm run dev:backend    # :3000
npm run dev:frontend   # :5173
cd backend && npm test && npm run test:e2e
cd frontend && npm run build
```

**Mobile:** na pauzi.

---

## 7. Zadnji bugfix (2026-06-25)

**Simptom:** `Uncaught TypeError: t?.find is not a function` — blokirao `/admin/news` i `/admin/media`.

**Uzrok:** Paginirani API odgovori `{ data, meta }` tretirani kao niz.

**Fix:** `frontend/src/lib/as-array.ts` + primjena u hookovima/komponentama (news, media, cms, EntitySelect, MediaPicker).

---

## 8. Sljedeći koraci (nova sesija)

1. Redeploy frontend (ako korisnik nije) — novi bundle mora zamijeniti stari `index-D2mw8J00.js`
2. Korisnik testira Vijesti → `APPROVED` ili `REVISE` u GATE_LOG
3. Korisnik testira Media → `APPROVED` ili `REVISE`
4. Tek onda **modul 3: CMS** gate review ([03_track-admin-modules.md](./21_web-complete/03_track-admin-modules.md))
5. Redom: Galerija → Sponzori → … → Dashboard (21 modula)

---

## 9. API ugovori

**Paginacija:** `GET …?page=1&limit=20&search=` → `{ data, meta: { total, page, limit, totalPages } }`

**Liste bez paginacije:** plain niz (npr. `/news-categories`, `/cms/blocks`)

**Frontend:** koristi `asArray()` kad endpoint može vratiti oba formata.

---

## 10. Reference

- [21_web-complete/HANDOFF.md](./21_web-complete/HANDOFF.md) — **start ovdje u novoj sesiji**
- [21_web-complete/GATE_LOG.md](./21_web-complete/GATE_LOG.md)
- [21_web-complete/03_track-admin-modules.md](./21_web-complete/03_track-admin-modules.md)
- [aplikacijski-plan.md](../../../aplikacijski-plan.md)
- Matrice: `.cursor/docs/matrices/{rbac,ticketing,membership,live_center}/`
