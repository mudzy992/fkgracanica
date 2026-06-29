import { BadRequestException } from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';

const DEFAULT_MAX = 4;

export async function getMaxBoxOfficeTicketsPerUser(prisma: PrismaService): Promise<number> {
  const row = await prisma.setting.findUnique({
    where: { key: 'ticketing.maxBoxOfficeTicketsPerUser' },
  });
  const n = row ? Number(row.value) : DEFAULT_MAX;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_MAX;
}

export async function countUserActiveTicketsForMatch(
  prisma: PrismaService,
  userId: string,
  matchId: string,
): Promise<number> {
  return prisma.ticket.count({
    where: {
      matchId,
      status: { notIn: [TicketStatus.CANCELLED] },
      order: {
        userId,
        status: { notIn: ['cancelled', 'refunded'] },
      },
    },
  });
}

export async function assertBoxOfficeTicketLimit(
  prisma: PrismaService,
  userId: string,
  matchId: string,
  quantity: number,
) {
  const max = await getMaxBoxOfficeTicketsPerUser(prisma);
  const current = await countUserActiveTicketsForMatch(prisma, userId, matchId);
  if (current + quantity > max) {
    const left = Math.max(0, max - current);
    throw new BadRequestException(
      left > 0
        ? `Maksimalno ${max} ulaznica po korisniku (blagajna). Možete rezervisati još ${left}.`
        : `Dostigli ste limit od ${max} ulaznica za ovu utakmicu (blagajna).`,
    );
  }
}
