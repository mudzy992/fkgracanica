import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slug.util';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(status?: ContentStatus) {
    return this.prisma.news.findMany({
      where: status ? { status } : undefined,
      include: { category: true, author: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findPublished() {
    return this.findAll(ContentStatus.PUBLISHED);
  }

  async findBySlug(slug: string) {
    const item = await this.prisma.news.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED },
      include: { category: true, tags: true },
    });
    if (!item) throw new NotFoundException('Vijest nije pronađena');
    return item;
  }

  async findOne(id: string) {
    const item = await this.prisma.news.findUnique({
      where: { id },
      include: { category: true, tags: true },
    });
    if (!item) throw new NotFoundException('Vijest nije pronađena');
    return item;
  }

  async create(data: {
    title: string;
    content: string;
    excerpt?: string;
    authorId?: string;
    categoryId?: string;
    coverPath?: string;
  }) {
    const slug = await this.uniqueSlug(slugify(data.title));
    return this.prisma.news.create({
      data: { ...data, slug, status: ContentStatus.DRAFT },
    });
  }

  async update(id: string, data: Record<string, unknown>) {
    await this.findOne(id);
    return this.prisma.news.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: ContentStatus) {
    await this.findOne(id);
    return this.prisma.news.update({
      where: { id },
      data: {
        status,
        publishedAt: status === ContentStatus.PUBLISHED ? new Date() : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.news.delete({ where: { id } });
  }

  private async uniqueSlug(base: string): Promise<string> {
    let slug = base;
    let n = 1;
    while (await this.prisma.news.findUnique({ where: { slug } })) {
      slug = `${base}-${n++}`;
    }
    return slug;
  }
}
