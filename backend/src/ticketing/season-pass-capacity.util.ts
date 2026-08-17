import type { PrismaService } from '../prisma/prisma.service';
import { countSoldForMatch } from './ticketing-query.util';

export function countActivePasses(prisma: PrismaService, seasonId: string) {
  return prisma.seasonPass.count({
    where: { seasonId, status: { in: ['ACTIVE', 'PENDING'] } },
  });
}

export async function matchSeasonId(prisma: PrismaService, matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { edition: { select: { seasonId: true } } },
  });
  return match?.edition.seasonId ?? null;
}

export async function occupiedForMatch(prisma: PrismaService, matchId: string) {
  const sold = await countSoldForMatch(prisma, matchId);
  const seasonId = await matchSeasonId(prisma, matchId);
  const passes = seasonId ? await countActivePasses(prisma, seasonId) : 0;
  return { sold, passes, occupied: sold + passes };
}
