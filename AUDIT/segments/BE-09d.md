# BE-09d — uklanjanje legacy `Match.round` (backlog P-B09c-11)

> Segment iz backloga **BE-09c** (P-B09c-11), pokrenut na zahtjev korisnika
> 2026-11-04: „možemo detaljno obraditi P-B09c-11". Opseg: `backend/prisma/schema.prisma`
> (`Match.round`), `backend/src/matches/`, `backend/src/rounds/`, `backend/src/statistics/`,
> seed demo utakmica, `frontend/src/lib/**` + `frontend/src/types/**` + `mobile/src/components/league/`.
> Sesija: 2026-11-04.

## 1. Kontekst

`Match` je nekad nosio **skalarni broj kola** (`round Int?`) jer model `Round` nije
postojao. Danas postoji normalizovan `Round` (`roundId` → `Round.number/name`, sa
`@@unique([seasonCompetitionId, number])`), a skalarni `round` je **duplikat** koji se
ručno održava u sinhronizaciji na 4 mjesta u backendu. Rizik: dva izvora istine
(rename/brisanje kola, ručni SQL, stari redovi) → tabela i „kolo" filter lažu.

## 2. Inventar (svi dodiri)

| # | Fajl / mjesto | Šta radi sa `Match.round` | Tip |
|---|---|---|---|
| 1 | `backend/prisma/schema.prisma:706` | `round Int?` (kolona postoji od `init_postgres`) | **šema** |
| 2 | `backend/src/matches/match-round.util.ts:12,15,30,33,42` | `resolveMatchRoundFields` vraća `{roundId, round}`; `roundToMatchUpdateInput`/`roundToMatchCreateInput` **pišu** `round` uz `roundId` | pisanje |
| 3 | `backend/src/rounds/rounds.service.ts:78-84` | pri promjeni broja kola radi `match.updateMany({ round: data.number })` da drži duplikat u sinhronizaciji | pisanje |
| 4 | `backend/src/rounds/rounds.service.ts:107-131` | `syncLegacyRounds` — lenjo mapira `round` → `Round` red i upisuje `roundId`; poziva se **samo** iz `findBySeason` | backfill |
| 5 | `backend/src/rounds/round.util.ts:5-17` | `resolveRoundNumber`/`matchWithinRoundLimit` — fallback `roundRel?.number ?? round` (koristi `statistics.getStandings(upToRound)`) | čitanje |
| 6 | `backend/prisma/seed/demo/matches.ts:51,66,79,88` | demo utakmice upisuju `round: 12/13` i filtriraju `findFirst` po `round` | pisanje |
| 7 | `backend/src/rounds/round.util.spec.ts:5-13` | testovi testiraju **legacy fallback** | test |
| 8 | `frontend/src/lib/round-utils.ts:6,9,17,22` | `matchRoundNumber`/`matchRoundLabel`/`groupMatchesByRound` — fallback na `match.round` | čitanje |
| 9 | `frontend/src/lib/league-position.util.ts:24` | `maxFinishedRound` — fallback `?? m.round` | čitanje |
| 10 | `frontend/src/lib/ticket-match-meta.ts:6` | `ticketRoundLabel` — fallback `?? match.round` | čitanje |
| 11 | `frontend/src/pages/admin/commentator/CommentatorDeskHeader.tsx:10` | `match.roundRel?.name ?? `Kolo ${match.round}`` | čitanje |
| 12 | `frontend/src/types/index.ts:180`, `frontend/src/types/ticketing.ts:26` | `round?: number \| null` u API tipovima | tipovi |
| 13 | `mobile/src/components/league/map-league-lists.ts:39` | `roundsPlayed` — fallback `item.round ?? 0` | čitanje |
| 14 | API odgovori `Match`-a | `findMany`/`include` vraćaju **sve skalare**, pa `round` ide u JSON prema webu i objavljenoj Android aplikaciji | API ugovor |

Napomena: `ROUND` u `scripts/qa-live-*.mjs|sh` je **broj kola kao parametar**, ne kolona — nije u opsegu.

## 3. Nalazi

| ID | Ozbiljnost | Nalaz |
|----|-----------|-------|
| **B-09d-01** | **Medium (integritet podataka)** | Dva izvora istine za broj kola. `Round.number` je kanonski, ali `Match.round` se i dalje piše (create/update/rename kola/seed) i može odstupiti — npr. ručni SQL, seed sa `SEED_DEMO`, ili utakmica kreirana prije `Round` modela. Tabela i „grupiši po kolu" tada pokazuju različito. |
| **B-09d-02** | **Medium (migracija)** | `syncLegacyRounds` je **lenj** (samo uz `GET /rounds?seasonId=`). Nijedan garantovani korak ne mapira sve redove `round != null, roundId == null` prije uklanjanja kolone → DROP bez backfilla bi **trajno izgubio** broj kola za te utakmice. |
| **B-09d-03** | **Medium (kompatibilnost)** | `round` je danas u JSON-u svake utakmice. Objavljena Android aplikacija ga koristi kao fallback (`map-league-lists.ts:39`); starije verzije u produkciji ne mogu se ažurirati sinhrono sa backendom. Naglo uklanjanje polja iz API-ja mijenja ugovor za klijente na terenu. |
| **B-09d-04** | Low (kod) | 5 fallback mjesta na frontendu/mobilnom (`?? match.round`) postaju mrtav kod nakon uklanjanja kolone; `round.util.spec.ts` testira ponašanje koje prestaje postojati. |
| **B-09d-05** | **High (nepovratnost)** | `DROP COLUMN` je nepovratan. Pending migracija se izvršava automatski pri startu kontejnera (`npx prisma migrate deploy` prije aplikacije), pa nema ručnog „prozorčeta" — potreban backup i guard u samoj migraciji. Već primijenjeni DROP se ne izvršava ponovo. |
| **B-09d-06** | Info ✓ | Zdravo: `Round` ima `@@unique([seasonCompetitionId, number])`; `syncLegacyRounds` je idempotentan (`upsert` + `updateMany`); `onDelete: SetNull` na `roundRel` je eksplicitan. |

