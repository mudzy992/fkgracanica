import { useMemo, useState, type ReactNode } from 'react';
import { useMatches } from '../../../hooks';
import { useStandings } from '../../../hooks/use-competition-admin';
import { useRounds } from '../../../hooks/use-rounds';
import { matchRoundNumber, roundLabel } from '../../../lib/round-utils';
import { cn } from '../../../lib/utils';
import { NewsSectionTitle } from '../../news/NewsSectionTitle';
import { LeagueStandingsMobile } from '../league/LeagueStandingsMobile';
import { LeagueStandingsTable } from '../league/LeagueStandingsTable';
import { ClubLastRoundMatchesTable } from './ClubLastRoundMatchesTable';
import { Skeleton } from '../../ui/skeleton';

type Tab = 'lastRound' | 'standings';

interface Props {
  clubId: string;
  seasonId?: string;
  seasonName?: string;
}

function TabPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition',
        active
          ? 'bg-primary text-white shadow-[0_0_20px_rgba(0,102,255,0.35)]'
          : 'glass-premium text-white/70 hover:text-white',
      )}
    >
      {children}
    </button>
  );
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
      return matchRoundNumber(m) === lastRound.number;
    });
  }, [matches, lastRound]);

  if (!seasonId) return null;

  return (
    <section>
      <NewsSectionTitle>Takmičenje</NewsSectionTitle>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {seasonName && (
          <p className="text-sm text-white/50">{seasonName}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <TabPill active={tab === 'lastRound'} onClick={() => setTab('lastRound')}>
            Posljednje kolo
          </TabPill>
          <TabPill active={tab === 'standings'} onClick={() => setTab('standings')}>
            Tabela
          </TabPill>
        </div>
      </div>

      {tab === 'lastRound' && (
        <div className="space-y-3">
          {lastRound && (
            <p className="text-center text-sm font-medium text-primary-light">{roundLabel(lastRound)}</p>
          )}
          <ClubLastRoundMatchesTable
            matches={lastRoundMatches}
            highlightClubId={clubId}
            loading={rl || ml}
          />
        </div>
      )}

      {tab === 'standings' && (
        sl ? (
          <Skeleton className="h-64 rounded-2xl" />
        ) : (
          <div className="border-gradient-club glass-premium overflow-hidden rounded-2xl">
            <LeagueStandingsMobile rows={standings ?? []} highlightClubId={clubId} />
            <div className="hidden overflow-x-auto lg:block">
              <LeagueStandingsTable rows={standings ?? []} highlightClubId={clubId} />
            </div>
          </div>
        )
      )}
    </section>
  );
}
