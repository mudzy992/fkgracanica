import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slug.util';
import { ensureSingleLeagueCompetition } from './league-season.util';

@Injectable()
export class CompetitionsService {
  constructor(private readonly prisma: PrismaService) {}

  findCompetitions() {
    return this.prisma.competition.findMany({
      include: { editions: { include: { season: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createCompetition(data: { name: string; isLeague?: boolean }) {
    return this.prisma.$transaction(async (tx) => {
      if (data.isLeague) await ensureSingleLeagueCompetition(tx);
      return tx.competition.create({
        data: { name: data.name, slug: slugify(data.name), isLeague: data.isLeague ?? false },
      });
    });
  }

  async updateCompetition(id: string, data: { name?: string; isLeague?: boolean }) {
    const patch: { name?: string; slug?: string; isLeague?: boolean } = { ...data };
    if (typeof data.name === 'string') patch.slug = slugify(data.name);
    return this.prisma.$transaction(async (tx) => {
      if (patch.isLeague === true) await ensureSingleLeagueCompetition(tx, id);
      return tx.competition.update({ where: { id }, data: patch });
    });
  }

  removeCompetition(id: string) {
    return this.prisma.competition.delete({ where: { id } });
  }
}
