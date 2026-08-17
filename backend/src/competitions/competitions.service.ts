import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slug.util';
import { ensureSingleLeagueCompetition } from './league-season.util';
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
    return this.prisma.$transaction(async (tx) => {
      const season = await tx.season.create({ data: seasonData });
      await syncSeasonParticipants(tx, season.id, clubIds);
      return tx.season.findUnique({ where: { id: season.id }, include: seasonInclude });
    });
  }

  async updateSeason(id: string, data: Record<string, unknown>) {
    const clubIds = Array.isArray(data.clubIds) ? (data.clubIds as string[]) : undefined;
    const patch = { ...data };
    delete patch.clubIds;
    return this.prisma.$transaction(async (tx) => {
      await tx.season.update({ where: { id }, data: patch });
      if (clubIds) await syncSeasonParticipants(tx, id, clubIds);
      return tx.season.findUnique({ where: { id }, include: seasonInclude });
    });
  }

  removeSeason(id: string) {
    return this.prisma.season.delete({ where: { id } });
  }

  getSeasonParticipants(seasonId: string) {
    return getSeasonParticipantClubs(this.prisma, seasonId);
  }
}
