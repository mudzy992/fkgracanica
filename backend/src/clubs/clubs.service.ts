import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slug.util';

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.club.findMany({ orderBy: { name: 'asc' } });
  }

  findOne(id: string) {
    return this.prisma.club.findUnique({ where: { id }, include: { players: true } });
  }

  create(data: { name: string; stadium?: string; city?: string; crestPath?: string; isOwnClub?: boolean }) {
    return this.prisma.club.create({ data: { ...data, slug: slugify(data.name) } });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.club.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.club.delete({ where: { id } });
  }
}
