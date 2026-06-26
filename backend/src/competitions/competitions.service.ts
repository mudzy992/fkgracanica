import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slug.util';
import { deactivateOtherSeasons } from './season-active.util';

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
      include: { competition: true },
      orderBy: { yearStart: 'desc' },
    });
  }

  async createSeason(data: {
    name: string;
    yearStart: number;
    yearEnd: number;
    competitionId: string;
    isActive?: boolean;
  }) {
    if (!data.isActive) return this.prisma.season.create({ data });
    return this.prisma.$transaction(async (tx) => {
      await deactivateOtherSeasons(tx, data.competitionId);
      return tx.season.create({ data });
    });
  }

  async updateSeason(id: string, data: Record<string, unknown>) {
    if (data.isActive !== true) {
      return this.prisma.season.update({ where: { id }, data });
    }
    const season = await this.prisma.season.findUnique({ where: { id } });
    if (!season) return this.prisma.season.update({ where: { id }, data });
    return this.prisma.$transaction(async (tx) => {
      await deactivateOtherSeasons(tx, season.competitionId, id);
      return tx.season.update({ where: { id }, data });
    });
  }

  removeSeason(id: string) {
    return this.prisma.season.delete({ where: { id } });
  }
}
