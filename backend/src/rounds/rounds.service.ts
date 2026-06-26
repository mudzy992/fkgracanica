import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { roundDefaultName } from './round.util';

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
    await this.syncLegacyRounds(seasonId);
    return this.prisma.round.findMany({
      where: { seasonId },
      include: { _count: { select: { matches: true } } },
      orderBy: { number: 'asc' },
    });
  }

  async create(data: RoundInput) {
    await this.ensureSeason(data.seasonId);
    this.validateNumber(data.number);
    const name = data.name?.trim() || roundDefaultName(data.number);
    return this.prisma.round.create({
      data: {
        seasonId: data.seasonId,
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
        name: data.name?.trim() || (data.number != null ? roundDefaultName(number) : undefined),
        startsAt: data.startsAt === undefined ? undefined : data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt === undefined ? undefined : data.endsAt ? new Date(data.endsAt) : null,
      },
    });
    if (data.number != null) {
      await this.prisma.match.updateMany({
        where: { roundId: id },
        data: { round: data.number },
      });
    }
    return round;
  }

  async remove(id: string) {
    await this.findOrThrow(id);
    const linked = await this.prisma.match.count({ where: { roundId: id } });
    if (linked > 0) {
      throw new BadRequestException('Kolo ima povezane utakmice. Prvo uklonite ili premjestite utakmice.');
    }
    return this.prisma.round.delete({ where: { id } });
  }

  /** Links legacy `Match.round` integers to Round rows (idempotent). */
  async syncLegacyRounds(seasonId: string) {
    const legacy = await this.prisma.match.findMany({
      where: { seasonId, round: { not: null }, roundId: null },
      select: { id: true, round: true },
    });
    if (!legacy.length) return;

    const numbers = [...new Set(legacy.map((m) => m.round!))];
    for (const number of numbers) {
      const round = await this.prisma.round.upsert({
        where: { seasonId_number: { seasonId, number } },
        create: { seasonId, number, name: roundDefaultName(number) },
        update: {},
      });
      await this.prisma.match.updateMany({
        where: { seasonId, round: number, roundId: null },
        data: { roundId: round.id },
      });
    }
  }

  private validateNumber(number: number) {
    if (!Number.isInteger(number) || number < 1) {
      throw new BadRequestException('Broj kola mora biti pozitivan cijeli broj.');
    }
  }

  private ensureSeason(seasonId: string) {
    return this.prisma.season.findUnique({ where: { id: seasonId } }).then((s) => {
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
