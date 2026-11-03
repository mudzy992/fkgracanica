import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { slugify } from '../common/utils/slug.util';
import {
  mapNewsUpdate,
  newsInclude,
  syncNewsRelations,
  syncNewsTags,
} from './news-relations.util';

export interface NewsWriteInput {
  title: string;
  content: string;
  excerpt?: string;
  slug?: string;
  authorId?: string;
  categoryId?: string;
  coverPath?: string;
  videoUrl?: string;
  galleryId?: string;
  seoTitle?: string;
  seoDesc?: string;
  scheduledAt?: string | null;
  tags?: string[];
  relatedMatchIds?: string[];
  relatedPlayerIds?: string[];
}

@Injectable()
export class NewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  findAll(status?: ContentStatus, categoryId?: string) {
    return this.prisma.news.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(categoryId ? { categoryId } : {}),
      },
      include: newsInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  findPublished(categoryId?: string) {
    return this.findAll(ContentStatus.PUBLISHED, categoryId);
  }

  async findBySlug(slug: string) {
    const item = await this.prisma.news.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
      include: newsInclude,
    });
    if (!item) throw new NotFoundException('Vijest nije pronađena');
    return item;
  }

  async findOne(id: string) {
    const item = await this.prisma.news.findUnique({
      where: { id },
      include: newsInclude,
    });
    if (!item) throw new NotFoundException('Vijest nije pronađena');
    return item;
  }

  /** BE-04/P-B04-1: laka provjera za javne rute (komentari drafta nisu javni). */
  async isPublished(id: string) {
    const news = await this.prisma.news.findUnique({
      where: { id },
      select: { status: true },
    });
    return news?.status === ContentStatus.PUBLISHED;
  }

  async create(data: NewsWriteInput) {
    const slug = await this.uniqueSlug(
      data.slug?.trim() || slugify(data.title),
    );
    const { tags, relatedMatchIds, relatedPlayerIds, scheduledAt, ...rest } =
      data;
    // BE-09b/P-B09b-5: vijest + tagovi + relacije u JEDNOJ transakciji —
    // prije je pad `createMany`-a ostavljao vijest bez tagova.
    const item = await this.prisma.$transaction(async (tx) => {
      const created = await tx.news.create({
        data: {
          ...rest,
          slug,
          status: ContentStatus.DRAFT,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        },
      });
      await syncNewsTags(tx, created.id, tags);
      await syncNewsRelations(
        tx,
        created.id,
        relatedMatchIds,
        relatedPlayerIds,
      );
      return created;
    });
    return this.findOne(item.id);
  }

  async update(id: string, data: Record<string, unknown>) {
    await this.findOne(id);
    const tags = data.tags as string[] | undefined;
    const relatedMatchIds = data.relatedMatchIds as string[] | undefined;
    const relatedPlayerIds = data.relatedPlayerIds as string[] | undefined;
    const update = mapNewsUpdate(data);
    if (typeof update.slug === 'string' && update.slug) {
      update.slug = await this.uniqueSlug(update.slug, id);
    }
    if (update.scheduledAt)
      update.scheduledAt = new Date(update.scheduledAt as string);
    // BE-09b/P-B09b-5: update + tagovi + relacije atomarno.
    await this.prisma.$transaction(async (tx) => {
      await tx.news.update({ where: { id }, data: update });
      await syncNewsTags(tx, id, tags);
      await syncNewsRelations(tx, id, relatedMatchIds, relatedPlayerIds);
    });
    return this.findOne(id);
  }

  async updateStatus(id: string, status: ContentStatus) {
    const previous = await this.findOne(id);
    const updated = await this.prisma.news.update({
      where: { id },
      data: {
        status,
        publishedAt:
          status === ContentStatus.PUBLISHED ? new Date() : undefined,
      },
      include: newsInclude,
    });
    if (
      status === ContentStatus.PUBLISHED &&
      previous.status !== ContentStatus.PUBLISHED
    ) {
      void this.notifications.broadcast({
        title: '📰 Nova vijest',
        body: updated.title,
        type: 'news.published',
        path: `/news/${updated.slug}`,
      });
    }
    return updated;
  }

  async submitForReview(id: string, authorId: string) {
    const item = await this.findOne(id);
    if (item.authorId !== authorId) {
      throw new ForbiddenException('Možete predati samo vlastite vijesti');
    }
    if (item.status !== ContentStatus.DRAFT) {
      throw new BadRequestException('Samo nacrt se može predati na pregled');
    }
    return this.updateStatus(id, ContentStatus.PENDING);
  }

  async archiveOwn(id: string, authorId: string) {
    const item = await this.findOne(id);
    if (item.authorId !== authorId) {
      throw new ForbiddenException('Možete arhivirati samo vlastite vijesti');
    }
    if (item.status !== ContentStatus.DRAFT) {
      throw new BadRequestException('Samo nacrt se može arhivirati');
    }
    return this.updateStatus(id, ContentStatus.ARCHIVED);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.news.delete({ where: { id } });
  }

  private async uniqueSlug(base: string, excludeId?: string): Promise<string> {
    let slug = base;
    let n = 1;
    while (true) {
      const existing = await this.prisma.news.findUnique({ where: { slug } });
      if (!existing || existing.id === excludeId) return slug;
      slug = `${base}-${n++}`;
    }
  }
}
