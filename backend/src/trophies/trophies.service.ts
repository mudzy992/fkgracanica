import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrophiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.trophy.findMany({ orderBy: { year: 'desc' } });
  }

  create(data: Record<string, unknown>) {
    return this.prisma.trophy.create({ data: data as never });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.trophy.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.trophy.delete({ where: { id } });
  }
}
