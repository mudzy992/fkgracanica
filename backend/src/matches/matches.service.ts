import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MatchReportStatus, MatchStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StatisticsService } from '../statistics/statistics.service';
import {
  assertDistinctClubs,
  isResolvedRound,
  resolveMatchRoundFields,
  roundToMatchCreateInput,
  roundToMatchUpdateInput,
} from './match-round.util';
import { assertSingleScheduledHomeMatch } from './match-scheduling.util';
import { validateMatchLineup, type LineupSlotInput } from './match-lineup.util';
import { resolveEffectiveMatchLineup } from './match-squad-lineup.util';
import {
  assertManualFinish,
  assertRetrospectiveCreate,
  isRetrospectiveMatch,
} from './match-retrospective.util';
import { resolveMatchVenue } from './match-venue.util';
import { assertManualMatchStatus } from './update-match.dto';
import {
  matchDetailInclude,
  matchEditionInclude,
  withSeasonAlias,
} from './match-edition.util';

const matchInclude = {
  homeClub: true,
  awayClub: true,
  roundRel: { select: { id: true, number: true, name: true } },
  ...matchEditionInclude,
} as const;

type MatchInput = {
  seasonId: string;
  homeClubId: string;
  awayClubId: string;
  scheduledAt: string;
  venue?: string | null;
  roundId?: string | null;
  status?: MatchStatus;
  homeScore?: number;
  awayScore?: number;
};

