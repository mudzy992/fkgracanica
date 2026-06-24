import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

loadEnv({ path: resolve(__dirname, '../../.env') });

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Admin users RBAC (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@fkgracanica.ba';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';
  const testEmail = `test-user-${Date.now()}@fkgracanica.ba`;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates user, lists paginated, updates, soft-deletes', async () => {
    const roles = await request(app.getHttpServer())
      .get('/api/v1/rbac/roles')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const writerRole = (roles.body as { id: string; name: string }[]).find(
      (r) => r.name === 'Writer',
    );

    const created = await request(app.getHttpServer())
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: testEmail,
        password: 'TestPass123',
        firstName: 'Test',
        lastName: 'User',
        roleIds: writerRole ? [writerRole.id] : [],
      })
      .expect(201);

    const userId = created.body.id as string;

    const list = await request(app.getHttpServer())
      .get('/api/v1/users?page=1&limit=10')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(list.body.data).toBeDefined();
    expect(list.body.meta.total).toBeGreaterThan(0);

    await request(app.getHttpServer())
      .patch(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ firstName: 'Updated' })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
