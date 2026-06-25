import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useMuseum } from '../../hooks';
import { useDeleteMuseumItem } from '../../hooks/use-heritage-admin';
import { useConfirm } from '../../hooks/use-confirm';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { MuseumAdminFormSheet } from './MuseumAdminFormSheet';
import type { MuseumItem } from '../../types';

type MuseumRow = MuseumItem & { category?: string };

export function MuseumAdminPage() {
  const { data, isLoading } = useMuseum();
  const remove = useDeleteMuseumItem();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<MuseumRow | null>(null);

  const onDelete = async (item: MuseumRow) => {
    const ok = await confirm({
      title: 'Obrisati predmet?',
      description: item.title,
      variant: 'danger',
      confirmLabel: 'Obriši',
    });
    if (ok) void remove.mutateAsync(item.id);
  };

  return (
    <>
      <Seo title="Muzej" />
      {dialog}
      <AdminPageShell
        title="Muzej"
        isLoading={isLoading}
        actions={
          <Button size="sm" onClick={() => { setEdit(null); setOpen(true); }}>
            <Plus className="mr-1 h-4 w-4" />
            Novi
          </Button>
        }
      >
        <AdminDataTable
          rows={(data as MuseumRow[] | undefined) ?? []}
          columns={[
            { key: 'title', header: 'Naslov', render: (r) => r.title },
            { key: 'category', header: 'Kategorija', render: (r) => r.category ?? '—' },
            { key: 'year', header: 'Godina', render: (r) => r.year ?? '—' },
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
      <MuseumAdminFormSheet
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) setEdit(null); }}
        edit={edit}
      />
    </>
  );
}
