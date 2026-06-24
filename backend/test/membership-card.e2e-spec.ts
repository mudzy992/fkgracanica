import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

loadEnv({ path: resolve(__dirname, '../../.env') });

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Membership card (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

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
  });

  afterAll(async () => app.close());

  it('register → activate → card with QR', async () => {
    const registered = await request(app.getHttpServer())
      .post('/api/v1/membership/register')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(registered.status).toBe(201);
    const membershipId = registered.body.id as string;

    const activated = await request(app.getHttpServer())
      .patch(`/api/v1/membership/${membershipId}/activate`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(activated.status).toBe(200);
    expect(activated.body.card.qrCode).toMatch(/^member_/);
    expect(activated.body.card.cardNumber).toMatch(/^FK-/);

    const mine = await request(app.getHttpServer())
      .get('/api/v1/membership/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(mine.status).toBe(200);
    const active = (mine.body as { status: string; card?: { qrCode: string } }[]).find(
      (m) => m.status === 'ACTIVE',
    );
    expect(active?.card?.qrCode).toBe(activated.body.card.qrCode);
  });
});
