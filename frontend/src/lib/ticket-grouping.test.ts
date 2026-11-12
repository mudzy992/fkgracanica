import { describe, expect, it } from 'vitest';
import type { TicketMatch, TicketOrderRow, TicketRow } from '../types/ticketing';
import { groupTicketsByMatch } from './group-tickets-by-match';
import { clubCrestPath, ticketCompetitionName, ticketMetaLine, ticketRoundLabel, ticketSeasonName } from './ticket-match-meta';

const ticket = (id: string, match?: TicketMatch): TicketRow => ({
  id, match, category: 'standard', price: 10, qrCode: `fixture-${id}`, status: 'RESERVED',
});
const order = (id: string, tickets?: TicketRow[]): TicketOrderRow => ({ id, total: 10, status: 'paid', tickets });

describe('ulaznice po utakmicama i meta podaci', () => {
  it('grupiše ulaznice više narudžbi i sortira poznate utakmice od najnovije', () => {
    const old = { id: 'old', scheduledAt: '2026-01-01T12:00:00Z' };
    const recent = { id: 'new', scheduledAt: '2026-05-01T12:00:00Z' };
    const input = [order('a', [ticket('t1', old), ticket('t2', recent)]), order('b', [ticket('t3', recent), ticket('t4')]), order('empty')];
    const groups = groupTicketsByMatch(input);
    expect(groups.map((g) => g.matchId)).toEqual(['new', 'old', 'unknown']);
    expect(groups[0].items.map((i) => [i.ticket.id, i.order.id])).toEqual([['t2', 'a'], ['t3', 'b']]);
    expect(groupTicketsByMatch([])).toEqual([]);
  });

  it('bira naziv kola prije broja, a sezonu i takmičenje prije rezervnih vrijednosti', () => {
    const match: TicketMatch = { id: 'm', roundRel: { name: ' Završnica ', number: 9 },
      season: { name: '2026/27', competition: { name: 'Liga' } },
      edition: { season: { name: 'stara' }, competition: { name: 'Kup' } } };
    expect(ticketRoundLabel(match)).toBe('Završnica');
    expect(ticketMetaLine(match)).toBe('Liga · 2026/27 · Završnica');
    expect(ticketRoundLabel({ id: 'm', roundRel: { name: ' ', number: 0 } })).toBe('0. kolo');
    const edition = { id: 'm', edition: { season: { name: 'Sezona' }, competition: { name: 'Kup' } } };
    expect(ticketCompetitionName(edition)).toBe('Kup');
    expect(ticketSeasonName(edition)).toBe('Sezona');
    expect(ticketMetaLine({ id: 'm' })).toBeUndefined();
    expect(clubCrestPath({ crestPath: '/crest.png' })).toBe('/crest.png');
    expect(clubCrestPath(null)).toBeUndefined();
  });
});
