import { useClubStats } from '../../../../hooks/use-club-hub';
import { ClubStatsSummary, PlayerStatsTable } from '../../../../components/club/ClubStatsPanels';
import { Skeleton } from '../../../../components/ui/skeleton';
import { useTranslation } from 'react-i18next';

export function ClubStatsTab({ clubId }: { clubId: string }) {
  const { t } = useTranslation();
  const { data, isLoading } = useClubStats(clubId);
  if (isLoading) return <Skeleton className="h-64" />;
  if (!data) return <p className="text-text-muted">{t('admin.clubStats.empty')}</p>;
  return (
    <div className="space-y-8">
      <ClubStatsSummary stats={data} />
      <section>
        <h2 className="mb-4 text-lg font-semibold">{t('admin.clubStats.title')}</h2>
        <PlayerStatsTable stats={data} />
      </section>
    </div>
  );
}
