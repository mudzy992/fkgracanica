import { useOnlineTicketCheckout } from '../../hooks/use-online-checkout';
import { useReserveTicket } from '../../hooks/use-ticketing';
import type { TicketPaymentIntent } from '../../types/ticketing';
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

  const submit = async (intent: TicketPaymentIntent) => {
    const max = intent === 'online' ? onlineMax : boxOfficeMax;
    if (quantity > max || remaining < 1) return;
    const order = await reserve.mutateAsync({
      matchId,
      category: category.label,
      categoryId: category.id,
      price: category.price,
      quantity,
      paymentIntent: intent,
    });
    const orderId = (order as { id?: string })?.id;
    if (intent === 'online' && orderId) {
      const res = await checkout.mutateAsync(orderId);
      if (res.url) {
        window.location.href = res.url;
        return;
      }
    }
    onReserved(orderId);
  };

  const busy = reserve.isPending || checkout.isPending;
  const onlineDisabled = busy || remaining === 0 || onlineMax < 1 || quantity > onlineMax;
  const boxOfficeDisabled = busy || remaining === 0 || boxOfficeMax < 1 || quantity > boxOfficeMax;

  if (boxOffice && online) {
    return (
      <div className="space-y-2">
        <Button
          type="button"
          className="w-full"
          disabled={onlineDisabled}
          onClick={() => void submit('online')}
        >
          {busy ? 'Obrada...' : 'Plati online'}
        </Button>
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
      <Button
        type="button"
        className="w-full"
        disabled={onlineDisabled}
        onClick={() => void submit('online')}
      >
        {busy ? 'Preusmjeravanje...' : 'Plati online'}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      className="w-full"
      disabled={boxOfficeDisabled || !boxOffice}
      onClick={() => void submit('box_office')}
    >
      {busy ? 'Rezervacija...' : 'Rezerviši ulaznice'}
    </Button>
  );
}
