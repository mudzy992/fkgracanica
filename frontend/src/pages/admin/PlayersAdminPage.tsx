import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { usePlayers } from '../../hooks';
import { useDeletePlayer } from '../../hooks/use-competition-admin';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { useConfirm } from '../../hooks/use-confirm';
import { playerPositionLabel } from '../../lib/player-utils';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { PlayersAdminFormSheet } from './PlayersAdminFormSheet';
import type { Player } from '../../types';

export function PlayersAdminPage() {
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, 'players.manage');
  const { data, isLoading, isError, refetch } = usePlayers();
  const remove = useDeletePlayer();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Player | null>(null);

  const onDelete = async (item: Player) => {
    const ok = await confirm({
      title: 'Obrisati igrača?',
      description: `${item.firstName} ${item.lastName} će biti obrisan.`,
      confirmLabel: 'Obriši',
      variant: 'danger',
    });
    if (ok) void remove.mutateAsync(item.id);
  };

  return (
    <>
      <Seo title="Igrači" />
      {dialog}
      <AdminPageShell
        isError={isError}
        onRetry={() => void refetch()}
        title="Igrači"
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
              header: 'Ime',
              render: (r) => (
                <span className="flex items-center gap-2">
                  {r.firstName} {r.lastName}
                  {!r.isActive && <Badge variant="muted">Neaktivan</Badge>}
                </span>
              ),
            },
            { key: 'position', header: 'Pozicija', render: (r) => playerPositionLabel(r.position) },
            { key: 'number', header: 'Broj', render: (r) => r.number ?? '—' },
            { key: 'club', header: 'Klub', render: (r) => r.club?.name ?? '—' },
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
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => void onDelete(r)}>
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                ) : null,
            },
          ]}
        />
      </AdminPageShell>
      <PlayersAdminFormSheet
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
