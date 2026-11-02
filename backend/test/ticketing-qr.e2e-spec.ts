import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

loadEnv({ path: resolve(__dirname, '../../.env') });

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Ticketing QR (e2e)', () => {
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
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
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
    const list = matches.body as { id: string }[];
    if (!list.length) throw new Error('No matches for ticketing e2e');
    matchId = list[0].id;
  });

  afterAll(async () => app.close());

  it('reserve → confirm payment → validate QR → reject reuse', async () => {
    const reserved = await request(app.getHttpServer())
      .post('/api/v1/ticketing/reserve')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ matchId, category: 'tribina', price: 5, quantity: 1 });

    expect(reserved.status).toBe(201);
    const orderId = reserved.body.id as string;
    const qrCode = reserved.body.tickets[0].qrCode as string;
    expect(qrCode).toMatch(/^ticket_/);

    await request(app.getHttpServer())
      .post('/api/v1/ticketing/validate')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ qrCode })
      .expect(400);

    const confirmed = await request(app.getHttpServer())
      .post(`/api/v1/ticketing/orders/${orderId}/confirm-payment`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(confirmed.status).toBe(201);
    expect(confirmed.body.tickets[0].status).toBe('PAID_AT_BOX_OFFICE');

    const validated = await request(app.getHttpServer())
      .post('/api/v1/ticketing/validate')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ qrCode });

    expect(validated.status).toBe(201);
    expect(validated.body.status).toBe('USED');

    await request(app.getHttpServer())
      .post('/api/v1/ticketing/validate')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ qrCode })
      .expect(400);
  });

  it('rejects unknown QR', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/ticketing/validate')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ qrCode: 'ticket_nonexistent_e2e' })
      .expect(404);
  });
});
