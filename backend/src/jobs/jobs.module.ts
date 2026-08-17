import { Injectable, Logger, Module, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';
import { tallyCampaignEmail } from '../newsletter/newsletter-campaign-tally';

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
  private readonly connection: { url: string } | null;
  private readonly emailQueue: Queue | null;
  private readonly worker: Worker | null;

  constructor(private readonly prisma: PrismaService) {
    const url = process.env.REDIS_URL;
    if (!url) {
      this.connection = null;
      this.emailQueue = null;
      this.worker = null;
      return;
    }
    this.connection = { url };
    this.emailQueue = new Queue('email', { connection: this.connection });
    this.worker = new Worker(
      'email',
      async (job) => this.sendEmail(job.data as EmailPayload),
      { connection: this.connection, limiter: { max: 10, duration: 60_000 } },
    );
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
    const smtp = await this.prisma.setting.findMany({ where: { key: { startsWith: 'smtp.' } } });
    const settings = smtp.reduce<Record<string, string>>((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
    if (!settings['smtp.host'] || !settings['smtp.user'] || !settings['smtp.pass']) {
      this.logger.warn(`SMTP unavailable for ${payload.to}`);
      await tallyCampaignEmail(this.prisma, payload.campaignId, false);
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
      await tallyCampaignEmail(this.prisma, payload.campaignId, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`SMTP fail ${payload.to}: ${message}`);
      await this.prisma.failedEmail.create({
        data: { to: payload.to, subject: payload.subject, error: message },
      });
      await tallyCampaignEmail(this.prisma, payload.campaignId, false);
    }
  }

  async onModuleDestroy() {
    await this.worker?.close();
    await this.emailQueue?.close();
  }
}

@Module({
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
