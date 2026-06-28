# HANDOFF — Web Complete

> **Datum:** 2026-06-26  
> **Sesija:** Takmičenja hub + statistika utakmice + Live (sat, broadcast, komentator v2)  
> **Sljedeći fokus:** Gate review ili **#13 Članstvo**  
> **Mobile:** na pauzi — samo web + backend.

---

## 1. Prvo pročitaj (agent)

1. [GATE_LOG.md](./GATE_LOG.md)
2. [03_track-admin-modules.md](./03_track-admin-modules.md)
3. [.cursor/docs/matrices/live_center/MATRIX.md](../../../docs/matrices/live_center/MATRIX.md)
4. [../HANDOFF.md](../HANDOFF.md) — deploy, env

---

## 2. Korisnička odluka (gate)

**Ništa na čekanju ne ide na APPROVED** dok se ne završe zavisni segmenti.

| Modul | Status | Napomena |
|-------|--------|----------|
| Takmičenja / Kola / Utakmice (unified hub) | `READY_FOR_REVIEW` | Čeka gate nakon Live stabilizacije |
| Live | `READY_FOR_REVIEW` | Funkcionalno gotovo; smoke test na produkciji |
| Sljedeći po planu | **#13 Članstvo** | Nakon gate-a ili paralelno po dogovoru |

---

## 3. Gate status (ukupno)

| # | Modul | Status |
|---|-------|--------|
| 1–7 | Vijesti → Club Timeline | **APPROVED** |
| 8 | Klub & kadar (unified) | **APPROVED** |
| 10–11 | Takmičenja + unified hub | **READY_FOR_REVIEW** |
| 12 | Live | **READY_FOR_REVIEW** |
| 13+ | Članstvo → Dashboard | nije gate-ovan |

---

## 4. Šta je urađeno u ovoj sesiji

### 4.1 Unified hub (Takmičenja → Sezona → Kolo → Utakmice)

- Jedan admin meni: `/admin/competitions`
- Season hub: `/admin/competitions/seasons/:seasonId`
- Postava utakmice **domaći + gosti** (`MatchLineup.clubId`)
- Redirect: `/admin/rounds`, `/admin/matches` → competitions
- Javno: postave po klubovima na `/utakmice/:id`

### 4.2 Statistika utakmice (javno)

- `GET /statistics/matches/:id/overview` — timska + igračka statistika iz događaja
- `MatchStatisticsSection` na `/utakmice/:id`
- Sync `TeamStatistics` pri odobrenju izvještaja

### 4.3 Live modul (#12)

**Backend**

- `live.service.ts` — start/end/halftime/resume, događaji, komentari, odobrenje
- `live-clock.util.ts` — automatski sat, nadoknada `46 (+6)` format
- Polja na `Match`: `clockStartedAt`, `matchPeriod`, `stoppageFirstHalf/SecondHalf`, `liveStreamUrl`
- `MatchEvent.relatedPlayerId` — izmjene (out → in)
- Endpoints: `POST .../stoppage`, `PATCH .../stream`, `GET /live/pending`
- Socket: `match:clock`, `match:event`, `match:comment`, `match:score`, `match:status`
- Safe realtime emit (ne ruši API ako socket nije spreman)
- `live.manage` dodan Moderator roli u seedu

**Admin komentator** (`/admin/live/:id`, RBAC `live.manage`)

- Automatski sat + unos sudijske nadoknade nakon 45′/90′
- Dvije kolone po timu (gol, kartoni, penali, više događaja)
- Izmjena: igrač izlazi / ulazi
- YouTube live stream URL
- Live dugme u competition hubu
- `/admin/live/pending` — odobrenje izvještaja (`live.approve`)

**Javno** (`/live/:id`)

- Fullscreen broadcast kad ima `liveStreamUrl` + LIVE/HALFTIME
- Scoreboard overlay (rezultat, minuta, grbovi)
- Event toast ~12s (gol, karton, izmjena, nadoknada)
- Sekcija „Uživo” na `/liga`
- Link „Live prikaz” uvijek na `/utakmice/:id`

---

## 5. Migracije (obavezno na svakom env)

```bash
cd backend && npx prisma migrate deploy && npx prisma generate
```

| Migracija | Sadržaj |
|-----------|---------|
| `20260626140000_match_lineup_club` | `MatchLineup.clubId` |
| `20260626180000_match_live_clock` | sat, nadoknada, `liveStreamUrl`, `relatedPlayerId` |

RBAC refresh (ako stariji admin nema `live.manage`):

```bash
cd backend && npx prisma db seed
```

---

## 6. Ključni fajlovi

| Područje | Putanja |
|----------|---------|
| Live backend | `backend/src/live/*` |
| Live clock | `backend/src/live/live-clock.util.ts` |
| Komentator UI | `frontend/src/pages/admin/commentator/*` |
| Stream overlay | `frontend/src/components/live/*` |
| Javni live | `frontend/src/pages/public/LiveMatchPage.tsx` |
| Competition hub | `frontend/src/pages/admin/competition-hub/*` |
| Match stats | `backend/src/statistics/match-stats.util.ts` |
| Match stats UI | `frontend/src/components/match/MatchStatisticsSection.tsx` |

---

## 7. Test plan (Live smoke)

1. `/admin/competitions` → sezona → kolo → **Live** na utakmici
2. **Započni** → sat teče; dodaj gol po timu (lijevo/desno)
3. Na 45′+ → unesi nadoknadu (+N) → feed + prikaz `46 (+N)`
4. Poluvrijeme → Nastavi 2. pol. → sat nastavlja od 46′
5. Zalijepi YouTube URL → **Spremi stream** → `/live/:id` fullscreen overlay
6. Završi → `/admin/live/pending` → Odobri → statistika se ažurira

**Napomena:** LIVE/HALFTIME se **ne** postavljaju ručno u formi utakmice — samo preko komentatora.

---

## 8. Poznato / mogući sljedeći polish (Live)

- [ ] Server-side tick emit `match:clock` svake minute (trenutno client-side iz `clockStartedAt`)
- [ ] Zvuk / animacija na gol toastu
- [ ] Mobilni live parity (Expo) — na pauzi
- [ ] E2E proširiti za stoppage + stream
- [ ] `live_center/MATRIX.md` — ažurirati state machine za novi sat

---

## 9. Sljedeći segment: #13 Članstvo

Po [03_track-admin-modules.md](./03_track-admin-modules.md):

- Admin CRUD članstva, statusi (PENDING/ACTIVE/…)
- Javna `/clanstvo` stranica
- RBAC `membership.manage`
- Gate tek kad korisnik potvrdi

---

## 10. Deploy

```bash
./scripts/docker-prod-build.sh && docker compose up -d
cd backend && npx prisma migrate deploy
```

---

## 11. Prompt za sljedeću sesiju (copy-paste)

```
Nastavi Web Complete iz HANDOFF-a:
@.cursor/plans/fk-gracanica/21_web-complete/HANDOFF.md

Gate: Takmičenja hub + Live su READY_FOR_REVIEW — ne APPROVE dok korisnik ne potvrdi.
Zadnji rad: automatski sat, komentator 2 kolone, YouTube broadcast overlay.

[Odaberi jedno:]
A) Smoke test + gate review Live
B) Nastavi #13 Članstvo
C) Polish Live (toast animacije, server clock tick)
```
