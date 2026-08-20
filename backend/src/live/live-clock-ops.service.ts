import { BadRequestException, Injectable } from '@nestjs/common';
import { LiveBreak, MatchEventType, MatchPeriod, MatchReportStatus, MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { LiveFanoutService } from '../notifications/live-fanout.service';
import { resolveEventMinute } from './live-clock.util';
import { emitLiveClock } from './live-emit-clock';

@Injectable()
export class LiveClockOpsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
    private readonly liveFanout: LiveFanoutService,
  ) {}

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
    await emitLiveClock(this.prisma, this.realtime, matchId);
    void this.liveFanout.fanout(matchId, kickoff);
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
    await emitLiveClock(this.prisma, this.realtime, matchId);
    void this.liveFanout.fanout(matchId, event);
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
    void this.liveFanout.fanout(matchId, { type: MatchEventType.FULL_TIME, minute });
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
    void this.liveFanout.fanout(matchId, { type: MatchEventType.HALFTIME, minute });
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
    await emitLiveClock(this.prisma, this.realtime, matchId);
    void this.liveFanout.fanout(matchId, { type: MatchEventType.SECOND_HALF, minute });
    return match;
  }
}
