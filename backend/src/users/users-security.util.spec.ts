import { BadRequestException, ConflictException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import {
  assertEmailAvailable,
  assertRoleIdsExist,
  ensureNotLastAdmin,
  ensureNotSelf,
  ensureNotSelfAdminRemoval,
  ensureNotSelfDeactivate,
} from './users-security.util';

function prismaStub(overrides: Record<string, unknown> = {}) {
  return {
    role: { findUnique: jest.fn().mockResolvedValue({ id: 'admin' }) },
    userRole: { findFirst: jest.fn(), count: jest.fn() },
    user: { findUnique: jest.fn() },
    ...overrides,
  } as unknown as PrismaService;
}

describe('users-security.util (BE-09 / P-B09-2, P-B09-8)', () => {
  describe('assertEmailAvailable', () => {
    it('propušta slobodan email', async () => {
      const prisma = prismaStub({
        user: { findUnique: jest.fn().mockResolvedValue(null) },
      });
      await expect(
        assertEmailAvailable(prisma, 'novi@fk.ba', 'u1'),
      ).resolves.toBeUndefined();
    });

    it('propušta isti email istog korisnika', async () => {
      const prisma = prismaStub({
        user: { findUnique: jest.fn().mockResolvedValue({ id: 'u1' }) },
      });
      await expect(
        assertEmailAvailable(prisma, 'isti@fk.ba', 'u1'),
      ).resolves.toBeUndefined();
    });

    it('409 kad email pripada drugom korisniku', async () => {
      const prisma = prismaStub({
        user: { findUnique: jest.fn().mockResolvedValue({ id: 'u2' }) },
      });
      await expect(
        assertEmailAvailable(prisma, 'zauzet@fk.ba', 'u1'),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('assertRoleIdsExist', () => {
    it('propušta sve postojeće role (i deduplikuje)', async () => {
      const findMany = jest
        .fn()
        .mockResolvedValue([{ id: 'r1' }, { id: 'r2' }]);
      const prisma = prismaStub({ role: { findMany } });
      await expect(
        assertRoleIdsExist(prisma, ['r1', 'r2', 'r1']),
      ).resolves.toBeUndefined();
      expect(findMany).toHaveBeenCalledWith({
        where: { id: { in: ['r1', 'r2'] } },
        select: { id: true },
      });
    });

    it('400 kad neka rola ne postoji', async () => {
      const prisma = prismaStub({
        role: { findMany: jest.fn().mockResolvedValue([{ id: 'r1' }]) },
      });
      await expect(
        assertRoleIdsExist(prisma, ['r1', 'nepostojeca']),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('invarijante admina', () => {
    it('ensureNotLastAdmin propušta kad korisnik nije admin', async () => {
      const prisma = prismaStub({
        userRole: {
          findFirst: jest.fn().mockResolvedValue(null),
          count: jest.fn(),
        },
      });
      await expect(ensureNotLastAdmin(prisma, 'u1')).resolves.toBeUndefined();
    });

    it('ensureNotLastAdmin blokira uklanjanje zadnjeg admina', async () => {
      const prisma = prismaStub({
        userRole: {
          findFirst: jest.fn().mockResolvedValue({ id: 'x' }),
          count: jest.fn().mockResolvedValue(1),
        },
      });
      await expect(ensureNotLastAdmin(prisma, 'u1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('ensureNotLastAdmin propušta kad postoji više admina', async () => {
      const prisma = prismaStub({
        userRole: {
          findFirst: jest.fn().mockResolvedValue({ id: 'x' }),
          count: jest.fn().mockResolvedValue(2),
        },
      });
      await expect(ensureNotLastAdmin(prisma, 'u1')).resolves.toBeUndefined();
    });

    it('ensureNotLastAdmin ne pada kad Administrator rola ne postoji', async () => {
      const prisma = prismaStub({
        role: { findUnique: jest.fn().mockResolvedValue(null) },
      });
      await expect(ensureNotLastAdmin(prisma, 'u1')).resolves.toBeUndefined();
    });

    it('ensureNotSelf blokira brisanje vlastitog računa', () => {
      expect(() => ensureNotSelf('u1', 'u1', 'Ne možete')).toThrow(
        BadRequestException,
      );
      expect(() => ensureNotSelf('u1', 'u2', 'Ne možete')).not.toThrow();
    });

    it('ensureNotSelfDeactivate blokira samo samodeaktivaciju', () => {
      expect(() => ensureNotSelfDeactivate('u1', 'u1', false)).toThrow(
        BadRequestException,
      );
      expect(() => ensureNotSelfDeactivate('u1', 'u2', false)).not.toThrow();
      expect(() => ensureNotSelfDeactivate('u1', 'u1', true)).not.toThrow();
    });

    it('ensureNotSelfAdminRemoval blokira samo skidanje vlastite admin role', () => {
      expect(() => ensureNotSelfAdminRemoval('u1', 'u1', true, false)).toThrow(
        BadRequestException,
      );
      expect(() =>
        ensureNotSelfAdminRemoval('u1', 'u2', true, false),
      ).not.toThrow();
    });
  });
});
