import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  useDeleteGallery,
  useGalleryAdminList,
  useUpdateGalleryStatus,
} from '../../hooks/use-content-admin';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { useConfirm } from '../../hooks/use-confirm';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { GalleryAdminFormSheet } from './GalleryAdminFormSheet';
import type { GalleryItem } from '../../types';

export function GalleryAdminPage() {
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, 'gallery.manage');
  const canApprove = hasPermission(user?.permissions, 'gallery.approve');
  const { data, isLoading } = useGalleryAdminList();
  const publish = useUpdateGalleryStatus();
  const remove = useDeleteGallery();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<GalleryItem | null>(null);

  const onDelete = async (item: GalleryItem) => {
    const ok = await confirm({
      title: 'Obrisati galeriju?',
      description: `"${item.title}" će biti trajno obrisana.`,
      confirmLabel: 'Obriši',
      variant: 'danger',
    });
    if (ok) void remove.mutateAsync(item.id);
  };

  return (
    <>
      <Seo title="Galerija" />
      {dialog}
      <AdminPageShell
        title="Galerija"
        isLoading={isLoading}
        actions={
          canManage ? (
            <Button size="sm" onClick={() => { setEdit(null); setOpen(true); }}>
              <Plus className="mr-1 h-4 w-4" />
              Nova
            </Button>
          ) : undefined
        }
      >
        <AdminDataTable
          rows={data ?? []}
          columns={[
            { key: 'title', header: 'Naslov', render: (r) => r.title },
            { key: 'status', header: 'Status', render: (r) => <Badge>{r.status}</Badge> },
            {
              key: 'actions',
              header: 'Akcije',
              render: (r) => (
                <div className="flex gap-1">
                  {canManage && (
                    <Button variant="ghost" size="icon" onClick={() => { setEdit(r); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {canApprove && r.status !== 'PUBLISHED' && (
                    <Button size="sm" variant="outline" onClick={() => void publish.mutateAsync({ id: r.id, status: 'PUBLISHED' })}>
                      Objavi
                    </Button>
                  )}
                  {canManage && (
                    <Button variant="ghost" size="icon" onClick={() => void onDelete(r)}>
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </AdminPageShell>
      <GalleryAdminFormSheet
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) setEdit(null); }}
        edit={edit}
      />
    </>
  );
}
