import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { MatchEventType, MatchReportStatus, MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { StatisticsService } from '../statistics/statistics.service';
import { applyScore, isScoringEvent } from './live-score.util';

@Injectable()
export class LiveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
    private readonly statistics: StatisticsService,
  ) {}

  async addEvent(matchId: string, data: {
    type: MatchEventType;
    minute: number;
    playerId?: string;
    teamSide?: string;
    description?: string;
    createdById?: string;
  }) {
    const event = await this.prisma.matchEvent.create({ data: { ...data, matchId } });

    if (isScoringEvent(data.type)) {
      const current = await this.prisma.match.findUniqueOrThrow({ where: { id: matchId } });
      const scores = applyScore(current.homeScore, current.awayScore, data.type, data.teamSide);
      const match = await this.prisma.match.update({
        where: { id: matchId },
        data: { ...scores, minute: data.minute },
      });
      this.realtime.emitMatchScore(matchId, {
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        minute: match.minute,
      });
      this.realtime.emitMatchStatus(matchId, match);
    }

    this.realtime.emitMatchEvent(matchId, event);
    return event;
  }

  async addComment(matchId: string, data: { message: string; userId?: string; minute?: number }) {
    const comment = await this.prisma.liveComment.create({ data: { ...data, matchId } });
    this.realtime.emitLiveComment(matchId, comment);
    return comment;
  }

  async startMatch(matchId: string) {
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: { status: MatchStatus.LIVE, minute: 0 },
    });
    this.realtime.emitMatchStatus(matchId, match);
    return match;
  }

  async endMatch(matchId: string) {
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: { status: MatchStatus.FINISHED, reportStatus: MatchReportStatus.PENDING_APPROVAL },
    });
    this.realtime.emitMatchStatus(matchId, match);
    return match;
  }

  async approveReport(matchId: string) {
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: { reportStatus: MatchReportStatus.APPROVED },
    });
    await this.statistics.recalculateForMatch(matchId);
    this.realtime.emitMatchStatus(matchId, match);
    return match;
  }

  async getFeed(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeClub: true,
        awayClub: true,
        events: { orderBy: { minute: 'asc' }, include: { player: true } },
        liveComments: { orderBy: { createdAt: 'asc' } },
        lineup: { include: { player: true } },
      },
    });
    if (!match) throw new NotFoundException('Utakmica nije pronađena');
    return match;
  }
}