## 4. Predlozi (čeka odobrenje)

| ID | Predlog | Šema? | API? | Preporuka |
|----|---------|-------|------|-----------|
| **P-B09d-1** | **Backfill migracija** `…_be09d_backfill_match_round`: za svaki `(seasonCompetitionId, round)` gdje je `round IS NOT NULL AND roundId IS NULL` → `INSERT … INTO "Round"` (ako ne postoji, ime `N. kolo`) → `UPDATE "Match" SET roundId = …`. Idempotentno (upsert preko unique constrainta). | ✅ (data-only) | ne | **DA** |
| **P-B09d-2** | **Guard u migraciji**: prije `DROP COLUMN` provjera `SELECT count(*) FROM "Match" WHERE round IS NOT NULL AND roundId IS NULL` → ako > 0, migracija pada sa jasnom porukom (bolje crven deploy nego tiho izgubljeno kolo). | ✅ | ne | **DA** |
| **P-B09d-3** | **Prestati pisati** skalarni `round`: `match-round.util.ts` vraća samo `roundId`; `rounds.service.update` briše `updateMany({ round })`; seed koristi `roundId` u `findFirst`. Poslije ovoga `round` je „zamrznut" (samo za čitanje). | ne | ne | **DA** |
| **P-B09d-4** | **DROP COLUMN** `Match.round` u odvojenoj migraciji `…_be09d_drop_match_round`, **samo prijavljeno uz backup** i primijenjeno tek nakon backfilla u produkciji. | ✅ **nepovratno** | ne | **DA**, uz backup prije deploya |
| **P-B09d-5** | **API kompatibilnost**: zadržati polje `round` u JSON-u, ali **izvedeno** — `round: roundRel?.number ?? null` u serijalizaciji utakmice (`match-edition.util.ts`/`withSeasonAlias` sloj) i označiti ga kao deprecated u `docs/BACKEND.md`. Starije Android verzije rade nepromijenjeno, izvor istine je jedan. | ne | **polje ostaje** | **DA** (preporuka) |
| **P-B09d-6** | **Čišćenje klijenata**: ukloniti `?? match.round` fallbacke (web: `round-utils`, `league-position.util`, `ticket-match-meta`, `CommentatorDeskHeader`; mobilni: `map-league-lists`), tip `round?` ostaviti kao deprecated (dolazi iz API-ja), prepraviti `round.util.spec.ts` na `roundRel` i dodati test za `P-B09d-5` izvedeno polje. | ne | ne | **DA** |

**Preporuka:** odobriti **P-B09d-1,2,3,5,6** odmah (jedan deploy: backfill + prestanak
pisanja + izvedeno API polje + čišćenje klijenata), pa **P-B09d-4 (DROP)** kao zadnji
korak iste serije, uz **backup baze prije deploya**. Alternativa „sve odjednom" (drop u
istoj migraciji kao backfill) je brža ali nepovratna u istom deployu.

### Varijante koje NE preporučujem
- **Zamrznuti kolonu i ne dirati** — dug ostaje, i dalje dva izvora istine, `syncLegacyRounds` ostaje zauvijek.
- **DROP bez izvedenog API polja** — mijenja ugovor za objavljenu aplikaciju (rizik B-09d-03).

## 5. Plan verifikacije

| Provjera | Kako |
|---|---|
| Backfill tačan | lokalno: `prisma migrate deploy` na praznu bazu + seed sa `SEED_DEMO=1` → `GET /rounds?seasonId=` → sve utakmice imaju `roundId`; SQL guard vraća 0 |
| Guard radi | test baza sa vještački „siročićem" (`round=7, roundId=null`) → migracija pada sa porukom |
| API ugovor nepromijenjen | `npm run test:e2e` + ručni `GET /matches` → polje `round` i dalje prisutno i jednako `roundRel.number` |
| Nema regresije statistike | `standings?upToRound=N` daje isti rezultat kao prije (spec + e2e) |
| Čisto | `npm run lint -w backend`, `tsc --noEmit`, `vitest`/`jest` backend, frontend `tsc -b` + `vitest`, `check:all` 9/9 |

