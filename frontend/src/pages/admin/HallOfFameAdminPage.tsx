import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useHallOfFame } from '../../hooks';
import { useDeleteHallOfFame } from '../../hooks/use-heritage-admin';
import { useConfirm } from '../../hooks/use-confirm';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { HallOfFameAdminFormSheet } from './HallOfFameAdminFormSheet';
import type { HallOfFameEntry } from '../../types';
import { runAction } from '../../lib/action-errors';

interface Props {
  embedded?: boolean;
}

export function HallOfFameAdminPage({ embedded = false }: Props) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useHallOfFame();
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
    if (ok) void runAction(remove.mutateAsync(item.id));
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
        rows={data ?? []}
        empty="Nema unosa u Hall of Fame."
        columns={[
          { key: 'name', header: 'Ime', render: (r) => r.name },
          { key: 'role', header: 'Uloga', render: (r) => r.role ?? '—' },
          { key: 'years', header: 'Godine', render: (r) => r.years ?? '—' },
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

                  aria-label={t('actions.edit')}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => void onDelete(r)}
                  aria-label={t('actions.delete')}
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
    <HallOfFameAdminFormSheet
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
      <Seo title={t('admin.hallOfFame')} />
      {dialog}
      <AdminPageShell
        isError={isError}
        onRetry={() => void refetch()}
        title={t('admin.hallOfFame')}
        isLoading={isLoading}
        actions={createAction}
      >
        {body}
      </AdminPageShell>
      {sheet}
    </>
  );
}
