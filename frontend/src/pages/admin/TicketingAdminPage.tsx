import { useMemo, useState } from 'react';
import { asArray } from '../../lib/as-array';
import {
  useConfirmTicketingPayment,
  useConfirmTicketingRefund,
  useTicketingAdminOrders,
} from '../../hooks';
import { Seo } from '../../components/seo/Seo';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { AdminDataTable, AdminPageShell } from '../../components/admin/AdminPageShell';
import { TicketingOrderSheet } from './TicketingOrderSheet';
import type { TicketingAdminOrder } from '../../hooks/use-ticketing-admin';

type Filter = 'all' | 'pending' | 'refund';

export function TicketingAdminPage() {
  const { data, isLoading } = useTicketingAdminOrders();
  const confirmPayment = useConfirmTicketingPayment();
  const confirmRefund = useConfirmTicketingRefund();
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<TicketingAdminOrder | null>(null);

  const orders = useMemo(() => {
    const list = asArray<TicketingAdminOrder>(data);
    if (filter === 'pending') {
      return list.filter((o) => o.status === 'pending' || o.payment?.status === 'PENDING_BOX_OFFICE');
    }
    if (filter === 'refund') return list.filter((o) => o.status === 'refund_requested');
    return list;
  }, [data, filter]);

  return (
    <>
      <Seo title="Ulaznice" />
      <AdminPageShell
        title="Ulaznice"
        isLoading={isLoading}
        actions={
          <div className="flex gap-2">
            {(['all', 'pending', 'refund'] as const).map((f) => (
              <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>
                {f === 'all' ? 'Sve' : f === 'pending' ? 'Na čekanju' : 'Povrati'}
              </Button>
            ))}
          </div>
        }
      >
        <AdminDataTable
          rows={orders}
          empty="Nema narudžbi."
          onRowClick={setSelected}
          columns={[
            { key: 'id', header: 'ID', render: (r) => r.id.slice(0, 8) },
            { key: 'user', header: 'Korisnik', render: (r) => r.user?.email ?? '—' },
            { key: 'status', header: 'Status', render: (r) => <Badge variant="muted">{r.status}</Badge> },
            { key: 'total', header: 'Iznos', render: (r) => String(r.total) },
            {
              key: 'actions',
              header: 'Akcije',
              render: (r) => (
                <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="outline" onClick={() => setSelected(r)}>
                    Detalj
                  </Button>
                  {(r.status === 'pending' || r.payment?.status === 'PENDING_BOX_OFFICE') && (
                    <Button size="sm" onClick={() => void confirmPayment.mutateAsync(r.id)} disabled={confirmPayment.isPending}>
                      Potvrdi uplatu
                    </Button>
                  )}
                  {r.status === 'refund_requested' && (
                    <Button size="sm" variant="outline" onClick={() => void confirmRefund.mutateAsync(r.id)} disabled={confirmRefund.isPending}>
                      Odobri povrat
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </AdminPageShell>
      <TicketingOrderSheet
        order={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </>
  );
}
