# HANDOFF — Klub & kadar (unified modul)

> **Datum:** 2026-06-25  
> **Status:** READY_FOR_REVIEW (build prolazi)  
> **Zamjenjuje:** gate #8 Igrači + #9 Klubovi → jedan modul **Klub & kadar**

---

## 1. Šta je urađeno

### Admin — jedan modul
- Meni: **Klub & kadar** → `/admin/clubs`
- Lista klubova → hub `/admin/clubs/:id?tab=...`
- **Svi klubovi** (naš + protivnici): tabovi Osnovno · Stadion · Igrači · Formacija · Statistike
- Formacija: input ODB/VEZ/NAP, mapiranje igrača, klupa, jedan igrač = jedna pozicija

### Javno
| Ruta | Opis |
|------|------|
| `/tim` | Samo **naš tim** (formacija, klupa, stats) |
| `/klub/:slug` | Profil kluba (info, stadion, default formacija, posljednja postava, kadar, stats) |
| `/igrac/:id` | Profil igrača (bio, klub, sezona + karijera) |

### Formacija na terenu
- Središnja linija na ilustraciji
- Centriranje: 2 igrača → srednja dva slota; **3 igrača → srednji na Y=50% (kao golman)**
- Horizontalni teren (desktop), sync koordinata pri `GET /squad`

### API
```
GET  /clubs/public/:slug
GET  /clubs/:id/squad|stadium|stats
PUT  /clubs/:id/formation|squad|stadium
GET  /players/:id/public
```

### Migracija
`20260625180000_club_squad_stadium` — `Stadium`, `ClubSquadSlot`, `formationDef/Mid/Fwd`

### Build fix (2026-06-25)
- `clubs.module.ts` / `clubs.controller.ts` — import `ClubPublicService`, `ClubStatsService`
- `players.service.ts` — `getPublicProfile` bez nested `season` filtera na `PlayerStatistics`

---

## 2. Gate status (Web Complete)

| Modul | Status |
|-------|--------|
| 1–7 | APPROVED |
| **Klub & kadar** | **READY_FOR_REVIEW** |
| 10+ Takmičenja… | nije gate-ovan |

---

## 3. Deploy

```bash
cd backend && npx prisma migrate deploy
./scripts/docker-prod-build.sh && docker compose up -d
```

---

## 4. Smoke checklist

1. `/admin/clubs` → FK Gračanica + FK Slavija — svi tabovi
2. Formacija 4-4-2 — 3 vezna, srednji u centru terena
3. `/klub/fk-gracanica`, `/klub/fk-slavija`
4. `/tim` — naš klub
5. Klik na igrača → `/igrac/:id` (utakmica, pretraga, liga, vijesti)
6. Posljednja postava na profilu kluba (ako postoji FINISHED utakmica + lineup)

---

## 5. Sljedeća sesija

- Gate **APPROVED** ili **REVISE** za Klub & kadar
- Zatim modul **#10 Takmičenja**
- Opciono: javna lista svih klubova; link klubova iz liga tabele (treba `slug` u standings)

---

## 6. Prompt za korisnika

```
Nastavi Web Complete plan:
@.cursor/plans/fk-gracanica/22_club-squad-module/HANDOFF.md

Gate: Klub & kadar — [APPROVED / REVISE / nisam testirao]
```
