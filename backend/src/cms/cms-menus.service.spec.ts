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
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { CmsMenusService, type MenuItemInput } from './cms-menus.service';

/**
 * BE-09b/P-B09b-2: `saveItems` je jedna transakcija, `parentId` se validira
 * (self-reference, ciklus, tuđi/nepostojeći roditelj) i ID koji ne pripada
 * meniju se odbija umjesto da tiho napravi duplikat.
 */
describe('CmsMenusService.saveItems (BE-09b / P-B09b-2)', () => {
  const MENU = { id: 'm1', key: 'main' };
  const SYS = {
    id: 'sys',
    menuId: 'm1',
    label: 'Početna',
    isSystem: true,
    parentId: null,
  };
  const A = {
    id: 'a',
    menuId: 'm1',
    label: 'Klub',
    isSystem: false,
    parentId: null,
  };
  const B = {
    id: 'b',
    menuId: 'm1',
    label: 'Historija',
    isSystem: false,
    parentId: 'a',
  };

  const prismaMock = () => {
    const prisma = {
      cmsMenu: { findUnique: jest.fn().mockResolvedValue(MENU) },
      cmsMenuItem: {
        findMany: jest.fn().mockResolvedValue([SYS, A, B]),
        findUnique: jest.fn().mockResolvedValue(MENU),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        update: jest.fn().mockResolvedValue({}),
        create: jest.fn().mockResolvedValue({}),
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
    new CmsMenusService(prisma as unknown as PrismaService);

  const items = (list: MenuItemInput[]) => list;

  it('sve upise radi unutar $transaction (prije: N sekvencijalnih upisa)', async () => {
    const prisma = prismaMock();

    await svc(prisma).saveItems(
      'main',
      items([
        { id: 'sys', label: 'Početna', sortOrder: 0 },
        { id: 'a', label: 'Klub', sortOrder: 1 },
        { label: 'Kontakt', sortOrder: 2 },
      ]),
    );

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.cmsMenuItem.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        menuId: 'm1',
        label: 'Kontakt',
      }) as unknown,
    });
  });

  it('odbija stavku koja je sama sebi roditelj (400)', async () => {
    const prisma = prismaMock();
    await expect(
      svc(prisma).saveItems('main', [
        { id: 'sys', label: 'Početna', sortOrder: 0 },
        { id: 'a', label: 'Klub', sortOrder: 1, parentId: 'a' },
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('odbija nepostojećeg roditelja (400) — prije P2003 → 500', async () => {
    const prisma = prismaMock();
    await expect(
      svc(prisma).saveItems('main', [
        { id: 'sys', label: 'Početna', sortOrder: 0 },
        { id: 'a', label: 'Klub', sortOrder: 1, parentId: 'tudji' },
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('odbija ciklus a → b → a (400)', async () => {
    const prisma = prismaMock();
    await expect(
      svc(prisma).saveItems('main', [
        { id: 'sys', label: 'Početna', sortOrder: 0 },
        { id: 'a', label: 'Klub', sortOrder: 1, parentId: 'b' },
        { id: 'b', label: 'Historija', sortOrder: 2, parentId: 'a' },
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('odbija ID koji ne pripada meniju (400) — prije tihi duplikat', async () => {
    const prisma = prismaMock();
    await expect(
      svc(prisma).saveItems('main', [
        { id: 'sys', label: 'Početna', sortOrder: 0 },
        { id: 'iz-drugog-menija', label: 'X', sortOrder: 1 },
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.cmsMenuItem.create).not.toHaveBeenCalled();
  });

  it('sistemska stavka se ne može izostaviti (403)', async () => {
    const prisma = prismaMock();
    await expect(
      svc(prisma).saveItems('main', [{ id: 'a', label: 'Klub', sortOrder: 0 }]),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('validan parentId na postojeću stavku prolazi', async () => {
    const prisma = prismaMock();
    await svc(prisma).saveItems('main', [
      { id: 'sys', label: 'Početna', sortOrder: 0 },
      { id: 'a', label: 'Klub', sortOrder: 1 },
      { id: 'b', label: 'Historija', sortOrder: 2, parentId: 'a' },
    ]);
    const calls = prisma.cmsMenuItem.update.mock.calls as Array<
      [{ where: { id: string }; data: { parentId: string | null } }]
    >;
    expect(calls.map((c) => c[0].where.id)).toEqual(['sys', 'a', 'b']);
    expect(calls[2]?.[0].data.parentId).toBe('a');
  });

  it('briše samo nestale NE-sistemske stavke', async () => {
    const prisma = prismaMock();
    await svc(prisma).saveItems('main', [
      { id: 'sys', label: 'Početna', sortOrder: 0 },
      { id: 'a', label: 'Klub', sortOrder: 1 },
    ]);
    expect(prisma.cmsMenuItem.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['b'] }, isSystem: false },
    });
  });

  it('nepoznat meni → 404', async () => {
    const prisma = prismaMock();
    prisma.cmsMenu.findUnique.mockResolvedValue(null);
    await expect(svc(prisma).saveItems('nema', [])).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
