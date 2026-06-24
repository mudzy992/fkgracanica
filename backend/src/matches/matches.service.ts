import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(seasonId?: string) {
    return this.prisma.match.findMany({
      where: seasonId ? { seasonId } : undefined,
      include: {
        homeClub: true,
        awayClub: true,
        season: { include: { competition: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        homeClub: true,
        awayClub: true,
        events: { orderBy: { minute: 'asc' } },
        lineup: { include: { player: true } },
        liveComments: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!match) throw new NotFoundException('Utakmica nije pronađena');
    return match;
  }

  create(data: {
    seasonId: string;
    homeClubId: string;
    awayClubId: string;
    scheduledAt: string;
    venue?: string;
    round?: number;
  }) {
    return this.prisma.match.create({
      data: { ...data, scheduledAt: new Date(data.scheduledAt) },
    });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.match.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.match.delete({ where: { id } });
  }

  setLineup(matchId: string, slots: { playerId: string; isStarter?: boolean; positionX?: number; positionY?: number }[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.matchLineup.deleteMany({ where: { matchId } });
      if (slots.length) {
        await tx.matchLineup.createMany({
          data: slots.map((s) => ({ ...s, matchId })),
        });
      }
      return tx.matchLineup.findMany({ where: { matchId }, include: { player: true } });
    });
  }
}
