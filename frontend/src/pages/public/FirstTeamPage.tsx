import { useMemo } from 'react';
import { useClubSquad, useClubStats } from '../../hooks/use-club-hub';
import { useOwnClub } from '../../hooks';
import { TeamCinematicHero } from '../../components/team/TeamCinematicHero';
import { TeamFormationSection } from '../../components/team/TeamFormationSection';
import { TeamSpotlight } from '../../components/team/TeamSpotlight';
import { TeamRosterSections } from '../../components/team/TeamRosterSections';
import { TeamSeasonStatsSection } from '../../components/team/TeamSeasonStatsSection';
import { spotlightPlayers, statsByPlayerId } from '../../components/team/team-stats-utils';
import { Seo } from '../../components/seo/Seo';
import { Skeleton } from '../../components/ui/skeleton';
import { DataError } from '../../components/public/DataError';
import type { Stadium } from '../../types/club-hub';
import { useTranslation } from 'react-i18next';

export function FirstTeamPage() {
  const { t } = useTranslation();
  const { data: ownClub, isLoading: clubLoading } = useOwnClub();
  const {
    data: squad,
    isLoading: squadLoading,
    isError: squadError,
    refetch: refetchSquad,
  } = useClubSquad(ownClub?.id ?? '');
  const { data: stats } = useClubStats(ownClub?.id ?? '');

  const bench = useMemo(() => squad?.slots.filter((s) => s.isBench && s.player) ?? [], [squad]);
  const squadPlayers = useMemo(
    () => squad?.slots.filter((s) => !s.isBench && s.player).map((s) => s.player!) ?? [],
    [squad],
  );
  const allPlayers = useMemo(
    () => squad?.slots.filter((s) => s.player).map((s) => s.player!) ?? [],
    [squad],
  );
  const statsMap = useMemo(() => statsByPlayerId(stats), [stats]);
  const scorers = useMemo(() => spotlightPlayers(stats, allPlayers), [stats, allPlayers]);

  const stadiumRel = (ownClub as { stadiumRel?: Stadium | null } | undefined)?.stadiumRel;
  const isLoading = clubLoading || squadLoading;

  return (
    <div className="pb-20">
      <Seo
        title={ownClub ? `Prvi tim — ${ownClub.name}` : 'Prvi tim'}
        description={ownClub?.description ?? 'Kadrovi prvog tima'}
      />

      <TeamCinematicHero
        club={ownClub}
        squad={squad}
        stats={stats}
        stadiumName={stadiumRel?.name ?? ownClub?.stadium}
        city={stadiumRel?.city ?? ownClub?.city}
      />

      <div className="mx-auto max-w-6xl space-y-14 px-4 pt-12 sm:px-6 sm:space-y-16">
        {squadError ? (
          <DataError onRetry={() => void refetchSquad()} />
        ) : isLoading ? (
          <Skeleton className="h-[420px] w-full rounded-3xl" />
        ) : squad?.slots.length ? (
          <>
            <TeamFormationSection squad={squad} />
            {scorers.length > 0 && <TeamSpotlight players={scorers} statsMap={statsMap} />}
            <TeamRosterSections bench={bench} squadPlayers={squadPlayers} statsMap={statsMap} />
          </>
        ) : (
          <p className="py-20 text-center text-text-muted">{t('pages.club.squadEmpty')}</p>
        )}

        {ownClub?.id ? <TeamSeasonStatsSection clubId={ownClub.id} /> : null}
      </div>
    </div>
  );
}
