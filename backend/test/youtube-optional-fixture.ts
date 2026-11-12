import { randomUUID } from 'node:crypto';
import { ValidationPipe, type INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';
import { Test } from '@nestjs/testing';
import type { NextFunction, Request, Response } from 'express';
import { createLineupFixture } from './lineup-e2e-fixture';
import { PermissionsGuard } from '../src/common/guards/permissions.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { LiveController } from '../src/live/live.controller';
import { LiveService } from '../src/live/live.service';
import { LiveClockOpsService } from '../src/live/live-clock-ops.service';
import { LivePhaseService } from '../src/live/live-phase.service';
import { LiveFanoutService } from '../src/notifications/live-fanout.service';
import { RealtimeGateway } from '../src/realtime/realtime.gateway';
import { StatisticsService } from '../src/statistics/statistics.service';
import { NewsController } from '../src/news/news.controller';
import { NewsService } from '../src/news/news.service';
import { CommentsService } from '../src/news/comments.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { SettingsController } from '../src/settings/settings.controller';
import { SettingsService } from '../src/settings/settings.service';
import { AuditService } from '../src/audit/audit.service';

/** Lokalni PG + pravi HTTP kontroleri; samo auth i sporedni događaji su stubovi. */
export async function youtubeOptionalFixture() {
  const base = await createLineupFixture();
  const { prisma } = base;
  const key = randomUUID();
  const user = await prisma.user.create({
    data: { email: `fe06-${key}@example.invalid`, passwordHash: 'test' },
  });
  await prisma.match.update({
    where: { id: base.matchId },
    data: { status: 'FINISHED' },
  });
  const module = await Test.createTestingModule({
    controllers: [LiveController, NewsController, SettingsController],
    providers: [
      LiveService,
      NewsService,
      SettingsService,
      { provide: PrismaService, useValue: prisma },
      { provide: LiveClockOpsService, useValue: {} },
      { provide: LivePhaseService, useValue: {} },
      { provide: StatisticsService, useValue: {} },
      { provide: LiveFanoutService, useValue: {} },
      { provide: CommentsService, useValue: {} },
      { provide: NotificationsService, useValue: { create: jest.fn() } },
      { provide: AuditService, useValue: { log: jest.fn() } },
      {
        provide: RealtimeGateway,
        useValue: {
          emitMatchStatus: jest.fn(),
          emitSettingsChanged: jest.fn(),
        },
      },
    ],
  })
    .overrideGuard(PermissionsGuard)
    .useValue({ canActivate: () => true })
    .compile();
  const app: INestApplication<App> = module.createNestApplication();
  app.use(
    (
      req: Request & { user?: { id: string } },
      _res: Response,
      next: NextFunction,
    ) => {
      req.user = { id: user.id };
      next();
    },
  );
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.init();
  const original = await prisma.setting.findUniqueOrThrow({
    where: { key: 'live.prematchAudioUrl' },
  });
  const otherKey = `fe06.${key}`;
  await prisma.setting.create({ data: { key: otherKey, value: 'prije' } });
  const news = await prisma.news.create({
    data: {
      title: 'Staro',
      slug: `fe06-${key}`,
      content: 'Stari sadržaj',
      videoUrl: 'https://legacy.invalid/watch?v=short',
    },
  });
  return {
    app,
    prisma,
    matchId: base.matchId,
    newsId: news.id,
    otherKey,
    key,
    async close() {
      await prisma.news.deleteMany({
        where: { slug: { startsWith: `fe06-${key}` } },
      });
      await prisma.setting.update({
        where: { key: original.key },
        data: { value: original.value },
      });
      await prisma.setting.delete({ where: { key: otherKey } });
      await prisma.user.delete({ where: { id: user.id } });
      await base.close();
      await app.close();
    },
  };
}
