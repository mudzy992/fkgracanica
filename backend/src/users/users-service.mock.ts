/**
 * Zajednički mock-ovi za `users.service` specove (BE-09/P-B09-8) — izdvojeni
 * da oba speca ostanu ispod file-size limita od 200 linija.
 */
import type { AuditService } from '../audit/audit.service';
import type { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

export type Mock = jest.Mock;

export interface MockPrisma {
  user: {
    findFirst: Mock;
    findUnique: Mock;
    create: Mock;
    update: Mock;
    count: Mock;
    findMany: Mock;
  };
  userRole: {
    findFirst: Mock;
    count: Mock;
    deleteMany: Mock;
    createMany: Mock;
    findMany: Mock;
  };
  role: { findUnique: Mock; findMany: Mock };
  $transaction: Mock & ((arg: unknown) => Promise<unknown>);
}

export function makePrisma(): MockPrisma {
  const prisma: MockPrisma = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    userRole: {
      findFirst: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn(),
    },
    role: { findUnique: jest.fn(), findMany: jest.fn() },
    $transaction: jest.fn(),
  };
  prisma.$transaction.mockImplementation(async (arg: unknown) =>
    typeof arg === 'function'
      ? (arg as (tx: unknown) => Promise<unknown>)(prisma)
      : Promise.all(arg as Promise<unknown>[]),
  );
  return prisma;
}

export function service(prisma: MockPrisma) {
  const audit = { log: jest.fn().mockResolvedValue(undefined) };
  return {
    svc: new UsersService(
      prisma as unknown as PrismaService,
      audit as unknown as AuditService,
    ),
    audit,
  };
}

export const EXISTING = {
  id: 'u1',
  email: 'stari@fk.ba',
  firstName: 'A',
  lastName: 'B',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  roles: [{ role: { id: 'r1', name: 'Writer' } }],
};

export function setup() {
  const prisma = makePrisma();
  const { svc, audit } = service(prisma);
  prisma.user.findFirst.mockResolvedValue(EXISTING);
  prisma.role.findUnique.mockResolvedValue({
    id: 'admin',
    name: 'Administrator',
  });
  prisma.userRole.findFirst.mockResolvedValue(null);
  return { prisma, audit, svc };
}
