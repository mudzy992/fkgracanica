import type {
  FinanceSummary,
  MembershipExportRow,
  SeasonPassExportRow,
  TicketExportRow,
} from './finance.types';
import { bucketize, iso, round2, seasonPassFinanceStatus } from './finance-query.util';

export function buildFinanceSummary(
  from: Date,
  to: Date,
  tickets: TicketExportRow[],
  membership: MembershipExportRow[],
  seasonPass: SeasonPassExportRow[] = [],
): FinanceSummary {
  const ticketSum = round2(tickets.reduce((s, r) => s + r.amount, 0));
  const memberSum = round2(membership.reduce((s, r) => s + r.amount, 0));
  const seasonSum = round2(seasonPass.reduce((s, r) => s + r.amount, 0));
  return {
    from: iso(from),
    to: iso(to),
    tickets: { count: tickets.length, sum: ticketSum },
    seasonPass: { count: seasonPass.length, sum: seasonSum },
    membership: { count: membership.length, sum: memberSum, estimated: true },
    totalSum: round2(ticketSum + memberSum + seasonSum),
    byProvider: bucketize([
      ...tickets.map((r) => ({ key: r.provider, amount: r.amount })),
      ...seasonPass.map((r) => ({ key: r.provider, amount: r.amount })),
      ...membership.map((r) => ({ key: 'membership', amount: r.amount })),
    ]),
    byStatus: bucketize([
      ...tickets.map((r) => ({ key: r.status, amount: r.amount })),
      ...seasonPass.map((r) => ({
        key: seasonPassFinanceStatus(r.status, r.provider),
        amount: r.amount,
      })),
      ...membership.map((r) => ({ key: r.status, amount: r.amount })),
    ]),
  };
}
