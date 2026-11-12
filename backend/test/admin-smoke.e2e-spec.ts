import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

loadEnv({ path: resolve(__dirname, '../../.env') });

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Admin smoke (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@fkgracanica.ba';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';
  const smokeSlug = `smoke-test-${Date.now()}`;

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
      .send({ email: adminEmail, password: adminPassword });

    expect(login.status).toBe(201);
    accessToken = login.body.accessToken as string;
    expect(accessToken).toBeTruthy();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health', () => {
    return request(app.getHttpServer()).get('/api/v1/health').expect(200);
  });

  it('login → update settings → create news → publish → public list', async () => {
    const settings = await request(app.getHttpServer())
      .put('/api/v1/settings/public')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ 'club.tagline': 'Smoke test tagline' });

    expect(settings.status).toBe(200);

    const created = await request(app.getHttpServer())
      .post('/api/v1/news')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: `Smoke vijest ${smokeSlug}`,
        excerpt: 'Automatski smoke test',
        content: '<p>Smoke test sadržaj vijesti.</p>',
      });

    expect(created.status).toBe(201);
    const newsId = created.body.id as string;

    const published = await request(app.getHttpServer())
      .patch(`/api/v1/news/${newsId}/status`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'PUBLISHED' });

    expect(published.status).toBe(200);
    expect(published.body.status).toBe('PUBLISHED');

    const list = await request(app.getHttpServer()).get(
      '/api/v1/news/published',
    );
    expect(list.status).toBe(200);
    const found = (list.body as { id: string }[]).some((n) => n.id === newsId);
    expect(found).toBe(true);

    await request(app.getHttpServer())
      .delete(`/api/v1/news/${newsId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
