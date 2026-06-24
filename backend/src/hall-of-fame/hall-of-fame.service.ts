import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HallOfFameService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.hallOfFameEntry.findMany({ orderBy: { name: 'asc' } });
  }

  create(data: Record<string, unknown>) {
    return this.prisma.hallOfFameEntry.create({ data: data as never });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.hallOfFameEntry.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.hallOfFameEntry.delete({ where: { id } });
  }
}
