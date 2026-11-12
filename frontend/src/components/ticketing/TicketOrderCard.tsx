import { formatDateTime } from '../../lib/utils';
import {
  canPayOrderOnline,
  canRequestRefund,
  canShowTicketQr,
  orderStatusLabel,
  orderStatusVariant,
} from '../../lib/ticketing-status';
import { getReadyPaymentProviders } from '../../lib/payment-providers';
import { useCancelMyTicketOrder, useRequestTicketRefund, useTicketingPublicConfig } from '../../hooks/use-ticketing';
import { useOnlineTicketCheckout } from '../../hooks/use-online-checkout';
import { OnlinePaymentChoice } from '../payments/OnlinePaymentChoice';
import { TicketPassCard } from './TicketPassCard';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { TicketOrderRow } from '../../types/ticketing';
import { runAction } from '../../lib/action-errors';

interface Props {
  order: TicketOrderRow;
}

export function TicketOrderCard({ order }: Props) {
  const refund = useRequestTicketRefund();
  const cancel = useCancelMyTicketOrder();
  const checkout = useOnlineTicketCheckout();
  const { data: config } = useTicketingPublicConfig();
  const providers = getReadyPaymentProviders(config);
  const isPaid = order.status === 'paid';
  const canCancel = order.status === 'pending' && !order.tickets?.some((t) => canShowTicketQr(t.status));
  const canPayOnline = canPayOrderOnline(order, providers.length > 0);

  const payOnline = async (provider: typeof providers[number]) => {
    // P-FE06-44: `onSelect` se poziva sa `void`, pa odbijeni checkout mora biti prijavljen.
    const result = await runAction(checkout.mutateAsync({ orderId: order.id, provider }));
    if (result.ok && result.value.url) window.location.href = result.value.url;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <p className="text-sm font-medium text-text-muted">
            Narudžba · {order.createdAt ? formatDateTime(order.createdAt) : '—'} · {String(order.total)} KM
          </p>
          {order.status === 'pending' && order.payment?.status === 'PENDING_ONLINE' && (
            <p className="text-xs text-text-muted">Online uplata u toku ili nije završena</p>
          )}
        </div>
        <Badge variant={orderStatusVariant(order.status)}>{orderStatusLabel(order.status)}</Badge>
      </div>

      {order.tickets?.map((ticket) => (
        <TicketPassCard key={ticket.id} ticket={ticket} />
      ))}

      <div className="flex flex-wrap items-center gap-2">
        {canPayOnline && (
          <OnlinePaymentChoice
            providers={providers}
            size="sm"
            loading={checkout.isPending}
            onSelect={(provider) => void payOnline(provider)}
          />
        )}
        {canCancel && (
          <Button
            size="sm"
            variant="outline"
            disabled={cancel.isPending}
            onClick={() => void runAction(cancel.mutateAsync(order.id))}
          >
            Otkaži rezervaciju
          </Button>
        )}
        {isPaid && canRequestRefund(order.status) && (
          <Button
            size="sm"
            variant="ghost"
            disabled={refund.isPending}
            onClick={() => void runAction(refund.mutateAsync(order.id))}
          >
            Zatraži povrat
          </Button>
        )}
      </div>
    </div>
  );
}
