import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(q: string) {
    const query = q.trim();
    if (!query) return { news: [], players: [], clubs: [], matches: [], galleries: [], trophies: [] };

    const [news, players, clubs, matches, galleries, trophies] = await Promise.all([
      this.prisma.news.findMany({
        where: {
          status: ContentStatus.PUBLISHED,
          OR: [{ title: { contains: query } }, { excerpt: { contains: query } }],
        },
        take: 10,
        select: { id: true, title: true, slug: true },
      }),
      this.prisma.player.findMany({
        where: {
          OR: [
            { firstName: { contains: query } },
            { lastName: { contains: query } },
          ],
        },
        take: 10,
        select: { id: true, firstName: true, lastName: true },
      }),
      this.prisma.club.findMany({
        where: { name: { contains: query } },
        take: 10,
        select: { id: true, name: true, slug: true },
      }),
      this.prisma.match.findMany({
        where: {
          OR: [
            { venue: { contains: query } },
            { homeClub: { name: { contains: query } } },
            { awayClub: { name: { contains: query } } },
          ],
        },
        take: 10,
        include: {
          homeClub: { select: { name: true } },
          awayClub: { select: { name: true } },
        },
      }),
      this.prisma.gallery.findMany({
        where: {
          status: ContentStatus.PUBLISHED,
          title: { contains: query },
        },
        take: 10,
        select: { id: true, title: true, slug: true },
      }),
      this.prisma.trophy.findMany({
        where: {
          OR: [{ name: { contains: query } }, { competition: { contains: query } }],
        },
        take: 10,
        select: { id: true, name: true, year: true },
      }),
    ]);

    return { news, players, clubs, matches, galleries, trophies };
  }
}
