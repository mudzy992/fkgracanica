import type { TicketMatch, TicketOrderRow, TicketRow } from '../types/ticketing';

export interface TicketWithOrder {
  ticket: TicketRow;
  order: TicketOrderRow;
}

export interface MatchTicketGroup {
  matchId: string;
  match?: TicketMatch;
  items: TicketWithOrder[];
}

export function groupTicketsByMatch(orders: TicketOrderRow[]): MatchTicketGroup[] {
  const map = new Map<string, MatchTicketGroup>();

  for (const order of orders) {
    for (const ticket of order.tickets ?? []) {
      const matchId = ticket.matchId ?? ticket.match?.id ?? 'unknown';
      const existing = map.get(matchId);
      const item: TicketWithOrder = { ticket, order };
      if (existing) {
        existing.items.push(item);
      } else {
        map.set(matchId, { matchId, match: ticket.match, items: [item] });
      }
    }
  }

  return [...map.values()].sort((a, b) => {
    const da = a.match?.scheduledAt ? new Date(a.match.scheduledAt).getTime() : 0;
    const db = b.match?.scheduledAt ? new Date(b.match.scheduledAt).getTime() : 0;
    return db - da;
  });
}
