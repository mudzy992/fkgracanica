import { describe, expect, it } from 'vitest';
import type { TicketOrderRow, TicketRow, TicketStatus } from '../types/ticketing';
import {
  canPayOrderOnline, canRequestRefund, canShowTicketQr, filterTicketOrders, matchLabel,
  orderStatusLabel, orderStatusVariant, ticketStatusLabel, ticketStatusVariant,
} from './ticketing-status';

const ticket = (status: TicketStatus): TicketRow => ({ id: 'fixture', category: 'regular', price: 10, qrCode: 'fixture', status });
const order = (status: string, tickets?: TicketRow[], payment?: TicketOrderRow['payment']): TicketOrderRow => ({
  id: status, status, total: 10, tickets, payment,
});

describe('ticket and order status', () => {
  it('pokazuje QR samo za plaćenu ulaznicu, a povrat samo za plaćenu narudžbu', () => {
    expect(canShowTicketQr('PAID_AT_BOX_OFFICE')).toBe(true);
    for (const status of ['RESERVED', 'USED', 'CANCELLED', 'REFUND_REQUESTED', 'ACTIVE', 'unknown']) {
      expect(canShowTicketQr(status)).toBe(false);
    }
    expect(canRequestRefund('paid')).toBe(true);
    for (const status of ['pending', 'cancelled', 'refund_requested', 'refunded', 'unknown']) {
      expect(canRequestRefund(status)).toBe(false);
    }
  });

  it('online plaćanje dozvoljava samo neplaćenoj rezervaciji sa svim rezervisanim ulaznicama', () => {
    const pending = order('pending', [ticket('RESERVED'), ticket('RESERVED')]);
    expect(canPayOrderOnline(pending, true)).toBe(true);
    expect(canPayOrderOnline(pending, false)).toBe(false);
    expect(canPayOrderOnline(order('paid', pending.tickets), true)).toBe(false);
    expect(canPayOrderOnline(order('pending', pending.tickets, { status: 'CONFIRMED' }), true)).toBe(false);
    expect(canPayOrderOnline(order('pending', pending.tickets, { status: 'PENDING' }), true)).toBe(true);
    expect(canPayOrderOnline(order('pending', []), true)).toBe(false);
    expect(canPayOrderOnline(order('pending'), true)).toBe(false);
    expect(canPayOrderOnline(order('pending', [ticket('RESERVED'), ticket('CANCELLED')]), true)).toBe(false);
  });

  it('filtrira rezervisane, kupljene i sve oblike zatvorenih narudžbi bez izmjene liste', () => {
    const rows = ['pending', 'paid', 'cancelled', 'refunded', 'refund_requested', 'unknown'].map((status) => order(status));
    expect(filterTicketOrders(rows, 'all')).toBe(rows);
    expect(filterTicketOrders(rows, 'active').map((row) => row.status)).toEqual(['paid']);
    expect(filterTicketOrders(rows, 'reserved').map((row) => row.status)).toEqual(['pending']);
    expect(filterTicketOrders(rows, 'closed').map((row) => row.status)).toEqual(['cancelled', 'refunded', 'refund_requested']);
    expect(rows).toHaveLength(6);
  });

  it('prevodi poznate statuse i sigurno prikazuje nepoznate vrijednosti', () => {
    expect(orderStatusLabel('paid')).toBe('Plaćeno');
    expect(orderStatusLabel('refund_requested')).toBe('Povrat zatražen');
    expect(orderStatusLabel('unknown')).toBe('unknown');
    expect(orderStatusVariant('paid')).toBe('success');
    expect(orderStatusVariant('pending')).toBe('default');
    expect(orderStatusVariant('refunded')).toBe('muted');
    expect(orderStatusVariant('unknown')).toBe('muted');
    expect(ticketStatusLabel('RESERVED')).toBe('Rezervisano');
    expect(ticketStatusLabel('CANCELLED')).toBe('Otkazano');
    expect(ticketStatusLabel('other')).toBe('other');
    expect(ticketStatusVariant('PAID_AT_BOX_OFFICE')).toBe('success');
    expect(ticketStatusVariant('PENDING')).toBe('default');
    expect(ticketStatusVariant('USED')).toBe('muted');
    expect(ticketStatusVariant('CANCELLED')).toBe('danger');
    expect(ticketStatusVariant('other')).toBe('muted');
  });

  it('naziv utakmice zahtijeva oba kluba', () => {
    expect(matchLabel({ homeClub: { name: 'Domaći' }, awayClub: { name: 'Gosti' } })).toBe('Domaći vs Gosti');
    expect(matchLabel({ homeClub: { name: 'Domaći' } })).toBe('—');
    expect(matchLabel()).toBe('—');
  });
});
