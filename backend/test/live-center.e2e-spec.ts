import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

loadEnv({ path: resolve(__dirname, '../../.env') });

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Live center (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let matchId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL ?? 'admin@fkgracanica.ba',
        password: process.env.ADMIN_PASSWORD ?? 'Admin123!',
      });
    accessToken = login.body.accessToken as string;

    const matches = await request(app.getHttpServer()).get('/api/v1/matches');
    let scheduled = (matches.body as { id: string; status: string }[]).find(
      (m) => m.status === 'SCHEDULED',
    );
    if (!scheduled) {
      const seasons = await request(app.getHttpServer()).get('/api/v1/competitions/seasons/list');
      const clubs = await request(app.getHttpServer()).get('/api/v1/clubs');
      const seasonId = (seasons.body as { id: string }[])[0]?.id;
      const clubIds = (clubs.body as { id: string }[]).slice(0, 2).map((c) => c.id);
      if (!seasonId || clubIds.length < 2) {
        throw new Error('Missing season/clubs for live e2e');
      }
      const created = await request(app.getHttpServer())
        .post('/api/v1/matches')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          seasonId,
          homeClubId: clubIds[0],
          awayClubId: clubIds[1],
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
          round: 99,
        });
      scheduled = created.body as { id: string; status: string };
    }
    matchId = scheduled.id;
  });

  afterAll(async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/live/matches/${matchId}/end`)
      .set('Authorization', `Bearer ${accessToken}`)
      .catch(() => undefined);
    await app.close();
  });

  it('start → goal → score update', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/live/matches/${matchId}/start`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/live/matches/${matchId}/events`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ type: 'GOAL', minute: 23, teamSide: 'home', description: 'E2E gol' })
      .expect(201);

    const match = await request(app.getHttpServer()).get(`/api/v1/matches/${matchId}`);
    expect(match.body.homeScore).toBeGreaterThanOrEqual(1);
    expect(match.body.status).toBe('LIVE');
    expect((match.body.events as unknown[]).length).toBeGreaterThanOrEqual(1);
  });
});
