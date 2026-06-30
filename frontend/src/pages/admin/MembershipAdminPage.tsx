import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Settings } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { formatDate } from '../../lib/utils';
import {
  membershipStatusLabel,
  membershipStatusVariant,
  membershipUserName,
} from '../../lib/membership-status';
import {
  useActivateMembership,
  useCancelMembership,
  useMemberships,
  useRenewMembership,
  useSuspendMembership,
} from '../../hooks/use-membership';
import { useConfirm } from '../../hooks/use-confirm';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { MembershipCardsBulkExport } from '../../components/membership/MembershipCardsBulkExport';
import { MembershipDetailSheet } from './MembershipDetailSheet';
import { MembershipAdminFormSheet } from './MembershipAdminFormSheet';
import type { MembershipRow, MembershipStatus } from '../../types/membership';

type Filter = 'all' | MembershipStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Sve' },
  { key: 'PENDING', label: 'Na čekanju' },
  { key: 'ACTIVE', label: 'Aktivna' },
  { key: 'SUSPENDED', label: 'Suspendovana' },
  { key: 'EXPIRED', label: 'Istekla' },
  { key: 'CANCELLED', label: 'Otkazana' },
];

export function MembershipAdminPage() {
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, 'membership.manage');
  const { data, isLoading } = useMemberships();
  const activate = useActivateMembership();
  const renew = useRenewMembership();
  const suspend = useSuspendMembership();
  const cancel = useCancelMembership();
  const { confirm, dialog } = useConfirm();
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<MembershipRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const items = useMemo(() => {
    const list = data ?? [];
    if (filter === 'all') return list;
    return list.filter((m) => m.status === filter);
  }, [data, filter]);

  const askAction = async (title: string, id: string, action: (id: string) => Promise<unknown>) => {
    const ok = await confirm({ title, confirmLabel: 'Potvrdi' });
    if (ok) void action(id);
  };

  return (
    <>
      <Seo title="Članstvo" />
      {dialog}
      <AdminPageShell
        title="Članstvo"
        isLoading={isLoading}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {canManage && (
              <>
                <Link
                  to="/admin/ticketing"
                  state={{ tab: 'payments' }}
                  className="inline-flex h-8 items-center rounded-lg border border-[var(--border-subtle)] bg-background px-3 text-xs font-medium hover:bg-surface"
                >
                  <Settings className="mr-1 h-4 w-4" />
                  Online postavke
                </Link>
                <MembershipCardsBulkExport memberships={items} />
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Novi član
                </Button>
              </>
            )}
            {FILTERS.map((f) => (
              <Button
                key={f.key}
                size="sm"
                variant={filter === f.key ? 'default' : 'outline'}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        }
      >
        <AdminDataTable
          rows={items}
          empty="Nema članstava."
          onRowClick={setSelected}
          columns={[
            { key: 'name', header: 'Ime', render: (r) => membershipUserName(r.user) },
            { key: 'email', header: 'Email', render: (r) => r.user?.email ?? '—' },
            {
              key: 'status',
              header: 'Status',
              render: (r) => (
                <Badge variant={membershipStatusVariant(r.status)}>
                  {membershipStatusLabel(r.status)}
                </Badge>
              ),
            },
            {
              key: 'endDate',
              header: 'Istek',
              render: (r) => (r.endDate ? formatDate(r.endDate) : '—'),
            },
            {
              key: 'card',
              header: 'Kartica',
              render: (r) => r.card?.cardNumber ?? '—',
            },
            {
              key: 'actions',
              header: 'Akcije',
              render: (r) =>
                canManage ? (
                  <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button size="sm" variant="outline" onClick={() => setSelected(r)}>
                      Detalj
                    </Button>
                    {(r.status === 'PENDING' || r.status === 'SUSPENDED') && (
                      <Button
                        size="sm"
                        disabled={activate.isPending}
                        onClick={() => void askAction('Aktivirati članstvo?', r.id, activate.mutateAsync)}
                      >
                        Aktiviraj
                      </Button>
                    )}
                    {r.status === 'ACTIVE' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={renew.isPending}
                          onClick={() => void askAction('Obnoviti članstvo?', r.id, renew.mutateAsync)}
                        >
                          Obnovi
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={suspend.isPending}
                          onClick={() => void askAction('Suspendovati članstvo?', r.id, suspend.mutateAsync)}
                        >
                          Suspenduj
                        </Button>
                      </>
                    )}
                    {r.status !== 'CANCELLED' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={cancel.isPending}
                        onClick={() => void askAction('Otkazati članstvo?', r.id, cancel.mutateAsync)}
                      >
                        Otkaži
                      </Button>
                    )}
                  </div>
                ) : (
                  '—'
                ),
            },
          ]}
        />
      </AdminPageShell>
      <MembershipDetailSheet
        membership={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
      <MembershipAdminFormSheet open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
