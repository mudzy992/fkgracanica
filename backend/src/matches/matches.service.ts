import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MatchStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { assertDistinctClubs, isResolvedRound, resolveMatchRoundFields, roundToMatchCreateInput, roundToMatchUpdateInput } from './match-round.util';
import { assertSingleScheduledHomeMatch } from './match-scheduling.util';
import { validateMatchLineup, type LineupSlotInput } from './match-lineup.util';
import { resolveEffectiveMatchLineup } from './match-squad-lineup.util';
import { assertManualMatchStatus } from './update-match.dto';

const matchInclude = {
  homeClub: true,
  awayClub: true,
  roundRel: { select: { id: true, number: true, name: true } },
  season: { include: { competition: true } },
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
  constructor(private readonly prisma: PrismaService) {}

  findAll(seasonId?: string, roundId?: string) {
    return this.prisma.match.findMany({
      where: {
        ...(seasonId ? { seasonId } : {}),
        ...(roundId ? { roundId } : {}),
      },
      include: matchInclude,
      orderBy: [{ scheduledAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        ...matchInclude,
        events: { orderBy: { minute: 'asc' }, include: { player: true, relatedPlayer: true } },
        lineup: { include: { player: true, club: true } },
        liveComments: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!match) throw new NotFoundException('Utakmica nije pronađena');
    match.lineup = (await resolveEffectiveMatchLineup(
      this.prisma,
      match.id,
      match.homeClubId,
      match.awayClubId,
      match.lineup,
    )) as typeof match.lineup;
    return match;
  }

  async create(data: MatchInput) {
    assertDistinctClubs(data.homeClubId, data.awayClubId);
    const round = await resolveMatchRoundFields(this.prisma, data.roundId);
    if (isResolvedRound(round) && round.roundId) {
      const r = await this.prisma.round.findUnique({ where: { id: round.roundId } });
      if (r && r.seasonId !== data.seasonId) {
        throw new BadRequestException('Kolo ne pripada odabranoj sezoni.');
      }
    }
    const status = data.status ?? MatchStatus.SCHEDULED;
    if (status === MatchStatus.SCHEDULED) {
      await assertSingleScheduledHomeMatch(this.prisma, data.homeClubId);
    }
    return this.prisma.match.create({
      data: {
        seasonId: data.seasonId,
        homeClubId: data.homeClubId,
        awayClubId: data.awayClubId,
        scheduledAt: new Date(data.scheduledAt),
        venue: data.venue ?? null,
        status,
        homeScore: data.homeScore ?? 0,
        awayScore: data.awayScore ?? 0,
        ...roundToMatchCreateInput(round),
      },
      include: matchInclude,
    });
  }

  async update(id: string, data: Partial<MatchInput>) {
    assertManualMatchStatus(data.status);
    const existing = await this.prisma.match.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Utakmica nije pronađena');
    if (existing.status === MatchStatus.FINISHED) {
      throw new BadRequestException('Završena utakmica se ne može uređivati.');
    }
    if (
      (existing.status === MatchStatus.LIVE || existing.status === MatchStatus.HALFTIME) &&
      data.status !== undefined &&
      data.status !== existing.status
    ) {
      throw new BadRequestException(
        'Status LIVE/HALFTIME mijenja se isključivo preko Live komentatora.',
      );
    }

    const homeClubId = data.homeClubId ?? existing.homeClubId;
    const awayClubId = data.awayClubId ?? existing.awayClubId;
    assertDistinctClubs(homeClubId, awayClubId);

    const round =
      data.roundId !== undefined
        ? await resolveMatchRoundFields(this.prisma, data.roundId)
        : {};
    if (isResolvedRound(round) && round.roundId) {
      const r = await this.prisma.round.findUnique({ where: { id: round.roundId } });
      const seasonId = data.seasonId ?? existing.seasonId;
      if (r && r.seasonId !== seasonId) {
        throw new BadRequestException('Kolo ne pripada sezoni utakmice.');
      }
    }

    const patch: Prisma.MatchUpdateInput = {
      ...(data.seasonId ? { season: { connect: { id: data.seasonId } } } : {}),
      ...(data.homeClubId ? { homeClub: { connect: { id: data.homeClubId } } } : {}),
      ...(data.awayClubId ? { awayClub: { connect: { id: data.awayClubId } } } : {}),
      ...(data.venue !== undefined ? { venue: data.venue } : {}),
      ...(data.scheduledAt ? { scheduledAt: new Date(data.scheduledAt) } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.homeScore !== undefined ? { homeScore: data.homeScore } : {}),
      ...(data.awayScore !== undefined ? { awayScore: data.awayScore } : {}),
      ...roundToMatchUpdateInput(round),
    };

    const nextStatus = data.status ?? existing.status;
    if (nextStatus === MatchStatus.SCHEDULED) {
      await assertSingleScheduledHomeMatch(this.prisma, homeClubId, id);
    }

    return this.prisma.match.update({ where: { id }, data: patch, include: matchInclude });
  }

  remove(id: string) {
    return this.prisma.match.delete({ where: { id } });
  }

  async setLineup(matchId: string, slots: LineupSlotInput[]) {
    const match = await this.prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new NotFoundException('Utakmica nije pronađena');
    if (match.status === MatchStatus.FINISHED) {
      throw new BadRequestException('Postava završene utakmice se ne može mijenjati.');
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
