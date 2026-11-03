#!/usr/bin/env bash
# Reset demo utakmice na SCHEDULED za QA.
#
# BE-09c/P-B09c-6: skripta radi DELETE/UPDATE, pa cilj MORA biti eksplicitan
# (`QA_MATCH_ROUND`) i potvrđen (`--yes`); prije je bez provjere brisala redove
# za kolo 13 na bazi na koju pokazuje `backend/.env`.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ -z "${QA_MATCH_ROUND:-}" ]]; then
  echo "QA_MATCH_ROUND nije postavljen (npr. QA_MATCH_ROUND=13)." >&2
  exit 1
fi
ROUND="$QA_MATCH_ROUND"
if ! [[ "$ROUND" =~ ^[0-9]+$ ]]; then
  echo "QA_MATCH_ROUND mora biti broj (dobijeno: '$ROUND')." >&2
  exit 1
fi
if [[ "${1:-}" != "--yes" ]]; then
  echo "Potvrda nedostaje: briše događaje i resetuje utakmice kola $ROUND." >&2
  echo "Pokreni sa --yes ako je to zaista cilj." >&2
  exit 1
fi

cd "$ROOT/backend"

npx prisma db execute --stdin <<SQL
DELETE FROM "MatchEvent" WHERE "matchId" IN (SELECT id FROM "Match" WHERE round = ${ROUND});
DELETE FROM "LiveComment" WHERE "matchId" IN (SELECT id FROM "Match" WHERE round = ${ROUND});
UPDATE "Match" SET status = 'SCHEDULED', "homeScore" = 0, "awayScore" = 0, minute = 0, "reportStatus" = 'DRAFT'
WHERE round = ${ROUND};
SQL

echo "✓ Kolo ${ROUND} reset na SCHEDULED"
