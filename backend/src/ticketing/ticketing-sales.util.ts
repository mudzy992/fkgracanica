import { BadRequestException } from '@nestjs/common';

export type TicketPaymentIntent = 'box_office' | 'online';

export function assertTicketReserveAllowed(
  sales: { boxOffice: boolean; online: boolean },
  intent: TicketPaymentIntent,
): void {
  if (!sales.boxOffice && !sales.online) {
    throw new BadRequestException('Kupovina ulaznica trenutno nije dostupna');
  }
  if (intent === 'box_office' && !sales.boxOffice) {
    throw new BadRequestException('Rezervacija za blagajnu nije dostupna');
  }
  if (intent === 'online' && !sales.online) {
    throw new BadRequestException('Online plaćanje nije dostupno');
  }
}

export function resolvePaymentIntent(
  sales: { boxOffice: boolean; online: boolean },
  requested?: TicketPaymentIntent,
): TicketPaymentIntent {
  if (requested) {
    assertTicketReserveAllowed(sales, requested);
    return requested;
  }
  if (sales.online && !sales.boxOffice) return 'online';
  if (sales.boxOffice && !sales.online) return 'box_office';
  if (sales.boxOffice) return 'box_office';
  return 'online';
}

export function usesBoxOfficeLimit(intent: TicketPaymentIntent): boolean {
  return intent === 'box_office';
}
