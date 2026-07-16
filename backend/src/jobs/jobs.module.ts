import { Injectable, Logger, Module, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

type EmailPayload = { to: string; subject: string; body: string };

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
      { connection: this.connection },
    );
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
    if (!settings['smtp.host'] || !settings['smtp.user'] || !settings['smtp.pass']) {
      this.logger.warn(`SMTP unavailable for ${payload.to}`);
      return;
    }
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
    });
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
