import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { useSponsors } from '../../hooks';
import { useDeleteSponsor, useReorderSponsors } from '../../hooks/use-content-admin';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { useConfirm } from '../../hooks/use-confirm';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { SponsorsAdminFormSheet } from './SponsorsAdminFormSheet';
import type { Sponsor } from '../../types';

export function SponsorsAdminPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, 'sponsors.manage');
  const { data, isLoading, isError, refetch } = useSponsors();
  const remove = useDeleteSponsor();
  const reorder = useReorderSponsors();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Sponsor | null>(null);
  const rows = data ?? [];

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= rows.length) return;
    const ids = rows.map((r) => r.id);
    [ids[index], ids[next]] = [ids[next], ids[index]];
    void reorder.mutateAsync(ids);
  };

  const onDelete = async (item: Sponsor) => {
    const ok = await confirm({
      title: 'Obrisati sponzora?',
      description: `"${item.name}" će biti obrisan.`,
      confirmLabel: 'Obriši',
      variant: 'danger',
    });
    if (ok) void remove.mutateAsync(item.id);
  };

  return (
    <>
      <Seo title={t('admin.sponsors')} />
      {dialog}
      <AdminPageShell
        isError={isError}
        onRetry={() => void refetch()}
        title={t('admin.sponsors')}
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
          rows={rows}
          columns={[
            { key: 'name', header: 'Naziv', render: (r) => r.name },
            { key: 'tier', header: 'Kategorija', render: (r) => r.tier },
            {
              key: 'actions',
              header: 'Akcije',
              render: (r) => {
                const index = rows.findIndex((row) => row.id === r.id);
                return (
                  <div className="flex gap-1">
                    {canManage && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={index === 0}
                          onClick={() => move(index, -1)}

                          aria-label={t('admin.common.moveUp')}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={index === rows.length - 1}
                          onClick={() => move(index, 1)}

                          aria-label={t('admin.common.moveDown')}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEdit(r);
                            setOpen(true);
                          }}

                          aria-label={t('actions.edit')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => void onDelete(r)}
                          aria-label={t('actions.delete')}
                        >
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </>
                    )}
                  </div>
                );
              },
            },
          ]}
        />
      </AdminPageShell>
      <SponsorsAdminFormSheet
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
