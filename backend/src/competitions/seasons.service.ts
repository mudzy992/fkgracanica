import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calendarSeasonInclude } from './edition-include';

@Injectable()
export class SeasonsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.season.findMany({
      include: calendarSeasonInclude,
      orderBy: { yearStart: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.season.findUnique({
      where: { id },
      include: calendarSeasonInclude,
    });
  }

  create(data: {
    name: string;
    yearStart: number;
    yearEnd: number;
    isActive?: boolean;
  }) {
    return this.prisma.season.create({
      data: {
        name: data.name,
        yearStart: data.yearStart,
        yearEnd: data.yearEnd,
        isActive: data.isActive ?? false,
      },
      include: calendarSeasonInclude,
    });
  }

  update(
    id: string,
    data: {
      name?: string;
      yearStart?: number;
      yearEnd?: number;
      isActive?: boolean;
    },
  ) {
    return this.prisma.season.update({
      where: { id },
      data,
      include: calendarSeasonInclude,
    });
  }

  remove(id: string) {
    return this.prisma.season.delete({ where: { id } });
  }
}
