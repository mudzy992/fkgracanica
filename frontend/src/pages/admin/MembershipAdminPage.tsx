import { useMemberships } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

interface Membership {
  id: string;
  fullName?: string;
  email?: string;
  status?: string;
}

export function MembershipAdminPage() {
  const { data, isLoading } = useMemberships();
  const items = (data as Membership[] | undefined) ?? [];

  return (
    <>
      <Seo title="Članstvo" />
      <AdminPageShell title="Članstvo" isLoading={isLoading}>
        <AdminDataTable
          rows={items}
          columns={[
            { key: 'name', header: 'Ime', render: (r) => r.fullName ?? '—' },
            { key: 'email', header: 'Email', render: (r) => r.email ?? '—' },
            { key: 'status', header: 'Status', render: (r) => r.status ?? '—' },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
