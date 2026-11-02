import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClubTimelineService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.clubTimelineEvent.findMany({
      orderBy: [{ year: 'desc' }, { sortOrder: 'asc' }],
    });
  }

  async create(data: Record<string, unknown>) {
    const max = await this.prisma.clubTimelineEvent.aggregate({
      _max: { sortOrder: true },
    });
    const sortOrder = (max._max.sortOrder ?? -1) + 1;
    return this.prisma.clubTimelineEvent.create({
      data: { ...data, sortOrder } as never,
    });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.clubTimelineEvent.update({ where: { id }, data });
  }

  reorder(ids: string[]) {
    return this.prisma.$transaction(
      ids.map((id, sortOrder) =>
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
