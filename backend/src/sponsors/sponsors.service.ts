import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  parseEntityPayload,
  parseIdList,
  type EntitySpec,
} from '../common/utils/entity-payload.util';

/** Allowlista polja (BE-08 / P-B08-2) — FE šalje tačno ova polja. */
const SPONSOR_FIELDS: EntitySpec = {
  name: { kind: 'string', required: true, maxLength: 120 },
  logoPath: { kind: 'string', nullable: true, maxLength: 255 },
  url: { kind: 'string', nullable: true, maxLength: 500 },
  tier: {
    kind: 'enum',
    values: ['GENERAL', 'GOLD', 'SILVER', 'BRONZE', 'PARTNER'],
  },
};

@Injectable()
export class SponsorsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.sponsor.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async create(body: Record<string, unknown>) {
    const data = parseEntityPayload(body, SPONSOR_FIELDS, 'create');
    const max = await this.prisma.sponsor.aggregate({
      _max: { sortOrder: true },
    });
    const sortOrder = (max._max.sortOrder ?? -1) + 1;
    return this.prisma.sponsor.create({
      data: { ...data, sortOrder } as never,
    });
  }

  update(id: string, body: Record<string, unknown>) {
    const data = parseEntityPayload(body, SPONSOR_FIELDS, 'update');
    return this.prisma.sponsor.update({ where: { id }, data: data as never });
  }

  reorder(ids: unknown) {
    const ordered = parseIdList(ids);
    return this.prisma.$transaction(
      ordered.map((id, sortOrder) =>
        this.prisma.sponsor.update({ where: { id }, data: { sortOrder } }),
      ),
    );
  }

  remove(id: string) {
    return this.prisma.sponsor.delete({ where: { id } });
  }
}
