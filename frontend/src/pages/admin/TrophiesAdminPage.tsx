import { useTrophies } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

export function TrophiesAdminPage() {
  const { data, isLoading } = useTrophies();
  return (
    <>
      <Seo title="Trofeji" />
      <AdminPageShell title="Trofeji" isLoading={isLoading}>
        <AdminDataTable
          rows={data ?? []}
          columns={[
            { key: 'title', header: 'Naslov', render: (r) => r.title },
            { key: 'year', header: 'Godina', render: (r) => r.year },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
