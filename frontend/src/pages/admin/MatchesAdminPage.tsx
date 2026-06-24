import { Link } from 'react-router-dom';
import { useMatches } from '../../hooks';
import { formatDateTime } from '../../lib/utils';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

export function MatchesAdminPage() {
  const { data, isLoading } = useMatches();
  return (
    <>
      <Seo title="Utakmice" />
      <AdminPageShell title="Utakmice" isLoading={isLoading}>
        <AdminDataTable
          rows={data ?? []}
          columns={[
            {
              key: 'match',
              header: 'Utakmica',
              render: (r) => (
                <Link to={`/admin/live/${r.id}`} className="text-accent hover:underline">
                  {r.homeClub?.name ?? '—'} vs {r.awayClub?.name ?? '—'}
                </Link>
              ),
            },
            { key: 'date', header: 'Datum', render: (r) => formatDateTime(r.scheduledAt) },
            { key: 'status', header: 'Status', render: (r) => <Badge>{r.status}</Badge> },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
