import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(clubId?: string) {
    return this.prisma.player.findMany({
      where: clubId ? { clubId } : undefined,
      include: { club: { select: { id: true, name: true } } },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  findOne(id: string) {
    return this.prisma.player.findUnique({
      where: { id },
      include: { club: true, statistics: true },
    });
  }

  create(data: Record<string, unknown>) {
    return this.prisma.player.create({ data: data as never });
  }

  update(id: string, data: Record<string, unknown>) {
    return this.prisma.player.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.player.delete({ where: { id } });
  }
}
