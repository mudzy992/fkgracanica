import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOwnClub, useSeasons, useStandings } from '../../hooks';
import {
  competitionSeasonLabel,
  pickActiveLeagueYearKey,
  pickDefaultSeasonId,
  seasonsInYear,
  type SeasonOption,
} from '../../lib/season-utils';
import { LeagueStandingsMobile } from '../../components/public/league/LeagueStandingsMobile';
import { LeagueStandingsTable } from '../../components/public/league/LeagueStandingsTable';
import { PublicPill } from '../../components/public/PublicPill';
import { WidgetSectionHeaderBlock } from '../../components/public/shell/WidgetSectionHeaderBlock';
import { WidgetSectionShell } from '../../components/public/shell/WidgetSectionShell';
import { Skeleton } from '../../components/ui/skeleton';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['league-table'] };

export function LeagueTableWidget({ config }: Props) {
  const { t } = useTranslation();
  const { data: ownClub } = useOwnClub();
  const { data: seasons, isLoading: sl } = useSeasons();
  const allSeasons = useMemo(() => (seasons as SeasonOption[] | undefined) ?? [], [seasons]);
  const yearKey = pickActiveLeagueYearKey(allSeasons);
  const inYear = useMemo(
    () => (yearKey ? seasonsInYear(allSeasons, yearKey) : []).slice().sort((a, b) => {
      const league = Number(b.competition?.isLeague) - Number(a.competition?.isLeague);
      return league || competitionSeasonLabel(a).localeCompare(competitionSeasonLabel(b));
    }),
    [allSeasons, yearKey],
  );
  const [seasonId, setSeasonId] = useState<string | undefined>();

  useEffect(() => {
    const league = inYear.filter((s) => s.competition?.isLeague);
    const next = pickDefaultSeasonId(league.length ? league : inYear);
    setSeasonId((prev) => (prev && inYear.some((s) => s.id === prev) ? prev : next));
  }, [inYear]);

  const selected = inYear.find((s) => s.id === seasonId);
  const { data: standings, isLoading: stl } = useStandings(seasonId);
  const rows = standings ?? [];
  const title = selected
    ? competitionSeasonLabel(selected)
    : (config.title ?? t('home.leagueTable'));

  return (
    <WidgetSectionShell id="liga">
      <WidgetSectionHeaderBlock
        title={title}
        subtitle={t('home.leagueSubtitle', 'Trenutno stanje u ligi')}
      />
      {inYear.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {inYear.map((s) => (
            <PublicPill key={s.id} active={s.id === seasonId} onClick={() => setSeasonId(s.id)}>
              {competitionSeasonLabel(s)}
              {s.competition?.isLeague ? ' · liga' : ''}
            </PublicPill>
          ))}
        </div>
      )}
      {sl || stl ? (
        <Skeleton className="h-48 w-full rounded-3xl" />
      ) : (
        <div className="border-gradient-club glass-premium overflow-hidden rounded-3xl">
          <LeagueStandingsMobile rows={rows} />
          <div className="hidden overflow-x-auto lg:block">
            <LeagueStandingsTable rows={rows} highlightClubId={ownClub?.id} />
          </div>
          {rows.length === 0 && (
            <p className="p-6 text-center text-text-muted">{t('common.noResults')}</p>
          )}
        </div>
      )}
    </WidgetSectionShell>
  );
}
