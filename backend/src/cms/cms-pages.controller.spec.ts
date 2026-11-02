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
import { Test } from '@nestjs/testing';
import { CmsPagesController } from './cms-pages.controller';
import { CmsPagesService } from './cms-pages.service';
import type { AuthUser } from '../common/types/auth-user.type';

/**
 * BE-04/P-B04-1 (odobreno): CMS `?admin=1` flag MORA imati prijavljenog
 * korisnika (tiha autorizacija) — anon `?admin=1` se ponaša kao da ne postoji.
 */
describe('CmsPagesController — admin flag (BE-04)', () => {
  let controller: CmsPagesController;
  const pagesMock = { findAll: jest.fn(), findBySlug: jest.fn() };
  const admin = { id: 'a1', email: 'a@b.ba', permissions: [] } as AuthUser;

  beforeEach(async () => {
    jest.clearAllMocks();
    pagesMock.findAll.mockResolvedValue([]);
    pagesMock.findBySlug.mockResolvedValue({});
    const module = await Test.createTestingModule({
      controllers: [CmsPagesController],
      providers: [{ provide: CmsPagesService, useValue: pagesMock }],
    }).compile();
    controller = module.get(CmsPagesController);
  });

  it('anon + ?admin=1 → findAll(false) (flag ignorisan — draftovi ostaju skriveni)', async () => {
    await controller.findAll(undefined, '1');

    expect(pagesMock.findAll).toHaveBeenCalledWith(false);
  });

  it('prijavljen + ?admin=1 → findAll(true) (admin panel radi netaknuto)', async () => {
    await controller.findAll(admin, '1');

    expect(pagesMock.findAll).toHaveBeenCalledWith(true);
  });

  it('anon slug detalj + ?admin=1 → findBySlug(false)', async () => {
    await controller.findBySlug(undefined, 'o-nama', '1');

    expect(pagesMock.findBySlug).toHaveBeenCalledWith('o-nama', false);
  });

  it('prijavljen slug detalj + ?admin=1 → findBySlug(true)', async () => {
    await controller.findBySlug(admin, 'o-nama', '1');

    expect(pagesMock.findBySlug).toHaveBeenCalledWith('o-nama', true);
  });
});