## 6. Napomene o deployu (korisnik, 2026-11-04)

- Sve migracije do sada su **primijenjene**; aplikacija je **live** → novi deploy je
  **redeploy** koji će automatski pokrenuti `prisma migrate deploy` iz `CMD`-a.
- **Obavezan backup** prije deploya sa `DROP COLUMN` (Coolify → PostgreSQL backup ili
  `pg_dump`). Migracija sama po sebi ne čuva podatke.
- `prisma migrate deploy` pokreće se pri **svakom** startu kontejnera, ali izvršava samo
  pending migracije: već primijenjeni `DROP` se ne ponavlja. Sa više replika postoji rizik
  paralelnog pozivanja migracija; za ovaj segment preporučen je redeploy sa **jednom** replikom.
- **Korekcija 2026-11-04 (FE-06):** `Match.roundId` je nullable; broj svih utakmica bez
  `roundId` ne mora biti 0. Guard je obuhvatao samo nenulti legacy `round` bez `roundId`.

## 7. Implementacija (odobreno 2026-11-04)

Korisnik: **„Imaš moje odobrenje za P-B09d-1,2,3,5,6, a što se tiče 4 za DROP ja sam upravo
uradio Backup baze prije bilo koje izmjene."** → odobreno **P-B09d-1…6**, backup potvrđen.

| Predlog | Šta je urađeno | Fajlovi |
|---------|----------------|---------|
| **P-B09d-1** | Backfill migracija: `INSERT … "Round"` za svaki `(seasonId, round)` bez `roundId` (ime `N. kolo`, `gen_random` id preko `md5(...)`), pa `UPDATE "Match" SET "roundId"` po `(seasonId, round)`. Idempotentno (`WHERE NOT EXISTS` + `roundId IS NULL`). | `backend/prisma/migrations/20261104120000_be09d_backfill_match_round/migration.sql` |
| **P-B09d-2** | Guard u istoj migraciji: `DO $$ … RAISE EXCEPTION 'BE-09d: % utakmica jos nema roundId poslije backfilla…'` — deploy pada ako ostane siročić. | isto |
| **P-B09d-3** | Skalarni `round` se više ne piše: `resolveMatchRoundFields` vraća samo `{ roundId }`; `roundToMatchUpdateInput` radi `roundRel: connect/disconnect`; `rounds.service.update` **ne** propagira broj u utakmice; seed demo koristi `roundId` u `findFirst` i create. Uklonjen i `syncLegacyRounds` (čitao je kolonu) — više nema šta da mapira. | `matches/match-round.util.ts`, `rounds/rounds.service.ts`, `prisma/seed/demo/matches.ts` |
| **P-B09d-4** | `DROP COLUMN "round"` u odvojenoj migraciji (poslije backfilla, redoslijed po timestampu); `schema.prisma` bez `Match.round`. **Backup baze urađen prije izmjene.** | `backend/prisma/migrations/20261104120100_be09d_drop_match_round/migration.sql`, `schema.prisma` |
| **P-B09d-5** | API kompatibilnost: `withSeasonAlias` dodaje izvedeno `round: roundRel?.number ?? null` (deprecated); `live.listPendingApproval` sada uključuje `roundRel` da polje ne bude `null`; `docs/BACKEND.md` dokumentuje pravilo. | `matches/match-edition.util.ts`, `live/live.service.ts`, `docs/BACKEND.md` |
| **P-B09d-6** | Uklonjeni fallbacki: web `round-utils`, `league-position.util`, `ticket-match-meta`, `CommentatorDeskHeader`; mobilni `map-league-lists`; tipovi nose `@deprecated` komentar. `round.util.ts` bez skalara; testovi prepravljeni + **novi** `match-edition.util.spec.ts` (3 testa za izvedeno polje). | vidi `git show --stat 2b3a7d7` |

### Verifikacija (lokalno + CI)

| Provjera | Rezultat |
|---|---|
| `prisma migrate deploy` (CI `e2e` job, `postgres:16`) | ✅ obje migracije primijenjene, seed prošao |
| Backend build + unit testovi (CI `build + test`) | ✅ (`prisma generate` + `tsc`) |
| `round.util.spec.ts` / `match-edition.util.spec.ts` | ✅ 4 testa |
| Frontend `tsc -b`, `vitest` | ✅ 69/69, čisto |
| Frontend `eslint` / `vite build` | ✅ 0 errors / 30 warnings, build 1.44 s |
| `check:all` | ✅ 9/9 |
| Mobilni `tsc --noEmit` | ⚠️ preostale **prethodne** greške (`StyleSheet.absoluteFillObject`, RN tipovi) — nisu iz ovog segmenta; `map-league-lists.ts` čist |

> Lokalno `prisma generate` nije moguć (sandbox blokira `binaries.prisma.sh`), pa je backend
> tipizacija verifikovana u CI-ju — zelen run je dokaz.

## Status segmenta: ZATVOREN (P-B09d-1…6 implementirano, CI zelen)

## Status segmenta: U TOKU (audit ✔, čeka odobrenje korisnika za P-B09d-1…6)
