# Faza 1 — Šema

- `Season` bez `competitionId`
- `SeasonCompetition` unique `(seasonId, competitionId)`, zadržava stare Season ID-eve
- FK Round/Match/SeasonClub/PlayerStatistics → izdanje (`seasonId` u DB, `seasonCompetitionId` u Prisma)
