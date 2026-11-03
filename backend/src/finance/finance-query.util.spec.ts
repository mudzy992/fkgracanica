import { buildFinanceSummary } from './finance-aggregate.util';
import {
  includeMembership,
  membershipSheet,
  parseFinanceRange,
  parseFinanceStatus,
  seasonPassFinanceStatus,
  seasonPassStatusFilter,
} from './finance-query.util';
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
    expect(parseFinanceRange({ from: '2026-08-02', to: '2026-08-01' })).toEqual(
      {
        error: 'Datum od mora biti prije datuma do',
      },
    );
    expect(parseFinanceStatus('NOPE')).toEqual({ error: 'Neispravan status' });
    expect(parseFinanceStatus('CONFIRMED')).toBe('CONFIRMED');
  });

  it('maps payment status to season pass status', () => {
    expect(seasonPassStatusFilter(undefined)).toBeUndefined();
    expect(seasonPassStatusFilter('CONFIRMED')).toBe('ACTIVE');
    expect(seasonPassStatusFilter('PENDING_ONLINE')).toBe('PENDING');
    expect(seasonPassFinanceStatus('ACTIVE', 'stripe')).toBe('CONFIRMED');
    expect(seasonPassFinanceStatus('PENDING', 'box_office')).toBe(
      'PENDING_BOX_OFFICE',
    );
  });

  it('membership is always included and filtered by status/provider', () => {
    // BE-07/Q-15: članstvo ima Payment red → isti filteri kao ulaznice.
    expect(includeMembership(undefined, undefined)).toBe(true);
    expect(includeMembership('CONFIRMED', undefined)).toBe(true);
    expect(includeMembership('PENDING_ONLINE', undefined)).toBe(true);
    expect(includeMembership(undefined, 'stripe')).toBe(true);
  });

  it('membership sheet exports provider and amount (no estimate note)', () => {
    const sheet = membershipSheet([
      {
        id: 'm1',
        updatedAt: new Date('2026-11-03T10:00:00.000Z'),
        amount: 50,
        status: 'ACTIVE',
        provider: 'stripe',
        email: 'a@x.ba',
        estimated: false,
      },
    ]);
    expect(sheet[0]).toEqual([
      'Datum',
      'ID',
      'Iznos',
      'Status',
      'Provider',
      'Email',
    ]);
    expect(sheet[1]).toEqual([
      '2026-11-03T10:00:00.000Z',
      'm1',
      '50',
      'ACTIVE',
      'stripe',
      'a@x.ba',
    ]);
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
      [
        {
          id: 'm1',
          updatedAt: from,
          amount: 50,
          status: 'ACTIVE',
          provider: 'stripe',
          email: 'b@x.ba',
          estimated: false,
        },
      ],
      [
        {
          id: 's1',
          updatedAt: from,
          amount: 80,
          status: 'ACTIVE',
          provider: 'stripe',
          label: 'Sezonska karta',
          email: 'c@x.ba',
        },
      ],
    );
    expect(s.tickets).toEqual({ count: 1, sum: 10.5 });
    // BE-07/Q-15: članstvo sada ima Payment red → prihod nije procjena.
    expect(s.membership).toEqual({ count: 1, sum: 50, estimated: false });
    expect(s.seasonPass).toEqual({ count: 1, sum: 80 });
    expect(s.totalSum).toBe(140.5);
    expect(s.byProvider.map((b) => b.key).sort()).toEqual(['stripe']);
  });
});

describe('export bytes', () => {
  it('zip starts with PK and pdf with %PDF', () => {
    const zip = zipStore([{ name: 'a.txt', data: Buffer.from('hi') }]);
    expect(zip.subarray(0, 2).toString()).toBe('PK');
    expect(buildFinancePdf(['test']).subarray(0, 5).toString()).toBe('%PDF-');
  });
});
