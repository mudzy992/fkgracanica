import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
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
import { contentStatusLabel } from '../../lib/content-status-labels';
import type { GalleryItem } from '../../types';

export function GalleryAdminPage() {
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, 'gallery.manage');
  const canApprove = hasPermission(user?.permissions, 'gallery.approve');
  const { data, isLoading, isError, refetch } = useGalleryAdminList();
  const publish = useUpdateGalleryStatus();
  const remove = useDeleteGallery();
  const { confirm, dialog } = useConfirm();

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
        isError={isError}
        onRetry={() => void refetch()}
        title="Galerija"
        isLoading={isLoading}
        actions={
          canManage ? (
            <Link to="/admin/gallery/new">
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Nova
              </Button>
            </Link>
          ) : undefined
        }
      >
        <AdminDataTable
          rows={data ?? []}
          columns={[
            {
              key: 'title',
              header: 'Naslov',
              render: (r) => (
                <Link to={`/admin/gallery/${r.id}/edit`} className="font-medium hover:underline">
                  {r.title}
                </Link>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (r) => <Badge>{contentStatusLabel(r.status)}</Badge>,
            },
            {
              key: 'actions',
              header: 'Akcije',
              render: (r) => (
                <div className="flex gap-1">
                  {canManage && (
                    <Link to={`/admin/gallery/${r.id}/edit`}>
                      <Button variant="ghost" size="icon" aria-label="Uredi">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  {canApprove && r.status !== 'PUBLISHED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void publish.mutateAsync({ id: r.id, status: 'PUBLISHED' })}
                    >
                      Objavi
                    </Button>
                  )}
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void onDelete(r)}
                      aria-label="Obriši"
                    >
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
