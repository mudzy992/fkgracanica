import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useUsers } from '../../hooks';
import { useDeleteUser } from '../../hooks/use-users-admin';
import { Seo } from '../../components/seo/Seo';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { UserAdminFormSheet } from './UserAdminFormSheet';

type UserRow = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive?: boolean;
  roles?: { role: { id: string; name: string } }[];
};

export function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const { data, isLoading } = useUsers({ page, search: search || undefined });
  const remove = useDeleteUser();
  const rows = (data?.data as UserRow[] | undefined) ?? [];

  const openCreate = () => {
    setEditUser(null);
    setSheetOpen(true);
  };

  const openEdit = (user: UserRow) => {
    setEditUser(user);
    setSheetOpen(true);
  };

  return (
    <>
      <Seo title="Korisnici" />
      <AdminPageShell
        title="Korisnici"
        isLoading={isLoading}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Novi
          </Button>
        }
      >
        <div className="border-b border-slate-200 p-4">
          <Input
            placeholder="Pretraži..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <AdminDataTable
          rows={rows}
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
              key: 'actions',
              header: '',
              render: (r) => (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void remove.mutateAsync(r.id)}
                  >
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prethodna
            </Button>
            <span className="self-center text-sm text-text-muted">
              {page} / {data.meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sljedeća
            </Button>
          </div>
        )}
      </AdminPageShell>
      <UserAdminFormSheet open={sheetOpen} onOpenChange={setSheetOpen} user={editUser} />
    </>
  );
}
