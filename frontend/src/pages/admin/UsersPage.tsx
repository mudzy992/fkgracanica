import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useUsers } from '../../hooks';
import { useDeleteUser } from '../../hooks/use-users-admin';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { useConfirm } from '../../hooks/use-confirm';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { AdminPagination } from '../../components/admin/AdminPagination';
import { UserAdminFormSheet } from './UserAdminFormSheet';
import { runAction } from '../../lib/action-errors';

interface Props {
  embedded?: boolean;
}

type UserRow = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive?: boolean;
  roles?: { role: { id: string; name: string } }[];
};

export function UsersPage({ embedded = false }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const perms = user?.permissions ?? [];
  const canCreate = hasPermission(perms, 'users.create');
  const canUpdate = hasPermission(perms, 'users.update');
  const canDelete = hasPermission(perms, 'users.delete');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useUsers(
    { page, search: search || undefined },
  );
  const remove = useDeleteUser();
  const { confirm, dialog } = useConfirm();
  const rows = (data?.data as UserRow[] | undefined) ?? [];

  const onDelete = async (item: UserRow) => {
    const ok = await confirm({
      title: t('admin.usersPage.deleteTitle', { defaultValue: 'Obrisati korisnika?' }),
      description: item.email,
      variant: 'danger',
      confirmLabel: t('admin.common.delete', { defaultValue: 'Obriši' }),
    });
    if (ok) void runAction(remove.mutateAsync(item.id));
  };

  const createLabel = t('admin.usersPage.create', { defaultValue: 'Novi' }) as string;
  const createAction = canCreate ? (
    <Button
      size="sm"
      onClick={() => {
        setEditUser(null);
        setSheetOpen(true);
      }}
    >
      <Plus className="mr-1 h-4 w-4" />
      {createLabel}
    </Button>
  ) : undefined;

  if (isLoading) {
    return (
      <div aria-busy="true" className="animate-pulse space-y-3 p-4">
        <div className="h-8 w-1/3 rounded bg-muted" />
        <div className="h-12 w-full rounded bg-muted" />
        <div className="h-12 w-full rounded bg-muted" />
        <div className="h-12 w-full rounded bg-muted" />
        <p className="sr-only">{t('admin.common.loading')}</p>
      </div>
    );
  }

  if (isError) {
    const err = (
      <div role="alert" className="flex flex-col gap-3 p-4">
        <p className="text-sm text-danger">{t('admin.common.loadError', { defaultValue: 'Greška pri učitavanju.' })}</p>
        <Button onClick={() => refetch()} disabled={Boolean(isFetching)} size="sm" variant="outline">
          {isFetching ? t('admin.common.loading') : t('admin.common.retry', { defaultValue: 'Pokušaj ponovo' })}
        </Button>
      </div>
    );
    if (embedded) return <>{dialog}{err}</>;
    return (
      <>
        <Seo title={t('admin.users')} />
        {dialog}
        <AdminPageShell title={t('admin.users')} actions={createAction}>
          {err}
        </AdminPageShell>
        <UserAdminFormSheet open={sheetOpen} onOpenChange={setSheetOpen} user={editUser} canCreate={canCreate} canUpdate={canUpdate} />
      </>
    );
  }

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const emptyLabel = t('admin.usersPage.empty', { defaultValue: 'Nema korisnika.' }) as string;
  const activeLabel = t('admin.usersPage.active', { defaultValue: 'Aktivan' }) as string;
  const inactiveLabel = t('admin.usersPage.inactive', { defaultValue: 'Neaktivan' }) as string;

  const body = (
    <>
      <div className="mb-3 flex items-center justify-end gap-3 px-4 pt-4 text-xs text-text-muted">
        {lastUpdated ? <span>{t('admin.home.lastUpdated', { defaultValue: 'Ažurirano u {{time}}', time: lastUpdated })}</span> : null}
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={Boolean(isFetching)}>
          {isFetching ? t('admin.common.loading') : t('admin.common.refresh', { defaultValue: 'Osvježi' })}
        </Button>
      </div>
      {embedded && createAction && (
        <div className="flex justify-end border-b border-[var(--border-subtle)] p-4">{createAction}</div>
      )}
      <div className={`border-b border-[var(--border-subtle)] p-4 ${embedded && createAction ? 'pt-0' : ''}`}>
        <Input
          className="max-w-xs"
          placeholder={t('admin.usersAdmin.search') as string}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>
      <AdminDataTable
        rows={rows}
        empty={emptyLabel}
        columns={[
          { key: 'email', header: 'Email', render: (r) => r.email },
          {
            key: 'name',
            header: t('admin.usersPage.name', { defaultValue: 'Ime' }) as string,
            render: (r) => `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() || '—',
          },
          {
            key: 'roles',
            header: t('admin.usersPage.roles', { defaultValue: 'Uloge' }) as string,
            render: (r) => r.roles?.map((x) => x.role.name).join(', ') || '—',
          },
          {
            key: 'status',
            header: t('admin.usersPage.status', { defaultValue: 'Status' }) as string,
            render: (r) => (
              <Badge variant={r.isActive !== false ? 'success' : 'muted'}>
                {r.isActive !== false ? activeLabel : inactiveLabel}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: '',
            render: (r) => (
              <div className="flex gap-1">
                {canUpdate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditUser(r);
                      setSheetOpen(true);
                    }}
                    aria-label={t('actions.edit') as string}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={remove.isPending}
                    onClick={() => void onDelete(r)}
                    aria-label={t('actions.delete') as string}
                  >
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />
      {data?.meta && <AdminPagination meta={data.meta} page={page} onPageChange={setPage} />}
    </>
  );

  if (embedded) {
    return (
      <>
        {dialog}
        {body}
        <UserAdminFormSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          user={editUser}
          canCreate={canCreate}
          canUpdate={canUpdate}
        />
      </>
    );
  }

  return (
    <>
      <Seo title={t('admin.users')} />
      {dialog}
      <AdminPageShell title={t('admin.users')} actions={createAction}>
        {body}
      </AdminPageShell>
      <UserAdminFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        user={editUser}
        canCreate={canCreate}
        canUpdate={canUpdate}
      />
    </>
  );
}
