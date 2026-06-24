import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MuseumService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(category?: string) {
    return this.prisma.museumItem.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ year: 'desc' }, { title: 'asc' }],
    });
  }

  create(data: Record<string, unknown>) {
    return this.prisma.museumItem.create({ data: data as never });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.museumItem.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.museumItem.delete({ where: { id } });
  }
}
