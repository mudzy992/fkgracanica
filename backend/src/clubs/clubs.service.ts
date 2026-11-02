import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slug.util';

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.club.findMany({
      orderBy: { name: 'asc' },
      include: { stadiumRel: true, _count: { select: { players: true } } },
    });
  }

  findOwn() {
    return this.prisma.club.findFirst({
      where: { isOwnClub: true },
      include: { stadiumRel: true },
    });
  }

  findOne(id: string) {
    return this.prisma.club.findUnique({
      where: { id },
      include: {
        players: true,
        stadiumRel: true,
        squadSlots: { include: { player: true } },
      },
    });
  }

  async create(data: {
    name: string;
    stadium?: string;
    city?: string;
    description?: string;
    crestPath?: string;
    isOwnClub?: boolean;
  }) {
    if (data.isOwnClub) {
      await this.prisma.club.updateMany({
        where: { isOwnClub: true },
        data: { isOwnClub: false },
      });
    }
    return this.prisma.club.create({
      data: { ...data, slug: slugify(data.name) },
    });
  }

  async update(id: string, data: Record<string, unknown>) {
    const patch = { ...data };
    if (typeof patch.name === 'string') {
      patch.slug = slugify(patch.name);
    }
    if (patch.isOwnClub === true) {
      await this.prisma.club.updateMany({
        where: { isOwnClub: true, NOT: { id } },
        data: { isOwnClub: false },
      });
    }
    return this.prisma.club.update({ where: { id }, data: patch });
  }

  remove(id: string) {
    return this.prisma.club.delete({ where: { id } });
  }
}
