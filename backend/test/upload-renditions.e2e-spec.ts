import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: resolve(__dirname, '../../.env') });

const uploadDir = mkdtempSync(join(tmpdir(), 'fk-upload-test-'));
process.env.UPLOAD_PATH = uploadDir;

import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

describe('Upload renditions (e2e)', () => {
  let app: NestExpressApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.setGlobalPrefix('api/v1');
    app.useStaticAssets(uploadDir, { prefix: '/api/v1/uploads/files/' });
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

  afterAll(async () => {
    await app.close();
    rmSync(uploadDir, { recursive: true, force: true });
  });

  it('uploads image with thumb and medium renditions', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/media/upload')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', PNG_1X1, 'smoke.png');

    expect(res.status).toBe(201);
    expect(res.body.originalPath).toMatch(/^originals\//);
    expect(res.body.thumbPath).toMatch(/^thumbs\/.+\.webp$/);
    expect(res.body.mediumPath).toMatch(/^medium\/.+\.webp$/);

    await request(app.getHttpServer())
      .get(`/api/v1/uploads/files/${res.body.thumbPath}`)
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/v1/media/assets/${res.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
