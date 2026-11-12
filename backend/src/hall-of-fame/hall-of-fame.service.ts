import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  parseEntityPayload,
  type EntitySpec,
} from '../common/utils/entity-payload.util';

/** Allowlista polja (BE-08 / P-B08-2). */
const HALL_OF_FAME_FIELDS: EntitySpec = {
  name: { kind: 'string', required: true, maxLength: 120 },
  role: { kind: 'string', required: true, maxLength: 120 },
  years: { kind: 'string', nullable: true, maxLength: 60 },
  bio: { kind: 'string', nullable: true, maxLength: 5000 },
  imagePath: { kind: 'string', nullable: true, maxLength: 255 },
  achievements: { kind: 'json', nullable: true },
};

@Injectable()
export class HallOfFameService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.hallOfFameEntry.findMany({ orderBy: { name: 'asc' } });
  }

  create(body: Record<string, unknown>) {
    const data = parseEntityPayload(body, HALL_OF_FAME_FIELDS, 'create');
    return this.prisma.hallOfFameEntry.create({ data: data as never });
  }

  update(id: string, body: Record<string, unknown>) {
    const data = parseEntityPayload(body, HALL_OF_FAME_FIELDS, 'update');
    return this.prisma.hallOfFameEntry.update({
      where: { id },
      data: data as never,
    });
  }

  remove(id: string) {
    return this.prisma.hallOfFameEntry.delete({ where: { id } });
  }
}
