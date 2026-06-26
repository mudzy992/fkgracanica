import { useTranslation } from 'react-i18next';
import { useOwnClub, useSeasons, useStandings } from '../../hooks';
import { LeagueStandingsMobile } from '../../components/public/league/LeagueStandingsMobile';
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
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-left text-text-muted">
                    <th className="p-3">#</th>
                    <th className="p-3">Klub</th>
                    <th className="p-3">O</th>
                    <th className="p-3">B</th>
                    <th className="p-3">N</th>
                    <th className="p-3">P</th>
                    <th className="p-3 font-bold">Bod</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={row.clubId}
                      className={
                        row.clubId === ownClub?.id
                          ? 'bg-primary/5 font-medium'
                          : 'border-b border-[var(--border-subtle)]'
                      }
                    >
                      <td className="p-3">{i + 1}</td>
                      <td className="p-3">{row.clubName}</td>
                      <td className="p-3">{row.played}</td>
                      <td className="p-3">{row.won}</td>
                      <td className="p-3">{row.drawn}</td>
                      <td className="p-3">{row.lost}</td>
                      <td className="p-3 font-bold">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
