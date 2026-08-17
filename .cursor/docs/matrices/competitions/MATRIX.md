# Competitions Matrix

## Hierarchy

```
Season (calendar) 1—n SeasonCompetition (edition)
Competition (catalog) 1—n SeasonCompetition
SeasonCompetition 1—n Round 1—n Match
SeasonCompetition 1—n SeasonClub n—1 Club
SeasonCompetition 1—n PlayerStatistics
```

Kalendarska sezona je roditelj. Katalog takmičenja (`name`, `slug`, `isLeague`) nema kola. Unique `(seasonId, competitionId)`.

## Season.isActive

- Više kalendarskih sezona smije biti aktivno (preklapanje).
- Default prikaz: aktivna sezona, zatim `yearStart desc`.
- Ligaško izdanje = `SeasonCompetition` gdje `competition.isLeague` unutar odabrane sezone.

## Competition.isLeague

- Boolean, default `false`. Najviše jedno takmičenje u katalogu smije biti ligaško.
- Postavljanje `isLeague: true` skida flag sa ostalih (`ensureSingleLeagueCompetition`).
- Ligaško → `/liga`, tabela na naslovnoj, mobile liga/home snippet.
- Ostala takmičenja → tabovi izdanja iste sezone / klubska stranica.

## Public surfaces

| Surface | Source |
|---|---|
| `/liga`, `LeaguePage` | calendar picker; standings iz ligaškog izdanja |
| Naslovna `LeagueTableWidget` | aktivna calendar sezona; tabovi = izdanja (liga prva) |
| Mobile `/league` + home snippet | calendar + `leagueEditionId` |
| `/tim` statistike | calendar + edition; default aktivna liga |
| Klub public | participacije (`seasonId` = edition id) |
| Player public stats | `findDefaultLeagueEdition` |

## Match finish (bez live)

```
SCHEDULED | POSTPONED → FINISHED  (admin PATCH, datum u prošlosti + rezultat)
LIVE | HALFTIME → FINISHED        (samo komentator endMatch)
```

- Admin forma: status `Završena` + golovi. Ne treba startati live.
- `reportStatus` ostaje `DRAFT` (izvještaj se može dopuniti kasnije).
- Tabela se računa iz `status: FINISHED`. Player stats tek nakon `APPROVED` izvještaja.
