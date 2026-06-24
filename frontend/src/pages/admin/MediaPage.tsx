import { useMediaAssets } from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

interface MediaAsset {
  id: string;
  filename: string;
  mimeType?: string | null;
}

export function MediaPage() {
  const { data, isLoading } = useMediaAssets();
  const assets = (data as MediaAsset[] | undefined) ?? [];

  return (
    <>
      <Seo title="Mediji" />
      <AdminPageShell title="Mediji" isLoading={isLoading}>
        <AdminDataTable
          rows={assets}
          columns={[
            { key: 'filename', header: 'Fajl', render: (r) => r.filename },
            { key: 'mime', header: 'Tip', render: (r) => r.mimeType ?? '—' },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
