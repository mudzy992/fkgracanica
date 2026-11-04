import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { createLineupFixture } from './lineup-e2e-fixture';

describe('FE-06 zaštita postave pri promjeni klubova', () => {
  let f: Awaited<ReturnType<typeof createLineupFixture>>;
  let replacementId: string;
  beforeEach(async () => {
    f = await createLineupFixture();
    const replacement = await f.prisma.club.create({
      data: {
        name: 'Zamjenski testni klub',
        slug: `fe06-replacement-${randomUUID()}`,
      },
    });
    replacementId = replacement.id;
  });
  afterEach(async () => {
    if (!f) return;
    await f.prisma.match.update({
      where: { id: f.matchId },
      data: { homeClubId: f.homeId, awayClubId: f.awayId },
    });
    if (replacementId)
      await f.prisma.club.delete({ where: { id: replacementId } });
    await f.close();
  });

  it('blokira napuštanje kluba s redovima i štiti već neusaglašene redove; dozvoljava povratak', async () => {
    const { app, prisma, matchId, homeId, awayId, wingId } = f;
    const api = request(app.getHttpServer());
    const path = `/api/v1/matches/${matchId}`;
    await api
      .put(`${path}/lineup`)
      .send({
        slots: [
          { playerId: wingId, clubId: homeId, positionX: 75, positionY: 28 },
        ],
      })
      .expect(200);
    const saved = await prisma.matchLineup.findMany({
      where: { matchId },
      orderBy: { id: 'asc' },
    });
    await api.patch(path).send({ homeClubId: replacementId }).expect(409);
    expect(
      (await prisma.match.findUniqueOrThrow({ where: { id: matchId } }))
        .homeClubId,
    ).toBe(homeId);
    expect(await prisma.matchLineup.count({ where: { matchId } })).toBe(1);

    // Drugi klub se može promijeniti ako time nijedan spremljeni red ne postaje neskladan.
    await api.patch(path).send({ awayClubId: replacementId }).expect(200);
    await prisma.match.update({
      where: { id: matchId },
      data: { homeClubId: replacementId, awayClubId: awayId },
    });
    await api.put(`${path}/lineup`).send({ slots: [] }).expect(409);
    expect(
      await prisma.matchLineup.findMany({
        where: { matchId },
        orderBy: { id: 'asc' },
      }),
    ).toEqual(saved);
    expect(
      (await prisma.match.findUniqueOrThrow({ where: { id: matchId } }))
        .lineupConfigured,
    ).toBe(true);
    await api.patch(path).send({ homeClubId: homeId }).expect(200);
    await api.put(`${path}/lineup`).send({ slots: [] }).expect(200);
    expect(await prisma.matchLineup.count({ where: { matchId } })).toBe(0);
  });

  it('provjerava oba kluba, dozvoljava popravak i zamjenu strana bez gubitka redova', async () => {
    const { app, prisma, matchId, homeId, awayId, wingId, outsiderId } = f;
    const api = request(app.getHttpServer());
    const path = `/api/v1/matches/${matchId}`;
    await api
      .put(`${path}/lineup`)
      .send({
        slots: [
          { playerId: wingId, clubId: homeId },
          { playerId: outsiderId, clubId: awayId },
        ],
      })
      .expect(200);
    const saved = await prisma.matchLineup.findMany({
      where: { matchId },
      orderBy: { id: 'asc' },
    });
    await prisma.match.update({
      where: { id: matchId },
      data: { homeClubId: replacementId },
    });
    await api.patch(path).send({ venue: 'Novo mjesto' }).expect(200);
    // Jedan vraćeni klub nije dovoljan ako bi drugi spremljeni klub ispao.
    await api.patch(path).send({ awayClubId: homeId }).expect(409);
    await api.patch(path).send({ homeClubId: homeId }).expect(200);
    await api
      .patch(path)
      .send({ homeClubId: awayId, awayClubId: homeId })
      .expect(200);
    await api.patch(path).send({ awayClubId: replacementId }).expect(409);
    expect(
      await prisma.matchLineup.findMany({
        where: { matchId },
        orderBy: { id: 'asc' },
      }),
    ).toEqual(saved);
  });

  it('istovremena promjena kluba i spremanje ne mogu proizvesti nesklad', async () => {
    const { app, prisma, matchId, homeId, awayId, wingId } = f;
    const api = request(app.getHttpServer());
    const path = `/api/v1/matches/${matchId}`;
    for (let i = 0; i < 6; i += 1) {
      await prisma.matchLineup.deleteMany({ where: { matchId } });
      await prisma.match.update({
        where: { id: matchId },
        data: {
          homeClubId: homeId,
          awayClubId: awayId,
          lineupConfigured: false,
        },
      });
      const [patch, put] = await Promise.all([
        api.patch(path).send({ homeClubId: replacementId }),
        api
          .put(`${path}/lineup`)
          .send({ slots: [{ playerId: wingId, clubId: homeId }] }),
      ]);
      const match = await prisma.match.findUniqueOrThrow({
        where: { id: matchId },
        include: { lineup: true },
      });
      expect(
        match.lineup.every((row) =>
          [match.homeClubId, match.awayClubId].includes(row.clubId),
        ),
      ).toBe(true);
      if (patch.status === 200) {
        expect(put.status).toBe(400);
        expect(match.lineup).toHaveLength(0);
      } else {
        expect(patch.status).toBe(409);
        expect(put.status).toBe(200);
        expect(match.lineup).toHaveLength(1);
      }
    }
  });
});
