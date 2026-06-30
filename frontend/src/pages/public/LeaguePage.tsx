import { useEffect, useMemo, useState } from 'react';
import { LeagueCinematicHero } from '../../components/public/league/LeagueCinematicHero';
import { LeagueFilterBar } from '../../components/public/league/LeagueFilterBar';
import { LeagueStandingsSection } from '../../components/public/league/LeagueStandingsSection';
import { LeagueResultsRound } from '../../components/public/league/LeagueResultsRound';
import { LeagueTopScorers } from '../../components/public/league/LeagueTopScorers';
import { LeagueLiveMatches } from '../../components/public/league/LeagueLiveMatches';
import { LeagueNextMatch } from '../../components/public/league/LeagueNextMatch';
import { useMatches, useOwnClub, useSeasons, useStandings, useTopAssists, useTopScorers } from '../../hooks';
import { useRounds } from '../../hooks/use-rounds';
import { computePositionChanges, maxFinishedRound } from '../../lib/league-position.util';
import { pickDefaultSeasonId, type SeasonOption } from '../../lib/season-utils';
import { Seo } from '../../components/seo/Seo';
import { Skeleton } from '../../components/ui/skeleton';

export function LeaguePage() {
  const { data: ownClub } = useOwnClub();
  const { data: seasons, isLoading: sl } = useSeasons();
  const seasonOptions = useMemo(() => (seasons as SeasonOption[] | undefined) ?? [], [seasons]);
  const [seasonId, setSeasonId] = useState<string | undefined>();
  const [upToRound, setUpToRound] = useState<number | null>(null);

  useEffect(() => {
    if (!seasonOptions.length) return;
    setSeasonId((prev) =>
      prev && seasonOptions.some((s) => s.id === prev) ? prev : pickDefaultSeasonId(seasonOptions),
    );
  }, [seasonOptions]);

  useEffect(() => setUpToRound(null), [seasonId]);

  const activeSeason = seasonOptions.find((s) => s.id === seasonId);
  const { data: rounds } = useRounds(seasonId);
  const { data: standings, isLoading: stl } = useStandings(seasonId, upToRound);
  const { data: scorers, isLoading: scl } = useTopScorers(seasonId);
  const { data: assists, isLoading: acl } = useTopAssists(seasonId);
  const { data: matches, isLoading: ml } = useMatches(seasonId);

  const maxRound = useMemo(() => maxFinishedRound(matches ?? []), [matches]);
  const movementRound = upToRound ?? maxRound;
  const prevRound = movementRound > 1 ? movementRound - 1 : null;
  const { data: prevStandings } = useStandings(seasonId, prevRound);

  const positionChanges = useMemo(() => {
    if (!prevRound || !prevStandings?.length || !standings?.length) return undefined;
    return computePositionChanges(standings, prevStandings);
  }, [standings, prevStandings, prevRound]);

  const leader = standings?.[0];
  const tableTitle = upToRound ? `Tabela do ${upToRound}. kola` : 'Ukupna tabela';

  return (
    <div className="pb-20">
      <Seo title="Liga" description={activeSeason ? `Liga — ${activeSeason.name}` : 'Tabela i rezultati lige'} />

      {sl ? (
        <Skeleton className="h-72 w-full rounded-none" />
      ) : (
        <LeagueCinematicHero
          season={activeSeason}
          teamCount={standings?.length ?? 0}
          roundsPlayed={maxRound}
          leaderName={leader?.clubName}
          leaderPoints={leader?.points}
        />
      )}

      <div className="mx-auto max-w-6xl space-y-14 px-4 pt-10 sm:px-6 sm:space-y-16">
        {!sl && (
          <LeagueFilterBar
            seasons={seasonOptions}
            seasonId={seasonId}
            onSeasonChange={setSeasonId}
            rounds={rounds ?? []}
            upToRound={upToRound}
            onRoundChange={setUpToRound}
          />
        )}

        <LeagueNextMatch matches={matches ?? []} />
        <LeagueLiveMatches matches={matches ?? []} />

        <LeagueStandingsSection
          title={tableTitle}
          rows={standings ?? []}
          loading={sl || stl}
          positionChanges={positionChanges}
          highlightClubId={ownClub?.id}
        />

        <LeagueResultsRound matches={matches ?? []} loading={ml} />

        {scl || acl ? (
          <Skeleton className="h-64 rounded-2xl" />
        ) : (
          <LeagueTopScorers scorers={scorers} assists={assists} />
        )}
      </div>
    </div>
  );
}
