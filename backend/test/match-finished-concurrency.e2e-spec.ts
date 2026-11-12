import { randomUUID } from 'node:crypto';
import request from 'supertest';
import type { PrismaService } from '../src/prisma/prisma.service';
import { createLineupFixture } from './lineup-e2e-fixture';

async function waitForBlockedRequest(
  prisma: PrismaService,
  blockerPid: number,
) {
  const deadline = Date.now() + 3_000;
  while (Date.now() < deadline) {
    const [result] = await prisma.$queryRaw<{ waiting: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM pg_stat_activity WHERE ${blockerPid} = ANY(pg_blocking_pids(pid))
      ) AS waiting
    `;
    if (result.waiting) return true;
    await new Promise((resolve) => setTimeout(resolve, 15));
  }
  return false;
}

describe('završetak i istovremeno uređivanje utakmice', () => {
  it.each(['club', 'venue'] as const)(
    'nakon čekanja ponovo provjerava završenu utakmicu (%s)',
    async (field) => {
      const f = await createLineupFixture();
      const replacement = await f.prisma.club.create({
        data: {
          name: 'Concurrent test',
          slug: `fe06-concurrent-${randomUUID()}`,
        },
      });
      let release!: () => void;
      let ready!: (pid: number) => void;
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      const acquired = new Promise<number>((resolve) => {
        ready = resolve;
      });
      const finish = f.prisma.$transaction(
        async (tx) => {
          await tx.$queryRaw`SELECT "id" FROM "Match" WHERE "id" = ${f.matchId} FOR UPDATE`;
          const [{ pid }] = await tx.$queryRaw<
            { pid: number }[]
          >`SELECT pg_backend_pid() AS pid`;
          ready(pid);
          await gate;
          await tx.match.update({
            where: { id: f.matchId },
            data: { status: 'FINISHED' },
          });
        },
        { timeout: 10_000 },
      );

      try {
        const blockerPid = await acquired;
        const pending = request(f.app.getHttpServer())
          .patch(`/api/v1/matches/${f.matchId}`)
          .send(
            field === 'club'
              ? { homeClubId: replacement.id }
              : { venue: 'Nedozvoljena izmjena' },
          )
          .then((response) => response);
        try {
          expect(await waitForBlockedRequest(f.prisma, blockerPid)).toBe(true);
        } finally {
          release();
          await finish;
        }
        const response = await pending;
        expect(response.status).toBe(400);
        expect(response.body.message).toContain('Završena utakmica');
        const match = await f.prisma.match.findUniqueOrThrow({
          where: { id: f.matchId },
        });
        expect(match.status).toBe('FINISHED');
        expect(match.homeClubId).toBe(f.homeId);
        expect(match.venue).toBeNull();
      } finally {
        release();
        await finish;
        await f.prisma.match.update({
          where: { id: f.matchId },
          data: { homeClubId: f.homeId },
        });
        await f.prisma.club.delete({ where: { id: replacement.id } });
        await f.close();
      }
    },
    15_000,
  );
});
