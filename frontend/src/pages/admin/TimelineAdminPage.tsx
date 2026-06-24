import { useClubTimeline } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

export function TimelineAdminPage() {
  const { data, isLoading } = useClubTimeline();
  return (
    <>
      <Seo title="Vremenska linija" />
      <AdminPageShell title="Vremenska linija kluba" isLoading={isLoading}>
        <AdminDataTable
          rows={data ?? []}
          columns={[
            { key: 'year', header: 'Godina', render: (r) => r.year },
            { key: 'title', header: 'Naslov', render: (r) => r.title },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
