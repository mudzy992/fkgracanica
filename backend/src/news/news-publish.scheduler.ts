import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class NewsPublishScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NewsPublishScheduler.name);
  private timer: ReturnType<typeof setInterval> | null = null;
  /** BE-09b/P-B09b-4: overlap guard — tick traje < 60 s, ali ne garantovano. */
  private running: Promise<void> | null = null;
  private stopped = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.runSafe(), 60_000);
    void this.runSafe();
  }

  async onModuleDestroy() {
    this.stopped = true;
    if (this.timer) clearInterval(this.timer);
    // Ne ostavljaj transakciju u letu (testovi i graceful shutdown).
    await this.running?.catch(() => undefined);
  }

  private runSafe(): Promise<void> | null {
    if (this.running) return this.running;
    // BE-09b/P-B09b-4: `try/catch` — prije je pad DB-a bio unhandled rejection
    // iz intervala (Node ruši proces), a greška je nestajala bez traga.
    this.running = this.tick()
      .catch((error: unknown) => {
        this.logger.error(
          `News publish tick nije uspio: ${error instanceof Error ? error.message : String(error)}`,
        );
      })
      .finally(() => {
        this.running = null;
      });
    return this.running;
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
      if (this.stopped) return;
      await this.publishOne(item);
    }
  }

  /** Greška jedne vijesti ne prekida batch (prije: ostatak čeka sljedeću minutu). */
  private async publishOne(item: { id: string; title: string; slug: string }) {
    try {
      // BE-09b/P-B09b-4: uslovni update — ako je admin u međuvremenu vratio
      // vijest u DRAFT (ili je objavio ručno), tick je ne pregazi.
      const result = await this.prisma.news.updateMany({
        where: {
          id: item.id,
          status: { in: [ContentStatus.DRAFT, ContentStatus.PENDING] },
        },
        data: { status: ContentStatus.PUBLISHED, publishedAt: new Date() },
      });
      if (!result.count) return;
      void this.notifications.broadcast({
        title: '📰 Nova vijest',
        body: item.title,
        type: 'news.published',
        path: `/news/${item.slug}`,
      });
      this.logger.log(`Auto-published news ${item.id}`);
    } catch (error) {
      this.logger.error(
        `Auto-publish vijesti ${item.id} nije uspio: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
