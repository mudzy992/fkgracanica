# HANDOFF — Web Complete

> **Datum:** 2026-06-26  
> **Sesija:** Live TV polish + autogol + statistike + YouTube safe player + komentator UX  
> **Gate:** Segmenti **#1–#12 APPROVED** (korisnik potvrdio)  
> **Sljedeći fokus:** **#13 Članstvo**  
> **Mobile:** na pauzi — samo web + backend.

---

## 1. Prvo pročitaj (agent)

1. [GATE_LOG.md](./GATE_LOG.md)
2. [03_track-admin-modules.md](./03_track-admin-modules.md)
3. [.cursor/docs/matrices/live_center/MATRIX.md](../../../docs/matrices/live_center/MATRIX.md)
4. [../HANDOFF.md](../HANDOFF.md) — deploy, env, produkcija

---

## 2. Gate status (ukupno)

| # | Modul | Status |
|---|-------|--------|
| 1–7 | Vijesti → Club Timeline | **APPROVED** |
| 8 | Klub & kadar | **APPROVED** |
| 9–11 | Klubovi / Takmičenja / Utakmice (hub) | **APPROVED** |
| 12 | Live | **APPROVED** |
| 13 | Članstvo | **nije gate-ovan** — sljedeći |
| 14–21 | Ulaznice → Dashboard | nije gate-ovan |

---

## 3. Urađeno u zadnjim sesijama (Live #12 — final polish)

### 3.1 TV semafor (`/live/:id` broadcast)

- Kompaktan semafor **gore lijevo**; puni nazivi klubova; minuta **ispod** rezultata; bijeli tekst
- Klik na semafor → expand/collapse (bez dugmeta Detalji)
- `Club.shortName` + admin polje (Kratko ime) — fallback na skraćeni naziv
- Poluvrijeme: isti **pre-match audio** (`live.prematchAudioUrl`) u `LiveHalftimePanel`

### 3.2 Premium statistike (povremeni popup)

- `LiveStatsComparisonCard` — korneri, udarci u okvir, prekršaji, zaleđa, kartoni
- `LiveStatsPlayerListCard` — golovi + žuti/crveni kartoni (igrač + minuta po klubu)
- Rotacija: prvi prikaz 45–90s, vidljivo 8–12s, pauza 2–4 min

### 3.3 Autogol (OWN_GOAL)

- Komentator: **Više događaja → Autogol** (obavezan igrač)
- Rezultat protivniku (`live-score.util` — već postojalo)
- Toast, TV statistike, `PlayerStatistics.ownGoals`, match player stats kolona **AG**
- Migracija: `20260626220000_player_own_goals`

### 3.4 YouTube stream

- Keep-alive kroz poluvrijeme (mute/pause, bez destroy)
- Minimalan `useYouTubeStreamPlayer` — **bez** quality hackova (kvaliteta ovisi o YouTube stream postavkama)
- Korisnik potvrdio: loša rezolucija bila **ograničenje izvora**, ne app bug

### 3.5 Komentator UX

- **Završi** dugmad vidljiva na tamnoj traci (`danger` / bijeli outline)

### 3.6 Ranije u istom ciklusu (već APPROVED uz Live)

- Lock FINISHED utakmice; report editor; asistencije (bez VAR)
- Lineup iz klupske postave; pre-match shell; league GR; scheduled highlight
- `roundId` fix u match update; pitch avatar rotate na vertikalnoj skici

---

## 4. Migracije (deploy obavezno)

```bash
cd backend && npx prisma migrate deploy && npx prisma generate
```

| Migracija | Sadržaj |
|-----------|---------|
| `20260626140000_match_lineup_club` | `MatchLineup.clubId` |
| `20260626180000_match_live_clock` | sat, nadoknada, `liveStreamUrl` |
| `20260626210000_club_short_name` | `Club.shortName` |
| `20260626220000_player_own_goals` | `PlayerStatistics.ownGoals` |

---

## 5. Ključni fajlovi (Live)

| Područje | Putanja |
|----------|---------|
| Broadcast shell | `frontend/src/components/live/LiveStreamBroadcast.tsx` |
| Semafor | `LiveScoreboardCompact.tsx`, `LiveScoreboardExpanded.tsx`, `LiveScoreboardOverlay.tsx` |
| Statistike | `live-stats-feed.ts`, `LiveStatsCorner.tsx`, `LiveStats*Card.tsx` |
| Stream player | `use-youtube-stream-player.ts`, `LiveYouTubePlayer.tsx` |
| Komentator | `frontend/src/pages/admin/commentator/*` |
| Autogol stats | `backend/src/statistics/match-stats.util.ts` |
| Live backend | `backend/src/live/*` |

---

## 6. Opcionalni Live backlog (ne blokira #13)

- [ ] Server-side `match:clock` tick svake minute
- [ ] `live_center/MATRIX.md` — ažurirati state machine + CHANGELOG
- [ ] E2E: stoppage, stream, autogol
- [ ] Mobilni live (Expo) — na pauzi

---

## 7. Sljedeći segmenti (plan #13–#21)

Redoslijed iz [03_track-admin-modules.md](./03_track-admin-modules.md):

| # | Segment | Stanje u kodu | Predloženi scope sljedeće sesije |
|---|---------|---------------|----------------------------------|
| **13** | **Članstvo** | Backend `membership/*` postoji; **nema admin UI** | Admin CRUD (PENDING/ACTIVE/…), javna `/clanstvo`, RBAC `membership.manage`, gate |
| 14 | Ulaznice | Backend ticketing djelimično (P19 Done) | Admin narudžbe, QR, kapacitet — uskladiti s planom |
| 15 | Kontakt | Provjeri postojeće | Forma + admin inbox ako nedostaje |
| 16 | Newsletter | Provjeri postojeće | Pretplate admin + javni signup |
| 17 | Hall of Fame | — | CRUD + javni prikaz |
| 18 | Muzej | — | CRUD + galerija/eksponati |
| 19 | Korisnici + Role | Admin djelimično | RBAC matrix, invite, reset |
| 20 | Postavke | Settings contract postoji | Polish opisi, javne/privatne grupe |
| 21 | Audit + Notifikacije + Dashboard | Djelimično | Dashboard widgeti, audit log UI |

**Preporuka:** Krenuti **#13 Članstvo** end-to-end (admin + public + gate) prije Ulaznica jer dijele domen.

---

## 8. Deploy

```bash
./scripts/docker-prod-build.sh && docker compose up -d
cd backend && npx prisma migrate deploy
```

---

## 9. Prompt za sljedeću sesiju (copy-paste)

```
Nastavi Web Complete iz HANDOFF-a:
@.cursor/plans/fk-gracanica/21_web-complete/HANDOFF.md

Gate: #1–#12 APPROVED. Sljedeći segment: #13 Članstvo.

Pročitaj GATE_LOG + 03_track-admin-modules.md.
Backend membership modul već postoji — treba admin UI + javna stranica + gate.

[Odaberi:]
A) #13 Članstvo — full implementacija + gate checklist
B) #14 Ulaznice — nastavak ticketing admina
C) Live backlog (MATRIX, server clock tick)
```
