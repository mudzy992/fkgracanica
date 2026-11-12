import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { createLineupFixture } from './lineup-e2e-fixture';

describe('završena utakmica sa starim klubom postave', () => {
  it('čuva redove, ali postojeća zabrana uređivanja onemogućava povrat kluba', async () => {
    const f = await createLineupFixture();
    const replacement = await f.prisma.club.create({
      data: { name: 'Finished test', slug: `fe06-finished-${randomUUID()}` },
    });
    try {
      const api = request(f.app.getHttpServer());
      const path = `/api/v1/matches/${f.matchId}`;
      await api
        .put(`${path}/lineup`)
        .send({ slots: [{ playerId: f.wingId, clubId: f.homeId }] })
        .expect(200);
      // Naslijeđeno stanje, stvoreno isključivo u izolovanoj testnoj bazi.
      await f.prisma.match.update({
        where: { id: f.matchId },
        data: { homeClubId: replacement.id, status: 'FINISHED' },
      });
      const response = await api
        .patch(path)
        .send({ homeClubId: f.homeId })
        .expect(400);
      expect(response.body.message).toContain(
        'Završena utakmica se ne može uređivati',
      );
      await api.put(`${path}/lineup`).send({ slots: [] }).expect(409);
      expect(
        await f.prisma.matchLineup.count({ where: { matchId: f.matchId } }),
      ).toBe(1);
      await f.prisma.match.update({
        where: { id: f.matchId },
        data: { reportStatus: 'APPROVED' },
      });
      await api.patch(path).send({ homeClubId: f.homeId }).expect(400);
      await api.put(`${path}/lineup`).send({ slots: [] }).expect(400);
      expect(
        await f.prisma.matchLineup.count({ where: { matchId: f.matchId } }),
      ).toBe(1);
    } finally {
      await f.prisma.match.update({
        where: { id: f.matchId },
        data: { homeClubId: f.homeId },
      });
      await f.prisma.club.delete({ where: { id: replacement.id } });
      await f.close();
    }
  });
});
