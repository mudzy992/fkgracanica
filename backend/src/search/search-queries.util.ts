import { ContentStatus, Prisma, type PrismaClient } from '@prisma/client';
import type { SearchFacet } from './dto/search-query.dto';

const PREVIEW_LIMIT = 10;

export function buildWhere(
  type: SearchFacet,
  q: string,
):
  | Prisma.NewsWhereInput
  | Prisma.PlayerWhereInput
  | Prisma.ClubWhereInput
  | Prisma.MatchWhereInput
  | Prisma.GalleryWhereInput
  | Prisma.TrophyWhereInput
  | Prisma.ClubTimelineEventWhereInput
  | Prisma.HallOfFameEntryWhereInput {
  switch (type) {
    case 'news':
      return {
        status: ContentStatus.PUBLISHED,
        OR: [{ title: { contains: q } }, { excerpt: { contains: q } }],
      };
    case 'players':
      return { OR: [{ firstName: { contains: q } }, { lastName: { contains: q } }] };
    case 'clubs':
      return { name: { contains: q } };
    case 'matches':
      return {
        OR: [
          { venue: { contains: q } },
          { homeClub: { name: { contains: q } } },
          { awayClub: { name: { contains: q } } },
        ],
      };
    case 'galleries':
      return { status: ContentStatus.PUBLISHED, title: { contains: q } };
    case 'trophies':
      return { OR: [{ name: { contains: q } }, { competition: { contains: q } }] };
    case 'timeline':
      return { OR: [{ title: { contains: q } }, { description: { contains: q } }] };
    case 'hallOfFame':
      return {
        OR: [
          { name: { contains: q } },
          { role: { contains: q } },
          { bio: { contains: q } },
          { years: { contains: q } },
        ],
      };
  }
}

export async function countSearchFacets(prisma: PrismaClient, q: string) {
  const [news, players, clubs, matches, galleries, trophies, timeline, hallOfFame] = await Promise.all([
    prisma.news.count({ where: buildWhere('news', q) as Prisma.NewsWhereInput }),
    prisma.player.count({ where: buildWhere('players', q) as Prisma.PlayerWhereInput }),
    prisma.club.count({ where: buildWhere('clubs', q) as Prisma.ClubWhereInput }),
    prisma.match.count({ where: buildWhere('matches', q) as Prisma.MatchWhereInput }),
    prisma.gallery.count({ where: buildWhere('galleries', q) as Prisma.GalleryWhereInput }),
    prisma.trophy.count({ where: buildWhere('trophies', q) as Prisma.TrophyWhereInput }),
    prisma.clubTimelineEvent.count({
      where: buildWhere('timeline', q) as Prisma.ClubTimelineEventWhereInput,
    }),
    prisma.hallOfFameEntry.count({
      where: buildWhere('hallOfFame', q) as Prisma.HallOfFameEntryWhereInput,
    }),
  ]);
  return { news, players, clubs, matches, galleries, trophies, timeline, hallOfFame };
}

export async function findSearchFacet(
  prisma: PrismaClient,
  type: SearchFacet,
  q: string,
  skip: number,
  take: number,
) {
  switch (type) {
    case 'news':
      return prisma.news.findMany({
        where: buildWhere('news', q) as Prisma.NewsWhereInput,
        skip,
        take,
        select: { id: true, title: true, slug: true },
      });
    case 'players':
      return prisma.player.findMany({
        where: buildWhere('players', q) as Prisma.PlayerWhereInput,
        skip,
        take,
        select: { id: true, firstName: true, lastName: true },
      });
    case 'clubs':
      return prisma.club.findMany({
        where: buildWhere('clubs', q) as Prisma.ClubWhereInput,
        skip,
        take,
        select: { id: true, name: true, slug: true },
      });
    case 'matches':
      return prisma.match.findMany({
        where: buildWhere('matches', q) as Prisma.MatchWhereInput,
        skip,
        take,
        include: {
          homeClub: { select: { name: true } },
          awayClub: { select: { name: true } },
        },
      });
    case 'galleries':
      return prisma.gallery.findMany({
        where: buildWhere('galleries', q) as Prisma.GalleryWhereInput,
        skip,
        take,
        select: { id: true, title: true, slug: true },
      });
    case 'trophies':
      return prisma.trophy.findMany({
        where: buildWhere('trophies', q) as Prisma.TrophyWhereInput,
        skip,
        take,
        select: { id: true, name: true, year: true },
      });
    case 'timeline':
      return prisma.clubTimelineEvent.findMany({
        where: buildWhere('timeline', q) as Prisma.ClubTimelineEventWhereInput,
        skip,
        take,
        select: { id: true, title: true },
      });
    case 'hallOfFame':
      return prisma.hallOfFameEntry.findMany({
        where: buildWhere('hallOfFame', q) as Prisma.HallOfFameEntryWhereInput,
        skip,
        take,
        select: { id: true, name: true, role: true },
      });
  }
}

export async function previewAllFacets(prisma: PrismaClient, q: string) {
  const types: SearchFacet[] = [
    'news',
    'players',
    'clubs',
    'matches',
    'galleries',
    'trophies',
    'timeline',
    'hallOfFame',
  ];
  const [news, players, clubs, matches, galleries, trophies, timeline, hallOfFame] = await Promise.all(
    types.map((type) => findSearchFacet(prisma, type, q, 0, PREVIEW_LIMIT)),
  );
  return { news, players, clubs, matches, galleries, trophies, timeline, hallOfFame };
}

export function emptySearchResponse() {
  return {
    facets: {
      news: 0,
      players: 0,
      clubs: 0,
      matches: 0,
      galleries: 0,
      trophies: 0,
      timeline: 0,
      hallOfFame: 0,
    },
    news: [],
    players: [],
    clubs: [],
    matches: [],
    galleries: [],
    trophies: [],
    timeline: [],
    hallOfFame: [],
  };
}
