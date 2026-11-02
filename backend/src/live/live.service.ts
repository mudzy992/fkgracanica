import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MatchEventType,
  MatchPeriod,
  MatchReportStatus,
  MatchStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { StatisticsService } from '../statistics/statistics.service';
import { applyScore, isScoringEvent } from './live-score.util';
import { resolveEventMinute } from './live-clock.util';
import {
  matchEditionInclude,
  withSeasonAlias,
} from '../matches/match-edition.util';
import { LiveFanoutService } from '../notifications/live-fanout.service';
import { requiresClubPlayer, requiresRelatedPlayer } from './live-event-rules';
import { emitLiveClock } from './live-emit-clock';

@Injectable()
export class LiveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
    private readonly statistics: StatisticsService,
    private readonly liveFanout: LiveFanoutService,
  ) {}

  async addEvent(
    matchId: string,
    data: {
      type: MatchEventType;
      minute?: number;
      playerId?: string;
      relatedPlayerId?: string;
      teamSide?: string;
      description?: string;
      createdById?: string;
    },
  ) {
    const current = await this.prisma.match.findUniqueOrThrow({
      where: { id: matchId },
    });
    if (current.status === MatchStatus.FINISHED) {
      throw new BadRequestException(
        'Za završenu utakmicu koristite editor izvještaja.',
      );
    }
    if (requiresClubPlayer(data.type) && !data.playerId) {
      throw new BadRequestException('Odaberite igrača za ovu akciju.');
    }
    if (requiresRelatedPlayer(data.type) && !data.relatedPlayerId) {
      throw new BadRequestException(
        'Izmjena zahtijeva igrača koji izlazi i koji ulazi.',
      );
    }
    const minute = data.minute ?? resolveEventMinute(current, current.minute);
    const event = await this.prisma.matchEvent.create({
      data: { ...data, minute, matchId },
      include: { player: true, relatedPlayer: true },
    });
    await this.applyEventScore(matchId, current, data, minute);
    this.realtime.emitMatchEvent(matchId, event);
    await emitLiveClock(this.prisma, this.realtime, matchId);
    void this.liveFanout.fanout(matchId, event);
    return event;
  }

  async addComment(
    matchId: string,
    data: { message: string; userId?: string; minute?: number },
  ) {
    const current = await this.prisma.match.findUniqueOrThrow({
      where: { id: matchId },
    });
    const minute = data.minute ?? resolveEventMinute(current, current.minute);
    const comment = await this.prisma.liveComment.create({
      data: { ...data, minute, matchId },
    });
    this.realtime.emitLiveComment(matchId, comment);
    return comment;
  }

  async setLiveStream(matchId: string, url: string | null) {
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: { liveStreamUrl: url },
    });
    this.realtime.emitMatchStatus(matchId, match);
    return match;
  }

  listPendingApproval() {
    return this.prisma.match
      .findMany({
        where: { reportStatus: MatchReportStatus.PENDING_APPROVAL },
        include: { homeClub: true, awayClub: true, ...matchEditionInclude },
        orderBy: { updatedAt: 'desc' },
      })
      .then((rows) => rows.map(withSeasonAlias));
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

  private async applyEventScore(
    matchId: string,
    current: {
      homeScore: number;
      awayScore: number;
      matchPeriod: MatchPeriod | null;
    },
    data: { type: MatchEventType; teamSide?: string },
    minute: number,
  ) {
    if (!isScoringEvent(data.type)) {
      await this.prisma.match.update({
        where: { id: matchId },
        data: { minute },
      });
      return;
    }
    const isPenalties = current.matchPeriod === MatchPeriod.PENALTIES;
    const isShootoutPenalty =
      isPenalties &&
      (data.type === MatchEventType.PENALTY_SCORED ||
        data.type === MatchEventType.PENALTY_MISSED);
    if (isShootoutPenalty) {
      const side = data.teamSide === 'away' ? 'away' : 'home';
      const scored = data.type === MatchEventType.PENALTY_SCORED;
      const penaltyPatch = scored
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
      return;
    }
    if (isPenalties) {
      await this.prisma.match.update({
        where: { id: matchId },
        data: { minute },
      });
      return;
    }
    const scores = applyScore(
      current.homeScore,
      current.awayScore,
      data.type,
      data.teamSide,
    );
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
  }
}
