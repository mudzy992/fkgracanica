import { useMemberships } from '../../hooks';
import {
  useActivateMembership,
  useCancelMembership,
  useSuspendMembership,
} from '../../hooks/use-competition-admin';
import { useConfirm } from '../../hooks/use-confirm';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';

interface Membership {
  id: string;
  fullName?: string;
  email?: string;
  status?: string;
}

export function MembershipAdminPage() {
  const { data, isLoading } = useMemberships();
  const activate = useActivateMembership();
  const suspend = useSuspendMembership();
  const cancel = useCancelMembership();
  const { confirm, dialog } = useConfirm();
  const items = (data as Membership[] | undefined) ?? [];

  const askAction = async (title: string, id: string, action: (id: string) => Promise<unknown>) => {
    const ok = await confirm({ title, confirmLabel: 'Potvrdi' });
    if (ok) void action(id);
  };

  return (
    <>
      <Seo title="Članstvo" />
      {dialog}
      <AdminPageShell title="Članstvo" isLoading={isLoading}>
        <AdminDataTable
          rows={items}
          columns={[
            { key: 'name', header: 'Ime', render: (r) => r.fullName ?? '—' },
            { key: 'email', header: 'Email', render: (r) => r.email ?? '—' },
            {
              key: 'status',
              header: 'Status',
              render: (r) => <Badge variant="muted">{r.status ?? '—'}</Badge>,
            },
            {
              key: 'actions',
              header: 'Akcije',
              render: (r) => (
                <div className="flex flex-wrap gap-2">
                  {r.status !== 'ACTIVE' && (
                    <Button size="sm" onClick={() => void askAction('Aktivirati članstvo?', r.id, activate.mutateAsync)}>
                      Aktiviraj
                    </Button>
                  )}
                  {r.status === 'ACTIVE' && (
                    <Button size="sm" variant="outline" onClick={() => void askAction('Suspendovati članstvo?', r.id, suspend.mutateAsync)}>
                      Suspenduj
                    </Button>
                  )}
                  {r.status !== 'CANCELLED' && (
                    <Button size="sm" variant="ghost" onClick={() => void askAction('Otkazati članstvo?', r.id, cancel.mutateAsync)}>
                      Otkaži
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </AdminPageShell>
    </>
  );
}
