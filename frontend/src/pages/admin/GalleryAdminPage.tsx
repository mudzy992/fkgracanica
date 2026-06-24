import { useGalleryList } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

export function GalleryAdminPage() {
  const { data, isLoading } = useGalleryList();
  return (
    <>
      <Seo title="Galerija" />
      <AdminPageShell title="Galerija" isLoading={isLoading}>
        <AdminDataTable
          rows={data ?? []}
          columns={[
            { key: 'title', header: 'Naslov', render: (r) => r.title },
            { key: 'status', header: 'Status', render: (r) => <Badge>{r.status}</Badge> },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