@Injectable()
export class MatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly statistics: StatisticsService,
  ) {}

  findAll(seasonId?: string, roundId?: string) {
    return this.prisma.match
      .findMany({
        where: {
          ...(seasonId ? { seasonCompetitionId: seasonId } : {}),
          ...(roundId ? { roundId } : {}),
        },
        include: matchInclude,
        orderBy: [{ scheduledAt: 'desc' }],
      })
      .then((rows) => rows.map(withSeasonAlias));
  }

  async findOne(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: { ...matchInclude, ...matchDetailInclude },
    });
    if (!match) throw new NotFoundException('Utakmica nije pronađena');
    match.lineup = (await resolveEffectiveMatchLineup(
      this.prisma,
      match.id,
      match.homeClubId,
      match.awayClubId,
      match.lineup,
    )) as typeof match.lineup;
    return withSeasonAlias(match);
  }

  async create(data: MatchInput) {
    assertDistinctClubs(data.homeClubId, data.awayClubId);
    assertManualMatchStatus(data.status);
    assertRetrospectiveCreate(data);
    const round = await resolveMatchRoundFields(this.prisma, data.roundId);
    if (isResolvedRound(round) && round.roundId) {
      const r = await this.prisma.round.findUnique({
        where: { id: round.roundId },
      });
      if (r && r.seasonCompetitionId !== data.seasonId) {
        throw new BadRequestException('Kolo ne pripada odabranoj sezoni.');
      }
    }
    const status = data.status ?? MatchStatus.SCHEDULED;
    if (status === MatchStatus.SCHEDULED) {
      await assertSingleScheduledHomeMatch(this.prisma, data.homeClubId);
    }
    const isRetro = status === MatchStatus.FINISHED;
    const venue = await resolveMatchVenue(
      this.prisma,
      data.homeClubId,
      data.venue,
    );
    return this.prisma.match
      .create({
        data: {
          seasonCompetitionId: data.seasonId,
          homeClubId: data.homeClubId,
          awayClubId: data.awayClubId,
          scheduledAt: new Date(data.scheduledAt),
          venue,
          status,
          homeScore: data.homeScore ?? 0,
          awayScore: data.awayScore ?? 0,
          minute: isRetro ? 90 : 0,
          ...roundToMatchCreateInput(round),
        },
        include: matchInclude,
      })
      .then(withSeasonAlias);
  }

  async update(id: string, data: Partial<MatchInput>) {
    assertManualMatchStatus(data.status);
    const existing = await this.prisma.match.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Utakmica nije pronađena');
    if (existing.status === MatchStatus.FINISHED) {
      throw new BadRequestException('Završena utakmica se ne može uređivati.');
    }
    if (
      (existing.status === MatchStatus.LIVE ||
        existing.status === MatchStatus.HALFTIME) &&
      data.status !== undefined &&
      data.status !== existing.status
    ) {
      throw new BadRequestException(
        'Status LIVE/HALFTIME mijenja se isključivo preko Live komentatora.',
      );
    }
    assertManualFinish({
      nextStatus: data.status,
      existingStatus: existing.status,
      scheduledAt: data.scheduledAt ?? existing.scheduledAt,
      homeScore: data.homeScore,
      awayScore: data.awayScore,
    });

    const homeClubId = data.homeClubId ?? existing.homeClubId;
    const awayClubId = data.awayClubId ?? existing.awayClubId;
    assertDistinctClubs(homeClubId, awayClubId);

    const round =
      data.roundId !== undefined
        ? await resolveMatchRoundFields(this.prisma, data.roundId)
        : {};
    if (isResolvedRound(round) && round.roundId) {
      const r = await this.prisma.round.findUnique({
        where: { id: round.roundId },
      });
      const seasonId = data.seasonId ?? existing.seasonCompetitionId;
      if (r && r.seasonCompetitionId !== seasonId) {
        throw new BadRequestException('Kolo ne pripada sezoni utakmice.');
      }
    }

    const patch: Prisma.MatchUpdateInput = {
      ...(data.seasonId ? { edition: { connect: { id: data.seasonId } } } : {}),
      ...(data.homeClubId
        ? { homeClub: { connect: { id: data.homeClubId } } }
        : {}),
      ...(data.awayClubId
        ? { awayClub: { connect: { id: data.awayClubId } } }
        : {}),
      ...(data.venue !== undefined ? { venue: data.venue } : {}),
      ...(data.scheduledAt ? { scheduledAt: new Date(data.scheduledAt) } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.status === MatchStatus.FINISHED && existing.minute === 0
        ? { minute: 90 }
        : {}),
      ...(data.homeScore !== undefined ? { homeScore: data.homeScore } : {}),
      ...(data.awayScore !== undefined ? { awayScore: data.awayScore } : {}),
      ...roundToMatchUpdateInput(round),
    };

    const nextStatus = data.status ?? existing.status;
    if (nextStatus === MatchStatus.SCHEDULED) {
      await assertSingleScheduledHomeMatch(this.prisma, homeClubId, id);
    }

    return this.prisma.match
      .update({ where: { id }, data: patch, include: matchInclude })
      .then(withSeasonAlias);
  }

  async remove(id: string) {
    const match = await this.prisma.match.findUnique({ where: { id } });
    if (!match) throw new NotFoundException('Utakmica nije pronađena');
    const needsRebuild = match.reportStatus === MatchReportStatus.APPROVED;
    const seasonId = match.seasonCompetitionId;
    await this.prisma.match.delete({ where: { id } });
    if (needsRebuild) {
      await this.statistics.rebuildSeasonPlayerStatistics(seasonId);
    }
    return { ok: true };
  }

  async setLineup(matchId: string, slots: LineupSlotInput[]) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });
    if (!match) throw new NotFoundException('Utakmica nije pronađena');
    if (match.status === MatchStatus.FINISHED && !isRetrospectiveMatch(match)) {
      throw new BadRequestException(
        'Postava završene utakmice se ne može mijenjati.',
      );
    }
    await validateMatchLineup(this.prisma, matchId, slots);
    return this.prisma.$transaction(async (tx) => {
      await tx.matchLineup.deleteMany({ where: { matchId } });
      if (slots.length) {
        await tx.matchLineup.createMany({
          data: slots.map((s) => ({ ...s, matchId })),
        });
      }
      return tx.matchLineup.findMany({
        where: { matchId },
        include: { player: true, club: true },
      });
    });
  }
}
