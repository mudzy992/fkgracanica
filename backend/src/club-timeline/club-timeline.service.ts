import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClubTimelineService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.clubTimelineEvent.findMany({ orderBy: [{ year: 'desc' }, { sortOrder: 'asc' }] });
  }

  create(data: Record<string, unknown>) {
    return this.prisma.clubTimelineEvent.create({ data: data as never });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.clubTimelineEvent.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.clubTimelineEvent.delete({ where: { id } });
  }
}
