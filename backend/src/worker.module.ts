import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { JobsModule } from './jobs/jobs.module';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validate';

/**
 * P-CI04-2 napredno: izdvojeni worker modul.
 *
 * Pokreće se kao poseban proces (`node dist/src/worker.js`) u `worker` servisu
 * docker-compose.yml-a. U tom procesu JOBS_MODE=worker → JobsService kreira
 * samo BullMQ Worker (bez Queue), a RealtimeGateway je opcionalan (ne smeta
 * što nema HTTP server — gateway će biti instanciran ali ne sluša).
 *
 * Za razliku od AppModule, ovdje ne importujemo cijeli API (Auth, Cms, ...),
 * samo minimalno: Config + Prisma + Jobs. Time se worker brzo diže i troši
 * manje memorije, a ne duplira API logiku.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '..', '..', '.env'),
        join(__dirname, '..', '.env'),
      ],
      load: [configuration],
      validate: validateEnv,
    }),
    PrismaModule,
    JobsModule,
  ],
})
export class WorkerModule {}
