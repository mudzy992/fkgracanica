import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

loadEnv({ path: resolve(__dirname, '../../.env') });

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Notifications (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let userId: string;
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@fkgracanica.ba';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';

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
      .send({ email: adminEmail, password: adminPassword });

    accessToken = login.body.accessToken as string;
    userId = login.body.user.id as string;
  });

  afterAll(async () => {
    await app.close();
  });

  it('settings update creates notification → list → mark read → read-all', async () => {
    await request(app.getHttpServer())
      .put('/api/v1/settings/public')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ 'club.tagline': `Notif test ${Date.now()}` })
      .expect(200);

    const list = await request(app.getHttpServer())
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(list.body.data).toBeDefined();
    expect(list.body.meta.total).toBeGreaterThan(0);
    const notif = list.body.data[0] as { id: string; isRead: boolean };
    expect(notif.isRead).toBe(false);

    await request(app.getHttpServer())
      .patch(`/api/v1/notifications/${notif.id}/read`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const unread = await request(app.getHttpServer())
      .get('/api/v1/notifications?unreadOnly=true')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const stillUnread = (unread.body.data as { id: string }[]).some((n) => n.id === notif.id);
    expect(stillUnread).toBe(false);

    await request(app.getHttpServer())
      .patch('/api/v1/notifications/read-all')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(userId).toBeTruthy();
  });
});
