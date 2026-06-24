import { Injectable, Logger, Module, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';

@Injectable()
export class JobsService implements OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name);
  private readonly connection: { url: string } | null;
  private readonly emailQueue: Queue | null;
  private readonly worker: Worker | null;

  constructor() {
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
      async (job) => {
        this.logger.log(`Email job ${job.id}: ${JSON.stringify(job.data)}`);
      },
      { connection: this.connection },
    );
  }

  async enqueueEmail(payload: { to: string; subject: string; body: string }) {
    if (!this.emailQueue) {
      this.logger.warn('Email queue unavailable (no Redis)');
      return;
    }
    await this.emailQueue.add('send', payload);
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
