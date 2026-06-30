import { Link } from 'react-router-dom';
import { formatDateTime } from '../../../lib/utils';
import { ClubLink } from './ClubLink';
import type { Match } from '../../../types';

interface Props {
  matches: Match[];
  highlightClubId: string;
  loading?: boolean;
}

export function ClubLastRoundMatchesTable({ matches, highlightClubId, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-surface" />
        ))}
      </div>
    );
  }

  if (!matches.length) {
    return <p className="text-sm text-text-muted">Nema utakmica u posljednjem kolu.</p>;
  }

  const sorted = [...matches].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b bg-surface/50 text-left text-text-muted">
            <th className="px-4 py-3">Datum</th>
            <th className="px-4 py-3">Domaćin</th>
            <th className="px-4 py-3 text-center">Rez.</th>
            <th className="px-4 py-3">Gost</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((m) => {
            const involved =
              m.homeClubId === highlightClubId || m.awayClubId === highlightClubId;
            return (
              <tr
                key={m.id}
                className={
                  involved
                    ? 'border-b border-[var(--border-subtle)] bg-primary/5 font-medium last:border-0'
                    : 'border-b border-[var(--border-subtle)] last:border-0'
                }
              >
                <td className="px-4 py-3.5 text-text-muted">{formatDateTime(m.scheduledAt)}</td>
                <td className="px-4 py-3.5">
                  {m.homeClub?.slug ? (
                    <ClubLink slug={m.homeClub.slug} name={m.homeClub.name ?? '—'} />
                  ) : (
                    m.homeClub?.name ?? '—'
                  )}
                </td>
                <td className="px-4 py-3.5 text-center tabular-nums">
                  <Link to={`/utakmice/${m.id}`} className="font-bold text-primary hover:underline">
                    {m.homeScore}:{m.awayScore}
                  </Link>
                </td>
                <td className="px-4 py-3.5">
                  {m.awayClub?.slug ? (
                    <ClubLink slug={m.awayClub.slug} name={m.awayClub.name ?? '—'} />
                  ) : (
                    m.awayClub?.name ?? '—'
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
