export function canShowTicketQr(status: string): boolean {
  return status === 'PAID_AT_BOX_OFFICE';
}

export function canPayOrderOnline(order: { status: string; tickets: { status: string }[] }): boolean {
  if (order.status !== 'pending') return false;
  if (!order.tickets.length) return false;
  return order.tickets.every((t) => t.status === 'RESERVED');
}

export function canCancelOrder(order: { status: string }): boolean {
  return order.status === 'pending';
}

export function canShowSeasonQr(status: string): boolean {
  return status === 'ACTIVE';
}
