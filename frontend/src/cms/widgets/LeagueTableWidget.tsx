import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOwnClub, useSeasons, useStandings } from '../../hooks';
import {
  editionLabel,
  leagueEdition,
  pickDefaultCalendarId,
  sortedEditions,
  type CalendarSeason,
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
  const calendars = useMemo(() => (seasons as CalendarSeason[] | undefined) ?? [], [seasons]);
  const calendar = useMemo(() => {
    const id = pickDefaultCalendarId(calendars);
    return calendars.find((s) => s.id === id) ?? calendars[0];
  }, [calendars]);
  const editions = useMemo(() => sortedEditions(calendar), [calendar]);
  const [editionId, setEditionId] = useState<string | undefined>();

  useEffect(() => {
    const next = leagueEdition(calendar)?.id;
    setEditionId((prev) => (prev && editions.some((e) => e.id === prev) ? prev : next));
  }, [calendar, editions]);

  const selected = editions.find((e) => e.id === editionId);
  const { data: standings, isLoading: stl } = useStandings(editionId);
  const rows = standings ?? [];
  const title = selected
    ? editionLabel(selected)
    : (config.title ?? t('home.leagueTable'));

  return (
    <WidgetSectionShell id="liga">
      <WidgetSectionHeaderBlock
        title={title}
        subtitle={t('home.leagueSubtitle', 'Trenutno stanje u ligi')}
      />
      {editions.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {editions.map((e) => (
            <PublicPill key={e.id} active={e.id === editionId} onClick={() => setEditionId(e.id)}>
              {editionLabel(e)}
              {e.competition?.isLeague ? ' · liga' : ''}
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
