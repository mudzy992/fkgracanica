import { useState } from 'react';
import { usePermissions, useRoles } from '../../hooks';
import { useUpdateRolePermissions } from '../../hooks/use-users-admin';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';

interface Role {
  id: string;
  name: string;
  description?: string | null;
  permissions?: { permission: { key: string } }[];
}

interface Permission {
  id: string;
  key: string;
  description?: string | null;
}

export function RolesPage() {
  const { data: roles, isLoading } = useRoles();
  const { data: permissions } = usePermissions();
  const updatePerms = useUpdateRolePermissions();
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
    await updatePerms.mutateAsync({ roleId: editRole.id, permissionKeys: selected });
    setEditRole(null);
  };

  return (
    <>
      <Seo title="Uloge" />
      <AdminPageShell title="Uloge i dozvole" isLoading={isLoading}>
        <AdminDataTable
          rows={roleList}
          columns={[
            { key: 'name', header: 'Naziv', render: (r) => r.name },
            { key: 'desc', header: 'Opis', render: (r) => r.description ?? '—' },
            {
              key: 'perms',
              header: 'Dozvole',
              render: (r) => String(r.permissions?.length ?? 0),
            },
            {
              key: 'actions',
              header: '',
              render: (r) =>
                r.name === 'Administrator' ? (
                  <span className="text-xs text-text-muted">Sistemska</span>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
                    Uredi dozvole
                  </Button>
                ),
            },
          ]}
        />
      </AdminPageShell>
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
              <span>
                <span className="font-mono text-xs">{p.key}</span>
                {p.description && <span className="block text-text-muted">{p.description}</span>}
              </span>
            </label>
          ))}
        </div>
        <Button className="mt-4" onClick={() => void save()} disabled={updatePerms.isPending}>
          Sačuvaj dozvole
        </Button>
      </AdminFormSheet>
    </>
  );
}
