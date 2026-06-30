import { useState } from 'react';
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
import { Skeleton } from '../../components/ui/skeleton';
import { UserAdminFormSheet } from './UserAdminFormSheet';

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
  const { user } = useAuth();
  const perms = user?.permissions ?? [];
  const canCreate = hasPermission(perms, 'users.create');
  const canUpdate = hasPermission(perms, 'users.update');
  const canDelete = hasPermission(perms, 'users.delete');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const { data, isLoading } = useUsers({ page, search: search || undefined });
  const remove = useDeleteUser();
  const { confirm, dialog } = useConfirm();
  const rows = (data?.data as UserRow[] | undefined) ?? [];

  const onDelete = async (item: UserRow) => {
    const ok = await confirm({
      title: 'Obrisati korisnika?',
      description: item.email,
      variant: 'danger',
      confirmLabel: 'Obriši',
    });
    if (ok) void remove.mutateAsync(item.id);
  };

  const createAction = canCreate ? (
    <Button size="sm" onClick={() => { setEditUser(null); setSheetOpen(true); }}>
      <Plus className="mr-1 h-4 w-4" />
      Novi
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
        <div className="flex justify-end border-b border-slate-200 p-4">
          {createAction}
        </div>
      )}
      <div className={`border-b border-slate-200 p-4 ${embedded && createAction ? 'pt-0' : ''}`}>
        <Input
          className="max-w-xs"
          placeholder="Pretraži..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>
      <AdminDataTable
        rows={rows}
        empty="Nema korisnika."
        columns={[
          { key: 'email', header: 'Email', render: (r) => r.email },
          {
            key: 'name',
            header: 'Ime',
            render: (r) => `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() || '—',
          },
          {
            key: 'roles',
            header: 'Uloge',
            render: (r) => r.roles?.map((x) => x.role.name).join(', ') || '—',
          },
          {
            key: 'status',
            header: 'Status',
            render: (r) => (
              <Badge variant={r.isActive !== false ? 'success' : 'muted'}>
                {r.isActive !== false ? 'Aktivan' : 'Neaktivan'}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: '',
            render: (r) => (
              <div className="flex gap-1">
                {canUpdate && (
                  <Button variant="ghost" size="icon" onClick={() => { setEditUser(r); setSheetOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {canDelete && (
                  <Button variant="ghost" size="icon" onClick={() => void onDelete(r)}>
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
      <Seo title="Korisnici" />
      {dialog}
      <AdminPageShell title="Korisnici" isLoading={isLoading} actions={createAction}>
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
