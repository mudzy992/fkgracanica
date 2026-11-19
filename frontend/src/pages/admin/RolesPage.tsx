import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePermissions, useRoles } from '../../hooks';
import { useDeleteRole, useUpdateRolePermissions } from '../../hooks/use-users-admin';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { getApiErrorMessage } from '../../lib/api-error';
import { isSystemRole } from '../../lib/rbac-constants';
import { useConfirm } from '../../hooks/use-confirm';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { Switch } from '../../components/ui/switch';
import { RolesAdminFormSheet } from './RolesAdminFormSheet';
import { runAction } from '../../lib/action-errors';

interface Props {
  embedded?: boolean;
}

interface Role {
  id: string;
  name: string;
  description?: string | null;
  permissions?: { permission: { key: string } }[];
  _count?: { users: number };
}

interface Permission {
  id: string;
  key: string;
  description?: string | null;
}

export function RolesPage({ embedded = false }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canUpdate = hasPermission(user?.permissions, 'rbac.update');
  const { data: roles, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useRoles();
  const { data: permissions } = usePermissions();
  const updatePerms = useUpdateRolePermissions();
  const deleteRole = useDeleteRole();
  const { confirm, dialog } = useConfirm();
  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const roleList = (roles as Role[] | undefined) ?? [];
  const permList = (permissions as Permission[] | undefined) ?? [];

  const openEdit = (role: Role) => {
    setEditRole(role);
    setSelected(role.permissions?.map((p) => p.permission.key) ?? []);
  };

  const toggle = (key: string) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const save = async () => {
    if (!editRole) return;
    try {
      await updatePerms.mutateAsync({ roleId: editRole.id, permissionKeys: selected });
      setEditRole(null);
    } catch {
      /* error via mutation */
    }
  };

  const onDelete = async (role: Role) => {
    const ok = await confirm({
      title: t('admin.rolesPage.deleteTitle', { defaultValue: 'Obrisati ulogu?' }) as string,
      description: role.name,
      variant: 'danger',
      confirmLabel: t('admin.common.delete', { defaultValue: 'Obriši' }) as string,
    });
    if (ok) void runAction(deleteRole.mutateAsync(role.id));
  };

  const createLabel = t('admin.rolesPage.create', { defaultValue: 'Nova uloga' }) as string;
  const createAction = canUpdate ? (
    <Button size="sm" onClick={() => setCreateOpen(true)}>
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
        <Seo title={t('admin.roles')} />
        {dialog}
        <AdminPageShell title={t('admin.usersAndRoles')} actions={createAction}>
          {err}
        </AdminPageShell>
        <RolesAdminFormSheet open={createOpen} onOpenChange={setCreateOpen} />
        <AdminFormSheet open={!!editRole} onOpenChange={(o) => !o && setEditRole(null)} title={`Dozvole: ${editRole?.name ?? ''}`}>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto">
            {permList.map((p) => (
              <label key={p.key} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-[var(--border-subtle)] p-3">
                <span className="text-sm font-medium">{p.description ?? p.key}</span>
                <Switch checked={selected.includes(p.key)} onCheckedChange={() => toggle(p.key)} />
              </label>
            ))}
          </div>
          {updatePerms.isError && (
            <p className="mt-2 text-sm text-danger">{getApiErrorMessage(updatePerms.error, 'Spremanje dozvola nije uspjelo.')}</p>
          )}
          <Button className="mt-4" onClick={() => void save()} disabled={updatePerms.isPending}>
            {t('admin.rolesPage.savePermissions', { defaultValue: 'Sačuvaj dozvole' })}
          </Button>
        </AdminFormSheet>
      </>
    );
  }

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const emptyLabel = t('admin.rolesPage.empty', { defaultValue: 'Nema uloga.' }) as string;
  const deleteLabel = t('admin.common.delete', { defaultValue: 'Obriši' }) as string;
  const savePermsLabel = t('admin.rolesPage.savePermissions', { defaultValue: 'Sačuvaj dozvole' }) as string;

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
      <AdminDataTable
        rows={roleList}
        empty={emptyLabel}
        columns={[
          { key: 'name', header: t('admin.rolesPage.name', { defaultValue: 'Naziv' }) as string, render: (r) => r.name },
          { key: 'desc', header: t('admin.rolesPage.description', { defaultValue: 'Opis' }) as string, render: (r) => r.description ?? '—' },
          { key: 'users', header: t('admin.rolesPage.usersCount', { defaultValue: 'Korisnici' }) as string, render: (r) => String(r._count?.users ?? 0) },
          { key: 'perms', header: t('admin.rolesPage.permsCount', { defaultValue: 'Dozvole' }) as string, render: (r) => String(r.permissions?.length ?? 0) },
          {
            key: 'actions',
            header: t('admin.common.actions', { defaultValue: 'Akcije' }) as string,
            render: (r) =>
              !canUpdate ? (
                <span className="text-xs text-text-muted">—</span>
              ) : r.name === 'Administrator' ? (
                <span className="text-xs text-text-muted">{t('admin.rolesPage.system')}</span>
              ) : (
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
                    {t('admin.rolesPage.editPermissions')}
                  </Button>
                  {!isSystemRole(r.name) && (
                    <Button variant="ghost" size="sm" disabled={deleteRole.isPending} onClick={() => void onDelete(r)}>
                      {deleteLabel}
                    </Button>
                  )}
                </div>
              ),
          },
        ]}
      />
    </>
  );

  const sheets = (
    <>
      <RolesAdminFormSheet open={createOpen} onOpenChange={setCreateOpen} />
      <AdminFormSheet
        open={!!editRole}
        onOpenChange={(o) => !o && setEditRole(null)}
        title={`Dozvole: ${editRole?.name ?? ''}`}
      >
        <div className="max-h-[60vh] space-y-2 overflow-y-auto">
          {permList.map((p) => (
            <label key={p.key} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-[var(--border-subtle)] p-3">
              <span className="text-sm font-medium">{p.description ?? p.key}</span>
              <Switch checked={selected.includes(p.key)} onCheckedChange={() => toggle(p.key)} />
            </label>
          ))}
        </div>
        {updatePerms.isError && (
          <p className="mt-2 text-sm text-danger">
            {getApiErrorMessage(updatePerms.error, 'Spremanje dozvola nije uspjelo.')}
          </p>
        )}
        <Button className="mt-4" onClick={() => void save()} disabled={updatePerms.isPending}>
          {savePermsLabel}
        </Button>
      </AdminFormSheet>
    </>
  );

  if (embedded) {
    return (
      <>
        {dialog}
        {body}
        {sheets}
      </>
    );
  }

  return (
    <>
      <Seo title={t('admin.roles')} />
      {dialog}
      <AdminPageShell title={t('admin.usersAndRoles')} actions={createAction}>
        {body}
      </AdminPageShell>
      {sheets}
    </>
  );
}
