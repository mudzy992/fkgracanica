import { useTranslation } from 'react-i18next';
import { useOwnClub, useSeasons, useStandings } from '../../hooks';
import { LeagueStandingsMobile } from '../../components/public/league/LeagueStandingsMobile';
import { LeagueStandingsTable } from '../../components/public/league/LeagueStandingsTable';
import { WidgetSectionHeaderBlock } from '../../components/public/shell/WidgetSectionHeaderBlock';
import { WidgetSectionShell } from '../../components/public/shell/WidgetSectionShell';
import { Skeleton } from '../../components/ui/skeleton';
import type { WidgetConfigMap } from './schemas';

type Props = { config: WidgetConfigMap['league-table'] };

export function LeagueTableWidget({ config }: Props) {
  const { t } = useTranslation();
  const { data: ownClub } = useOwnClub();
  const { data: seasons, isLoading: sl } = useSeasons();
  const seasonId = (seasons as { id: string }[] | undefined)?.[0]?.id;
  const { data: standings, isLoading: stl } = useStandings(seasonId);
  const rows = standings ?? [];

  return (
    <WidgetSectionShell id="liga">
      <WidgetSectionHeaderBlock
        title={config.title ?? t('home.leagueTable')}
        subtitle={t('home.leagueSubtitle', 'Trenutno stanje u ligi')}
      />
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
