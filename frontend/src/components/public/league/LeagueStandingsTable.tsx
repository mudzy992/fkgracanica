import { ClubLink } from '../clubs/ClubLink';
import { ClubCrest } from '../clubs/ClubCrest';
import { FormResultChips } from './FormResultChips';
import { LeaguePositionBadge } from './LeaguePositionBadge';
import { standingRowClub } from '../../../lib/club-utils';
import { formatGoalDifference } from '../../../lib/standings-format';
import type { StandingRow } from '../../../types';

interface Props {
  rows: StandingRow[];
  compact?: boolean;
  highlightClubId?: string;
  positionChanges?: Map<string, number>;
}

function ClubCell({ row }: { row: StandingRow }) {
  if (row.clubSlug) return <ClubLink slug={row.clubSlug} name={row.clubName} />;
  return <span className="font-medium text-white">{row.clubName}</span>;
}

export function LeagueStandingsTable({ rows, compact, highlightClubId, positionChanges }: Props) {
  const showMovement = positionChanges && positionChanges.size > 0;

  return (
    <table className="w-full min-w-[700px] text-sm">
      <thead>
        <tr className="border-b border-white/10 text-left text-[10px] font-semibold uppercase tracking-wider text-white/45">
          <th className="w-10 px-4 py-3">#</th>
          {showMovement && <th className="w-10 px-2 py-3 text-center">±</th>}
          <th className="px-4 py-3">Klub</th>
          <th className="px-3 py-3 text-center">O</th>
          {!compact && (
            <>
              <th className="hidden px-3 py-3 text-center md:table-cell">P</th>
              <th className="hidden px-3 py-3 text-center md:table-cell">N</th>
              <th className="hidden px-3 py-3 text-center md:table-cell">I</th>
            </>
          )}
          <th className="hidden px-3 py-3 text-center lg:table-cell">G+</th>
          <th className="hidden px-3 py-3 text-center lg:table-cell">G-</th>
          <th className="px-3 py-3 text-center">GR</th>
          <th className="px-4 py-3 text-center font-bold">Bod</th>
          {!compact && <th className="hidden px-4 py-3 xl:table-cell">Forma</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={row.clubId}
            className={
              row.clubId === highlightClubId
                ? 'border-b border-primary-light/20 bg-primary/15 font-medium last:border-0'
                : 'border-b border-white/5 last:border-0 hover:bg-white/[0.03]'
            }
          >
            <td className="px-4 py-3.5 font-display font-bold text-white/80">{i + 1}</td>
            {showMovement && (
              <td className="px-2 py-3.5 text-center">
                <LeaguePositionBadge change={positionChanges.get(row.clubId)} />
              </td>
            )}
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-3">
                <ClubCrest club={standingRowClub(row)} size="sm" />
                <ClubCell row={row} />
              </div>
            </td>
            <td className="px-3 py-3.5 text-center text-white/80">{row.played}</td>
            {!compact && (
              <>
                <td className="hidden px-3 py-3.5 text-center text-success md:table-cell">{row.won}</td>
                <td className="hidden px-3 py-3.5 text-center text-white/80 md:table-cell">{row.drawn}</td>
                <td className="hidden px-3 py-3.5 text-center text-danger md:table-cell">{row.lost}</td>
              </>
            )}
            <td className="hidden px-3 py-3.5 text-center text-white/80 lg:table-cell">{row.goalsFor}</td>
            <td className="hidden px-3 py-3.5 text-center text-white/80 lg:table-cell">{row.goalsAgainst}</td>
            <td
              className={`px-3 py-3.5 text-center tabular-nums ${
                row.goalDifference > 0 ? 'text-success' : row.goalDifference < 0 ? 'text-danger' : 'text-white/80'
              }`}
            >
              {formatGoalDifference(row.goalDifference)}
            </td>
            <td className="px-4 py-3.5 text-center font-display text-lg font-bold text-primary-light">
              {row.points}
            </td>
            {!compact && (
              <td className="hidden px-4 py-3.5 xl:table-cell">
                <FormResultChips form={row.form} formMatches={row.formMatches} clubName={row.clubName} />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
