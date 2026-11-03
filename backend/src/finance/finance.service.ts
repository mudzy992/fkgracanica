import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildFinanceSummary } from './finance-aggregate.util';
import {
  includeMembership,
  membershipSheet,
  parseFinanceRange,
  parseFinanceStatus,
  seasonPassSheet,
  ticketSheet,
} from './finance-query.util';
import {
  loadMembership,
  loadSeasonPasses,
  loadTickets,
} from './finance-loaders';
import { buildFinancePdf } from './pdf.util';
import { buildFinanceXlsx } from './xlsx.util';
import type { FinanceBundle, FinanceQuery } from './finance.types';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(query: FinanceQuery) {
    const bundle = await this.load(query);
    return bundle.summary;
  }

  async exportXlsx(query: FinanceQuery) {
    const bundle = await this.load(query);
    return buildFinanceXlsx(
      ticketSheet(bundle.tickets),
      seasonPassSheet(bundle.seasonPass),
      membershipSheet(bundle.membership),
    );
  }

  async exportPdf(query: FinanceQuery) {
    const s = (await this.load(query)).summary;
    const km = (n: number) => `${n.toFixed(2)} KM`;
    const lines = [
      `Period: ${s.from.slice(0, 10)} - ${s.to.slice(0, 10)}`,
      `Ulaznice: ${s.tickets.count} / ${km(s.tickets.sum)}`,
      `Sezona: ${s.seasonPass.count} / ${km(s.seasonPass.sum)}`,
      `Clanstvo${s.membership.estimated ? ' (procjena)' : ''}: ${s.membership.count} / ${km(s.membership.sum)}`,
      `Ukupno: ${km(s.totalSum)}`,
      '',
      'Po provideru:',
      ...s.byProvider.map((b) => `  ${b.key}: ${b.count} / ${km(b.sum)}`),
      '',
      'Po statusu:',
      ...s.byStatus.map((b) => `  ${b.key}: ${b.count} / ${km(b.sum)}`),
    ];
    return buildFinancePdf(lines);
  }

  private async load(query: FinanceQuery): Promise<FinanceBundle> {
    const range = parseFinanceRange(query);
    if ('error' in range) throw new BadRequestException(range.error);
    const status = parseFinanceStatus(query.status);
    if (status && typeof status === 'object')
      throw new BadRequestException(status.error);
    const provider = query.provider?.trim() || undefined;
    const tickets = await loadTickets(
      this.prisma,
      range.from,
      range.to,
      provider,
      status,
    );
    const seasonPass = await loadSeasonPasses(
      this.prisma,
      range.from,
      range.to,
      provider,
      status,
    );
    const membership = includeMembership(status, provider)
      ? await loadMembership(
          this.prisma,
          range.from,
          range.to,
          provider,
          status,
        )
      : [];
    return {
      from: range.from,
      to: range.to,
      tickets,
      seasonPass,
      membership,
      summary: buildFinanceSummary(
        range.from,
        range.to,
        tickets,
        membership,
        seasonPass,
      ),
    };
  }
}
