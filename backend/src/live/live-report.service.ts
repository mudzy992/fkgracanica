import { BadRequestException, Injectable } from '@nestjs/common';
import { MatchEventType, MatchReportStatus, MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { recalculateScoreFromEvents } from './live-report-score.util';

@Injectable()
export class LiveReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  private async getEditableMatch(matchId: string) {
    const match = await this.prisma.match.findUniqueOrThrow({
      where: { id: matchId },
    });
    if (match.status !== MatchStatus.FINISHED) {
      throw new BadRequestException(
        'Izvještaj se može uređivati samo za završenu utakmicu.',
      );
    }
    if (
      match.reportStatus !== MatchReportStatus.DRAFT &&
      match.reportStatus !== MatchReportStatus.PENDING_APPROVAL
    ) {
      throw new BadRequestException('Odobren izvještaj se ne može mijenjati.');
    }
    return match;
  }

  async addEvent(
    matchId: string,
    data: {
      type: MatchEventType;
      minute: number;
      playerId?: string;
      relatedPlayerId?: string;
      teamSide?: string;
      description?: string;
      createdById?: string;
    },
  ) {
    await this.getEditableMatch(matchId);
    if (data.minute == null || data.minute < 0) {
      throw new BadRequestException('Minuta događaja je obavezna.');
    }

    const event = await this.prisma.matchEvent.create({
      data: { ...data, matchId },
      include: { player: true, relatedPlayer: true },
    });

    const allEvents = await this.prisma.matchEvent.findMany({
      where: { matchId },
    });
    const { homeScore, awayScore } = recalculateScoreFromEvents(allEvents);
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: { homeScore, awayScore, minute: data.minute },
    });

    this.realtime.emitMatchEvent(matchId, event);
    this.realtime.emitMatchScore(matchId, {
      homeScore,
      awayScore,
      minute: match.minute,
    });
    this.realtime.emitMatchStatus(matchId, match);
    return event;
  }

  async deleteEvent(matchId: string, eventId: string) {
    await this.getEditableMatch(matchId);
    await this.prisma.matchEvent.delete({ where: { id: eventId } });
    const allEvents = await this.prisma.matchEvent.findMany({
      where: { matchId },
    });
    const { homeScore, awayScore } = recalculateScoreFromEvents(allEvents);
    const minute = allEvents.length
      ? Math.max(...allEvents.map((e) => e.minute))
      : 0;
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: { homeScore, awayScore, minute },
    });
    this.realtime.emitMatchStatus(matchId, match);
    this.realtime.emitMatchScore(matchId, { homeScore, awayScore, minute });
    return { ok: true };
  }

  async addComment(
    matchId: string,
    data: { message: string; userId?: string; minute: number },
  ) {
    await this.getEditableMatch(matchId);
    const comment = await this.prisma.liveComment.create({
      data: { ...data, matchId },
    });
    this.realtime.emitLiveComment(matchId, comment);
    return comment;
  }

  async submitReport(matchId: string) {
    const match = await this.getEditableMatch(matchId);
    if (match.reportStatus === MatchReportStatus.PENDING_APPROVAL) {
      return match;
    }
    const updated = await this.prisma.match.update({
      where: { id: matchId },
      data: { reportStatus: MatchReportStatus.PENDING_APPROVAL },
    });
    this.realtime.emitMatchStatus(matchId, updated);
    return updated;
  }

  async syncScores(matchId: string, homeScore: number, awayScore: number) {
    await this.getEditableMatch(matchId);
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: { homeScore, awayScore },
    });
    this.realtime.emitMatchScore(matchId, {
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      minute: match.minute,
    });
    this.realtime.emitMatchStatus(matchId, match);
    return match;
  }
}
