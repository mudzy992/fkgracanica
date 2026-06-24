import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTeamAnalytics(seasonId?: string) {
    const matches = await this.prisma.match.findMany({
      where: seasonId ? { seasonId } : undefined,
      include: { homeClub: true, awayClub: true, teamStats: true },
    });
    return {
      totalMatches: matches.length,
      goalsScored: matches.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0),
      matches,
    };
  }

  async getPlayerAnalytics(playerId: string) {
    const [player, stats, events] = await Promise.all([
      this.prisma.player.findUnique({ where: { id: playerId }, include: { club: true } }),
      this.prisma.playerStatistics.findMany({ where: { playerId } }),
      this.prisma.matchEvent.findMany({
        where: { playerId },
        include: { match: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);
    return { player, stats, recentEvents: events };
  }
}
