import type { Prisma } from '@prisma/client';

/** Podskup Prisma klijenta koji dijele `PrismaService` i `tx` u transakciji. */
export type NewsRelationsClient = Pick<
  Prisma.TransactionClient,
  'newsTag' | 'newsMatch' | 'newsPlayer'
>;

export const newsInclude = {
  category: true,
  tags: true,
  gallery: { include: { photos: { orderBy: { sortOrder: 'asc' as const } } } },
  relatedMatches: {
    include: { match: { include: { homeClub: true, awayClub: true } } },
  },
  relatedPlayers: { include: { player: true } },
  author: {
    select: { id: true, email: true, firstName: true, lastName: true },
  },
} satisfies Prisma.NewsInclude;

/**
 * BE-09b/P-B09b-5: prima i `PrismaService` i transakcijski klijent — poziva se
 * unutar `$transaction`-a zajedno sa `news.create/update`, pa pad
 * `createMany`-a vraća i same tagove (prije: vijest bez ijednog taga).
 */
export async function syncNewsTags(
  prisma: NewsRelationsClient,
  newsId: string,
  tags?: string[],
) {
  if (tags === undefined) return;
  await prisma.newsTag.deleteMany({ where: { newsId } });
  const names = [...new Set(tags.map((t) => t.trim()).filter(Boolean))];
  if (names.length) {
    await prisma.newsTag.createMany({
      data: names.map((name) => ({ newsId, name })),
    });
  }
}

export async function syncNewsRelations(
  prisma: NewsRelationsClient,
  newsId: string,
  matchIds?: string[],
  playerIds?: string[],
) {
  if (matchIds !== undefined) {
    await prisma.newsMatch.deleteMany({ where: { newsId } });
    if (matchIds.length) {
      await prisma.newsMatch.createMany({
        data: matchIds.map((matchId) => ({ newsId, matchId })),
      });
    }
  }
  if (playerIds !== undefined) {
    await prisma.newsPlayer.deleteMany({ where: { newsId } });
    if (playerIds.length) {
      await prisma.newsPlayer.createMany({
        data: playerIds.map((playerId) => ({ newsId, playerId })),
      });
    }
  }
}

export function mapNewsUpdate(data: Record<string, unknown>) {
  const allowed = [
    'title',
    'slug',
    'excerpt',
    'content',
    'coverPath',
    'videoUrl',
    'galleryId',
    'categoryId',
    'seoTitle',
    'seoDesc',
    'scheduledAt',
  ] as const;
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (data[key] !== undefined) update[key] = data[key];
  }
  if (update.scheduledAt === '') update.scheduledAt = null;
  return update;
}
