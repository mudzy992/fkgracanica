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
  let adminUserId: string;
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
    adminUserId = login.body.user?.id as string;
    expect(accessToken).toBeTruthy();
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
      .get('/api/v1/users/role-options')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

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

  it('rejects self-delete', async () => {
    await request(app.getHttpServer())
      .delete(`/api/v1/users/${adminUserId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  it('rejects self-deactivate', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/users/${adminUserId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isActive: false })
      .expect(400);
  });

  it('denies users list for Writer role', async () => {
    const writerEmail = `writer-deny-${Date.now()}@fkgracanica.ba`;
    const roles = await request(app.getHttpServer())
      .get('/api/v1/rbac/roles')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const writerRole = (roles.body as { id: string; name: string }[]).find(
      (r) => r.name === 'Writer',
    );
    expect(writerRole).toBeTruthy();

    await request(app.getHttpServer())
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: writerEmail,
        password: 'TestPass123',
        roleIds: [writerRole!.id],
      })
      .expect(201);

    const writerLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: writerEmail, password: 'TestPass123' })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${writerLogin.body.accessToken}`)
      .expect(403);
  });

  it('rejects updating Administrator role permissions', async () => {
    const roles = await request(app.getHttpServer())
      .get('/api/v1/rbac/roles')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const adminRole = (roles.body as { id: string; name: string }[]).find(
      (r) => r.name === 'Administrator',
    );
    if (!adminRole) return;

    await request(app.getHttpServer())
      .patch(`/api/v1/rbac/roles/${adminRole.id}/permissions`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ permissionKeys: ['users.read'] })
      .expect(400);
  });

  it('writes audit log on user create', async () => {
    const email = `audit-user-${Date.now()}@fkgracanica.ba`;
    const created = await request(app.getHttpServer())
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email,
        password: 'TestPass123',
        firstName: 'Audit',
        lastName: 'Test',
      })
      .expect(201);

    const audit = await request(app.getHttpServer())
      .get('/api/v1/audit?action=users.create&limit=20')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const logs = audit.body.data as { entityId?: string; action: string }[];
    expect(
      logs.some(
        (l) => l.action === 'users.create' && l.entityId === created.body.id,
      ),
    ).toBe(true);

    await request(app.getHttpServer())
      .delete(`/api/v1/users/${created.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
