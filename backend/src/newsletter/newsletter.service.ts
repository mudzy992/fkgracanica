import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NewsletterListQueryDto } from './dto/newsletter-list-query.dto';
import { paginate, parsePagination } from '../common/utils/pagination.util';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  subscribe(email: string) {
    return this.prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email },
      update: { isActive: true },
    });
  }

  unsubscribe(email: string) {
    return this.prisma.newsletterSubscriber.update({
      where: { email },
      data: { isActive: false },
    }).catch(() => {
      throw new NotFoundException('Pretplatnik nije pronađen');
    });
  }

  async findAll(query: NewsletterListQueryDto) {
    const params = parsePagination(query);
    const where: Prisma.NewsletterSubscriberWhereInput = {};
    if (params.search) {
      where.email = { contains: params.search };
    }
    return paginate(
      params,
      (skip, take) =>
        this.prisma.newsletterSubscriber.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
      () => this.prisma.newsletterSubscriber.count({ where }),
    );
  }

  async exportCsv() {
    const rows = await this.prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: { email: true, createdAt: true },
    });
    const header = 'email,createdAt';
    const body = rows
      .map((r) => `${r.email},${r.createdAt.toISOString()}`)
      .join('\n');
    return `${header}\n${body}\n`;
  }
}
