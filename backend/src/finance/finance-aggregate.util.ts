import type { FinanceSummary, MembershipExportRow, TicketExportRow } from './finance.types';
import { bucketize, iso, round2 } from './finance-query.util';

export function buildFinanceSummary(
  from: Date,
  to: Date,
  tickets: TicketExportRow[],
  membership: MembershipExportRow[],
): FinanceSummary {
  const ticketSum = round2(tickets.reduce((s, r) => s + r.amount, 0));
  const memberSum = round2(membership.reduce((s, r) => s + r.amount, 0));
  return {
    from: iso(from),
    to: iso(to),
    tickets: { count: tickets.length, sum: ticketSum },
    membership: { count: membership.length, sum: memberSum, estimated: true },
    totalSum: round2(ticketSum + memberSum),
    byProvider: bucketize([
      ...tickets.map((r) => ({ key: r.provider, amount: r.amount })),
      ...membership.map((r) => ({ key: 'membership', amount: r.amount })),
    ]),
    byStatus: bucketize([
      ...tickets.map((r) => ({ key: r.status, amount: r.amount })),
      ...membership.map((r) => ({ key: r.status, amount: r.amount })),
    ]),
  };
}
