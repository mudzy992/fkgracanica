import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { SitemapRow } from './seo-sitemap.util';

export interface SitemapData {
  news: SitemapRow[];
  galleries: SitemapRow[];
  players: SitemapRow[];
  timeline: SitemapRow[];
  hallOfFame: SitemapRow[];
  museum: SitemapRow[];
}

/**
 * BE-08: dohvat redova za sitemap izdvojen iz `SeoService` (file-size limit).
 * Vraća samo javno vidljiv sadržaj — vijesti/galerije `PUBLISHED`, aktivni igrači.
 */
export async function loadSitemapData(
  prisma: PrismaService,
): Promise<SitemapData> {
  const [news, galleries, players, timeline, hallOfFame, museum] =
    await Promise.all([
      prisma.news.findMany({
        where: { status: ContentStatus.PUBLISHED },
        select: { slug: true, updatedAt: true },
      }),
      prisma.gallery.findMany({
        where: { status: ContentStatus.PUBLISHED },
        select: { slug: true, updatedAt: true },
      }),
      prisma.player.findMany({
        where: { isActive: true },
        select: { id: true, updatedAt: true },
      }),
      prisma.clubTimelineEvent.findMany({
        select: { id: true, updatedAt: true },
      }),
      prisma.hallOfFameEntry.findMany({
        select: { id: true, updatedAt: true },
      }),
      prisma.museumItem.findMany({
        select: { id: true, updatedAt: true },
      }),
    ]);
  return { news, galleries, players, timeline, hallOfFame, museum };
}
