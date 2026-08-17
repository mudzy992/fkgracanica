import { useEffect, useState } from 'react';
import { useStandings } from '../../../hooks/use-competition-admin';
import {
  participationLabel,
  pickDefaultParticipation,
  type ClubParticipation,
} from '../../../lib/club-participation.util';
import { PublicPill } from '../PublicPill';
import { NewsSectionTitle } from '../../news/NewsSectionTitle';
import { LeagueStandingsMobile } from '../league/LeagueStandingsMobile';
import { LeagueStandingsTable } from '../league/LeagueStandingsTable';
import { ClubRoundMatches } from './ClubRoundMatches';
import { Skeleton } from '../../ui/skeleton';

type Tab = 'rounds' | 'standings';

interface Props {
  clubId: string;
  participations: ClubParticipation[];
}

export function ClubCompetitionTabs({ clubId, participations }: Props) {
  const [tab, setTab] = useState<Tab>('rounds');
  const [seasonId, setSeasonId] = useState<string | undefined>();
  const selected = participations.find((p) => p.seasonId === seasonId);

  useEffect(() => {
    const next = pickDefaultParticipation(participations);
    setSeasonId((prev) =>
      prev && participations.some((p) => p.seasonId === prev) ? prev : next?.seasonId,
    );
  }, [participations]);

  const { data: standings, isLoading: sl } = useStandings(seasonId);

  if (!participations.length || !seasonId) return null;

  return (
    <section>
      <NewsSectionTitle>Takmičenja</NewsSectionTitle>

      {participations.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {participations.map((p) => (
            <PublicPill
              key={p.seasonId}
              active={p.seasonId === seasonId}
              onClick={() => setSeasonId(p.seasonId)}
            >
              {participationLabel(p)}
            </PublicPill>
          ))}
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {selected && <p className="text-sm text-white/50">{participationLabel(selected)}</p>}
        <div className="flex flex-wrap gap-2">
          <PublicPill active={tab === 'rounds'} onClick={() => setTab('rounds')}>
            Kola
          </PublicPill>
          <PublicPill active={tab === 'standings'} onClick={() => setTab('standings')}>
            Tabela
          </PublicPill>
        </div>
      </div>

      {tab === 'rounds' && <ClubRoundMatches clubId={clubId} seasonId={seasonId} />}

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
