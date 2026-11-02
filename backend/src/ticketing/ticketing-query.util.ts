import { TicketStatus } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';

export const DEFAULT_STADIUM_CAPACITY = 5000;

export const ticketOrderInclude = {
  user: { select: { id: true, email: true, firstName: true, lastName: true } },
  tickets: {
    include: {
      match: {
        include: {
          homeClub: true,
          awayClub: true,
          roundRel: { select: { id: true, number: true, name: true } },
          edition: {
            select: {
              season: { select: { name: true } },
              competition: { select: { name: true } },
            },
          },
        },
      },
    },
  },
  payment: true,
} as const;

export async function getStadiumCapacity(
  prisma: PrismaService,
): Promise<number> {
  const setting = await prisma.setting.findUnique({
    where: { key: 'ticketing.stadiumCapacity' },
  });
  return setting
    ? Number(setting.value) || DEFAULT_STADIUM_CAPACITY
    : DEFAULT_STADIUM_CAPACITY;
}

export function countSoldForMatch(prisma: PrismaService, matchId: string) {
  return prisma.ticket.count({
    where: { matchId, status: { notIn: [TicketStatus.CANCELLED] } },
  });
}

export async function getMemberDiscountPercent(
  prisma: PrismaService,
  userId: string,
): Promise<number> {
  const active = await prisma.membership.findFirst({
    where: { userId, status: 'ACTIVE' },
  });
  if (!active) return 0;
  const setting = await prisma.setting.findUnique({
    where: { key: 'ticketing.memberDiscountPercent' },
  });
  return setting ? Number(setting.value) || 0 : 10;
}
