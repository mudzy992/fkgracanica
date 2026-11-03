import { useState } from 'react';
import { Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useTrophies } from '../../hooks';
import { useDeleteTrophy } from '../../hooks/use-content-admin';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { useConfirm } from '../../hooks/use-confirm';
import { Badge } from '../../components/ui/badge';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { TrophiesAdminFormSheet } from './TrophiesAdminFormSheet';
import type { Trophy } from '../../types';

export function TrophiesAdminPage() {
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, 'trophies.manage');
  const { data, isLoading, isError, refetch } = useTrophies();
  const remove = useDeleteTrophy();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Trophy | null>(null);

  const onDelete = async (item: Trophy) => {
    const ok = await confirm({
      title: 'Obrisati trofej?',
      description: `"${item.name}" će biti obrisan.`,
      confirmLabel: 'Obriši',
      variant: 'danger',
    });
    if (ok) void remove.mutateAsync(item.id);
  };

  return (
    <>
      <Seo title="Trofeji" />
      {dialog}
      <AdminPageShell
        isError={isError}
        onRetry={() => void refetch()}
        title="Trofeji"
        isLoading={isLoading}
        actions={
          canManage ? (
            <Button
              size="sm"
              onClick={() => {
                setEdit(null);
                setOpen(true);
              }}
            >
              <Plus className="mr-1 h-4 w-4" />
              Novi
            </Button>
          ) : undefined
        }
      >
        <AdminDataTable
          rows={data ?? []}
          columns={[
            {
              key: 'name',
              header: 'Naziv',
              render: (r) => (
                <span className="flex items-center gap-2">
                  {r.name}
                  {r.featured && (
                    <Badge variant="success">
                      <Star className="mr-1 h-3 w-3" />
                      Istaknut
                    </Badge>
                  )}
                </span>
              ),
            },
            { key: 'year', header: 'Godina', render: (r) => r.year },
            {
              key: 'actions',
              header: 'Akcije',
              render: (r) =>
                canManage ? (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEdit(r);
                        setOpen(true);
                      }}

                      aria-label="Uredi"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void onDelete(r)}
                      aria-label="Obriši"
                    >
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                ) : null,
            },
          ]}
        />
      </AdminPageShell>
      <TrophiesAdminFormSheet
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEdit(null);
        }}
        edit={edit}
      />
    </>
  );
}
