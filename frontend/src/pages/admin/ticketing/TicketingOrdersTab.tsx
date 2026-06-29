import { useMemo, useState } from 'react';
import { useAuth } from '../../../lib/auth';
import { hasPermission } from '../../../lib/permissions';
import { formatDateTime } from '../../../lib/utils';
import { matchLabel, orderStatusLabel, orderStatusVariant } from '../../../lib/ticketing-status';
import {
  useConfirmTicketingPayment,
  useConfirmTicketingRefund,
  useTicketingAdminOrders,
} from '../../../hooks/use-ticketing-admin';
import { useConfirm } from '../../../hooks/use-confirm';
import { TicketingValidatePanel } from '../../../components/ticketing/TicketingValidatePanel';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { AdminDataTable } from '../../../components/admin/AdminPageShell';
import { TicketingOrderSheet } from '../TicketingOrderSheet';
import type { TicketingAdminOrder } from '../../../hooks/use-ticketing-admin';

type Filter = 'all' | 'pending' | 'paid' | 'refund' | 'closed';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Sve' },
  { key: 'pending', label: 'Na čekanju' },
  { key: 'paid', label: 'Plaćeno' },
  { key: 'refund', label: 'Povrati' },
  { key: 'closed', label: 'Zatvoreno' },
];

export function TicketingOrdersTab() {
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, 'ticketing.manage');
  const { data, isLoading } = useTicketingAdminOrders();
  const confirmPayment = useConfirmTicketingPayment();
  const confirmRefund = useConfirmTicketingRefund();
  const { confirm, dialog } = useConfirm();
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<TicketingAdminOrder | null>(null);

  const orders = useMemo(() => {
    const list = data ?? [];
    if (filter === 'pending') {
      return list.filter((o) => o.status === 'pending' || o.payment?.status === 'PENDING_BOX_OFFICE');
    }
    if (filter === 'paid') return list.filter((o) => o.status === 'paid');
    if (filter === 'refund') return list.filter((o) => o.status === 'refund_requested');
    if (filter === 'closed') {
      return list.filter((o) => o.status === 'cancelled' || o.status === 'refunded');
    }
    return list;
  }, [data, filter]);

  const askAction = async (title: string, id: string, action: (id: string) => Promise<unknown>) => {
    const ok = await confirm({ title, confirmLabel: 'Potvrdi' });
    if (ok) void action(id);
  };

  if (isLoading) return <p className="p-4 text-sm text-text-muted">Učitavanje...</p>;

  return (
    <>
      {dialog}
      <div className="mb-4 flex flex-wrap gap-2 px-4 pt-4">
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
      {canManage && <div className="px-4"><TicketingValidatePanel /></div>}
      <AdminDataTable
        rows={orders}
        empty="Nema narudžbi."
        onRowClick={setSelected}
        columns={[
          { key: 'id', header: 'ID', render: (r) => r.id.slice(0, 8) },
          { key: 'user', header: 'Korisnik', render: (r) => r.user?.email ?? '—' },
          { key: 'match', header: 'Utakmica', render: (r) => matchLabel(r.tickets?.[0]?.match) },
          {
            key: 'status',
            header: 'Status',
            render: (r) => (
              <Badge variant={orderStatusVariant(r.status)}>{orderStatusLabel(r.status)}</Badge>
            ),
          },
          { key: 'total', header: 'Iznos', render: (r) => `${String(r.total)} KM` },
          {
            key: 'date',
            header: 'Datum',
            render: (r) => (r.createdAt ? formatDateTime(r.createdAt) : '—'),
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
                  {(r.status === 'pending' || r.payment?.status === 'PENDING_BOX_OFFICE') && (
                    <Button
                      size="sm"
                      disabled={confirmPayment.isPending}
                      onClick={() => void askAction('Potvrditi uplatu?', r.id, confirmPayment.mutateAsync)}
                    >
                      Potvrdi uplatu
                    </Button>
                  )}
                  {r.status === 'refund_requested' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={confirmRefund.isPending}
                      onClick={() => void askAction('Odobriti povrat?', r.id, confirmRefund.mutateAsync)}
                    >
                      Odobri povrat
                    </Button>
                  )}
                </div>
              ) : (
                '—'
              ),
          },
        ]}
      />
      <TicketingOrderSheet
        order={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        canManage={canManage}
      />
    </>
  );
}
