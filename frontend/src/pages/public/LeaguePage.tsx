import { useEffect, useMemo, useState } from 'react';
import { LeagueCinematicHero } from '../../components/public/league/LeagueCinematicHero';
import { LeagueFilterBar } from '../../components/public/league/LeagueFilterBar';
import { LeagueStandingsSection } from '../../components/public/league/LeagueStandingsSection';
import { LeagueResultsRound } from '../../components/public/league/LeagueResultsRound';
import { LeagueTopScorers } from '../../components/public/league/LeagueTopScorers';
import { LeagueLiveMatches } from '../../components/public/league/LeagueLiveMatches';
import { LeagueNextMatch } from '../../components/public/league/LeagueNextMatch';
import {
  useMatches,
  useOwnClub,
  useSeasons,
  useStandings,
  useTopAssists,
  useTopScorers,
} from '../../hooks';
import { useRounds } from '../../hooks/use-rounds';
import { computePositionChanges, maxFinishedRound } from '../../lib/league-position.util';
import { leagueEdition, pickDefaultCalendarId, type CalendarSeason } from '../../lib/season-utils';
import { Seo } from '../../components/seo/Seo';
import { Skeleton } from '../../components/ui/skeleton';
import { DataError } from '../../components/public/DataError';
import { useTranslation } from 'react-i18next';

export function LeaguePage() {
  const { t } = useTranslation();
  const { data: ownClub } = useOwnClub();
  const { data: seasons, isLoading: sl } = useSeasons();
  const calendars = useMemo(() => (seasons as CalendarSeason[] | undefined) ?? [], [seasons]);
  const [calendarId, setCalendarId] = useState<string | undefined>();
  const [upToRound, setUpToRound] = useState<number | null>(null);

  useEffect(() => {
    if (!calendars.length) return;
    setCalendarId((prev) =>
      prev && calendars.some((s) => s.id === prev) ? prev : pickDefaultCalendarId(calendars),
    );
  }, [calendars]);

  useEffect(() => setUpToRound(null), [calendarId]);

  const activeSeason = calendars.find((s) => s.id === calendarId);
  const editionId = leagueEdition(activeSeason)?.id;
  const { data: rounds } = useRounds(editionId);
  const {
    data: standings,
    isLoading: stl,
    isError: standingsError,
    refetch: refetchStandings,
  } = useStandings(editionId, upToRound);
  const { data: scorers, isLoading: scl } = useTopScorers(editionId);
  const { data: assists, isLoading: acl } = useTopAssists(editionId);
  const { data: matches, isLoading: ml } = useMatches(editionId);

  const maxRound = useMemo(() => maxFinishedRound(matches ?? []), [matches]);
  const movementRound = upToRound ?? maxRound;
  const prevRound = movementRound > 1 ? movementRound - 1 : null;
  const { data: prevStandings } = useStandings(editionId, prevRound);

  const positionChanges = useMemo(() => {
    if (!prevRound || !prevStandings?.length || !standings?.length) return undefined;
    return computePositionChanges(standings, prevStandings);
  }, [standings, prevStandings, prevRound]);

  const leader = standings?.[0];
  const tableTitle = upToRound
    ? t('pages.league.tableToRound', { round: upToRound })
    : t('pages.league.overallTable');

  return (
    <div className="pb-20">
      <Seo
        title={t('pages.league.seoTitle')}
        description={
          activeSeason
            ? `${t('pages.league.seoTitle')} — ${activeSeason.name}`
            : t('pages.league.seoDesc')
        }
      />

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
            seasons={calendars}
            seasonId={calendarId}
            onSeasonChange={setCalendarId}
            rounds={rounds ?? []}
            upToRound={upToRound}
            onRoundChange={setUpToRound}
          />
        )}

        {standingsError && <DataError onRetry={() => void refetchStandings()} className="py-8" />}

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
