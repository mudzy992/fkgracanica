import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useClubPublic } from '../../hooks/use-club-public';
import { useModuleFlags } from '../../hooks';
import { isModuleEnabled } from '../../lib/module-settings-rules';
import { ClubCinematicHero } from '../../components/public/clubs/ClubCinematicHero';
import { ClubInfoSection } from '../../components/public/clubs/ClubInfoSection';
import { ClubPlayersGrid } from '../../components/public/clubs/ClubPublicSections';
import { ClubCompetitionTabs } from '../../components/public/clubs/ClubCompetitionTabs';
import { TeamFormationSection } from '../../components/team/TeamFormationSection';
import { TeamRosterSections } from '../../components/team/TeamRosterSections';
import { TeamSpotlight } from '../../components/team/TeamSpotlight';
import { TeamSeasonStats } from '../../components/team/TeamSeasonStats';
import { spotlightPlayers, statsByPlayerId } from '../../components/team/team-stats-utils';
import { Seo } from '../../components/seo/Seo';
import { Skeleton } from '../../components/ui/skeleton';

export function ClubPublicPage() {
  const { slug = '' } = useParams();
  const { data, isLoading, isError } = useClubPublic(slug);
  const { data: moduleFlags } = useModuleFlags();

  const squad = data?.squad;
  const seasonStats = data?.seasonStats;
  const players = data?.players ?? [];

  const bench = useMemo(
    () => squad?.slots.filter((s) => s.isBench && s.player) ?? [],
    [squad],
  );
  const squadPlayers = useMemo(
    () => squad?.slots.filter((s) => !s.isBench && s.player).map((s) => s.player!) ?? [],
    [squad],
  );
  const statsMap = useMemo(() => statsByPlayerId(seasonStats), [seasonStats]);
  const scorers = useMemo(
    () => spotlightPlayers(seasonStats, players),
    [seasonStats, players],
  );

  const competitionsOn = isModuleEnabled(moduleFlags, 'modules.competitions');
  const showCompetition = competitionsOn && !!seasonStats?.season?.id;
  const hasSquad = (squad?.slots.length ?? 0) > 0;

  if (isLoading) {
    return (
      <div className="pb-20">
        <Skeleton className="h-72 w-full rounded-none" />
        <div className="mx-auto max-w-6xl space-y-8 px-4 pt-10 sm:px-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <p className="p-12 text-center text-text-muted">Klub nije pronađen.</p>;
  }

  const { club, stadium } = data;

  return (
    <div className="pb-20">
      <Seo title={club.name} description={club.description ?? `Profil kluba ${club.name}`} />

      <ClubCinematicHero club={club} stadium={stadium} squad={squad} stats={seasonStats} />

      <div className="mx-auto max-w-6xl space-y-14 px-4 pt-10 sm:px-6 sm:space-y-16">
        {stadium && <ClubInfoSection stadium={stadium} />}

        {hasSquad ? (
          <>
            <TeamFormationSection squad={squad!} />
            {scorers.length > 0 && <TeamSpotlight players={scorers} statsMap={statsMap} />}
            <TeamRosterSections bench={bench} squadPlayers={squadPlayers} statsMap={statsMap} />
          </>
        ) : players.length > 0 ? (
          <ClubPlayersGrid players={players} stats={seasonStats} />
        ) : (
          <p className="py-12 text-center text-text-muted">Kadar trenutno nije objavljen.</p>
        )}

        {showCompetition && (
          <ClubCompetitionTabs
            clubId={club.id}
            seasonId={seasonStats.season?.id}
            seasonName={seasonStats.season?.name}
          />
        )}

        <TeamSeasonStats stats={seasonStats} />
      </div>
    </div>
  );
}
