import request from 'supertest';
import { createLineupFixture } from './lineup-e2e-fixture';

describe('FE-06 API postave i transakcija (izolovana baza)', () => {
  let f: Awaited<ReturnType<typeof createLineupFixture>>;
  beforeAll(async () => {
    f = await createLineupFixture();
  });
  afterAll(async () => {
    if (f) await f.close();
  });

  it('predložak → spremljena postava → transfer → rollback → namjerno prazno', async () => {
    const {
      app,
      prisma,
      service,
      matchId,
      homeId,
      awayId,
      wingId,
      formerId,
      reserveId,
      outsiderId,
    } = f;
    const api = request(app.getHttpServer());
    const path = `/api/v1/matches/${matchId}`;
    const initial = await api.get(path).expect(200);
    expect(initial.body.lineupConfigured).toBe(false);
    expect(initial.body.lineup).toEqual([
      expect.objectContaining({
        playerId: wingId,
        positionX: 75,
        positionY: 28,
        id: `squad-default-${homeId}-10`,
      }),
    ]);
    await expect(
      service.setLineup(matchId, [
        {
          playerId: wingId,
          clubId: homeId,
          positionX: 'bad' as unknown as number,
        },
      ]),
    ).rejects.toThrow();
    expect(
      (await prisma.match.findUniqueOrThrow({ where: { id: matchId } }))
        .lineupConfigured,
    ).toBe(false);
    expect(await prisma.matchLineup.count({ where: { matchId } })).toBe(0);

    const saved = [
      {
        playerId: formerId,
        clubId: homeId,
        positionX: 71,
        positionY: 25,
        isStarter: true,
      },
      { playerId: reserveId, clubId: homeId, isStarter: false },
    ];
    await api.put(`${path}/lineup`).send({ slots: saved }).expect(200);
    let detail = await api.get(path).expect(200);
    expect(detail.body.lineupConfigured).toBe(true);
    expect(detail.body.lineup).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          playerId: formerId,
          positionX: 71,
          positionY: 25,
          isStarter: true,
        }),
        expect.objectContaining({ playerId: reserveId, isStarter: false }),
      ]),
    );
    expect(detail.body.lineup).toHaveLength(2);

    // Stari klijent može upisati red bez ažuriranja novog flaga: red je i dalje autoritativan.
    await prisma.match.update({
      where: { id: matchId },
      data: { lineupConfigured: false },
    });
    detail = await api.get(path).expect(200);
    expect(detail.body.lineupConfigured).toBe(true);
    expect(detail.body.lineup).toHaveLength(2);
    await prisma.player.update({
      where: { id: formerId },
      data: { clubId: awayId },
    });
    await api.put(`${path}/lineup`).send({ slots: saved }).expect(200);
    await api
      .put(`${path}/lineup`)
      .send({ slots: [...saved, { playerId: outsiderId, clubId: homeId }] })
      .expect(400);
    await api
      .put(`${path}/lineup`)
      .send({ slots: [saved[0], saved[0]] })
      .expect(400);
    await expect(
      service.setLineup(matchId, [
        {
          playerId: wingId,
          clubId: homeId,
          positionX: 'bad' as unknown as number,
        },
      ]),
    ).rejects.toThrow();
    detail = await api.get(path).expect(200);
    expect(detail.body.lineupConfigured).toBe(true);
    expect(detail.body.lineup).toHaveLength(2);
    expect(detail.body.lineup).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ playerId: formerId, positionX: 71 }),
      ]),
    );

    await api.put(`${path}/lineup`).send({ slots: [] }).expect(200);
    detail = await api.get(path).expect(200);
    expect(detail.body.lineupConfigured).toBe(true);
    expect(detail.body.lineup).toEqual([]);
    expect(await prisma.matchLineup.count({ where: { matchId } })).toBe(0);
    expect(
      (await prisma.match.findUniqueOrThrow({ where: { id: matchId } }))
        .lineupConfigured,
    ).toBe(true);
  });
});
