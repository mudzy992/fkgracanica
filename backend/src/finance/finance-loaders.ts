import { PaymentStatus, Prisma } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import { seasonPassStatusFilter } from './finance-query.util';
import type {
  MembershipExportRow,
  SeasonPassExportRow,
  TicketExportRow,
} from './finance.types';

/**
 * Upiti za finansijski izvještaj (BE-07 / Q-15).
 *
 * Izdvojeno iz `FinanceService` da servis ostane ispod limita od 200 linija.
 * Vezano za `Payment`: od BE-07 jedan Payment red može biti vezan na
 * `TicketOrder` **ili** na `Membership`, pa svaki loader filtrira svoju vrstu.
 */

export async function loadTickets(
  prisma: PrismaService,
  from: Date,
  to: Date,
  provider?: string,
  status?: string,
): Promise<TicketExportRow[]> {
  const where: Prisma.PaymentWhereInput = {
    orderId: { not: null },
    createdAt: { gte: from, lte: to },
  };
  if (provider) where.provider = provider;
  if (status) where.status = status as PaymentStatus;
  const rows = await prisma.payment.findMany({
    where,
    include: { order: { include: { user: { select: { email: true } } } } },
    orderBy: { createdAt: 'asc' },
  });
  return rows.flatMap((p) =>
    p.order
      ? [
          {
            id: p.id,
            createdAt: p.createdAt,
            amount: Number(p.amount),
            status: p.status,
            provider: p.provider,
            method: p.method,
            orderId: p.orderId ?? '',
            email: p.order.user.email,
          },
        ]
      : [],
  );
}

export async function loadSeasonPasses(
  prisma: PrismaService,
  from: Date,
  to: Date,
  provider?: string,
  status?: string,
): Promise<SeasonPassExportRow[]> {
  const passStatus = seasonPassStatusFilter(status);
  const rows = await prisma.seasonPass.findMany({
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

/**
 * Prihod od članstva iz **Payment redova** (ranije: procjena iz
 * `membership.annualPrice` za svako aktivno članstvo). Članstva aktivirana
 * bez plaćanja (admin) nemaju Payment red i zato nisu prihod.
 */
export async function loadMembership(
  prisma: PrismaService,
  from: Date,
  to: Date,
  provider?: string,
  status?: string,
): Promise<MembershipExportRow[]> {
  const where: Prisma.PaymentWhereInput = {
    membershipId: { not: null },
    createdAt: { gte: from, lte: to },
  };
  if (provider) where.provider = provider;
  if (status) where.status = status as PaymentStatus;
  const rows = await prisma.payment.findMany({
    where,
    include: {
      membership: { include: { user: { select: { email: true } } } },
    },
    orderBy: { createdAt: 'asc' },
  });
  return rows.flatMap((p) =>
    p.membership
      ? [
          {
            id: p.membership.id,
            updatedAt: p.createdAt,
            amount: Number(p.amount),
            status: p.membership.status,
            provider: p.provider,
            email: p.membership.user.email,
            estimated: false,
          },
        ]
      : [],
  );
}
