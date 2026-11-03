import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useMuseum } from '../../hooks';
import { useDeleteMuseumItem } from '../../hooks/use-heritage-admin';
import { useConfirm } from '../../hooks/use-confirm';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { MuseumAdminFormSheet } from './MuseumAdminFormSheet';
import { museumCategoryLabel } from '../../lib/museum-categories';
import type { MuseumItem } from '../../types';

type MuseumRow = MuseumItem & { category?: string };

interface Props {
  embedded?: boolean;
}

export function MuseumAdminPage({ embedded = false }: Props) {
  const { data, isLoading, isError, refetch } = useMuseum();
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

  const createAction = (
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
  );

  const body = (
    <>
      {embedded && (
        <div className="flex justify-end border-b border-[var(--border-subtle)] p-4">
          {createAction}
        </div>
      )}
      <AdminDataTable
        rows={(data as MuseumRow[] | undefined) ?? []}
        empty="Nema predmeta u muzeju."
        columns={[
          { key: 'title', header: 'Naslov', render: (r) => r.title },
          {
            key: 'category',
            header: 'Kategorija',
            render: (r) => museumCategoryLabel(r.category) || '—',
          },
          { key: 'year', header: 'Godina', render: (r) => r.year ?? '—' },
          {
            key: 'actions',
            header: 'Akcije',
            render: (r) => (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEdit(r);
                    setOpen(true);
                  }}

                  aria-label="Uredi"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => void onDelete(r)}
                  aria-label="Obriši"
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            ),
          },
        ]}
      />
    </>
  );

  const sheet = (
    <MuseumAdminFormSheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setEdit(null);
      }}
      edit={edit}
    />
  );

  if (embedded) {
    return (
      <>
        {dialog}
        {body}
        {sheet}
      </>
    );
  }

  return (
    <>
      <Seo title="Muzej" />
      {dialog}
      <AdminPageShell
        isError={isError}
        onRetry={() => void refetch()}
        title="Muzej"
        isLoading={isLoading}
        actions={createAction}
      >
        {body}
      </AdminPageShell>
      {sheet}
    </>
  );
}
