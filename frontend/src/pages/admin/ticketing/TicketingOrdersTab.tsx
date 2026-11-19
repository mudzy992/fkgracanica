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
import { useTranslation } from 'react-i18next';

type Filter = 'all' | 'pending' | 'paid' | 'refund' | 'closed';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Sve' },
  { key: 'pending', label: 'Na čekanju' },
  { key: 'paid', label: 'Plaćeno' },
  { key: 'refund', label: 'Povrati' },
  { key: 'closed', label: 'Zatvoreno' },
];

export function TicketingOrdersTab() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, 'ticketing.manage');
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useTicketingAdminOrders();
  const confirmPayment = useConfirmTicketingPayment();
  const confirmRefund = useConfirmTicketingRefund();
  const { confirm, dialog } = useConfirm();
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<TicketingAdminOrder | null>(null);

  const orders = useMemo(() => {
    const list = data ?? [];
    if (filter === 'pending') {
      return list.filter(
        (o) => o.status === 'pending' || o.payment?.status === 'PENDING_BOX_OFFICE',
      );
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
    return (
      <div role="alert" className="flex flex-col gap-3 p-4">
        <p className="text-sm text-danger">{t('admin.common.loadError', { defaultValue: 'Greška pri učitavanju.' })}</p>
        <Button onClick={() => refetch()} disabled={Boolean(isFetching)} size="sm" variant="outline">
          {isFetching ? t('admin.common.loading') : 'Pokušaj ponovo'}
        </Button>
      </div>
    );
  }

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <>
      {dialog}
      <div className="mb-3 flex items-center justify-end gap-3 px-4 pt-4 text-xs text-text-muted">
        {lastUpdated ? <span>{t('admin.home.lastUpdated', { defaultValue: 'Ažurirano u {{time}}', time: lastUpdated })}</span> : null}
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={Boolean(isFetching)}>
          {isFetching ? t('admin.common.loading') : 'Osvježi'}
        </Button>
      </div>
      <div className="mb-4 flex flex-wrap gap-2 px-4">
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
      {canManage && (
        <div className="px-4">
          <TicketingValidatePanel />
        </div>
      )}
      <AdminDataTable<TicketingAdminOrder>
        rows={orders as TicketingAdminOrder[]}
        empty="Nema narudžbi."
        onRowClick={(r: TicketingAdminOrder) => setSelected(r)}
        columns={[
          { key: 'id', header: 'ID', render: (r: TicketingAdminOrder) => r.id.slice(0, 8) },
          { key: 'user', header: 'Korisnik', render: (r: TicketingAdminOrder) => r.user?.email ?? '—' },
          { key: 'match', header: 'Utakmica', render: (r: TicketingAdminOrder) => matchLabel(r.tickets?.[0]?.match) },
          {
            key: 'status',
            header: 'Status',
            render: (r: TicketingAdminOrder) => (
              <Badge variant={orderStatusVariant(r.status)}>{orderStatusLabel(r.status)}</Badge>
            ),
          },
          { key: 'total', header: 'Iznos', render: (r: TicketingAdminOrder) => `${String(r.total)} KM` },
          {
            key: 'date',
            header: 'Datum',
            render: (r: TicketingAdminOrder) => (r.createdAt ? formatDateTime(r.createdAt) : '—'),
          },
          {
            key: 'actions',
            header: 'Akcije',
            render: (r: TicketingAdminOrder) =>
              canManage ? (
                <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="outline" onClick={() => setSelected(r)}>
                    Detalj
                  </Button>
                  {(r.status === 'pending' || r.payment?.status === 'PENDING_BOX_OFFICE') && (
                    <Button
                      size="sm"
                      disabled={confirmPayment.isPending}
                      onClick={() =>
                        void askAction('Potvrditi uplatu?', r.id, confirmPayment.mutateAsync)
                      }
                    >
                      Potvrdi uplatu
                    </Button>
                  )}
                  {r.status === 'refund_requested' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={confirmRefund.isPending}
                      onClick={() =>
                        void askAction('Odobriti povrat?', r.id, confirmRefund.mutateAsync)
                      }
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
