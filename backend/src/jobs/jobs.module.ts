import { Injectable, Logger, Module, OnModuleDestroy, Optional } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { tallyCampaignEmail } from '../newsletter/newsletter-campaign-tally';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { RealtimeModule } from '../realtime/realtime.module';
import { ConfigService } from '@nestjs/config';
import { buildRedisTlsOptions } from '../common/utils/redis-tls.util';

export type EmailPayload = {
  to: string;
  subject: string;
  body: string;
  html?: string;
  campaignId?: string;
};

@Injectable()
export class JobsService implements OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name);
  private readonly connection: { url: string; tls?: { ca: Buffer } } | null;
  private readonly emailQueue: Queue | null;
  private readonly worker: Worker | null;

  constructor(
    private readonly prisma: PrismaService,
    // P-CI04-2: realtime je opcionalan — worker servis ne mora imati WS gateway,
    // a i api-only/worker-only mode radi bez njega (tally samo preskače emit).
    @Optional() private readonly realtime: RealtimeGateway | undefined,
    // BE-06: migracija s process.env na ConfigService (BE-01 P2 konvencija)
    private readonly config: ConfigService,
  ) {
    const url = this.config.get<string>('redisUrl');
    if (!url) {
      this.connection = null;
      this.emailQueue = null;
      this.worker = null;
      return;
    }
    // P-CI04-2 napredno: JOBS_MODE — izolacija Queue/Worker po procesu.
    // both (default, dev/test): Queue + Worker u jednom procesu (kompatibilno);
    // api: samo Queue (backend ne procesira, samo enqueue);
    // worker: samo Worker (worker servis procesira, ne enqueue).
    const rawMode = this.config.get<string>('jobsMode') ?? 'both';
    const mode = rawMode.toLowerCase();
    const wantQueue = mode === 'both' || mode === 'api';
    const wantWorker = mode === 'both' || mode === 'worker';
    if (!wantQueue && !wantWorker) {
      this.logger.warn(`JOBS_MODE=${rawMode} nepoznat — padam na both`);
    }
    const effectiveQueue = wantQueue || (!wantWorker && mode !== 'worker');
    const effectiveWorker = wantWorker || (!wantQueue && mode !== 'api');
    // BullMQ proslijeđuje { url, ...rest } ioredis-u: rediss:// pali TLS,
    // a tls.ca (iz REDIS_TLS_CA) rješava "self-signed certificate in
    // certificate chain" prema privatnom Coolify CA-u.
    this.connection = {
      url,
      ...buildRedisTlsOptions(url, this.config.get<string>('redisTlsCa')),
    };
    if (effectiveQueue) {
      this.emailQueue = new Queue('email', { connection: this.connection });
      this.logger.log(`Jobs Queue email inicijalizovan (JOBS_MODE=${mode})`);
    } else {
      this.emailQueue = null;
      this.logger.log(`Jobs Queue preskočen (JOBS_MODE=${mode})`);
    }
    if (effectiveWorker) {
      this.worker = new Worker(
        'email',
        async (job) => this.sendEmail(job.data as EmailPayload),
        { connection: this.connection, limiter: { max: 10, duration: 60_000 } },
      );
      this.logger.log(`Jobs Worker email inicijalizovan (JOBS_MODE=${mode})`);
    } else {
      this.worker = null;
      this.logger.log(`Jobs Worker preskočen (JOBS_MODE=${mode})`);
    }
  }

  enqueueEmailLater(payload: EmailPayload) {
    void this.enqueueEmail(payload).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`enqueue fail ${payload.to}: ${message}`);
    });
  }

  async enqueueEmail(payload: EmailPayload) {
    if (!this.emailQueue) {
      await this.sendEmail(payload);
      return;
    }
    await this.emailQueue.add('send', payload);
  }

  private async sendEmail(payload: EmailPayload) {
    const smtp = await this.prisma.setting.findMany({
      where: { key: { startsWith: 'smtp.' } },
    });
    const settings = smtp.reduce<Record<string, string>>((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
    if (
      !settings['smtp.host'] ||
      !settings['smtp.user'] ||
      !settings['smtp.pass']
    ) {
      this.logger.warn(`SMTP unavailable for ${payload.to}`);
      await this.tally(payload.campaignId, false);
      return;
    }
    try {
      const transporter = nodemailer.createTransport({
        host: settings['smtp.host'],
        port: Number(settings['smtp.port'] || '587'),
        secure: settings['smtp.secure'] === 'true',
        auth: { user: settings['smtp.user'], pass: settings['smtp.pass'] },
      });
      await transporter.sendMail({
        from: settings['smtp.from'] || settings['smtp.user'],
        to: payload.to,
        subject: payload.subject,
        text: payload.body,
        html: payload.html,
      });
      await this.tally(payload.campaignId, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`SMTP fail ${payload.to}: ${message}`);
      await this.prisma.failedEmail.create({
        data: { to: payload.to, subject: payload.subject, error: message },
      });
      await this.tally(payload.campaignId, false);
    }
  }

  private async tally(campaignId: string | undefined, ok: boolean) {
    const snap = await tallyCampaignEmail(this.prisma, campaignId, ok);
    if (snap) this.realtime?.emitNewsletterCampaign(snap);
  }

  async onModuleDestroy() {
    await this.worker?.close();
    await this.emailQueue?.close();
  }
}

@Module({
  imports: [RealtimeModule],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
