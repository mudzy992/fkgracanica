import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slug.util';
import { ensureSingleLeagueCompetition } from './league-season.util';
import { editionInclude } from './edition-include';
import { syncSeasonParticipants } from './season-participants.util';

type AddEditionInput = {
  competitionId?: string;
  name?: string;
  isLeague?: boolean;
  clubIds?: string[];
};

@Injectable()
export class SeasonCompetitionsService {
  constructor(private readonly prisma: PrismaService) {}

  list(seasonId: string) {
    return this.prisma.seasonCompetition.findMany({
      where: { seasonId },
      include: editionInclude,
      orderBy: { competition: { name: 'asc' } },
    });
  }

  async add(seasonId: string, data: AddEditionInput) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
    });
    if (!season) throw new NotFoundException('Sezona nije pronađena.');
    return this.prisma.$transaction(async (tx) => {
      const competitionId = await this.resolveCompetitionId(tx, data);
      try {
        const edition = await tx.seasonCompetition.create({
          data: { seasonId, competitionId },
        });
        await syncSeasonParticipants(tx, edition.id, data.clubIds ?? []);
        return tx.seasonCompetition.findUnique({
          where: { id: edition.id },
          include: editionInclude,
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
          throw new BadRequestException(
            'Takmičenje je već dodano u ovu sezonu.',
          );
        }
        throw err;
      }
    });
  }

  async update(seasonId: string, editionId: string, clubIds?: string[]) {
    await this.requireEdition(seasonId, editionId);
    if (!clubIds) {
      return this.prisma.seasonCompetition.findUnique({
        where: { id: editionId },
        include: editionInclude,
      });
    }
    return this.prisma.$transaction(async (tx) => {
      await syncSeasonParticipants(tx, editionId, clubIds);
      return tx.seasonCompetition.findUnique({
        where: { id: editionId },
        include: editionInclude,
      });
    });
  }

  async remove(seasonId: string, editionId: string) {
    await this.requireEdition(seasonId, editionId);
    return this.prisma.seasonCompetition.delete({ where: { id: editionId } });
  }

  private async requireEdition(seasonId: string, editionId: string) {
    const edition = await this.prisma.seasonCompetition.findFirst({
      where: { id: editionId, seasonId },
    });
    if (!edition)
      throw new NotFoundException('Izdanje takmičenja nije pronađeno.');
    return edition;
  }

  private async resolveCompetitionId(
    tx: Prisma.TransactionClient,
    data: AddEditionInput,
  ): Promise<string> {
    if (data.competitionId) return data.competitionId;
    const name = data.name?.trim();
    if (!name)
      throw new BadRequestException(
        'Odaberite takmičenje ili unesite naziv novog.',
      );
    if (data.isLeague) await ensureSingleLeagueCompetition(tx);
    const created = await tx.competition.create({
      data: { name, slug: slugify(name), isLeague: data.isLeague ?? false },
    });
    return created.id;
  }
}
