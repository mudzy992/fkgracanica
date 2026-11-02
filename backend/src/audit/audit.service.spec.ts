jest.mock('@prisma/client', () => {
  const makeSentinel = (): unknown => {
    const target: Record<string, unknown> = {};
    return new Proxy(target, {
      get: (t, prop) => {
        if (prop === 'PrismaClient') return class PrismaClientMock {};
        if (prop === 'then') return undefined;
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
import { Test } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * BE-03: unit testovi AuditService — filteri + paginacija + actor join.
 * (Validacija datuma from/to je OTVORENI predlog P-B03-1 — ne testira se
 * dok ne prođe odobrenje jer mijenja status kod greške.)
 */
describe('AuditService (BE-03)', () => {
  let service: AuditService;
  const auditLogMock = {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    auditLogMock.findMany.mockResolvedValue([{ id: 'a1' }, { id: 'a2' }]);
    auditLogMock.count.mockResolvedValue(42);
    const module = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: { auditLog: auditLogMock } },
      ],
    }).compile();
    service = module.get(AuditService);
  });

  it('findAll: gradi where iz filtera + orderBy desc + actor join', async () => {
    const result = await service.findAll({
      action: 'auth.login',
      actorId: 'user-1',
      entity: 'User',
      page: 1,
      limit: 20,
    });

    expect(auditLogMock.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { action: 'auth.login', actorId: 'user-1', entity: 'User' },
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { id: true, email: true } } },
      }),
    );
    expect(result.data).toEqual([{ id: 'a1' }, { id: 'a2' }]);
    expect(auditLogMock.count).toHaveBeenCalledWith({
      where: { action: 'auth.login', actorId: 'user-1', entity: 'User' },
    });
  });

  it('findAll: from/to → createdAt gte/lte (Date konverzija)', async () => {
    const from = '2026-11-01T00:00:00.000Z';
    const to = '2026-11-02T23:59:59.999Z';

    await service.findAll({ from, to, page: 1, limit: 20 });

    expect(auditLogMock.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          createdAt: { gte: new Date(from), lte: new Date(to) },
        },
      }),
    );
  });

  it('findAll: bez filtera → prazan where; paginacija page=2/limit=10 → skip=10', async () => {
    await service.findAll({ page: 2, limit: 10 });

    expect(auditLogMock.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {}, skip: 10, take: 10 }),
    );
  });

  it('log: prosljeđuje input neizmijenjen (Prisma create)', async () => {
    await service.log({ action: 'x.y', actorId: 'u1', ipAddress: '1.2.3.4' });

    expect(auditLogMock.create).toHaveBeenCalledWith({
      data: { action: 'x.y', actorId: 'u1', ipAddress: '1.2.3.4' },
    });
  });
});
