import { getReadyPaymentProviders } from '../../lib/payment-providers';
import {
  canPayOrderOnline,
  canRequestRefund,
  orderStatusLabel,
} from '../../lib/ticketing-status';
import type { TicketOrderRow } from '../../types/ticketing';
import { useOnlineTicketCheckout } from '../../hooks/use-online-checkout';
import { useCancelMyTicketOrder, useRequestTicketRefund } from '../../hooks/use-ticketing';
import type { TicketingPublicConfig } from '../../types/ticketing-config';
import { OnlinePaymentChoice } from '../payments/OnlinePaymentChoice';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface Props {
  order: TicketOrderRow;
  config?: TicketingPublicConfig;
}

export function TicketOrderActions({ order, config }: Props) {
  const refund = useRequestTicketRefund();
  const cancel = useCancelMyTicketOrder();
  const checkout = useOnlineTicketCheckout();
  const providers = getReadyPaymentProviders(config);

  const canPay = canPayOrderOnline(order, providers.length > 0);
  const canCancel =
    order.status === 'pending' && !order.tickets?.some((t) => t.status === 'PAID_AT_BOX_OFFICE');
  const canRefund = order.status === 'paid' && canRequestRefund(order.status);

  if (!canPay && !canCancel && !canRefund) return null;

  const payOnline = async (provider: (typeof providers)[number]) => {
    const res = await checkout.mutateAsync({ orderId: order.id, provider });
    if (res.url) window.location.href = res.url;
  };

  return (
    <div className="space-y-2 border-t border-[var(--border-subtle)] pt-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-text-muted">Narudžba · {String(order.total)} KM</p>
        <Badge variant="default">{orderStatusLabel(order.status)}</Badge>
      </div>
      <div className="flex flex-col gap-2">
        {canPay && (
          <OnlinePaymentChoice
            providers={providers}
            size="sm"
            fullWidth
            loading={checkout.isPending}
            onSelect={(p) => void payOnline(p)}
          />
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
        {canRefund && (
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
