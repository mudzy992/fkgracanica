import { formatDateTime } from '../../lib/utils';
import {
  canPayOrderOnline,
  canRequestRefund,
  canShowTicketQr,
  orderStatusLabel,
  orderStatusVariant,
} from '../../lib/ticketing-status';
import { useCancelMyTicketOrder, useRequestTicketRefund, useTicketingPublicConfig } from '../../hooks/use-ticketing';
import { useOnlineTicketCheckout } from '../../hooks/use-online-checkout';
import { TicketPassCard } from './TicketPassCard';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { TicketOrderRow } from '../../types/ticketing';

interface Props {
  order: TicketOrderRow;
}

export function TicketOrderCard({ order }: Props) {
  const refund = useRequestTicketRefund();
  const cancel = useCancelMyTicketOrder();
  const checkout = useOnlineTicketCheckout();
  const { data: config } = useTicketingPublicConfig();
  const isPaid = order.status === 'paid';
  const canCancel = order.status === 'pending' && !order.tickets?.some((t) => canShowTicketQr(t.status));
  const canPayOnline = canPayOrderOnline(
    order,
    !!(config?.salesModes?.online && config?.onlineReady),
  );

  const payOnline = async () => {
    const res = await checkout.mutateAsync(order.id);
    if (res.url) window.location.href = res.url;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-sm font-medium text-text-muted">
          Narudžba · {order.createdAt ? formatDateTime(order.createdAt) : '—'} · {String(order.total)} KM
        </p>
        <Badge variant={orderStatusVariant(order.status)}>{orderStatusLabel(order.status)}</Badge>
      </div>

      {order.tickets?.map((ticket) => (
        <TicketPassCard key={ticket.id} ticket={ticket} />
      ))}

      <div className="flex flex-wrap gap-2">
        {canPayOnline && (
          <Button size="sm" disabled={checkout.isPending} onClick={() => void payOnline()}>
            {checkout.isPending ? 'Preusmjeravanje...' : 'Plati online'}
          </Button>
        )}
        {canCancel && (
          <Button
            size="sm"
            variant="outline"
            disabled={cancel.isPending}
            onClick={() => void cancel.mutateAsync(order.id)}
          >
            Otkaži rezervaciju
          </Button>
        )}
        {isPaid && canRequestRefund(order.status) && (
          <Button
            size="sm"
            variant="ghost"
            disabled={refund.isPending}
            onClick={() => void refund.mutateAsync(order.id)}
          >
            Zatraži povrat
          </Button>
        )}
      </div>
    </div>
  );
}
