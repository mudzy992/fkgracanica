import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

/**
 * P-CI04-2 napredno: entrypoint za izdvojeni worker servis.
 *
 * Pokreće se u `worker` kontejneru (docker-compose.yml) kao
 * `node dist/src/worker.js` (JOBS_MODE=worker). Koristi isti image kao
 * backend, ali ne starta HTTP server — samo BullMQ Worker za `email` red.
 *
 * Logika slanja mailova je u JobsService (queue/worker izolacija preko
 * JOBS_MODE env). Ovaj proces ostaje aktivan dok kontejner ne dobije
 * SIGTERM/SIGINT (Coolify restart).
 */
async function bootstrap() {
  const logger = new Logger('Worker');
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });
  // Nest ApplicationContext already calls app.init() internally.
  // Keep process alive — Worker is running inside JobsService.
  logger.log('[worker] started (JOBS_MODE=worker, email queue)');
  const shutdown = async (signal: string) => {
    logger.log(`[worker] ${signal} — zatvaram...`);
    await app.close();
    process.exit(0);
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  const logger = new Logger('Worker');
  logger.error(
    '[worker] fatal',
    err instanceof Error ? err.stack : String(err),
  );
  process.exit(1);
});
