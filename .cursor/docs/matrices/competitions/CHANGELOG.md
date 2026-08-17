# Competitions Changelog

## 2026-08-17 (season as parent)

- Kalendarska `Season` je roditelj; `SeasonCompetition` nosi učesnike, kola, utakmice i player stats
- Admin: lista sezona → takmičenja u sezoni → hub kola na izdanju
- Public `/liga`, naslovna, `/tim`: calendar + edition umjesto grupisanja po godini

## 2026-08-17 (season/competition pickers)

- `/tim` statistike: filter po sezoni (godine) i takmičenju, default aktivna liga
- Naslovna tabela: tabovi ostalih takmičenja unutar iste kalendarske sezone
- Klubska stranica: izbor kola umjesto samo posljednjeg

## 2026-08-17 (takmičenja review)

- `Competition.isLeague` — ligaško takmičenje za `/liga` i naslovnu
- Više aktivnih sezona istog takmičenja (uklonjen `deactivateOtherSeasons`)
- Klubska stranica: tabovi svih participacija
- Admin može završiti zakazanu/odgođenu utakmicu unosom rezultata bez live komentara
