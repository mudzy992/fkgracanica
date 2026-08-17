import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { buildFinanceSummary } from './finance-aggregate.util';
import {
  includeMembership,
  membershipSheet,
  parseFinanceRange,
  parseFinanceStatus,
  seasonPassSheet,
  seasonPassStatusFilter,
  ticketSheet,
} from './finance-query.util';
import { buildFinancePdf } from './pdf.util';
import { buildFinanceXlsx } from './xlsx.util';
import type {
  FinanceBundle,
  FinanceQuery,
  MembershipExportRow,
  SeasonPassExportRow,
  TicketExportRow,
} from './finance.types';

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
      `Clanstvo (procjena): ${s.membership.count} / ${km(s.membership.sum)}`,
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
    if (status && typeof status === 'object') throw new BadRequestException(status.error);
    const provider = query.provider?.trim() || undefined;
    const tickets = await this.loadTickets(range.from, range.to, provider, status);
    const seasonPass = await this.loadSeasonPasses(range.from, range.to, provider, status);
    const membership = includeMembership(status, provider)
      ? await this.loadMembership(range.from, range.to)
      : [];
    return {
      from: range.from,
      to: range.to,
      tickets,
      seasonPass,
      membership,
      summary: buildFinanceSummary(range.from, range.to, tickets, membership, seasonPass),
    };
  }

  private async loadTickets(
    from: Date,
    to: Date,
    provider?: string,
    status?: string,
  ): Promise<TicketExportRow[]> {
    const where: Prisma.PaymentWhereInput = { createdAt: { gte: from, lte: to } };
    if (provider) where.provider = provider;
    if (status) where.status = status as PaymentStatus;
    const rows = await this.prisma.payment.findMany({
      where,
      include: { order: { include: { user: { select: { email: true } } } } },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((p) => ({
      id: p.id,
      createdAt: p.createdAt,
      amount: Number(p.amount),
      status: p.status,
      provider: p.provider,
      method: p.method,
      orderId: p.orderId,
      email: p.order.user.email,
    }));
  }

  private async loadSeasonPasses(
    from: Date,
    to: Date,
    provider?: string,
    status?: string,
  ): Promise<SeasonPassExportRow[]> {
    const passStatus = seasonPassStatusFilter(status);
    const rows = await this.prisma.seasonPass.findMany({
      where: {
        updatedAt: { gte: from, lte: to },
        ...(provider ? { paymentProvider: provider } : {}),
        ...(passStatus ? { status: passStatus } : {}),
      },
      include: { user: { select: { email: true } } },
      orderBy: { updatedAt: 'asc' },
    });
    return rows.map((p) => ({
      id: p.id,
      updatedAt: p.updatedAt,
      amount: Number(p.price),
      status: p.status,
      provider: p.paymentProvider,
      label: p.label,
      email: p.user.email,
    }));
  }

  private async loadMembership(from: Date, to: Date): Promise<MembershipExportRow[]> {
    const priceRow = await this.prisma.setting.findUnique({ where: { key: 'membership.annualPrice' } });
    const amount = Number(priceRow?.value || '50');
    const rows = await this.prisma.membership.findMany({
      where: { status: 'ACTIVE', updatedAt: { gte: from, lte: to } },
      include: { user: { select: { email: true } } },
      orderBy: { updatedAt: 'asc' },
    });
    return rows.map((m) => ({
      id: m.id,
      updatedAt: m.updatedAt,
      amount,
      status: m.status,
      email: m.user.email,
    }));
  }
}
