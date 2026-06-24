import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slug.util';

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

  updateCompetition(id: string, data: Record<string, unknown>) {
    return this.prisma.competition.update({ where: { id }, data });
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

  createSeason(data: { name: string; yearStart: number; yearEnd: number; competitionId: string; isActive?: boolean }) {
    return this.prisma.season.create({ data });
  }

  updateSeason(id: string, data: Record<string, unknown>) {
    return this.prisma.season.update({ where: { id }, data });
  }

  removeSeason(id: string) {
    return this.prisma.season.delete({ where: { id } });
  }
}
