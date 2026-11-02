import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SponsorsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.sponsor.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async create(data: Record<string, unknown>) {
    const max = await this.prisma.sponsor.aggregate({
      _max: { sortOrder: true },
    });
    const sortOrder = (max._max.sortOrder ?? -1) + 1;
    return this.prisma.sponsor.create({
      data: { ...data, sortOrder } as never,
    });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.sponsor.update({ where: { id }, data });
  }

  reorder(ids: string[]) {
    return this.prisma.$transaction(
      ids.map((id, sortOrder) =>
        this.prisma.sponsor.update({ where: { id }, data: { sortOrder } }),
      ),
    );
  }

  remove(id: string) {
    return this.prisma.sponsor.delete({ where: { id } });
  }
}
