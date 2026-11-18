import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useClubs } from '../../hooks';
import { useDeleteClub } from '../../hooks/use-competition-admin';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { useConfirm } from '../../hooks/use-confirm';
import { mediaUrl } from '../../lib/media';
import { clubCrestPath } from '../../lib/club-utils';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { ClubsAdminFormSheet } from './ClubsAdminFormSheet';
import type { Club } from '../../types';
import { runAction } from '../../lib/action-errors';

export function ClubsAdminPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, 'clubs.manage');
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useClubs();
  const remove = useDeleteClub();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Club | null>(null);

  const onDelete = async (club: Club) => {
    const ok = await confirm({
      title: 'Obrisati klub?',
      description: `"${club.name}" će biti obrisan.`,
      confirmLabel: 'Obriši',
      variant: 'danger',
    });
    /* v8 ignore next */
    if (ok) void runAction(remove.mutateAsync(club.id));
  };

  return (
    <>
      <Seo title={t('admin.clubsList.title')} />
      {dialog}
      <AdminPageShell
        isError={Boolean(isError)}
        isFetching={Boolean(isFetching)}
        onRetry={() => void refetch()}
        title={t('admin.clubsList.title')}
        isLoading={Boolean(isLoading)}
        dataUpdatedAt={dataUpdatedAt}
        onRefresh={() => void refetch()}
        actions={
          canManage ? (
            <Button
              size="sm"
              disabled={remove.isPending}
              onClick={() => {
                setEdit(null);
                setOpen(true);
              }}
            >
              <Plus aria-hidden className="mr-1 h-4 w-4" />
              Novi
            </Button>
          ) : undefined
        }
      >
        <AdminDataTable
          rows={data ?? []}
          emptyRole="status"
          columns={[
            {
              key: 'crest',
              header: 'Grb',
              render: (r) => {
                const crest = clubCrestPath(r);
                return crest ? (
                  <img src={mediaUrl(crest, 'thumb')} alt="" className="h-8 w-8 object-contain" />
                ) : (
                  <span className="text-xs text-text-muted">—</span>
                );
              },
            },
            { key: 'name', header: 'Naziv', render: (r) => r.name },
            { key: 'city', header: 'Grad', render: (r) => r.city ?? '—' },
            { key: 'stadium', header: 'Stadion', render: (r) => r.stadium ?? '—' },
            {
              key: 'own',
              header: 'Naš klub',
              render: (r) =>
                r.isOwnClub ? (
                  <Badge variant="success">Da</Badge>
                ) : (
                  <Badge variant="muted">Ne</Badge>
                ),
            },
            {
              key: 'actions',
              header: 'Akcije',
              render: (r) =>
                canManage ? (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={remove.isPending}
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
                      disabled={remove.isPending}
                      onClick={() => void onDelete(r)}
                      aria-label={t('actions.delete')}
                    >
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                ) : null,
            },
          ]}
        />
      </AdminPageShell>
      <ClubsAdminFormSheet
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
