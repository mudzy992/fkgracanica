import { formatDateTime } from '../../lib/utils';
import {
  matchLabel,
  orderStatusLabel,
  orderStatusVariant,
  ticketStatusLabel,
  ticketStatusVariant,
  canShowTicketQr,
} from '../../lib/ticketing-status';
import {
  useAdminCancelTicketingOrder,
  useConfirmTicketingPayment,
  useConfirmTicketingRefund,
  useTicketingOrderDetail,
} from '../../hooks/use-ticketing-admin';
import { useConfirm } from '../../hooks/use-confirm';
import { AdminFormSheet } from '../../components/admin/AdminFormSheet';
import { MembershipQrCode } from '../../components/membership/MembershipQrCode';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import type { TicketingAdminOrder } from '../../hooks/use-ticketing-admin';

interface Props {
  order: TicketingAdminOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManage: boolean;
}

export function TicketingOrderSheet({ order, open, onOpenChange, canManage }: Props) {
  const { data: detail } = useTicketingOrderDetail(order?.id);
  const confirmPayment = useConfirmTicketingPayment();
  const confirmRefund = useConfirmTicketingRefund();
  const cancel = useAdminCancelTicketingOrder();
  const { confirm, dialog } = useConfirm();
  const o = detail ?? order;
  if (!o) return null;

  const isPending = o.status === 'pending' || o.payment?.status === 'PENDING_BOX_OFFICE';
  const canAdminCancel = o.status !== 'cancelled' && o.status !== 'refunded';

  const ask = async (title: string, action: () => Promise<unknown>) => {
    const ok = await confirm({ title, confirmLabel: 'Potvrdi' });
    if (ok) await action();
  };

  return (
    <>
      {dialog}
      <AdminFormSheet open={open} onOpenChange={onOpenChange} title={`Narudžba #${o.id.slice(0, 8)}`} size="lg">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-text-muted">Korisnik</dt>
            <dd className="font-medium">{o.user?.email ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Status</dt>
            <dd>
              <Badge variant={orderStatusVariant(o.status)}>{orderStatusLabel(o.status)}</Badge>
            </dd>
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
        </dl>

        {o.tickets && o.tickets.length > 0 && (
          <div className="mt-4 space-y-4">
            <p className="text-sm font-medium text-text-muted">Ulaznice ({o.tickets.length})</p>
            {o.tickets.map((t) => (
              <div key={t.id} className="rounded-lg border border-[var(--border-subtle)] p-3">
                <p className="font-medium">{matchLabel(t.match)}</p>
                <p className="text-sm text-text-muted">
                  {t.category} · {String(t.price)} KM
                </p>
                <Badge className="mt-2" variant={ticketStatusVariant(t.status)}>
                  {ticketStatusLabel(t.status)}
                </Badge>
                {canShowTicketQr(t.status) && (
                  <div className="mt-3 flex justify-center">
                    <MembershipQrCode value={t.qrCode} size={120} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {canManage && (
          <div className="mt-6 flex flex-wrap gap-2">
            {isPending && (
              <Button
                disabled={confirmPayment.isPending}
                onClick={() => void ask('Potvrditi uplatu na blagajni?', () => confirmPayment.mutateAsync(o.id))}
              >
                Potvrdi uplatu
              </Button>
            )}
            {o.status === 'refund_requested' && (
              <Button
                variant="outline"
                disabled={confirmRefund.isPending}
                onClick={() => void ask('Odobriti povrat?', () => confirmRefund.mutateAsync(o.id))}
              >
                Odobri povrat
              </Button>
            )}
            {canAdminCancel && (
              <Button
                variant="ghost"
                disabled={cancel.isPending}
                onClick={() =>
                  void ask('Otkazati narudžbu?', () => cancel.mutateAsync(o.id).then(() => onOpenChange(false)))
                }
              >
                Otkaži narudžbu
              </Button>
            )}
          </div>
        )}
      </AdminFormSheet>
    </>
  );
}
