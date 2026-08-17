# Competitions Matrix

## Hierarchy

```
Competition 1—n Season 1—n Round
                         1—n Match
Season 1—n SeasonClub n—1 Club
```

Sezona je dijete takmičenja. Ista kalendarska sezona (npr. 2025/2026) = više `Season` redova pod različitim takmičenjima.

## Season.isActive

- Više sezona istog takmičenja smije biti aktivno (preklapanje, npr. 2025/26 i 2026/27).
- Aktivacija nove sezone **ne** gasi susjedne.
- Default prikaz: aktivna sezona, zatim `yearStart desc`.

## Competition.isLeague

- Boolean, default `false`. Najviše jedno takmičenje smije biti ligaško.
- Postavljanje `isLeague: true` skida flag sa ostalih (`ensureSingleLeagueCompetition`).
- Ligaško → `/liga`, tabela na naslovnoj, mobile liga/home snippet.
- Ostala takmičenja → klubska stranica (`participations` tabovi).

## Public surfaces

| Surface | Season source |
|---|---|
| `/liga`, `LeaguePage` | samo `competition.isLeague` |
| Naslovna `LeagueTable` / `LeagueTableWidget` | `pickDefaultSeasonId(filterLeagueSeasons)` |
| Mobile `/league` + home snippet | `mapLeagueSeasons` |
| Klub public | sve `SeasonClub` participacije; default aktivna liga |
| Player public stats | `findDefaultLeagueSeason` |

## Match finish (bez live)

```
SCHEDULED | POSTPONED → FINISHED  (admin PATCH, datum u prošlosti + rezultat)
LIVE | HALFTIME → FINISHED        (samo komentator endMatch)
```

- Admin forma: status `Završena` + golovi. Ne treba startati live.
- `reportStatus` ostaje `DRAFT` (izvještaj se može dopuniti kasnije).
- Tabela se računa iz `status: FINISHED`. Player stats tek nakon `APPROVED` izvještaja.
