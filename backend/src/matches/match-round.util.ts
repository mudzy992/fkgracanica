import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';

export async function resolveMatchRoundFields(
  prisma: PrismaService,
  roundId?: string | null,
): Promise<{ roundId: string | null; round: number | null } | Record<string, never>> {
  if (roundId === undefined) return {};
  if (roundId === null || roundId === '') return { roundId: null, round: null };
  const round = await prisma.round.findUnique({ where: { id: roundId } });
  if (!round) throw new BadRequestException('Kolo nije pronađeno.');
  return { roundId: round.id, round: round.number };
}

export function assertDistinctClubs(homeClubId: string, awayClubId: string) {
  if (homeClubId === awayClubId) {
    throw new BadRequestException('Domaći i gosti ne mogu biti isti klub.');
  }
}
