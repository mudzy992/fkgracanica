import { useClubStats } from '../../../../hooks/use-club-hub';
import { ClubStatsSummary, PlayerStatsTable } from '../../../../components/club/ClubStatsPanels';
import { Skeleton } from '../../../../components/ui/skeleton';

export function ClubStatsTab({ clubId }: { clubId: string }) {
  const { data, isLoading } = useClubStats(clubId);
  if (isLoading) return <Skeleton className="h-64" />;
  if (!data) return <p className="text-text-muted">Nema podataka.</p>;
  return (
    <div className="space-y-8">
      <ClubStatsSummary stats={data} />
      <section>
        <h2 className="mb-4 text-lg font-semibold">Statistike igrača</h2>
        <PlayerStatsTable stats={data} />
      </section>
    </div>
  );
}
