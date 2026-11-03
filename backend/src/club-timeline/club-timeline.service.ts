import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  parseEntityPayload,
  parseIdList,
  type EntitySpec,
} from '../common/utils/entity-payload.util';

/** Allowlista polja (BE-08 / P-B08-2). */
const TIMELINE_FIELDS: EntitySpec = {
  year: { kind: 'int', required: true, min: 1850, max: 2200 },
  title: { kind: 'string', required: true, maxLength: 160 },
  description: { kind: 'string', nullable: true, maxLength: 5000 },
  imagePath: { kind: 'string', nullable: true, maxLength: 255 },
};

@Injectable()
export class ClubTimelineService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.clubTimelineEvent.findMany({
      orderBy: [{ year: 'desc' }, { sortOrder: 'asc' }],
    });
  }

  async create(body: Record<string, unknown>) {
    const data = parseEntityPayload(body, TIMELINE_FIELDS, 'create');
    const max = await this.prisma.clubTimelineEvent.aggregate({
      _max: { sortOrder: true },
    });
    const sortOrder = (max._max.sortOrder ?? -1) + 1;
    return this.prisma.clubTimelineEvent.create({
      data: { ...data, sortOrder } as never,
    });
  }

  update(id: string, body: Record<string, unknown>) {
    const data = parseEntityPayload(body, TIMELINE_FIELDS, 'update');
    return this.prisma.clubTimelineEvent.update({
      where: { id },
      data: data as never,
    });
  }

  reorder(ids: unknown) {
    const ordered = parseIdList(ids);
    return this.prisma.$transaction(
      ordered.map((id, sortOrder) =>
        this.prisma.clubTimelineEvent.update({
          where: { id },
          data: { sortOrder },
        }),
      ),
    );
  }

  remove(id: string) {
    return this.prisma.clubTimelineEvent.delete({ where: { id } });
  }
}
