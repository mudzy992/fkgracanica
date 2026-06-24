import { usePlayers } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

export function PlayersAdminPage() {
  const { data, isLoading } = usePlayers();
  return (
    <>
      <Seo title="Igrači" />
      <AdminPageShell title="Igrači" isLoading={isLoading}>
        <AdminDataTable
          rows={data ?? []}
          columns={[
            {
              key: 'name',
              header: 'Ime',
              render: (r) => `${r.firstName} ${r.lastName}`,
            },
            { key: 'number', header: 'Broj', render: (r) => r.number ?? '—' },
            { key: 'position', header: 'Pozicija', render: (r) => r.position ?? '—' },
            {
              key: 'active',
              header: 'Aktivan',
              render: (r) => <Badge variant={r.isActive ? 'success' : 'muted'}>{r.isActive ? 'Da' : 'Ne'}</Badge>,
            },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
