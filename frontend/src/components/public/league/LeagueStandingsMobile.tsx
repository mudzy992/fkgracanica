import { ClubLink } from '../clubs/ClubLink';
import { ClubCrest } from '../clubs/ClubCrest';
import { FormResultChips } from './FormResultChips';
import { LeaguePositionBadge } from './LeaguePositionBadge';
import { formatGoalDifference } from '../../../lib/standings-format';
import { standingRowClub } from '../../../lib/club-utils';
import { cn } from '../../../lib/utils';
import type { StandingRow } from '../../../types';

interface Props {
  rows: StandingRow[];
  positionChanges?: Map<string, number>;
  highlightClubId?: string;
}

export function LeagueStandingsMobile({ rows, positionChanges, highlightClubId }: Props) {
  const showMovement = positionChanges && positionChanges.size > 0;

  return (
    <div className="space-y-2 p-3 lg:hidden">
      {rows.map((row, i) => (
        <div
          key={row.clubId}
          className={cn(
            'rounded-xl border border-white/5 bg-white/[0.02] p-4',
            row.clubId === highlightClubId && 'border-primary/30 bg-primary/10',
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex w-10 shrink-0 flex-col items-center">
              <span className="font-display text-sm font-bold text-white/60">{i + 1}</span>
              {showMovement && (
                <LeaguePositionBadge change={positionChanges.get(row.clubId)} className="mt-0.5" />
              )}
            </div>
            <ClubCrest club={standingRowClub(row)} size="sm" />
            <div className="min-w-0 flex-1">
              {row.clubSlug ? (
                <ClubLink slug={row.clubSlug} name={row.clubName} />
              ) : (
                <span className="font-medium text-white">{row.clubName}</span>
              )}
              <p className="mt-0.5 text-xs text-white/45">
                {row.played} utakm. · P{row.won} N{row.drawn} I{row.lost}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-display text-xl font-bold text-primary-light">{row.points}</p>
              <p className="text-xs text-white/45">
                GR {formatGoalDifference(row.goalDifference)} · {row.goalsFor}:{row.goalsAgainst}
              </p>
            </div>
          </div>
          <div className="mt-3 border-t border-white/5 pt-3">
            <FormResultChips form={row.form} formMatches={row.formMatches} clubName={row.clubName} size="md" />
          </div>
        </div>
      ))}
    </div>
  );
}
