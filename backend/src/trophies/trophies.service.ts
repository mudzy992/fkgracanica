import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  parseEntityPayload,
  type EntitySpec,
} from '../common/utils/entity-payload.util';

/** Allowlista polja (BE-08 / P-B08-2). */
const TROPHY_FIELDS: EntitySpec = {
  name: { kind: 'string', required: true, maxLength: 120 },
  year: { kind: 'int', required: true, min: 1850, max: 2200 },
  competition: { kind: 'string', nullable: true, maxLength: 120 },
  description: { kind: 'string', nullable: true, maxLength: 5000 },
  imagePath: { kind: 'string', nullable: true, maxLength: 255 },
  featured: { kind: 'boolean' },
};

@Injectable()
export class TrophiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.trophy.findMany({
      orderBy: [{ featured: 'desc' }, { year: 'desc' }],
    });
  }

  private async clearFeatured(exceptId?: string) {
    await this.prisma.trophy.updateMany({
      where: exceptId ? { id: { not: exceptId } } : {},
      data: { featured: false },
    });
  }

  async create(body: Record<string, unknown>) {
    const data = parseEntityPayload(body, TROPHY_FIELDS, 'create');
    if (data.featured === true) await this.clearFeatured();
    return this.prisma.trophy.create({ data: data as never });
  }

  async update(id: string, body: Record<string, unknown>) {
    const data = parseEntityPayload(body, TROPHY_FIELDS, 'update');
    if (data.featured === true) await this.clearFeatured(id);
    return this.prisma.trophy.update({ where: { id }, data: data as never });
  }

  remove(id: string) {
    return this.prisma.trophy.delete({ where: { id } });
  }
}
