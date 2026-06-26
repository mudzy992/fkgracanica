import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  async create(data: Record<string, unknown>) {
    if (data.featured === true) await this.clearFeatured();
    return this.prisma.trophy.create({ data: data as never });
  }

  async update(id: string, data: Record<string, unknown>) {
    if (data.featured === true) await this.clearFeatured(id);
    return this.prisma.trophy.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.trophy.delete({ where: { id } });
  }
}
