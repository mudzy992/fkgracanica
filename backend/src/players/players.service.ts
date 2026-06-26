import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(clubId?: string, activeOnly?: boolean) {
    return this.prisma.player.findMany({
      where: {
        ...(clubId ? { clubId } : undefined),
        ...(activeOnly ? { isActive: true } : undefined),
      },
      include: { club: { select: { id: true, name: true } } },
      orderBy: [{ number: 'asc' }, { lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  findOne(id: string) {
    return this.prisma.player.findUnique({
      where: { id },
      include: { club: true, statistics: true },
    });
  }

  async getPublicProfile(id: string, seasonId?: string) {
    const season = seasonId
      ? await this.prisma.season.findUnique({ where: { id: seasonId } })
      : await this.prisma.season.findFirst({ where: { isActive: true }, orderBy: { yearStart: 'desc' } });

    const player = await this.prisma.player.findUnique({
      where: { id },
      include: {
        club: { select: { id: true, name: true, slug: true, crestPath: true, isOwnClub: true } },
      },
    });
    if (!player) return null;

    const seasonStats =
      season &&
      (await this.prisma.playerStatistics.findUnique({
        where: { playerId_seasonId: { playerId: id, seasonId: season.id } },
      }));

    const career = await this.prisma.playerStatistics.aggregate({
      where: { playerId: id },
      _sum: {
        appearances: true,
        goals: true,
        assists: true,
        yellowCards: true,
        redCards: true,
        minutes: true,
      },
    });

    return {
      ...player,
      season: season ? { id: season.id, name: season.name } : null,
      seasonStats: seasonStats ?? null,
      careerTotals: career._sum,
    };
  }

  async create(data: Record<string, unknown>) {
    const payload = { ...data };
    if (!payload.clubId) {
      const ownClub = await this.prisma.club.findFirst({ where: { isOwnClub: true } });
      if (ownClub) payload.clubId = ownClub.id;
    }
    return this.prisma.player.create({ data: payload as never });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.player.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.player.delete({ where: { id } });
  }
}
