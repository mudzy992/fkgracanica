import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useHallOfFame } from '../../hooks';
import { useDeleteHallOfFame } from '../../hooks/use-heritage-admin';
import { useConfirm } from '../../hooks/use-confirm';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { HallOfFameAdminFormSheet } from './HallOfFameAdminFormSheet';
import type { HallOfFameEntry } from '../../types';

export function HallOfFameAdminPage() {
  const { data, isLoading } = useHallOfFame();
  const remove = useDeleteHallOfFame();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<HallOfFameEntry | null>(null);

  const onDelete = async (item: HallOfFameEntry) => {
    const ok = await confirm({
      title: 'Obrisati unos?',
      description: item.name,
      variant: 'danger',
      confirmLabel: 'Obriši',
    });
    if (ok) void remove.mutateAsync(item.id);
  };

  return (
    <>
      <Seo title="Hall of Fame" />
      {dialog}
      <AdminPageShell
        title="Hall of Fame"
        isLoading={isLoading}
        actions={
          <Button size="sm" onClick={() => { setEdit(null); setOpen(true); }}>
            <Plus className="mr-1 h-4 w-4" />
            Novi
          </Button>
        }
      >
        <AdminDataTable
          rows={data ?? []}
          columns={[
            { key: 'name', header: 'Ime', render: (r) => r.name },
            { key: 'role', header: 'Uloga', render: (r) => r.role ?? '—' },
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
      <HallOfFameAdminFormSheet
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) setEdit(null); }}
        edit={edit}
      />
    </>
  );
}
