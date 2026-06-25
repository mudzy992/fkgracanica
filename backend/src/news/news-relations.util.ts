import type { Prisma } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';

export const newsInclude = {
  category: true,
  tags: true,
  gallery: { include: { photos: { orderBy: { sortOrder: 'asc' as const } } } },
  relatedMatches: { include: { match: { include: { homeClub: true, awayClub: true } } } },
  relatedPlayers: { include: { player: true } },
  author: { select: { id: true, email: true, firstName: true, lastName: true } },
} satisfies Prisma.NewsInclude;

export async function syncNewsTags(
  prisma: PrismaService,
  newsId: string,
  tags?: string[],
) {
  if (tags === undefined) return;
  await prisma.newsTag.deleteMany({ where: { newsId } });
  const names = [...new Set(tags.map((t) => t.trim()).filter(Boolean))];
  if (names.length) {
    await prisma.newsTag.createMany({ data: names.map((name) => ({ newsId, name })) });
  }
}

export async function syncNewsRelations(
  prisma: PrismaService,
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
    'title', 'slug', 'excerpt', 'content', 'coverPath', 'videoUrl',
    'galleryId', 'categoryId', 'seoTitle', 'seoDesc', 'scheduledAt',
  ] as const;
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (data[key] !== undefined) update[key] = data[key];
  }
  if (update.scheduledAt === '') update.scheduledAt = null;
  return update;
}
