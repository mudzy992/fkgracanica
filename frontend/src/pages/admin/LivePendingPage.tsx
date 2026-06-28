import { Link } from 'react-router-dom';
import { usePendingLiveReports, useApproveMatchReport } from '../../hooks/use-live-admin';
import { formatDateTime } from '../../lib/utils';
import { AdminPageShell, AdminDataTable } from '../../components/admin/AdminPageShell';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Seo } from '../../components/seo/Seo';

export function LivePendingPage() {
  const { data, isLoading } = usePendingLiveReports();
  const approve = useApproveMatchReport();

  return (
    <AdminPageShell title="Live izvještaji na odobrenje">
      <Seo title="Live odobrenje" />
      <AdminDataTable
        rows={data ?? []}
        empty={isLoading ? 'Učitavanje...' : 'Nema utakmica na čekanju.'}
        columns={[
          {
            key: 'match',
            header: 'Utakmica',
            render: (r) => `${r.homeClub?.name} ${r.homeScore}:${r.awayScore} ${r.awayClub?.name}`,
          },
          {
            key: 'comp',
            header: 'Takmičenje',
            render: (r) => r.season?.competition?.name ?? '—',
          },
          { key: 'date', header: 'Datum', render: (r) => formatDateTime(r.scheduledAt) },
          { key: 'status', header: 'Status', render: () => <Badge>Čeka odobrenje</Badge> },
          {
            key: 'actions',
            header: 'Akcije',
            render: (r) => (
              <div className="flex flex-wrap gap-2">
                <Link to={`/utakmice/${r.id}`}>
                  <Button size="sm" variant="outline">Pregled</Button>
                </Link>
                <Button
                  size="sm"
                  onClick={() => void approve.mutateAsync(r.id)}
                  disabled={approve.isPending}
                >
                  Odobri
                </Button>
              </div>
            ),
          },
        ]}
      />
    </AdminPageShell>
  );
}
