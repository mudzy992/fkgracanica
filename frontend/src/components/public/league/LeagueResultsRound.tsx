import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ClubCrest } from '../clubs/ClubCrest';
import { ClubLink } from '../clubs/ClubLink';
import { formatDate, formatDateTime } from '../../../lib/utils';
import { groupMatchesByRound } from '../../../lib/round-utils';
import { NewsSectionTitle } from '../../news/NewsSectionTitle';
import { Skeleton } from '../../ui/skeleton';
import type { Club, Match } from '../../../types';

function HomeClubCell({ club }: { club?: Club }) {
  if (!club) return <span className="text-white/50">—</span>;
  return (
    <div className="flex items-center justify-end gap-2">
      {club.slug ? (
        <ClubLink slug={club.slug} name={club.name} className="text-sm font-medium" />
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
        <ClubLink slug={club.slug} name={club.name} className="text-sm font-medium" />
      ) : (
        <span className="text-sm font-medium text-white">{club.name}</span>
      )}
    </div>
  );
}

function ResultsTable({ matches }: { matches: Match[] }) {
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
              <th className="hidden p-4 text-right md:table-cell">Detalj</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr
                key={m.id}
                className="border-b border-white/5 transition last:border-0 hover:bg-white/[0.03]"
              >
                <td className="hidden p-4 text-white/50 sm:table-cell">
                  <span className="block">{formatDate(m.scheduledAt)}</span>
                  <span className="text-[10px] text-white/35">{formatDateTime(m.scheduledAt).split(' ').slice(1).join(' ')}</span>
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
                <td className="hidden p-4 text-right md:table-cell">
                  <Link
                    to={`/utakmice/${m.id}`}
                    className="text-xs font-semibold uppercase tracking-wider text-primary-light hover:text-white"
                  >
                    Utakmica →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface Props {
  matches: Match[];
  loading: boolean;
}

export function LeagueResultsRound({ matches, loading }: Props) {
  const groups = useMemo(() => {
    const finished = matches.filter((m) => m.status === 'FINISHED');
    return groupMatchesByRound(finished);
  }, [matches]);

  const [selectedKey, setSelectedKey] = useState<number | null>(null);

  useEffect(() => {
    if (!groups.length) {
      setSelectedKey(null);
      return;
    }
    setSelectedKey((prev) => (prev != null && groups.some((g) => g.key === prev) ? prev : groups[0].key));
  }, [groups]);

  const selected = groups.find((g) => g.key === selectedKey);
  const idx = groups.findIndex((g) => g.key === selectedKey);
  const hasPrev = idx < groups.length - 1;
  const hasNext = idx > 0;

  if (loading) {
    return (
      <section>
        <NewsSectionTitle>Rezultati</NewsSectionTitle>
        <Skeleton className="h-48 rounded-2xl" />
      </section>
    );
  }

  if (!groups.length) {
    return (
      <section>
        <NewsSectionTitle>Rezultati</NewsSectionTitle>
        <p className="text-sm text-text-muted">Nema završenih utakmica u ovoj sezoni.</p>
      </section>
    );
  }

  return (
    <section>
      <NewsSectionTitle>Rezultati po kolima</NewsSectionTitle>

      <div className="border-gradient-club glass-premium mb-4 flex items-center justify-between rounded-2xl px-4 py-3">
        <button
          type="button"
          disabled={!hasPrev}
          onClick={() => hasPrev && setSelectedKey(groups[idx + 1].key)}
          className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
          aria-label="Prethodno kolo"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Kolo</p>
          <p className="font-display text-lg font-bold text-white">{selected?.label}</p>
        </div>
        <button
          type="button"
          disabled={!hasNext}
          onClick={() => hasNext && setSelectedKey(groups[idx - 1].key)}
          className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
          aria-label="Sljedeće kolo"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {selected && <ResultsTable matches={selected.matches} />}
    </section>
  );
}
