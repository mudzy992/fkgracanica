import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  parseEntityPayload,
  type EntitySpec,
} from '../common/utils/entity-payload.util';

/** Allowlista polja (BE-08 / P-B08-2). */
const MUSEUM_FIELDS: EntitySpec = {
  title: { kind: 'string', required: true, maxLength: 160 },
  year: { kind: 'int', nullable: true, min: 1850, max: 2200 },
  category: {
    kind: 'enum',
    required: true,
    values: ['artifact', 'photo', 'jersey', 'trophy', 'document', 'other'],
  },
  description: { kind: 'string', nullable: true, maxLength: 5000 },
  imagePath: { kind: 'string', nullable: true, maxLength: 255 },
};

@Injectable()
export class MuseumService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(category?: string) {
    return this.prisma.museumItem.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ year: 'desc' }, { title: 'asc' }],
    });
  }

  create(body: Record<string, unknown>) {
    const data = parseEntityPayload(body, MUSEUM_FIELDS, 'create');
    return this.prisma.museumItem.create({ data: data as never });
  }

  update(id: string, body: Record<string, unknown>) {
    const data = parseEntityPayload(body, MUSEUM_FIELDS, 'update');
    return this.prisma.museumItem.update({
      where: { id },
      data: data as never,
    });
  }

  remove(id: string) {
    return this.prisma.museumItem.delete({ where: { id } });
  }
}
