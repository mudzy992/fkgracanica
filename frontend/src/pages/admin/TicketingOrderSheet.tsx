import { formatDateTime } from '../../lib/utils';
import { useCancelTicketingOrder, useTicketingOrderDetail } from '../../hooks/use-ticketing-admin';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { Button } from '../../components/ui/button';
import type { TicketingAdminOrder } from '../../hooks/use-ticketing-admin';

interface Props {
  order: TicketingAdminOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel?: () => void;
}

export function TicketingOrderSheet({ order, open, onOpenChange, onCancel }: Props) {
  const { data: detail } = useTicketingOrderDetail(order?.id);
  const cancel = useCancelTicketingOrder();
  const o = detail ?? order;
  if (!o) return null;

  const canCancel = o.status !== 'cancelled' && o.status !== 'completed';

  return (
    <AdminFormSheet open={open} onOpenChange={onOpenChange} title={`Narudžba #${o.id.slice(0, 8)}`}>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-text-muted">Korisnik</dt>
          <dd className="font-medium">{o.user?.email ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-text-muted">Status</dt>
          <dd>{o.status}</dd>
        </div>
        <div>
          <dt className="text-text-muted">Iznos</dt>
          <dd>{String(o.total)} KM</dd>
        </div>
        {o.createdAt && (
          <div>
            <dt className="text-text-muted">Datum</dt>
            <dd>{formatDateTime(o.createdAt)}</dd>
          </div>
        )}
        {o.payment && (
          <div>
            <dt className="text-text-muted">Plaćanje</dt>
            <dd>{o.payment.status}</dd>
          </div>
        )}
        {o.tickets && o.tickets.length > 0 && (
          <div>
            <dt className="mb-1 text-text-muted">Ulaznice ({o.tickets.length})</dt>
            <dd className="space-y-1">
              {o.tickets.map((t) => (
                <div key={t.id} className="rounded bg-surface px-2 py-1 text-xs">
                  {t.category ?? '—'} — {t.status ?? '—'}
                </div>
              ))}
            </dd>
          </div>
        )}
      </dl>
      {canCancel && (
        <Button
          className="mt-6 w-full"
          variant="outline"
          disabled={cancel.isPending}
          onClick={() => {
            void cancel.mutateAsync(o.id).then(() => {
              onCancel?.();
              onOpenChange(false);
            });
          }}
        >
          Otkaži narudžbu
        </Button>
      )}
    </AdminFormSheet>
  );
}
