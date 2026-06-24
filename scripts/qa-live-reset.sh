#!/usr/bin/env bash
# Reset demo utakmice (kolo 13) na SCHEDULED za QA
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ROUND="${QA_MATCH_ROUND:-13}"
cd "$ROOT/backend"

npx prisma db execute --stdin <<SQL
DELETE FROM MatchEvent WHERE matchId IN (SELECT id FROM \`Match\` WHERE round = ${ROUND});
DELETE FROM LiveComment WHERE matchId IN (SELECT id FROM \`Match\` WHERE round = ${ROUND});
UPDATE \`Match\` SET status = 'SCHEDULED', homeScore = 0, awayScore = 0, minute = 0, reportStatus = 'DRAFT'
WHERE round = ${ROUND};
SQL

echo "✓ Kolo ${ROUND} reset na SCHEDULED"
