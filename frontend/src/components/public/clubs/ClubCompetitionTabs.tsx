import { useMemo, useState } from 'react';
import { useMatches } from '../../../hooks';
import { useStandings } from '../../../hooks/use-competition-admin';
import { useRounds } from '../../../hooks/use-rounds';
import { matchRoundNumber } from '../../../lib/round-utils';
import { roundLabel } from '../../../lib/round-utils';
import { LeagueStandingsTable } from '../league/LeagueStandingsTable';
import { ClubLastRoundMatchesTable } from './ClubLastRoundMatchesTable';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';

type Tab = 'lastRound' | 'standings';

interface Props {
  clubId: string;
  seasonId?: string;
  seasonName?: string;
}

export function ClubCompetitionTabs({ clubId, seasonId, seasonName }: Props) {
  const [tab, setTab] = useState<Tab>('lastRound');
  const { data: rounds, isLoading: rl } = useRounds(seasonId);
  const { data: matches, isLoading: ml } = useMatches(seasonId);
  const { data: standings, isLoading: sl } = useStandings(seasonId);

  const lastRound = useMemo(() => {
    if (!rounds?.length) return null;
    return [...rounds].sort((a, b) => b.number - a.number)[0];
  }, [rounds]);

  const lastRoundMatches = useMemo(() => {
    if (!lastRound || !matches?.length) return [];
    return matches.filter((m) => {
      if (m.status !== 'FINISHED' && m.status !== 'LIVE') return false;
      if (m.roundId && lastRound.id) return m.roundId === lastRound.id;
      const n = matchRoundNumber(m);
      return n === lastRound.number;
    });
  }, [matches, lastRound]);

  if (!seasonId) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'lastRound', label: 'Posljednje kolo' },
    { key: 'standings', label: 'Tabela' },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-text">Takmičenje</h2>
          {seasonName && <p className="mt-1 text-sm text-text-muted">{seasonName}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <Button
              key={t.key}
              size="sm"
              variant={tab === t.key ? 'default' : 'outline'}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {tab === 'lastRound' && (
        <div className="space-y-3">
          {lastRound && (
            <p className="text-sm font-medium text-text-muted">{roundLabel(lastRound)}</p>
          )}
          <ClubLastRoundMatchesTable
            matches={lastRoundMatches}
            highlightClubId={clubId}
            loading={rl || ml}
          />
        </div>
      )}

      {tab === 'standings' && (
        <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
          {sl ? (
            <Skeleton className="m-4 h-48 w-full" />
          ) : (
            <LeagueStandingsTable
              rows={standings ?? []}
              highlightClubId={clubId}
            />
          )}
        </div>
      )}
    </section>
  );
}
