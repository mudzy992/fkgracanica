import { useUsers } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

export function UsersPage() {
  const { data, isLoading } = useUsers();
  return (
    <>
      <Seo title="Korisnici" />
      <AdminPageShell title="Korisnici" isLoading={isLoading}>
        <AdminDataTable
          rows={data ?? []}
          columns={[
            { key: 'email', header: 'Email', render: (r) => r.email },
            {
              key: 'name',
              header: 'Ime',
              render: (r) => `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() || '—',
            },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
