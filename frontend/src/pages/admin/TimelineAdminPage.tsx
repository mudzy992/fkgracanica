import { useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { useClubTimeline } from '../../hooks';
import { useDeleteTimelineEvent, useReorderTimelineEvents } from '../../hooks/use-heritage-admin';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { useConfirm } from '../../hooks/use-confirm';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { TimelineAdminFormSheet } from './TimelineAdminFormSheet';
import type { ClubTimelineEvent } from '../../types';

export function TimelineAdminPage() {
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, 'club-timeline.manage');
  const { data, isLoading } = useClubTimeline();
  const remove = useDeleteTimelineEvent();
  const reorder = useReorderTimelineEvents();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<ClubTimelineEvent | null>(null);
  const rows = data ?? [];

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= rows.length) return;
    const ids = rows.map((r) => r.id);
    [ids[index], ids[next]] = [ids[next], ids[index]];
    void reorder.mutateAsync(ids);
  };

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
          canManage ? (
            <Button size="sm" onClick={() => { setEdit(null); setOpen(true); }}>
              <Plus className="mr-1 h-4 w-4" />
              Novi
            </Button>
          ) : undefined
        }
      >
        <AdminDataTable
          rows={rows}
          columns={[
            { key: 'year', header: 'Godina', render: (r) => r.year },
            { key: 'title', header: 'Naslov', render: (r) => r.title },
            {
              key: 'actions',
              header: 'Akcije',
              render: (r) => {
                const index = rows.findIndex((row) => row.id === r.id);
                return canManage ? (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" disabled={index === 0} onClick={() => move(index, -1)}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={index === rows.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setEdit(r); setOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => void onDelete(r)}>
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                ) : null;
              },
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
