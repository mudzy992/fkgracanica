import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

type ClubRow = Club & { _count?: { players: number } };

export function ClubsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, 'clubs.manage');
  const { data, isLoading } = useClubsWithCounts();
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
    if (ok) void remove.mutateAsync(club.id);
  };

  return (
    <>
      <Seo title="Klub & kadar" />
      {dialog}
      <AdminPageShell
        title="Klub & kadar"
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
                <Link to={`/admin/clubs/${r.id}`} className="font-medium text-primary hover:underline">
                  {r.name}
                </Link>
              ),
            },
            { key: 'city', header: 'Grad', render: (r) => r.city ?? '—' },
            { key: 'players', header: 'Igrači', render: (r) => r._count?.players ?? 0 },
            {
              key: 'own',
              header: 'Tip',
              render: (r) =>
                r.isOwnClub ? <Badge variant="success">Naš klub</Badge> : <Badge variant="muted">Protivnik</Badge>,
            },
            {
              key: 'actions',
              header: 'Akcije',
              render: (r) => (
                <div className="flex gap-1">
                  <Link to={`/admin/clubs/${r.id}`}>
                    <Button variant="ghost" size="sm">Upravljaj</Button>
                  </Link>
                  {canManage && !r.isOwnClub && (
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
      <ClubsCreateSheet
        open={open}
        onOpenChange={setOpen}
        onCreated={(id) => navigate(`/admin/clubs/${id}?tab=basic`)}
      />
    </>
  );
}
