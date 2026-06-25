import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useClubs } from '../../hooks';
import { useDeleteClub } from '../../hooks/use-competition-admin';
import { useConfirm } from '../../hooks/use-confirm';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { ClubsAdminFormSheet } from './ClubsAdminFormSheet';
import type { Club } from '../../types';

type ClubRow = Club & { stadium?: string | null; isOwnClub?: boolean };

export function ClubsAdminPage() {
  const { data, isLoading } = useClubs();
  const remove = useDeleteClub();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<ClubRow | null>(null);

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
      <Seo title="Klubovi" />
      {dialog}
      <AdminPageShell
        title="Klubovi"
        isLoading={isLoading}
        actions={
          <Button size="sm" onClick={() => { setEdit(null); setOpen(true); }}>
            <Plus className="mr-1 h-4 w-4" />
            Novi
          </Button>
        }
      >
        <AdminDataTable
          rows={(data as ClubRow[] | undefined) ?? []}
          columns={[
            { key: 'name', header: 'Naziv', render: (r) => r.name },
            { key: 'city', header: 'Grad', render: (r) => r.city ?? '—' },
            { key: 'stadium', header: 'Stadion', render: (r) => r.stadium ?? '—' },
            {
              key: 'own',
              header: 'Naš klub',
              render: (r) =>
                r.isOwnClub ? <Badge variant="success">Da</Badge> : <Badge variant="muted">Ne</Badge>,
            },
            {
              key: 'actions',
              header: 'Akcije',
              render: (r) => (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => { setEdit(r); setOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => void onDelete(r)}>
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </AdminPageShell>
      <ClubsAdminFormSheet
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) setEdit(null); }}
        edit={edit}
      />
    </>
  );
}
