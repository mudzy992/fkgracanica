import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MatchStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { assertDistinctClubs, resolveMatchRoundFields } from './match-round.util';
import { validateMatchLineup, type LineupSlotInput } from './match-lineup.util';

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
        events: { orderBy: { minute: 'asc' } },
        lineup: { include: { player: true, club: true } },
        liveComments: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!match) throw new NotFoundException('Utakmica nije pronađena');
    return match;
  }

  async create(data: MatchInput) {
    assertDistinctClubs(data.homeClubId, data.awayClubId);
    const round = await resolveMatchRoundFields(this.prisma, data.roundId);
    if (data.roundId && round.roundId) {
      const r = await this.prisma.round.findUnique({ where: { id: round.roundId } });
      if (r && r.seasonId !== data.seasonId) {
        throw new BadRequestException('Kolo ne pripada odabranoj sezoni.');
      }
    }
    return this.prisma.match.create({
      data: {
        seasonId: data.seasonId,
        homeClubId: data.homeClubId,
        awayClubId: data.awayClubId,
        scheduledAt: new Date(data.scheduledAt),
        venue: data.venue ?? null,
        status: data.status ?? MatchStatus.SCHEDULED,
        homeScore: data.homeScore ?? 0,
        awayScore: data.awayScore ?? 0,
        ...round,
      },
      include: matchInclude,
    });
  }

  async update(id: string, data: Partial<MatchInput>) {
    const existing = await this.findOne(id);
    const homeClubId = data.homeClubId ?? existing.homeClubId;
    const awayClubId = data.awayClubId ?? existing.awayClubId;
    assertDistinctClubs(homeClubId, awayClubId);

    const round = await resolveMatchRoundFields(this.prisma, data.roundId);
    if (round.roundId) {
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
      ...round,
    };

    return this.prisma.match.update({ where: { id }, data: patch, include: matchInclude });
  }

  remove(id: string) {
    return this.prisma.match.delete({ where: { id } });
  }

  async setLineup(matchId: string, slots: LineupSlotInput[]) {
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
