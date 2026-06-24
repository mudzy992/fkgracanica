import { useMuseum } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

export function MuseumAdminPage() {
  const { data, isLoading } = useMuseum();
  return (
    <>
      <Seo title="Muzej" />
      <AdminPageShell title="Muzej" isLoading={isLoading}>
        <AdminDataTable
          rows={data ?? []}
          columns={[
            { key: 'title', header: 'Naslov', render: (r) => r.title },
            { key: 'year', header: 'Godina', render: (r) => r.year ?? '—' },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
