import { useRef } from 'react';
import { useMediaAssets } from '../../hooks';
import { useDeleteMedia, useUploadMedia } from '../../hooks/use-media-admin';
import { mediaUrl } from '../../lib/media';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import type { MediaAsset } from '../../hooks/use-media-admin';

export function MediaPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading } = useMediaAssets();
  const upload = useUploadMedia();
  const remove = useDeleteMedia();
  const assets = (data as MediaAsset[] | undefined) ?? [];

  const onFile = (file: File) => {
    void upload.mutateAsync(file);
  };

  const onDelete = (asset: MediaAsset) => {
    if (window.confirm(`Obrisati "${asset.filename}"?`)) void remove.mutateAsync(asset.id);
  };

  return (
    <>
      <Seo title="Mediji" />
      <AdminPageShell
        title="Mediji"
        isLoading={isLoading}
        actions={
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFile(file);
                e.target.value = '';
              }}
            />
            <Button onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
              {upload.isPending ? 'Upload...' : 'Upload slike'}
            </Button>
          </>
        }
      >
        <AdminDataTable
          rows={assets}
          empty="Nema medija — uploadujte sliku."
          columns={[
            {
              key: 'preview',
              header: 'Pregled',
              render: (r) =>
                r.thumbPath || r.originalPath ? (
                  <img
                    src={mediaUrl(r.thumbPath ?? r.originalPath, 'thumb')}
                    alt=""
                    className="h-12 w-12 rounded object-cover"
                  />
                ) : (
                  '—'
                ),
            },
            { key: 'filename', header: 'Fajl', render: (r) => r.filename },
            { key: 'mime', header: 'Tip', render: (r) => r.mimeType },
            {
              key: 'actions',
              header: 'Akcije',
              render: (r) => (
                <Button size="sm" variant="ghost" onClick={() => onDelete(r)}>
                  Obriši
                </Button>
              ),
            },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
