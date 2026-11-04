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
import { Skeleton } from '../../components/ui/skeleton';
import { RolesAdminFormSheet } from './RolesAdminFormSheet';

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
  const { data: roles, isLoading, isError, refetch } = useRoles();
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
      title: 'Obrisati ulogu?',
      description: role.name,
      variant: 'danger',
      confirmLabel: 'Obriši',
    });
    if (ok) void deleteRole.mutateAsync(role.id);
  };

  const createAction = canUpdate ? (
    <Button size="sm" onClick={() => setCreateOpen(true)}>
      Nova uloga
    </Button>
  ) : undefined;

  const body = isLoading ? (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  ) : (
    <>
      {embedded && createAction && (
        <div className="flex justify-end border-b border-slate-200 p-4">{createAction}</div>
      )}
      <AdminDataTable
        rows={roleList}
        empty="Nema uloga."
        columns={[
          { key: 'name', header: 'Naziv', render: (r) => r.name },
          { key: 'desc', header: 'Opis', render: (r) => r.description ?? '—' },
          { key: 'users', header: 'Korisnici', render: (r) => String(r._count?.users ?? 0) },
          { key: 'perms', header: 'Dozvole', render: (r) => String(r.permissions?.length ?? 0) },
          {
            key: 'actions',
            header: 'Akcije',
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
                    <Button variant="ghost" size="sm" onClick={() => void onDelete(r)}>
                      Obriši
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
            <label key={p.key} className="flex cursor-pointer items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(p.key)}
                onChange={() => toggle(p.key)}
                className="mt-1"
              />
              <span className="font-medium">{p.description ?? p.key}</span>
            </label>
          ))}
        </div>
        {updatePerms.isError && (
          <p className="mt-2 text-sm text-danger">
            {getApiErrorMessage(updatePerms.error, 'Spremanje dozvola nije uspjelo.')}
          </p>
        )}
        <Button className="mt-4" onClick={() => void save()} disabled={updatePerms.isPending}>
          Sačuvaj dozvole
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
      <AdminPageShell
        isError={isError}
        onRetry={() => void refetch()}
        title={t('admin.usersAndRoles')}
        isLoading={isLoading}
        actions={createAction}
      >
        {body}
      </AdminPageShell>
      {sheets}
    </>
  );
}
