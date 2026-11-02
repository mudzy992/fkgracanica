import type { PrismaService } from '../prisma/prisma.service';

type LeaderRow = {
  playerId: string;
  firstName: string;
  lastName: string;
  value: number;
};

export async function getSeasonLeaders(
  prisma: PrismaService,
  seasonId: string,
  field: 'goals' | 'assists' | 'yellowCards' | 'redCards',
  limit = 10,
): Promise<LeaderRow[]> {
  const stats = await prisma.playerStatistics.findMany({
    where: { seasonCompetitionId: seasonId, [field]: { gt: 0 } },
    include: {
      player: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { [field]: 'desc' },
    take: limit,
  });
  return stats.map((s) => ({
    playerId: s.playerId,
    firstName: s.player.firstName,
    lastName: s.player.lastName,
    value: s[field],
  }));
}
