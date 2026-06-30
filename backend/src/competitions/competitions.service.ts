import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slug.util';
import { deactivateOtherSeasons } from './season-active.util';
import { getSeasonParticipantClubs, syncSeasonParticipants } from './season-participants.util';

const seasonInclude = {
  competition: true,
  participants: {
    include: { club: { select: { id: true, name: true, slug: true } } },
    orderBy: { club: { name: 'asc' as const } },
  },
};

@Injectable()
export class CompetitionsService {
  constructor(private readonly prisma: PrismaService) {}

  findCompetitions() {
    return this.prisma.competition.findMany({
      include: { seasons: true },
      orderBy: { name: 'asc' },
    });
  }

  createCompetition(data: { name: string }) {
    return this.prisma.competition.create({
      data: { name: data.name, slug: slugify(data.name) },
    });
  }

  async updateCompetition(id: string, data: Record<string, unknown>) {
    const patch: Record<string, unknown> = { ...data };
    if (typeof data.name === 'string') patch.slug = slugify(data.name);
    return this.prisma.competition.update({ where: { id }, data: patch });
  }

  removeCompetition(id: string) {
    return this.prisma.competition.delete({ where: { id } });
  }

  findSeasons(competitionId?: string) {
    return this.prisma.season.findMany({
      where: competitionId ? { competitionId } : undefined,
      include: seasonInclude,
      orderBy: { yearStart: 'desc' },
    });
  }

  async createSeason(data: {
    name: string;
    yearStart: number;
    yearEnd: number;
    competitionId: string;
    isActive?: boolean;
    clubIds?: string[];
  }) {
    const { clubIds = [], ...seasonData } = data;
    const run = async (tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0]) => {
      if (seasonData.isActive) await deactivateOtherSeasons(tx, seasonData.competitionId);
      const season = await tx.season.create({ data: seasonData });
      await syncSeasonParticipants(tx, season.id, clubIds);
      return tx.season.findUnique({ where: { id: season.id }, include: seasonInclude });
    };
    return this.prisma.$transaction(run);
  }

  async updateSeason(id: string, data: Record<string, unknown>) {
    const clubIds = Array.isArray(data.clubIds) ? (data.clubIds as string[]) : undefined;
    const patch = { ...data };
    delete patch.clubIds;

    const run = async (tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0]) => {
      if (patch.isActive === true) {
        const season = await tx.season.findUnique({ where: { id } });
        if (season) await deactivateOtherSeasons(tx, season.competitionId, id);
      }
      await tx.season.update({ where: { id }, data: patch });
      if (clubIds) await syncSeasonParticipants(tx, id, clubIds);
      return tx.season.findUnique({ where: { id }, include: seasonInclude });
    };
    return this.prisma.$transaction(run);
  }

  removeSeason(id: string) {
    return this.prisma.season.delete({ where: { id } });
  }

  getSeasonParticipants(seasonId: string) {
    return getSeasonParticipantClubs(this.prisma, seasonId);
  }
}
