import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useGalleryList } from '../../hooks';
import { useCreateGallery, useUpdateGalleryStatus } from '../../hooks/use-content-admin';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';

export function GalleryAdminPage() {
  const { data, isLoading } = useGalleryList();
  const create = useCreateGallery();
  const publish = useUpdateGalleryStatus();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  const onCreate = async () => {
    await create.mutateAsync({ title });
    setTitle('');
    setOpen(false);
  };

  return (
    <>
      <Seo title="Galerija" />
      <AdminPageShell
        title="Galerija"
        isLoading={isLoading}
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Nova
          </Button>
        }
      >
        <AdminDataTable
          rows={data ?? []}
          columns={[
            { key: 'title', header: 'Naslov', render: (r) => r.title },
            { key: 'status', header: 'Status', render: (r) => <Badge>{r.status}</Badge> },
            {
              key: 'actions',
              header: '',
              render: (r) =>
                r.status !== 'PUBLISHED' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void publish.mutateAsync({ id: r.id, status: 'PUBLISHED' })}
                  >
                    Objavi
                  </Button>
                ) : null,
            },
          ]}
        />
      </AdminPageShell>
      <AdminFormSheet open={open} onOpenChange={setOpen} title="Nova galerija">
        <div className="space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Naslov" />
          <Button onClick={() => void onCreate()} disabled={!title || create.isPending}>
            Kreiraj
          </Button>
        </div>
      </AdminFormSheet>
    </>
  );
}
