import { BadRequestException, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import {
  LiveBreak,
  MatchEventType,
  MatchPeriod,
  MatchReportStatus,
  MatchStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { StatisticsService } from '../statistics/statistics.service';
import { applyScore, isScoringEvent } from './live-score.util';
import { computeLiveClock, resolveEventMinute } from './live-clock.util';

@Injectable()
export class LiveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
    private readonly statistics: StatisticsService,
  ) {}

  private async emitClock(matchId: string) {
    const match = await this.prisma.match.findUnique({ where: { id: matchId } });
    if (!match) return;
    const clock = computeLiveClock(match);
    if (clock) this.realtime.emitMatchClock(matchId, clock);
  }

  async addEvent(matchId: string, data: {
    type: MatchEventType;
    minute?: number;
    playerId?: string;
    relatedPlayerId?: string;
    teamSide?: string;
    description?: string;
    createdById?: string;
  }) {
    const current = await this.prisma.match.findUniqueOrThrow({ where: { id: matchId } });
    if (current.status === MatchStatus.FINISHED) {
      throw new BadRequestException('Za završenu utakmicu koristite editor izvještaja.');
    }
    const minute = data.minute ?? resolveEventMinute(current, current.minute);
    const event = await this.prisma.matchEvent.create({
      data: { ...data, minute, matchId },
      include: { player: true, relatedPlayer: true },
    });

    if (isScoringEvent(data.type)) {
      const isPenalties = current.matchPeriod === MatchPeriod.PENALTIES;
      const isShootoutPenalty =
        isPenalties &&
        (data.type === MatchEventType.PENALTY_SCORED || data.type === MatchEventType.PENALTY_MISSED);
      if (isShootoutPenalty) {
        const side = data.teamSide === 'away' ? 'away' : 'home';
        const penaltyPatch =
          data.type === MatchEventType.PENALTY_SCORED
            ? side === 'home'
              ? { penaltyHomeScore: { increment: 1 } }
              : { penaltyAwayScore: { increment: 1 } }
            : {};
        const match = await this.prisma.match.update({
          where: { id: matchId },
          data: { minute, ...penaltyPatch },
        });
        this.realtime.emitMatchScore(matchId, {
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          minute: match.minute,
          penaltyHomeScore: match.penaltyHomeScore,
          penaltyAwayScore: match.penaltyAwayScore,
        });
        this.realtime.emitMatchStatus(matchId, match);
      } else if (!isPenalties) {
        const scores = applyScore(current.homeScore, current.awayScore, data.type, data.teamSide);
        const match = await this.prisma.match.update({
          where: { id: matchId },
          data: { ...scores, minute },
        });
        this.realtime.emitMatchScore(matchId, {
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          minute: match.minute,
        });
        this.realtime.emitMatchStatus(matchId, match);
      } else {
        await this.prisma.match.update({ where: { id: matchId }, data: { minute } });
      }
    } else {
      await this.prisma.match.update({ where: { id: matchId }, data: { minute } });
    }

    this.realtime.emitMatchEvent(matchId, event);
    await this.emitClock(matchId);
    return event;
  }

  async addComment(matchId: string, data: { message: string; userId?: string; minute?: number }) {
    const current = await this.prisma.match.findUniqueOrThrow({ where: { id: matchId } });
    const minute = data.minute ?? resolveEventMinute(current, current.minute);
    const comment = await this.prisma.liveComment.create({ data: { ...data, minute, matchId } });
    this.realtime.emitLiveComment(matchId, comment);
    return comment;
  }

  async startMatch(matchId: string) {
    const now = new Date();
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.LIVE,
        minute: 0,
        clockStartedAt: now,
        matchPeriod: MatchPeriod.FIRST_HALF,
        stoppageFirstHalf: 0,
        stoppageSecondHalf: 0,
        stoppageExtraFirst: 0,
        stoppageExtraSecond: 0,
        liveBreak: LiveBreak.NONE,
        penaltyHomeScore: 0,
        penaltyAwayScore: 0,
      },
    });
    const kickoff = await this.prisma.matchEvent.create({
      data: { matchId, type: MatchEventType.KICKOFF, minute: 0 },
    });
    this.realtime.emitMatchEvent(matchId, kickoff);
    this.realtime.emitMatchStatus(matchId, match);
    await this.emitClock(matchId);
    return match;
  }

  async setStoppage(matchId: string, half: 1 | 2 | 3 | 4, minutes: number) {
    const current = await this.prisma.match.findUniqueOrThrow({ where: { id: matchId } });
    const displayMinute = resolveEventMinute(current, current.minute);
    const patch: Record<string, number> = { minute: displayMinute };
    if (half === 1) patch.stoppageFirstHalf = minutes;
    else if (half === 2) patch.stoppageSecondHalf = minutes;
    else if (half === 3) patch.stoppageExtraFirst = minutes;
    else patch.stoppageExtraSecond = minutes;
    const match = await this.prisma.match.update({ where: { id: matchId }, data: patch });
    const event = await this.prisma.matchEvent.create({
      data: {
        matchId,
        type: MatchEventType.COMMENT,
        minute: displayMinute,
        description: `Sudijska nadoknada: +${minutes} min`,
      },
      include: { player: true, relatedPlayer: true },
    });
    this.realtime.emitMatchEvent(matchId, event);
    this.realtime.emitMatchStatus(matchId, match);
    await this.emitClock(matchId);
    return match;
  }

  async setLiveStream(matchId: string, url: string | null) {
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: { liveStreamUrl: url },
    });
    this.realtime.emitMatchStatus(matchId, match);
    return match;
  }

  async endMatch(matchId: string) {
    const current = await this.prisma.match.findUniqueOrThrow({ where: { id: matchId } });
    const minute = resolveEventMinute(current, current.minute);
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.FINISHED,
        reportStatus: MatchReportStatus.PENDING_APPROVAL,
        minute,
        clockStartedAt: null,
        matchPeriod: null,
        liveBreak: LiveBreak.NONE,
      },
    });
    this.realtime.emitMatchStatus(matchId, match);
    return match;
  }

  async setHalftime(matchId: string) {
    const current = await this.prisma.match.findUniqueOrThrow({ where: { id: matchId } });
    if (current.matchPeriod !== MatchPeriod.FIRST_HALF) {
      throw new BadRequestException('Poluvrijeme je moguće samo u 1. poluvremenu regularnog dijela.');
    }
    const minute = resolveEventMinute(current, current.minute);
    await this.prisma.matchEvent.create({
      data: { matchId, type: MatchEventType.HALFTIME, minute },
    });
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.HALFTIME,
        liveBreak: LiveBreak.REGULAR_HT,
        minute,
        clockStartedAt: null,
      },
    });
    this.realtime.emitMatchStatus(matchId, match);
    return match;
  }

  async resumeSecondHalf(matchId: string) {
    const current = await this.prisma.match.findUniqueOrThrow({ where: { id: matchId } });
    if (current.liveBreak !== LiveBreak.REGULAR_HT) {
      throw new BadRequestException('Nastavak 2. poluvremena nije dostupan u ovoj fazi.');
    }
    const minute = 46;
    await this.prisma.matchEvent.create({
      data: { matchId, type: MatchEventType.SECOND_HALF, minute },
    });
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.LIVE,
        liveBreak: LiveBreak.NONE,
        minute,
        clockStartedAt: new Date(),
        matchPeriod: MatchPeriod.SECOND_HALF,
      },
    });
    this.realtime.emitMatchStatus(matchId, match);
    await this.emitClock(matchId);
    return match;
  }

  listPendingApproval() {
    return this.prisma.match.findMany({
      where: { reportStatus: MatchReportStatus.PENDING_APPROVAL },
      include: { homeClub: true, awayClub: true, season: { include: { competition: true } } },
      orderBy: { updatedAt: 'desc' },
    });
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
        events: {
          orderBy: { minute: 'asc' },
          include: { player: true, relatedPlayer: true },
        },
        liveComments: { orderBy: { createdAt: 'asc' } },
        lineup: { include: { player: true } },
      },
    });
    if (!match) throw new NotFoundException('Utakmica nije pronađena');
    return match;
  }
}
