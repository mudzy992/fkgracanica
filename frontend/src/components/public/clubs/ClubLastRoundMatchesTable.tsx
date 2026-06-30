import { Link } from 'react-router-dom';
import { formatDate, formatDateTime } from '../../../lib/utils';
import { ClubCrest } from './ClubCrest';
import { ClubLink } from './ClubLink';
import { cn } from '../../../lib/utils';
import type { Club, Match } from '../../../types';

function HomeClubCell({ club }: { club?: Club }) {
  if (!club) return <span className="text-white/50">—</span>;
  return (
    <div className="flex items-center justify-end gap-2">
      {club.slug ? (
        <ClubLink slug={club.slug} name={club.name ?? '—'} className="text-sm font-medium" />
      ) : (
        <span className="text-sm font-medium text-white">{club.name}</span>
      )}
      <ClubCrest club={club} size="sm" />
    </div>
  );
}

function AwayClubCell({ club }: { club?: Club }) {
  if (!club) return <span className="text-white/50">—</span>;
  return (
    <div className="flex items-center gap-2">
      <ClubCrest club={club} size="sm" />
      {club.slug ? (
        <ClubLink slug={club.slug} name={club.name ?? '—'} className="text-sm font-medium" />
      ) : (
        <span className="text-sm font-medium text-white">{club.name}</span>
      )}
    </div>
  );
}

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
          <div key={i} className="h-12 animate-pulse rounded-xl bg-white/5" />
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
    <div className="border-gradient-club glass-premium overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[10px] font-semibold uppercase tracking-wider text-white/45">
              <th className="hidden p-4 sm:table-cell">Datum</th>
              <th className="p-4 text-right">Domaćin</th>
              <th className="p-4 text-center">Rez.</th>
              <th className="p-4">Gost</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => {
              const involved =
                m.homeClubId === highlightClubId || m.awayClubId === highlightClubId;
              return (
                <tr
                  key={m.id}
                  className={cn(
                    'border-b border-white/5 transition last:border-0 hover:bg-white/[0.03]',
                    involved && 'bg-primary/10',
                  )}
                >
                  <td className="hidden p-4 text-white/50 sm:table-cell">
                    <span className="block">{formatDate(m.scheduledAt)}</span>
                    <span className="text-[10px] text-white/35">
                      {formatDateTime(m.scheduledAt).split(' ').slice(1).join(' ')}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4">
                    <HomeClubCell club={m.homeClub} />
                  </td>
                  <td className="p-3 text-center sm:p-4">
                    <Link
                      to={`/utakmice/${m.id}`}
                      className="font-display inline-block min-w-[3.5rem] rounded-lg bg-white/5 px-2 py-1 text-base font-bold tabular-nums text-white transition hover:bg-primary/20 hover:text-primary-light"
                    >
                      {m.homeScore}:{m.awayScore}
                    </Link>
                  </td>
                  <td className="p-3 sm:p-4">
                    <AwayClubCell club={m.awayClub} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
