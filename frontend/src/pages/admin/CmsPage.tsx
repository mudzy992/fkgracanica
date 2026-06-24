import { useCmsBlocks } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

interface CmsBlock {
  id: string;
  key: string;
  title?: string | null;
}

export function CmsPage() {
  const { data, isLoading } = useCmsBlocks();
  const blocks = (data as CmsBlock[] | undefined) ?? [];

  return (
    <>
      <Seo title="CMS" />
      <AdminPageShell title="CMS blokovi" isLoading={isLoading}>
        <AdminDataTable
          rows={blocks}
          columns={[
            { key: 'key', header: 'Ključ', render: (r) => r.key },
            { key: 'title', header: 'Naslov', render: (r) => r.title ?? '—' },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
