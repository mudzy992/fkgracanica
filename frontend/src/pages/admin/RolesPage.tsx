import { useRoles } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

interface Role {
  id: string;
  name: string;
  description?: string | null;
}

export function RolesPage() {
  const { data, isLoading } = useRoles();
  const roles = (data as Role[] | undefined) ?? [];

  return (
    <>
      <Seo title="Uloge" />
      <AdminPageShell title="Uloge (read-only)" isLoading={isLoading}>
        <AdminDataTable
          rows={roles}
          columns={[
            { key: 'name', header: 'Naziv', render: (r) => r.name },
            { key: 'desc', header: 'Opis', render: (r) => r.description ?? '—' },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
