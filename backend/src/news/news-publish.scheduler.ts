import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class NewsPublishScheduler implements OnModuleInit {
  private readonly logger = new Logger(NewsPublishScheduler.name);
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.tick(), 60_000);
    void this.tick();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick() {
    const due = await this.prisma.news.findMany({
      where: {
        status: { in: [ContentStatus.DRAFT, ContentStatus.PENDING] },
        scheduledAt: { lte: new Date() },
      },
      select: { id: true, title: true, slug: true },
    });
    for (const item of due) {
      await this.prisma.news.update({
        where: { id: item.id },
        data: { status: ContentStatus.PUBLISHED, publishedAt: new Date() },
      });
      void this.notifications.broadcast({
        title: '📰 Nova vijest',
        body: item.title,
        type: 'news.published',
        path: `/news/${item.slug}`,
      });
      this.logger.log(`Auto-published news ${item.id}`);
    }
  }
}
