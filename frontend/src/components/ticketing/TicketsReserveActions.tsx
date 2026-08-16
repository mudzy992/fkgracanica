import { useOnlineTicketCheckout } from '../../hooks/use-online-checkout';
import { useReserveTicket, useTicketingPublicConfig } from '../../hooks/use-ticketing';
import { getReadyPaymentProviders } from '../../lib/payment-providers';
import type { TicketPaymentIntent } from '../../types/ticketing';
import type { PaymentProviderId } from '../../types/payment-provider';
import { OnlinePaymentChoice } from '../payments/OnlinePaymentChoice';
import { Button } from '../ui/button';

interface Category {
  id: string;
  label: string;
  price: number;
}

interface Props {
  matchId: string;
  category: Category;
  quantity: number;
  boxOfficeMax: number;
  onlineMax: number;
  remaining: number;
  boxOffice: boolean;
  online: boolean;
  onReserved: (orderId?: string) => void;
}

export function TicketsReserveActions({
  matchId,
  category,
  quantity,
  boxOfficeMax,
  onlineMax,
  remaining,
  boxOffice,
  online,
  onReserved,
}: Props) {
  const reserve = useReserveTicket();
  const checkout = useOnlineTicketCheckout();
  const { data: config } = useTicketingPublicConfig();
  const providers = getReadyPaymentProviders(config);

  const submit = async (intent: TicketPaymentIntent, provider?: PaymentProviderId) => {
    const max = intent === 'online' ? onlineMax : boxOfficeMax;
    if (quantity > max || remaining < 1) return;
    try {
      const order = await reserve.mutateAsync({
        matchId,
        category: category.label,
        categoryId: category.id,
        price: category.price,
        quantity,
        paymentIntent: intent,
      });
      const orderId = (order as { id?: string })?.id;
      if (intent === 'online' && orderId && provider) {
        const res = await checkout.mutateAsync({ orderId, provider });
        if (res.url) {
          window.location.href = res.url;
          return;
        }
      }
      onReserved(orderId);
    } catch {
      /* react-query stores error */
    }
  };

  const busy = reserve.isPending || checkout.isPending;
  const errorMsg =
    (reserve.error instanceof Error && reserve.error.message) ||
    (checkout.error instanceof Error && checkout.error.message) ||
    null;
  const onlineDisabled = busy || remaining === 0 || onlineMax < 1 || quantity > onlineMax;
  const boxOfficeDisabled = busy || remaining === 0 || boxOfficeMax < 1 || quantity > boxOfficeMax;

  if (boxOffice && online) {
    return (
      <div className="space-y-2">
        {errorMsg && <p className="text-sm text-danger">{errorMsg}</p>}
        <OnlinePaymentChoice
          providers={providers}
          fullWidth
          disabled={onlineDisabled}
          loading={busy}
          onSelect={(provider) => void submit('online', provider)}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={boxOfficeDisabled}
          onClick={() => void submit('box_office')}
        >
          {busy ? 'Obrada...' : 'Rezerviši za blagajnu'}
        </Button>
      </div>
    );
  }

  if (online) {
    return (
      <div className="space-y-2">
        {errorMsg && <p className="text-sm text-danger">{errorMsg}</p>}
        <OnlinePaymentChoice
        providers={providers}
        fullWidth
        disabled={onlineDisabled}
        loading={busy}
        onSelect={(provider) => void submit('online', provider)}
      />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {errorMsg && <p className="text-sm text-danger">{errorMsg}</p>}
      <Button
      type="button"
      className="w-full"
      disabled={boxOfficeDisabled || !boxOffice}
      onClick={() => void submit('box_office')}
    >
      {busy ? 'Rezervacija...' : 'Rezerviši ulaznice'}
    </Button>
    </div>
  );
}
