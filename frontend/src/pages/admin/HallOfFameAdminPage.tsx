import { useHallOfFame } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

export function HallOfFameAdminPage() {
  const { data, isLoading } = useHallOfFame();
  return (
    <>
      <Seo title="Hall of Fame" />
      <AdminPageShell title="Hall of Fame" isLoading={isLoading}>
        <AdminDataTable
          rows={data ?? []}
          columns={[
            { key: 'name', header: 'Ime', render: (r) => r.name },
            { key: 'role', header: 'Uloga', render: (r) => r.role ?? '—' },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
