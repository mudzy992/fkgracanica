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
import { NotFoundException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { CommentsService } from './comments.service';
import type { AuthUser } from '../common/types/auth-user.type';

/**
 * BE-04/P-B04-1 (odobreno): regression testovi DRAFT LEAK zatvaranja —
 * anonimac nikad ne vidi draft/PENDING; prijavljeni (admin paneli) zadržavaju
 * postojeće ponašanje (FE/MOB bez izmjena).
 */
describe('NewsController — javno vs prijavljeno (BE-04)', () => {
  let controller: NewsController;
  const newsMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    isPublished: jest.fn(),
    findPublished: jest.fn(),
  };
  const commentsMock = { findByNews: jest.fn() };
  const admin = { id: 'u1', email: 'a@b.ba', permissions: [] } as AuthUser;

  beforeEach(async () => {
    jest.clearAllMocks();
    newsMock.findAll.mockResolvedValue([]);
    newsMock.isPublished.mockResolvedValue(true);
    const module = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [
        { provide: NewsService, useValue: newsMock },
        { provide: CommentsService, useValue: commentsMock },
      ],
    }).compile();
    controller = module.get(NewsController);
  });

  it('anon LISTA + ?status=DRAFT → servis dobiva PUBLISHED (parametar ignorisan)', async () => {
    await controller.findAll(undefined, 'DRAFT' as ContentStatus);

    expect(newsMock.findAll).toHaveBeenCalledWith(
      ContentStatus.PUBLISHED,
      undefined,
    );
  });

  it('anon LISTA bez statusa (mobile home obrazac) → PUBLISHED', async () => {
    await controller.findAll(undefined, undefined, 'cat-1');

    expect(newsMock.findAll).toHaveBeenCalledWith(
      ContentStatus.PUBLISHED,
      'cat-1',
    );
  });

  it('prijavljen admin: status parametar prolazi nepromijenjen', async () => {
    await controller.findAll(admin, 'DRAFT' as ContentStatus, 'cat-2');

    expect(newsMock.findAll).toHaveBeenCalledWith('DRAFT', 'cat-2');
  });

  it('anon DETALJ drafta → 404 (ne otkriva postojanje)', async () => {
    newsMock.findOne.mockResolvedValue({
      id: 'n1',
      status: ContentStatus.DRAFT,
    });

    await expect(controller.findOne(undefined, 'n1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('anon DETALJ published vijesti → vraća', async () => {
    const item = { id: 'n1', status: ContentStatus.PUBLISHED };
    newsMock.findOne.mockResolvedValue(item);

    await expect(controller.findOne(undefined, 'n1')).resolves.toBe(item);
  });

  it('prijavljen (admin edit) DETALJ drafta → vraća', async () => {
    const item = { id: 'n1', status: ContentStatus.DRAFT };
    newsMock.findOne.mockResolvedValue(item);

    await expect(controller.findOne(admin, 'n1')).resolves.toBe(item);
  });

  it('anon KOMENTARI na nepublished vijest → 404', async () => {
    newsMock.isPublished.mockResolvedValue(false);

    await expect(
      controller.findComments(undefined, 'n1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(commentsMock.findByNews).not.toHaveBeenCalled();
  });

  it('anon KOMENTARI na published vijest → prolazi', async () => {
    await controller.findComments(undefined, 'n1');

    expect(newsMock.isPublished).toHaveBeenCalledWith('n1');
    expect(commentsMock.findByNews).toHaveBeenCalledWith('n1');
  });

  it('prijavljen KOMENTARI → bez isPublished provjere', async () => {
    await controller.findComments(admin, 'n1');

    expect(newsMock.isPublished).not.toHaveBeenCalled();
    expect(commentsMock.findByNews).toHaveBeenCalledWith('n1');
  });
});
