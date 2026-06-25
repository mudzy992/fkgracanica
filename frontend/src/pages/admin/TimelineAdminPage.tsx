import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useClubTimeline } from '../../hooks';
import { useDeleteTimelineEvent } from '../../hooks/use-heritage-admin';
import { useConfirm } from '../../hooks/use-confirm';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { TimelineAdminFormSheet } from './TimelineAdminFormSheet';
import type { ClubTimelineEvent } from '../../types';

export function TimelineAdminPage() {
  const { data, isLoading } = useClubTimeline();
  const remove = useDeleteTimelineEvent();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<ClubTimelineEvent | null>(null);

  const onDelete = async (item: ClubTimelineEvent) => {
    const ok = await confirm({
      title: 'Obrisati događaj?',
      description: `"${item.title}" će biti obrisan.`,
      confirmLabel: 'Obriši',
      variant: 'danger',
    });
    if (ok) void remove.mutateAsync(item.id);
  };

  return (
    <>
      <Seo title="Vremenska linija" />
      {dialog}
      <AdminPageShell
        title="Vremenska linija kluba"
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
            { key: 'year', header: 'Godina', render: (r) => r.year },
            { key: 'title', header: 'Naslov', render: (r) => r.title },
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
      <TimelineAdminFormSheet
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) setEdit(null); }}
        edit={edit}
      />
    </>
  );
}
