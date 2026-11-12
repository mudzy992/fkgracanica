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
import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { CmsPagesService } from './cms-pages.service';

/**
 * BE-09b/P-B09b-3 + P-B09b-6: reorder sekcija je scoped na stranicu (prije je
 * `where: { id }` dopuštao prepisivanje sekcija tuđe stranice), a neispravna
 * widget konfiguracija je 400 (prije 403).
 */
describe('CmsPagesService — reorder scoping i widget validacija (BE-09b)', () => {
  const PAGE = { id: 'p1', title: 'O nama', status: 'DRAFT', sections: [] };

  const prismaMock = () => {
    const prisma = {
      cmsPage: {
        findUnique: jest.fn().mockResolvedValue(PAGE),
        update: jest.fn().mockResolvedValue({}),
      },
      cmsPageSection: {
        findMany: jest.fn().mockResolvedValue([{ id: 's1' }, { id: 's2' }]),
        findFirst: jest
          .fn()
          .mockResolvedValue({ id: 's1', widgetType: 'hero' }),
        aggregate: jest.fn().mockResolvedValue({ _max: { sortOrder: 1 } }),
        create: jest.fn().mockResolvedValue({ id: 's9' }),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn(),
    };
    prisma.$transaction.mockImplementation(async (arg: unknown) =>
      typeof arg === 'function'
        ? (arg as (tx: unknown) => Promise<unknown>)(prisma)
        : Promise.all(arg as Promise<unknown>[]),
    );
    return prisma;
  };

  const svc = (prisma: ReturnType<typeof prismaMock>) =>
    new CmsPagesService(prisma as unknown as PrismaService);

  it('reorder provjerava vlasništvo sekcija upitom scoped na pageId', async () => {
    const prisma = prismaMock();

    await svc(prisma).reorderSections('p1', ['s2', 's1']);

    expect(prisma.cmsPageSection.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['s2', 's1'] }, pageId: 'p1' },
      select: { id: true },
    });
    const calls = prisma.cmsPageSection.update.mock.calls as [
      [{ where: { id: string; pageId: string }; data: { sortOrder: number } }],
    ];
    expect(calls.map((c) => c[0].where)).toEqual([
      { id: 's2', pageId: 'p1' },
      { id: 's1', pageId: 'p1' },
    ]);
  });

  it('reorder sa sekcijom tuđe stranice → 400 (prije: tiho prepisano)', async () => {
    const prisma = prismaMock();
    prisma.cmsPageSection.findMany.mockResolvedValue([{ id: 's1' }]);

    await expect(
      svc(prisma).reorderSections('p1', ['s1', 'tudja']),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.cmsPageSection.update).not.toHaveBeenCalled();
  });

  it('addSection sa neispravnom konfiguracijom → 400 (prije 403)', async () => {
    const prisma = prismaMock();

    await expect(
      svc(prisma).addSection('p1', {
        widgetType: 'hero',
        config: { title: ' ' },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.cmsPageSection.create).not.toHaveBeenCalled();
  });

  it('addSection sa nepoznatim widgetom → 400', async () => {
    const prisma = prismaMock();

    await expect(
      svc(prisma).addSection('p1', { widgetType: 'nepostojeci', config: {} }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updateSection sa config koji nije objekat → 400 (prije tiho {})', async () => {
    const prisma = prismaMock();

    await expect(
      svc(prisma).updateSection('p1', 's1', {
        widgetType: 'news-feed',
        config: 'nije-objekat',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.cmsPageSection.update).not.toHaveBeenCalled();
  });

  it('addSection sa ispravnom konfiguracijom prolazi i dobija sortOrder', async () => {
    const prisma = prismaMock();

    await svc(prisma).addSection('p1', {
      widgetType: 'hero',
      config: { title: 'Dobrodošli' },
    });

    expect(prisma.cmsPageSection.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        pageId: 'p1',
        widgetType: 'hero',
        sortOrder: 2,
      }) as unknown,
    });
  });
});
