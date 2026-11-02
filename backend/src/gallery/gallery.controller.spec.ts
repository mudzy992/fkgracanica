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
import { ContentStatus } from '@prisma/client';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import type { AuthUser } from '../common/types/auth-user.type';

/**
 * BE-04/P-B04-1 (odobreno): gallery lista — anon (portal home, mobile home)
 * uvijek PUBLISHED; prijavljeni (moderacija PENDING, admin sve) bez izmjena.
 */
describe('GalleryController — javno vs prijavljeno (BE-04)', () => {
  let controller: GalleryController;
  const galleryMock = { findAll: jest.fn(), findBySlug: jest.fn() };
  const moderator = { id: 'm1', email: 'm@b.ba', permissions: [] } as AuthUser;

  beforeEach(async () => {
    jest.clearAllMocks();
    galleryMock.findAll.mockResolvedValue([]);
    const module = await Test.createTestingModule({
      controllers: [GalleryController],
      providers: [{ provide: GalleryService, useValue: galleryMock }],
    }).compile();
    controller = module.get(GalleryController);
  });

  it('anon BARE poziv (mobile home) → PUBLISHED (prije je vraćao i draftove)', async () => {
    await controller.findAll(undefined, undefined);

    expect(galleryMock.findAll).toHaveBeenCalledWith(ContentStatus.PUBLISHED);
  });

  it('anon + ?status=DRAFT → parametar ignorisan → PUBLISHED', async () => {
    await controller.findAll(undefined, 'DRAFT');

    expect(galleryMock.findAll).toHaveBeenCalledWith(ContentStatus.PUBLISHED);
  });

  it('prijavljen moderator: ?status=PENDING prolazi (moderacioni queue)', async () => {
    await controller.findAll(moderator, 'PENDING');

    expect(galleryMock.findAll).toHaveBeenCalledWith('PENDING');
  });

  it('prijavljen admin bez statusa → sve (parity ranijeg ponašanja)', async () => {
    await controller.findAll(moderator, undefined);

    expect(galleryMock.findAll).toHaveBeenCalledWith(undefined);
  });
});
