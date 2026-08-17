import { buildFinanceSummary } from './finance-aggregate.util';
import { includeMembership, parseFinanceRange, parseFinanceStatus } from './finance-query.util';
import { buildFinancePdf } from './pdf.util';
import { zipStore } from './zip-store.util';

describe('finance-query.util', () => {
  it('defaults from to start of year', () => {
    const range = parseFinanceRange({ to: '2026-08-17' });
    if ('error' in range) throw new Error(range.error);
    expect(range.from.getFullYear()).toBe(2026);
    expect(range.from.getMonth()).toBe(0);
    expect(range.from.getDate()).toBe(1);
  });

  it('rejects inverted range and bad status', () => {
    expect(parseFinanceRange({ from: '2026-08-02', to: '2026-08-01' })).toEqual({
      error: 'Datum od mora biti prije datuma do',
    });
    expect(parseFinanceStatus('NOPE')).toEqual({ error: 'Neispravan status' });
    expect(parseFinanceStatus('CONFIRMED')).toBe('CONFIRMED');
  });

  it('membership sheet only without provider and CONFIRMED/empty status', () => {
    expect(includeMembership(undefined, undefined)).toBe(true);
    expect(includeMembership('CONFIRMED', undefined)).toBe(true);
    expect(includeMembership('PENDING_ONLINE', undefined)).toBe(false);
    expect(includeMembership(undefined, 'stripe')).toBe(false);
  });
});

describe('buildFinanceSummary', () => {
  it('sums tickets and membership separately', () => {
    const from = new Date('2026-01-01');
    const to = new Date('2026-08-17');
    const s = buildFinanceSummary(
      from,
      to,
      [
        {
          id: 'p1',
          createdAt: from,
          amount: 10.5,
          status: 'CONFIRMED',
          provider: 'stripe',
          method: 'stripe',
          orderId: 'o1',
          email: 'a@x.ba',
        },
      ],
      [{ id: 'm1', updatedAt: from, amount: 50, status: 'ACTIVE', email: 'b@x.ba' }],
    );
    expect(s.tickets).toEqual({ count: 1, sum: 10.5 });
    expect(s.membership).toEqual({ count: 1, sum: 50, estimated: true });
    expect(s.totalSum).toBe(60.5);
    expect(s.byProvider.map((b) => b.key).sort()).toEqual(['membership', 'stripe']);
  });
});

describe('export bytes', () => {
  it('zip starts with PK and pdf with %PDF', () => {
    const zip = zipStore([{ name: 'a.txt', data: Buffer.from('hi') }]);
    expect(zip.subarray(0, 2).toString()).toBe('PK');
    expect(buildFinancePdf(['test']).subarray(0, 5).toString()).toBe('%PDF-');
  });
});
