import { ClubLink } from '../clubs/ClubLink';
import { ClubCrest } from '../clubs/ClubCrest';
import { LeagueFormDots } from './LeagueFormDots';
import { formatGoalDifference } from '../../../lib/standings-format';
import type { StandingRow } from '../../../types';

interface Props {
  rows: StandingRow[];
  compact?: boolean;
  highlightClubId?: string;
}

function ClubCell({ row }: { row: StandingRow }) {
  if (row.clubSlug) return <ClubLink slug={row.clubSlug} name={row.clubName} />;
  return <span className="font-medium">{row.clubName}</span>;
}

export function LeagueStandingsTable({ rows, compact, highlightClubId }: Props) {
  return (
    <table className="w-full min-w-[520px] text-sm">
      <thead>
        <tr className="border-b bg-surface/50 text-left text-text-muted">
          <th className="w-10 px-4 py-3">#</th>
          <th className="px-4 py-3">Klub</th>
          <th className="px-4 py-3 text-center">O</th>
          {!compact && (
            <>
              <th className="px-4 py-3 text-center">P</th>
              <th className="px-4 py-3 text-center">N</th>
              <th className="px-4 py-3 text-center">I</th>
            </>
          )}
          <th className="px-4 py-3 text-center">GR</th>
          <th className="px-4 py-3 text-center font-bold">Bod</th>
          {!compact && <th className="px-4 py-3">Forma</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={row.clubId}
            className={
              row.clubId === highlightClubId
                ? 'border-b border-[var(--border-subtle)] bg-primary/5 font-medium last:border-0'
                : 'border-b border-[var(--border-subtle)] last:border-0'
            }
          >
            <td className="px-4 py-3.5 text-text-muted">{i + 1}</td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-3">
                <ClubCrest club={{ name: row.clubName }} size="sm" />
                <ClubCell row={row} />
              </div>
            </td>
            <td className="px-4 py-3.5 text-center">{row.played}</td>
            {!compact && (
              <>
                <td className="px-4 py-3.5 text-center">{row.won}</td>
                <td className="px-4 py-3.5 text-center">{row.drawn}</td>
                <td className="px-4 py-3.5 text-center">{row.lost}</td>
              </>
            )}
            <td
              className={`px-4 py-3.5 text-center tabular-nums ${
                row.goalDifference > 0 ? 'text-success' : row.goalDifference < 0 ? 'text-danger' : ''
              }`}
            >
              {formatGoalDifference(row.goalDifference)}
            </td>
            <td className="px-4 py-3.5 text-center text-base font-bold">{row.points}</td>
            {!compact && (
              <td className="px-4 py-3.5">
                <LeagueFormDots form={row.form} />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
