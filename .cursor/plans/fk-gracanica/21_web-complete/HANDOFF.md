# HANDOFF — Web Complete (nova sesija)

> **Datum:** 2026-06-25  
> **Završeno:** Gate moduli 1–7 APPROVED  
> **Sljedeći fokus:** Gate review **#8 Igrači + #9 Klubovi** (zajedno)  
> **Mobile:** na pauzi — samo web + backend.

---

## 1. Prvo pročitaj (agent)

1. [GATE_LOG.md](./GATE_LOG.md)
2. [03_track-admin-modules.md](./03_track-admin-modules.md)
3. [../HANDOFF.md](../HANDOFF.md) — deploy, env
4. Korisnikova poruka — gate status po modulu

---

## 2. Gate status

| # | Modul | Status |
|---|-------|--------|
| 1 | Vijesti | **APPROVED** |
| 2 | Media | **APPROVED** |
| 3 | CMS | **APPROVED** |
| 4 | Galerija | **APPROVED** |
| 5 | Sponzori | **APPROVED** |
| 6 | Trofeji | **APPROVED** |
| 7 | Club Timeline | **APPROVED** |
| 8 | **Igrači** | **READY_FOR_REVIEW** |
| 9 | **Klubovi** | **READY_FOR_REVIEW** |
| 10+ | Takmičenja → Dashboard | nije gate-ovan |

---

## 3. Zadnji fix (Igrači + Klubovi)

- `GET /clubs/own` — javni endpoint za naš klub
- `useOwnClub()` hook
- `ClubProfileHero` — `/o-klubu` i `/tim` (grb, opis, grad, stadion)
- `ClubCrest` — grbovi na match centru
- Igrači filtrirani po `ownClub.id` na `/tim` i CMS widgetu
- Admin igrači: odabir kluba (`EntitySelect`), kolona Klub
- Admin klubovi: RBAC, opis, grb preview, jedan `isOwnClub`
- Backend: auto `clubId` na create igrača ako nije zadan

---

## 4. Igrači (#8) — READY_FOR_REVIEW

Checklist (gate):

- [x] Admin CRUD + Media picker + bio + `isActive` + **clubId**
- [x] RBAC (`players.manage`)
- [x] Javno `/tim` — formacija + kadar po pozicijama (GK/DEF/MID/FWD), **filter own club**
- [x] CMS `featured-players` widget + `viewAllUrl`, **own club filter**
- [x] API `GET /players?activeOnly=true&clubId=`
- [x] Demo seed (13 igrača, FK Gračanica)

| Resurs | Putanja |
|--------|---------|
| Admin | `/admin/players` |
| Javno | `/tim` |

---

## 5. Klubovi (#9) — READY_FOR_REVIEW

Checklist (gate):

- [x] Admin CRUD (`/admin/clubs`) — grb, opis, `isOwnClub` (jedan aktivan)
- [x] RBAC (`clubs.manage`) na admin akcijama
- [x] Javni prikaz: `ClubProfileHero` na `/o-klubu`, grbovi na utakmicama
- [x] API `GET /clubs/own`
- [x] Demo seed (FK Gračanica + FK Slavija u `clubs-competition`)

| Resurs | Putanja |
|--------|---------|
| Admin | `/admin/clubs` |
| Javno | `/o-klubu` (hero), `/tim` (hero), utakmice (grb) |

### Ključni fajlovi

| Područje | Putanja |
|----------|---------|
| Admin | `ClubsAdminPage.tsx`, `ClubsAdminFormSheet.tsx` |
| Javno | `ClubProfileHero.tsx`, `ClubCrest.tsx` |
| API | `backend/src/clubs/*` |
| Utils | `lib/club-utils.ts` |

---

## 6. Deploy

```bash
./scripts/docker-prod-build.sh && docker compose up -d
cd backend && npx prisma migrate deploy
```

---

## 7. Prompt za korisnika (copy-paste)

```
Nastavi Web Complete plan iz HANDOFF-a:
@.cursor/plans/fk-gracanica/21_web-complete/HANDOFF.md

Gate status:
- Vijesti: APPROVED
- Media: APPROVED
- CMS: APPROVED
- Galerija: APPROVED
- Sponzori: APPROVED
- Trofeji: APPROVED
- Club Timeline: APPROVED
- Igrači: [APPROVED / REVISE / nisam testirao]
- Klubovi: [APPROVED / REVISE / nisam testirao]

Nastavi po planu od modula koji nije APPROVED.
```

---

## 8. Pravila

- Max ~200 linija po fajlu
- Gate APPROVED samo uz korisnikovu potvrdu
- Mobile ne dirati
