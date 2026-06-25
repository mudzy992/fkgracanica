import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useSponsors } from '../../hooks';
import { useDeleteSponsor } from '../../hooks/use-content-admin';
import { useConfirm } from '../../hooks/use-confirm';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { SponsorsAdminFormSheet } from './SponsorsAdminFormSheet';
import type { Sponsor } from '../../types';

export function SponsorsAdminPage() {
  const { data, isLoading } = useSponsors();
  const remove = useDeleteSponsor();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Sponsor | null>(null);

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
      <Seo title="Sponzori" />
      {dialog}
      <AdminPageShell
        title="Sponzori"
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
            { key: 'name', header: 'Naziv', render: (r) => r.name },
            { key: 'tier', header: 'Kategorija', render: (r) => r.tier },
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
      <SponsorsAdminFormSheet
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) setEdit(null); }}
        edit={edit}
      />
    </>
  );
}
