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
import { BadRequestException, ConflictException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { NewsCategoriesService } from './news-categories.service';

/**
 * BE-09b/P-B09b-7: duplikat sluga je 409 (prije: P2002 → 500), eksplicitni
 * slug se trimuje, a promjena imena NE mijenja slug (stabilni URL-ovi).
 */
describe('NewsCategoriesService (BE-09b / P-B09b-7)', () => {
  const CATEGORY = { id: 'c1', name: 'Prva liga', slug: 'prva-liga' };
  const uniqueError = Object.assign(new Error('unique'), { code: 'P2002' });

  const prismaMock = () => ({
    newsCategory: {
      findUnique: jest.fn().mockResolvedValue(CATEGORY),
      create: jest.fn().mockResolvedValue(CATEGORY),
      update: jest.fn().mockResolvedValue(CATEGORY),
      delete: jest.fn().mockResolvedValue(CATEGORY),
    },
  });

  const svc = (prisma: ReturnType<typeof prismaMock>) =>
    new NewsCategoriesService(prisma as unknown as PrismaService);

  it('create generiše slug iz imena', async () => {
    const prisma = prismaMock();
    await svc(prisma).create({ name: 'Kup BiH' });

    expect(prisma.newsCategory.create).toHaveBeenCalledWith({
      data: { name: 'Kup BiH', slug: 'kup-bih' },
    });
  });

  it('create sa zauzetim slugom → 409 (prije 500)', async () => {
    const prisma = prismaMock();
    prisma.newsCategory.create.mockRejectedValue(uniqueError);

    await expect(
      svc(prisma).create({ name: 'Prva liga' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('create propagira ostale greške netaknute', async () => {
    const prisma = prismaMock();
    prisma.newsCategory.create.mockRejectedValue(new Error('veza pala'));

    await expect(svc(prisma).create({ name: 'X liga' })).rejects.toThrow(
      'veza pala',
    );
  });

  it('update sa duplikatom sluga → 409', async () => {
    const prisma = prismaMock();
    prisma.newsCategory.update.mockRejectedValue(uniqueError);

    await expect(
      svc(prisma).update('c1', { slug: 'zauzet-slug' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('update trimuje eksplicitni slug', async () => {
    const prisma = prismaMock();
    await svc(prisma).update('c1', { slug: '  novi-slug  ' });

    expect(prisma.newsCategory.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { slug: 'novi-slug' },
    });
  });

  it('update sa praznim slugom → 400', async () => {
    const prisma = prismaMock();
    await expect(
      svc(prisma).update('c1', { slug: '   ' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.newsCategory.update).not.toHaveBeenCalled();
  });

  it('promjena imena ne mijenja slug (stabilni URL-ovi)', async () => {
    const prisma = prismaMock();
    await svc(prisma).update('c1', { name: 'Novo ime' });

    expect(prisma.newsCategory.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { name: 'Novo ime' },
    });
  });

  it('update bez polja ne piše u bazu', async () => {
    const prisma = prismaMock();
    await svc(prisma).update('c1', {});

    expect(prisma.newsCategory.update).not.toHaveBeenCalled();
  });
});
