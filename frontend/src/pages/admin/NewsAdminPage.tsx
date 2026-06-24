import { useNewsList } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

export function NewsAdminPage() {
  const { data, isLoading } = useNewsList();
  return (
    <>
      <Seo title="Vijesti" />
      <AdminPageShell title="Vijesti" isLoading={isLoading}>
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
