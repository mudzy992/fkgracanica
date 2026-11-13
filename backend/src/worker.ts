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
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });
  // Nest ApplicationContext already calls app.init() internally.
  // Keep process alive — Worker is running inside JobsService.
  // eslint-disable-next-line no-console
  console.log('[worker] started (JOBS_MODE=worker, email queue)');
  const shutdown = async (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`[worker] ${signal} — zatvaram...`);
    await app.close();
    process.exit(0);
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[worker] fatal', err);
  process.exit(1);
});
