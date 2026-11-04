import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { roundDefaultName } from './round.util';
import {
  cascadeDeleteRound,
  getRoundDeleteImpact,
} from './round-cascade-delete.util';

type RoundInput = {
  seasonId: string;
  number: number;
  name?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
};

@Injectable()
export class RoundsService {
  constructor(private readonly prisma: PrismaService) {}

  async findBySeason(seasonId: string) {
    return this.prisma.round
      .findMany({
        where: { seasonCompetitionId: seasonId },
        include: { _count: { select: { matches: true } } },
        orderBy: { number: 'asc' },
      })
      .then((rows) =>
        rows.map((r) => ({ ...r, seasonId: r.seasonCompetitionId })),
      );
  }

  async create(data: RoundInput) {
    await this.ensureEdition(data.seasonId);
    this.validateNumber(data.number);
    const name = data.name?.trim() || roundDefaultName(data.number);
    return this.prisma.round.create({
      data: {
        seasonCompetitionId: data.seasonId,
        number: data.number,
        name,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
      },
    });
  }

  async update(id: string, data: Partial<RoundInput>) {
    const existing = await this.findOrThrow(id);
    if (data.number != null) this.validateNumber(data.number);
    const number = data.number ?? existing.number;
    const round = await this.prisma.round.update({
      where: { id },
      data: {
        number: data.number,
        name:
          data.name?.trim() ||
          (data.number != null ? roundDefaultName(number) : undefined),
        startsAt:
          data.startsAt === undefined
            ? undefined
            : data.startsAt
              ? new Date(data.startsAt)
              : null,
        endsAt:
          data.endsAt === undefined
            ? undefined
            : data.endsAt
              ? new Date(data.endsAt)
              : null,
      },
    });
    return round;
  }

  async getDeleteImpact(id: string) {
    await this.findOrThrow(id);
    return getRoundDeleteImpact(this.prisma, id);
  }

  async remove(id: string, cascade = false) {
    const round = await this.findOrThrow(id);
    const linked = await this.prisma.match.count({ where: { roundId: id } });
    if (linked === 0) {
      return this.prisma.round.delete({ where: { id } });
    }
    if (!cascade) {
      throw new BadRequestException(
        'Kolo ima povezane utakmice. Koristite cascade brisanje da uklonite kolo i sve povezane podatke.',
      );
    }
    return cascadeDeleteRound(this.prisma, id, round.seasonCompetitionId);
  }

  private validateNumber(number: number) {
    if (!Number.isInteger(number) || number < 1) {
      throw new BadRequestException(
        'Broj kola mora biti pozitivan cijeli broj.',
      );
    }
  }

  private ensureEdition(seasonId: string) {
    return this.prisma.seasonCompetition
      .findUnique({ where: { id: seasonId } })
      .then((s) => {
        if (!s) throw new NotFoundException('Sezona nije pronađena.');
        return s;
      });
  }

  private findOrThrow(id: string) {
    return this.prisma.round.findUnique({ where: { id } }).then((r) => {
      if (!r) throw new NotFoundException('Kolo nije pronađeno.');
      return r;
    });
  }
}
