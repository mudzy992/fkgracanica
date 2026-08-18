const STATUS_KEYS: Record<string, string> = {
  paid: 'ticketStatusPaid',
  PAID: 'ticketStatusPaid',
  PAID_AT_BOX_OFFICE: 'ticketStatusPaid',
  RESERVED: 'ticketStatusReserved',
  reserved: 'ticketStatusReserved',
  USED: 'ticketStatusUsed',
  used: 'ticketStatusUsed',
  pending: 'ticketStatusPending',
  PENDING: 'ticketStatusPending',
  PENDING_ONLINE: 'ticketStatusPending',
};

export function ticketStatusKey(status: string): string {
  return STATUS_KEYS[status] ?? 'status';
}
