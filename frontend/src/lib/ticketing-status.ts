import type { OrderStatus, TicketOrderRow, TicketStatus } from '../types/ticketing';

export function orderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Na čekanju',
    paid: 'Plaćeno',
    cancelled: 'Otkazano',
    refund_requested: 'Povrat zatražen',
    refunded: 'Povraćeno',
  };
  return labels[status] ?? status;
}

export function orderStatusVariant(status: string): 'default' | 'success' | 'muted' | 'danger' {
  if (status === 'paid') return 'success';
  if (status === 'pending' || status === 'refund_requested') return 'default';
  if (status === 'cancelled' || status === 'refunded') return 'muted';
  return 'muted';
}

export function ticketStatusLabel(status: TicketStatus | string): string {
  const labels: Record<string, string> = {
    RESERVED: 'Rezervisano',
    PAID_AT_BOX_OFFICE: 'Plaćeno',
    USED: 'Iskorišteno',
    CANCELLED: 'Otkazano',
    REFUND_REQUESTED: 'Povrat',
    ADMITTED: 'Ulaz odobren',
    ACTIVE: 'Aktivna',
    PENDING: 'Na čekanju',
  };
  return labels[status] ?? status;
}

export function ticketStatusVariant(status: string): 'default' | 'success' | 'muted' | 'danger' {
  if (status === 'PAID_AT_BOX_OFFICE') return 'success';
  if (status === 'RESERVED') return 'default';
  if (status === 'USED') return 'muted';
  if (status === 'CANCELLED') return 'danger';
  return 'muted';
}

export function matchLabel(match?: { homeClub?: { name: string }; awayClub?: { name: string } }) {
  if (!match?.homeClub?.name || !match?.awayClub?.name) return '—';
  return `${match.homeClub.name} vs ${match.awayClub.name}`;
}

export function canShowTicketQr(status: string) {
  return status === 'PAID_AT_BOX_OFFICE';
}

export function canRequestRefund(orderStatus: OrderStatus | string) {
  return orderStatus === 'paid';
}

export type TicketOrderFilter = 'all' | 'active' | 'reserved' | 'closed';

export function filterTicketOrders(orders: TicketOrderRow[], filter: TicketOrderFilter): TicketOrderRow[] {
  if (filter === 'all') return orders;
  if (filter === 'reserved') return orders.filter((o) => o.status === 'pending');
  if (filter === 'closed') {
    return orders.filter((o) => ['cancelled', 'refunded', 'refund_requested'].includes(o.status));
  }
  return orders.filter((o) => o.status === 'paid');
}

export const ticketOrderFilterLabels: Record<TicketOrderFilter, string> = {
  all: 'Sve',
  active: 'Kupljene',
  reserved: 'Rezervisane',
  closed: 'Otkazane',
};

/** Online plaćanje samo za neplaćenu rezervaciju (blagajna), ne za već plaćene ulaznice. */
export function canPayOrderOnline(order: TicketOrderRow, onlineEnabled: boolean): boolean {
  if (!onlineEnabled || order.status !== 'pending') return false;
  if (order.payment?.status === 'CONFIRMED') return false;
  const tickets = order.tickets ?? [];
  if (!tickets.length) return false;
  return tickets.every((t) => t.status === 'RESERVED');
}
