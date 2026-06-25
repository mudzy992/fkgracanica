import { Injectable } from '@nestjs/common';
import { MatchEventType, MatchReportStatus, MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { computeStandings } from './standings.util';
import { getSeasonLeaders } from './leaders.util';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async recalculateForMatch(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { events: true, season: true },
    });
    if (!match || match.reportStatus !== MatchReportStatus.APPROVED) {
      return { skipped: true, reason: 'Match not approved' };
    }

    const playerIds = [
      ...new Set(match.events.filter((e) => e.playerId).map((e) => e.playerId!)),
    ];

    for (const playerId of playerIds) {
      const events = match.events.filter((e) => e.playerId === playerId);
      const goals = events.filter((e) =>
        (['GOAL', 'PENALTY_SCORED'] as const).includes(e.type as 'GOAL' | 'PENALTY_SCORED'),
      ).length;
      const assists = 0;
      const yellowCards = events.filter((e) => e.type === MatchEventType.YELLOW_CARD).length;
      const redCards = events.filter((e) =>
        (['RED_CARD', 'SECOND_YELLOW'] as const).includes(e.type as 'RED_CARD' | 'SECOND_YELLOW'),
      ).length;

      await this.prisma.playerStatistics.upsert({
        where: {
          playerId_seasonId: { playerId, seasonId: match.seasonId },
        },
        create: {
          playerId,
          seasonId: match.seasonId,
          appearances: 1,
          goals,
          assists,
          yellowCards,
          redCards,
          minutes: 90,
        },
        update: {
          appearances: { increment: 1 },
          goals: { increment: goals },
          assists: { increment: assists },
          yellowCards: { increment: yellowCards },
          redCards: { increment: redCards },
          minutes: { increment: 90 },
        },
      });
    }

    return { success: true, playersUpdated: playerIds.length };
  }

  getPlayerStats(playerId: string, seasonId?: string) {
    return this.prisma.playerStatistics.findMany({
      where: { playerId, ...(seasonId ? { seasonId } : {}) },
    });
  }

  getTeamStats(matchId: string) {
    return this.prisma.teamStatistics.findMany({ where: { matchId } });
  }

  async getStandings(seasonId: string) {
    const matches = await this.prisma.match.findMany({
      where: { seasonId, status: MatchStatus.FINISHED },
      include: {
        homeClub: { select: { name: true } },
        awayClub: { select: { name: true } },
      },
    });
    return computeStandings(matches);
  }

  getTopScorers(seasonId: string) {
    return getSeasonLeaders(this.prisma, seasonId, 'goals');
  }

  getTopAssists(seasonId: string) {
    return getSeasonLeaders(this.prisma, seasonId, 'assists');
  }

  getCardsLeaders(seasonId: string) {
    return Promise.all([
      getSeasonLeaders(this.prisma, seasonId, 'yellowCards', 5),
      getSeasonLeaders(this.prisma, seasonId, 'redCards', 5),
    ]).then(([yellow, red]) => ({ yellow, red }));
  }
}
