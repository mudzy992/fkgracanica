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
import { ContentStatus } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../common/types/auth-user.type';
import { CommentsService } from './comments.service';

/**
 * BE-09b/P-B09b-8: `content` se validira u servisu (DTO hvata HTTP sloj) —
 * prazan/ne-string komentar ne smije doći do baze.
 */
describe('CommentsService (BE-09b / P-B09b-8)', () => {
  const PUBLISHED = { id: 'n1', status: ContentStatus.PUBLISHED };
  const member = { id: 'u1', email: 'c@fk.ba', permissions: [] } as AuthUser;

  const prismaMock = () => ({
    news: { findUnique: jest.fn().mockResolvedValue(PUBLISHED) },
    membership: { findFirst: jest.fn().mockResolvedValue({ id: 'ms1' }) },
    comment: {
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: 'cm1' }),
      delete: jest.fn().mockResolvedValue({ id: 'cm1' }),
    },
  });

  const svc = (prisma: ReturnType<typeof prismaMock>) =>
    new CommentsService(prisma as unknown as PrismaService);

  it('odbija prazan komentar (400) prije ijednog upita', async () => {
    const prisma = prismaMock();
    await expect(
      svc(prisma).create('n1', member, '   '),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.comment.create).not.toHaveBeenCalled();
  });

  it('odbija ne-string sadržaj (prije TypeError → 500)', async () => {
    const prisma = prismaMock();
    await expect(
      svc(prisma).create('n1', member, { a: 1 } as unknown as string),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('upisuje trimovan sadržaj', async () => {
    const prisma = prismaMock();
    await svc(prisma).create('n1', member, '  Bravo momci!  ');

    expect(prisma.comment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { newsId: 'n1', userId: 'u1', content: 'Bravo momci!' },
      }) as unknown,
    );
  });

  it('neaktivni član ne može komentarisati (403)', async () => {
    const prisma = prismaMock();
    prisma.membership.findFirst.mockResolvedValue(null);

    await expect(
      svc(prisma).create('n1', member, 'Zdravo svima'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('komentar na neobjavljenu vijest → 404', async () => {
    const prisma = prismaMock();
    prisma.news.findUnique.mockResolvedValue({
      id: 'n1',
      status: ContentStatus.DRAFT,
    });

    await expect(
      svc(prisma).create('n1', member, 'Zdravo svima'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('brisanje tuđeg komentara bez news.manage → 403', async () => {
    const prisma = prismaMock();
    prisma.comment.findUnique.mockResolvedValue({ id: 'cm1', userId: 'u2' });

    await expect(svc(prisma).remove('cm1', member)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prisma.comment.delete).not.toHaveBeenCalled();
  });

  it('moderator sa news.manage briše tuđi komentar', async () => {
    const prisma = prismaMock();
    prisma.comment.findUnique.mockResolvedValue({ id: 'cm1', userId: 'u2' });
    const moderator = {
      id: 'm1',
      email: 'm@fk.ba',
      permissions: ['news.manage'],
    } as AuthUser;

    await svc(prisma).remove('cm1', moderator);

    expect(prisma.comment.delete).toHaveBeenCalledWith({
      where: { id: 'cm1' },
    });
  });
});
