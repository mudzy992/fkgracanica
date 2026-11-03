import type {
  Bucket,
  FinanceQuery,
  MembershipExportRow,
  SeasonPassExportRow,
  TicketExportRow,
} from './finance.types';

const STATUSES = [
  'PENDING_BOX_OFFICE',
  'PENDING_ONLINE',
  'CONFIRMED',
  'REFUNDED',
  'CANCELLED',
] as const;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function parseFinanceRange(
  query: FinanceQuery,
): { from: Date; to: Date } | { error: string } {
  const to = query.to ? endOfDay(new Date(query.to)) : endOfDay(new Date());
  const from = query.from
    ? startOfDay(new Date(query.from))
    : startOfDay(new Date(to.getFullYear(), 0, 1));
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()))
    return { error: 'Neispravan datum' };
  if (from > to) return { error: 'Datum od mora biti prije datuma do' };
  return { from, to };
}

export function parseFinanceStatus(raw?: string) {
  if (!raw) return undefined;
  if (!STATUSES.includes(raw as (typeof STATUSES)[number]))
    return { error: 'Neispravan status' as const };
  return raw;
}

export function bucketize(rows: { key: string; amount: number }[]): Bucket[] {
  const map = new Map<string, Bucket>();
  for (const row of rows) {
    const cur = map.get(row.key) ?? { key: row.key, count: 0, sum: 0 };
    cur.count += 1;
    cur.sum += row.amount;
    map.set(row.key, cur);
  }
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * BE-07/Q-15: članstvo sada ima Payment red (`Payment.membershipId`), pa ga
 * filtriramo isto kao ulaznice — status/provider filteri više ne isključuju
 * članstvo.
 */
export function includeMembership(_status?: string, _provider?: string) {
  return true;
}

export function seasonPassStatusFilter(paymentStatus?: string) {
  if (!paymentStatus) return undefined;
  if (paymentStatus === 'CONFIRMED') return 'ACTIVE' as const;
  if (paymentStatus === 'REFUNDED') return 'REFUNDED' as const;
  if (paymentStatus === 'CANCELLED') return 'CANCELLED' as const;
  if (
    paymentStatus === 'PENDING_ONLINE' ||
    paymentStatus === 'PENDING_BOX_OFFICE'
  ) {
    return 'PENDING' as const;
  }
  return undefined;
}

export function seasonPassFinanceStatus(status: string, provider: string) {
  if (status === 'ACTIVE') return 'CONFIRMED';
  if (status === 'PENDING') {
    return provider === 'box_office' ? 'PENDING_BOX_OFFICE' : 'PENDING_ONLINE';
  }
  return status;
}

export function iso(d: Date) {
  return d.toISOString();
}

export function ticketSheet(rows: TicketExportRow[]): string[][] {
  const header = [
    'Datum',
    'ID',
    'Iznos',
    'Status',
    'Provider',
    'Metod',
    'Order',
    'Email',
  ];
  return [
    header,
    ...rows.map((r) => [
      r.createdAt.toISOString(),
      r.id,
      String(r.amount),
      r.status,
      r.provider,
      r.method,
      r.orderId,
      r.email,
    ]),
  ];
}

export function membershipSheet(rows: MembershipExportRow[]): string[][] {
  const header = ['Datum', 'ID', 'Iznos', 'Status', 'Provider', 'Email'];
  return [
    header,
    ...rows.map((r) => [
      r.updatedAt.toISOString(),
      r.id,
      String(r.amount),
      r.status,
      r.provider,
      r.email,
    ]),
  ];
}

export function seasonPassSheet(rows: SeasonPassExportRow[]): string[][] {
  const header = [
    'Datum',
    'ID',
    'Iznos',
    'Status',
    'Provider',
    'Naziv',
    'Email',
  ];
  return [
    header,
    ...rows.map((r) => [
      r.updatedAt.toISOString(),
      r.id,
      String(r.amount),
      r.status,
      r.provider,
      r.label,
      r.email,
    ]),
  ];
}
