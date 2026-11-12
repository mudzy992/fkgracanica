import { buttonVariants } from "../../../components/ui/button-variants";
import { cn } from "../../../lib/utils";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { adminLinkClass } from '../../../lib/admin-styles';
import { Plus, Trash2 } from 'lucide-react';
import { useClubsWithCounts } from '../../../hooks/use-club-hub';
import { useDeleteClub } from '../../../hooks/use-competition-admin';
import { useAuth } from '../../../lib/auth';
import { hasPermission } from '../../../lib/permissions';
import { useConfirm } from '../../../hooks/use-confirm';
import { Seo } from '../../../components/seo/Seo';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../../components/admin/AdminPageShell';
import { ClubsCreateSheet } from './ClubsCreateSheet';
import type { Club } from '../../../types';
import { runAction } from '../../../lib/action-errors';

type ClubRow = Club & { _count?: { players: number } };

export function ClubsListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, 'clubs.manage');
  const { data, isLoading, isError, refetch } = useClubsWithCounts();
  const remove = useDeleteClub();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);

  const onDelete = async (club: ClubRow) => {
    const ok = await confirm({
      title: 'Obrisati klub?',
      description: `"${club.name}" će biti obrisan.`,
      confirmLabel: 'Obriši',
      variant: 'danger',
    });
    if (ok) void runAction(remove.mutateAsync(club.id));
  };

  return (
    <>
      <Seo title={t('admin.clubSquad')} />
      {dialog}
      <AdminPageShell
        isError={isError}
        onRetry={() => void refetch()}
        title={t('admin.clubSquad')}
        isLoading={isLoading}
        actions={
          canManage ? (
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Novi klub
            </Button>
          ) : undefined
        }
      >
        <AdminDataTable
          rows={(data as ClubRow[] | undefined) ?? []}
          columns={[
            {
              key: 'name',
              header: 'Klub',
              render: (r) => (
                <Link to={`/admin/clubs/${r.id}`} className={adminLinkClass}>
                  {r.name}
                </Link>
              ),
            },
            { key: 'city', header: 'Grad', render: (r) => r.city ?? '—' },
            { key: 'players', header: 'Igrači', render: (r) => r._count?.players ?? 0 },
            {
              key: 'own',
              header: t('admin.clubsList.type'),
              render: (r) =>
                r.isOwnClub ? (
                  <Badge variant="success">{t('admin.club.ownClub')}</Badge>
                ) : (
                  <Badge variant="muted">{t('admin.clubsList.opponent')}</Badge>
                ),
            },
            {
              key: 'actions',
              header: t('admin.common.actions'),
              render: (r) => (
                <div className="flex gap-1">
                  <Link to={`/admin/clubs/${r.id}`} className={cn(buttonVariants({variant: "ghost", size: "sm"}))}>{t('admin.clubsList.manage')}</Link>
                  {canManage && !r.isOwnClub && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void onDelete(r)}
                      aria-label={t('actions.delete')}
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
      <ClubsCreateSheet
        open={open}
        onOpenChange={setOpen}
        onCreated={(id) => navigate(`/admin/clubs/${id}?tab=basic`)}
      />
    </>
  );
}
