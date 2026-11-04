import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { App } from 'supertest/types';
import { PermissionsGuard } from '../src/common/guards/permissions.guard';
import { MatchesController } from '../src/matches/matches.controller';
import { MatchesService } from '../src/matches/matches.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { StatisticsService } from '../src/statistics/statistics.service';

export function isolatedDatabaseUrl() {
  const value = process.env.DATABASE_URL ?? '';
  const parsed = new URL(value);
  if (
    !['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname) ||
    !/test|e2e/i.test(parsed.pathname)
  ) {
    throw new Error('Postava e2e zahtijeva izolovanu lokalnu testnu bazu.');
  }
  return value;
}

/** Minimalni API s isključenim guardom: provjerava postavu, ne autentikaciju. */
export async function createLineupFixture() {
  const prisma = new PrismaService(
    new ConfigService({ databaseUrl: isolatedDatabaseUrl() }),
  );
  const fixture = await Test.createTestingModule({
    controllers: [MatchesController],
    providers: [
      MatchesService,
      { provide: PrismaService, useValue: prisma },
      { provide: StatisticsService, useValue: {} },
    ],
  })
    .overrideGuard(PermissionsGuard)
    .useValue({ canActivate: () => true })
    .compile();
  const app: INestApplication<App> = fixture.createNestApplication();
  app.setGlobalPrefix('api/v1');
  await app.init();
  const service = fixture.get(MatchesService);

  const key = randomUUID();
  const home = await prisma.club.create({
    data: { name: 'Home FE06', slug: `fe06-home-${key}` },
  });
  const away = await prisma.club.create({
    data: { name: 'Away FE06', slug: `fe06-away-${key}` },
  });
  const season = await prisma.season.create({
    data: { name: 'FE06 test', yearStart: 2026, yearEnd: 2027 },
  });
  const competition = await prisma.competition.create({
    data: { name: 'FE06 test', slug: `fe06-${key}` },
  });
  const edition = await prisma.seasonCompetition.create({
    data: { seasonId: season.id, competitionId: competition.id },
  });
  const match = await prisma.match.create({
    data: {
      seasonCompetitionId: edition.id,
      homeClubId: home.id,
      awayClubId: away.id,
      scheduledAt: new Date('2027-01-01'),
    },
  });
  const wing = await prisma.player.create({
    data: {
      firstName: 'Test',
      lastName: 'Wing',
      position: 'FWD',
      clubId: home.id,
    },
  });
  const former = await prisma.player.create({
    data: {
      firstName: 'Test',
      lastName: 'Former',
      position: 'FWD',
      clubId: home.id,
    },
  });
  const reserve = await prisma.player.create({
    data: {
      firstName: 'Test',
      lastName: 'Reserve',
      position: 'MID',
      clubId: home.id,
    },
  });
  const outsider = await prisma.player.create({
    data: { firstName: 'Test', lastName: 'Outsider', clubId: away.id },
  });
  await prisma.clubSquadSlot.createMany({
    data: [
      {
        clubId: home.id,
        slotIndex: 0,
        lineRole: 'GK',
        positionX: 14,
        positionY: 50,
      },
      {
        clubId: home.id,
        slotIndex: 10,
        lineRole: 'FWD',
        positionX: 86,
        positionY: 88,
        playerId: wing.id,
      },
    ],
  });

  return {
    app,
    prisma,
    service,
    matchId: match.id,
    homeId: home.id,
    awayId: away.id,
    wingId: wing.id,
    formerId: former.id,
    reserveId: reserve.id,
    outsiderId: outsider.id,
    async close() {
      await prisma.season.delete({ where: { id: season.id } });
      await prisma.competition.delete({ where: { id: competition.id } });
      await prisma.player.deleteMany({
        where: { id: { in: [wing.id, former.id, reserve.id, outsider.id] } },
      });
      await prisma.club.deleteMany({
        where: { id: { in: [home.id, away.id] } },
      });
      await app.close();
    },
  };
}
