import { BadRequestException, Injectable } from '@nestjs/common';
import {
  LiveBreak,
  MatchEventType,
  MatchPeriod,
  MatchReportStatus,
  MatchStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { resolveEventMinute } from './live-clock.util';

@Injectable()
export class LivePhaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  private assertTied(match: { homeScore: number; awayScore: number }) {
    if (match.homeScore !== match.awayScore) {
      throw new BadRequestException('Produžeci i penali su dostupni samo kod neriješenog rezultata.');
    }
  }

  async finishRegularTime(matchId: string) {
    const current = await this.prisma.match.findUniqueOrThrow({ where: { id: matchId } });
    if (current.status !== MatchStatus.LIVE || current.matchPeriod !== MatchPeriod.SECOND_HALF) {
      throw new BadRequestException('Kraj regularnog vremena je moguć samo u 2. poluvremenu.');
    }
    const minute = resolveEventMinute(current, current.minute);
    await this.prisma.matchEvent.create({
      data: { matchId, type: MatchEventType.FULL_TIME, minute },
    });
    const tied = current.homeScore === current.awayScore;
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: tied ? MatchStatus.HALFTIME : current.status,
        liveBreak: tied ? LiveBreak.POST_REGULATION : LiveBreak.NONE,
        minute,
        clockStartedAt: tied ? null : current.clockStartedAt,
      },
    });
    this.realtime.emitMatchStatus(matchId, match);
    return match;
  }

  async startExtraTime(matchId: string) {
    const current = await this.prisma.match.findUniqueOrThrow({ where: { id: matchId } });
    if (current.liveBreak !== LiveBreak.POST_REGULATION) {
      throw new BadRequestException('Produžeci se mogu pokrenuti samo nakon neriješenog regularnog vremena.');
    }
    this.assertTied(current);
    const minute = 91;
    await this.prisma.matchEvent.create({
      data: { matchId, type: MatchEventType.EXTRA_TIME, minute, description: '1. produžetak' },
    });
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.LIVE,
        liveBreak: LiveBreak.NONE,
        matchPeriod: MatchPeriod.EXTRA_FIRST,
        minute,
        clockStartedAt: new Date(),
        stoppageExtraFirst: 0,
        stoppageExtraSecond: 0,
      },
    });
    this.realtime.emitMatchStatus(matchId, match);
    return match;
  }

  async extraTimeHalftime(matchId: string) {
    const current = await this.prisma.match.findUniqueOrThrow({ where: { id: matchId } });
    if (current.status !== MatchStatus.LIVE || current.matchPeriod !== MatchPeriod.EXTRA_FIRST) {
      throw new BadRequestException('Pauza produžetaka je moguća samo u 1. produžetku.');
    }
    const minute = resolveEventMinute(current, current.minute);
    await this.prisma.matchEvent.create({
      data: { matchId, type: MatchEventType.HALFTIME, minute, description: 'Pauza produžetaka' },
    });
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: { status: MatchStatus.HALFTIME, liveBreak: LiveBreak.ET_HT, minute, clockStartedAt: null },
    });
    this.realtime.emitMatchStatus(matchId, match);
    return match;
  }

  async resumeExtraSecond(matchId: string) {
    const current = await this.prisma.match.findUniqueOrThrow({ where: { id: matchId } });
    if (current.liveBreak !== LiveBreak.ET_HT) {
      throw new BadRequestException('Drugi produžetak se može pokrenuti samo nakon pauze produžetaka.');
    }
    const minute = 106;
    await this.prisma.matchEvent.create({
      data: { matchId, type: MatchEventType.SECOND_HALF, minute, description: '2. produžetak' },
    });
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.LIVE,
        liveBreak: LiveBreak.NONE,
        matchPeriod: MatchPeriod.EXTRA_SECOND,
        minute,
        clockStartedAt: new Date(),
      },
    });
    this.realtime.emitMatchStatus(matchId, match);
    return match;
  }

  async finishExtraTime(matchId: string) {
    const current = await this.prisma.match.findUniqueOrThrow({ where: { id: matchId } });
    if (current.status !== MatchStatus.LIVE || current.matchPeriod !== MatchPeriod.EXTRA_SECOND) {
      throw new BadRequestException('Kraj produžetaka je moguć samo u 2. produžetku.');
    }
    const minute = resolveEventMinute(current, current.minute);
    await this.prisma.matchEvent.create({
      data: { matchId, type: MatchEventType.FULL_TIME, minute, description: 'Kraj produžetaka' },
    });
    const tied = current.homeScore === current.awayScore;
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: tied ? MatchStatus.HALFTIME : current.status,
        liveBreak: tied ? LiveBreak.POST_EXTRA : LiveBreak.NONE,
        minute,
        clockStartedAt: tied ? null : current.clockStartedAt,
      },
    });
    this.realtime.emitMatchStatus(matchId, match);
    return match;
  }

  async startPenalties(matchId: string) {
    const current = await this.prisma.match.findUniqueOrThrow({ where: { id: matchId } });
    if (current.liveBreak !== LiveBreak.POST_EXTRA) {
      throw new BadRequestException('Penali se mogu pokrenuti samo nakon neriješenih produžetaka.');
    }
    this.assertTied(current);
    const minute = resolveEventMinute(current, 120);
    await this.prisma.matchEvent.create({
      data: { matchId, type: MatchEventType.COMMENT, minute, description: 'Izvođenje penala' },
    });
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.LIVE,
        liveBreak: LiveBreak.NONE,
        matchPeriod: MatchPeriod.PENALTIES,
        minute,
        clockStartedAt: null,
        penaltyHomeScore: 0,
        penaltyAwayScore: 0,
      },
    });
    this.realtime.emitMatchStatus(matchId, match);
    return match;
  }

  async endAfterPenalties(matchId: string) {
    const current = await this.prisma.match.findUniqueOrThrow({ where: { id: matchId } });
    if (current.matchPeriod !== MatchPeriod.PENALTIES) {
      throw new BadRequestException('Utakmica nije u fazi penala.');
    }
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.FINISHED,
        reportStatus: MatchReportStatus.PENDING_APPROVAL,
        matchPeriod: null,
        liveBreak: LiveBreak.NONE,
        clockStartedAt: null,
      },
    });
    this.realtime.emitMatchStatus(matchId, match);
    return match;
  }
}
