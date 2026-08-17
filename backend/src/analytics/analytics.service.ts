import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { aggregateClubMatches } from './analytics-team.util';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTeamAnalytics(seasonId?: string) {
    const own = await this.prisma.club.findFirst({ where: { isOwnClub: true } });
    if (!own) throw new NotFoundException('Vlastiti klub nije postavljen');
    const matches = await this.prisma.match.findMany({
      where: {
        ...(seasonId ? { seasonCompetitionId: seasonId } : {}),
        OR: [{ homeClubId: own.id }, { awayClubId: own.id }],
      },
      include: { homeClub: true, awayClub: true },
      orderBy: { scheduledAt: 'desc' },
    });
    const summary = aggregateClubMatches(matches, own.id);
    return {
      clubId: own.id,
      clubName: own.name,
      seasonId: seasonId ?? null,
      ...summary,
      recent: matches.slice(0, 8).map((m) => ({
        id: m.id,
        scheduledAt: m.scheduledAt,
        status: m.status,
        home: m.homeClub.name,
        away: m.awayClub.name,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
      })),
    };
  }

  async getH2H(clubAId: string, clubBId: string) {
    if (!clubAId || !clubBId || clubAId === clubBId) {
      throw new BadRequestException('Potrebna su dva različita kluba');
    }
    const matches = await this.prisma.match.findMany({
      where: {
        status: 'FINISHED',
        OR: [
          { homeClubId: clubAId, awayClubId: clubBId },
          { homeClubId: clubBId, awayClubId: clubAId },
        ],
      },
      include: { homeClub: true, awayClub: true },
      orderBy: { scheduledAt: 'desc' },
      take: 20,
    });
    const summaryA = aggregateClubMatches(matches, clubAId);
    const summaryB = aggregateClubMatches(matches, clubBId);
    return {
      clubAId,
      clubBId,
      played: matches.length,
      clubA: summaryA,
      clubB: summaryB,
      matches: matches.map((m) => ({
        id: m.id,
        scheduledAt: m.scheduledAt,
        status: m.status,
        home: m.homeClub.name,
        away: m.awayClub.name,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
      })),
    };
  }

  async getPlayerAnalytics(playerId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: { club: true },
    });
    if (!player) throw new NotFoundException('Igrač nije pronađen');
    const stats = await this.prisma.playerStatistics.findMany({
      where: { playerId },
    });
    const totals = stats.reduce(
      (acc, row) => ({
        appearances: acc.appearances + row.appearances,
        goals: acc.goals + row.goals,
        assists: acc.assists + row.assists,
        minutes: acc.minutes + row.minutes,
        yellowCards: acc.yellowCards + row.yellowCards,
        redCards: acc.redCards + row.redCards,
      }),
      { appearances: 0, goals: 0, assists: 0, minutes: 0, yellowCards: 0, redCards: 0 },
    );
    return { player, seasons: stats, totals };
  }
}
