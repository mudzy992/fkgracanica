import { ClubLink } from '../clubs/ClubLink';
import { ClubCrest } from '../clubs/ClubCrest';
import { LeagueFormDots } from './LeagueFormDots';
import { formatGoalDifference } from '../../../lib/standings-format';
import { Card, CardContent } from '../../ui/card';
import type { StandingRow } from '../../../types';

interface Props {
  rows: StandingRow[];
}

export function LeagueStandingsMobile({ rows }: Props) {
  return (
    <div className="space-y-2 lg:hidden">
      {rows.map((row, i) => (
        <Card key={row.clubId}>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="w-6 shrink-0 text-sm font-bold text-text-muted">{i + 1}</span>
            <ClubCrest club={{ name: row.clubName }} size="sm" />
            <div className="min-w-0 flex-1">
              {row.clubSlug ? (
                <ClubLink slug={row.clubSlug} name={row.clubName} />
              ) : (
                <span className="font-medium">{row.clubName}</span>
              )}
              <p className="text-xs text-text-muted">{row.played} utakmica</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-lg font-bold">{row.points}</p>
              <p className="text-xs text-text-muted">
                GR {formatGoalDifference(row.goalDifference)} · {row.goalsFor}:{row.goalsAgainst}
              </p>
            </div>
            <LeagueFormDots form={row.form} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
