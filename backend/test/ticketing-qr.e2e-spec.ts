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
  // BE-09c: `reserve` traži kategoriju iz podešavanja (labela iz speca
  // „tribina" nije postojala) i domaću utakmicu — oboje čitamo iz API-ja.
  let category: { id: string; label: string };

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
    const list = matches.body as {
      id: string;
      status: string;
      homeClub?: { isOwnClub?: boolean } | null;
    }[];
    if (!list.length) throw new Error('No matches for ticketing e2e');
    const own = list.find(
      (m) => m.status === 'SCHEDULED' && m.homeClub?.isOwnClub === true,
    );
    if (own) {
      matchId = own.id;
    } else {
      // BE-09c: `reserve` traži ZAKAZANU domaću utakmicu; demo seed je nema,
      // pa je kreiramo (domaćin = vlastiti klub).
      const clubs = await request(app.getHttpServer()).get('/api/v1/clubs');
      const clubList = clubs.body as { id: string; isOwnClub?: boolean }[];
      const ownClub = clubList.find((c) => c.isOwnClub === true);
      const rival = clubList.find((c) => c.isOwnClub !== true);
      const seasons = await request(app.getHttpServer()).get('/api/v1/seasons');
      const seasonId = (
        seasons.body as { competitions?: { id: string }[] }[]
      )[0]?.competitions?.[0]?.id;
      if (!ownClub || !rival || !seasonId) {
        throw new Error('Missing clubs/season for ticketing e2e');
      }
      const created = await request(app.getHttpServer())
        .post('/api/v1/matches')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          seasonId,
          homeClubId: ownClub.id,
          awayClubId: rival.id,
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        });
      matchId = (created.body as { id: string }).id;
    }

    const config = await request(app.getHttpServer())
      .get('/api/v1/ticketing/admin/config')
      .set('Authorization', `Bearer ${accessToken}`);
    const categories = config.body.categories as {
      id: string;
      label: string;
      isActive?: boolean;
    }[];
    const active = categories.find((c) => c.isActive !== false);
    if (!active) throw new Error('No active ticket category for e2e');
    category = { id: active.id, label: active.label };
  });

  afterAll(async () => app.close());

  it('reserve → confirm payment → validate QR → reject reuse', async () => {
    const reserved = await request(app.getHttpServer())
      .post('/api/v1/ticketing/reserve')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        matchId,
        category: category.label,
        categoryId: category.id,
        price: 5,
        quantity: 1,
      });

    if (reserved.status !== 201) {
      // FE-06: bez ovoga CI prikazuje samo „Expected 201, received 400" bez
      // razloga iz servisa (npr. nema aktivne utakmice / limit blagajne).
      throw new Error(
        `reserve nije uspio: ${reserved.status} ${JSON.stringify(reserved.body)}`,
      );
    }

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
