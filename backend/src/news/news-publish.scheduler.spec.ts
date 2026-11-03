jest.mock('@prisma/client', () => {
  const makeSentinel = (): unknown => {
    const target: Record<string, unknown> = {};
    return new Proxy(target, {
      get: (t, prop) => {
        if (prop === 'PrismaClient') return class PrismaClientMock {};
        if (prop === 'then' || prop === 'toJSON') return undefined;
        if (prop === 'toString') return () => '[prisma-mock]';
        if (prop === Symbol.toPrimitive) return () => '[prisma-mock]';
        if (typeof prop === 'symbol') return Reflect.get(t, prop) as unknown;
        if (!(prop in t)) t[prop] = makeSentinel();
        return t[prop];
      },
      has: () => true,
    });
  };
  return makeSentinel();
});
import { Logger } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import type { NotificationsService } from '../notifications/notifications.service';
import { NewsPublishScheduler } from './news-publish.scheduler';

/**
 * BE-09b/P-B09b-4: tick ima try/catch (prije: unhandled rejection iz
 * intervala), overlap guard, uslovni update (ne pregazi adminov DRAFT) i
 * greška jedne vijesti ne prekida batch.
 */
describe('NewsPublishScheduler (BE-09b / P-B09b-4)', () => {
  type Internals = { runSafe(): Promise<void> | null };

  const setup = () => {
    const prisma = {
      news: {
        findMany: jest.fn().mockResolvedValue([]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn(),
      },
    };
    const notifications = { broadcast: jest.fn().mockResolvedValue(undefined) };
    const scheduler = new NewsPublishScheduler(
      prisma as unknown as PrismaService,
      notifications as unknown as NotificationsService,
    );
    const runSafe = () => (scheduler as unknown as Internals).runSafe();
    return { prisma, notifications, scheduler, runSafe };
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('greška baze se loguje i NE izlazi kao unhandled rejection', async () => {
    const { prisma, runSafe } = setup();
    prisma.news.findMany.mockRejectedValue(new Error('DB down'));
    const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    await expect(runSafe()).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('DB down') as unknown,
    );
  });

  it('overlap guard: drugi poziv dok prvi traje ne pokreće novi tick', async () => {
    const { prisma, runSafe } = setup();
    let release: (value: unknown) => void = () => undefined;
    prisma.news.findMany.mockReturnValue(
      new Promise((resolve) => {
        release = resolve;
      }),
    );

    const first = runSafe();
    const second = runSafe();
    release([]);
    await first;
    await second;

    expect(prisma.news.findMany).toHaveBeenCalledTimes(1);
  });

  it('objavljuje samo ako uslovni update pogodi red (count > 0)', async () => {
    const { prisma, notifications, runSafe } = setup();
    prisma.news.findMany.mockResolvedValue([
      { id: 'n1', title: 'Vijest', slug: 'vijest' },
    ]);
    prisma.news.updateMany.mockResolvedValue({ count: 0 });

    await runSafe();

    expect(notifications.broadcast).not.toHaveBeenCalled();
  });

  it('uslovni update sadrži status DRAFT/PENDING (ne pregazi adminovu izmjenu)', async () => {
    const { prisma, runSafe } = setup();
    prisma.news.findMany.mockResolvedValue([
      { id: 'n1', title: 'Vijest', slug: 'vijest' },
    ]);

    await runSafe();

    const calls = prisma.news.updateMany.mock.calls as [
      [{ where: { id: string; status: unknown }; data: unknown }],
    ];
    expect(calls[0][0].where.id).toBe('n1');
    expect(calls[0][0].where.status).toBeDefined();
  });

  it('greška jedne vijesti ne prekida ostale', async () => {
    const { prisma, notifications, runSafe } = setup();
    prisma.news.findMany.mockResolvedValue([
      { id: 'n1', title: 'Prva', slug: 'prva' },
      { id: 'n2', title: 'Druga', slug: 'druga' },
    ]);
    prisma.news.updateMany
      .mockRejectedValueOnce(new Error('constraint'))
      .mockResolvedValueOnce({ count: 1 });
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    await runSafe();

    expect(notifications.broadcast).toHaveBeenCalledTimes(1);
    expect(notifications.broadcast).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/news/druga' }) as unknown,
    );
  });
});
