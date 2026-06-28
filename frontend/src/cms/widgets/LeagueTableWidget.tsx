import { useTranslation } from 'react-i18next';
import { useOwnClub, useSeasons, useStandings } from '../../hooks';
import { LeagueStandingsMobile } from '../../components/public/league/LeagueStandingsMobile';
import { LeagueStandingsTable } from '../../components/public/league/LeagueStandingsTable';
import { PublicSection } from '../../components/public/shell/PublicSection';
import { PremiumCard } from '../../components/public/shell/PremiumCard';
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
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <PublicSection title={config.title ?? t('home.leagueTable')}>
        {sl || stl ? (
          <Skeleton className="h-48 w-full rounded-2xl" />
        ) : (
          <>
            <LeagueStandingsMobile rows={rows} />
            <PremiumCard className="hidden overflow-x-auto p-0 lg:block" hover={false}>
              <LeagueStandingsTable rows={rows} compact highlightClubId={ownClub?.id} />
              {rows.length === 0 && (
                <p className="p-6 text-center text-text-muted">{t('common.noResults')}</p>
              )}
            </PremiumCard>
          </>
        )}
      </PublicSection>
    </section>
  );
}
