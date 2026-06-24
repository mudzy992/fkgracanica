import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SponsorsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.sponsor.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  create(data: Record<string, unknown>) {
    return this.prisma.sponsor.create({ data: data as never });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.sponsor.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.sponsor.delete({ where: { id } });
  }
}
