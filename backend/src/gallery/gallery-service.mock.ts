/**
 * Mock-ovi za `gallery.service` specove (BE-09b/P-B09b-13).
 */
import type { PrismaService } from '../prisma/prisma.service';
import { GalleryService } from './gallery.service';

export type Mock = jest.Mock;

export interface MockPrisma {
  gallery: {
    findUnique: Mock;
    findMany: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
  };
  galleryPhoto: {
    findUnique: Mock;
    findMany: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
    aggregate: Mock;
  };
  $transaction: Mock & ((arg: unknown) => Promise<unknown>);
}

export function makePrisma(): MockPrisma {
  const prisma: MockPrisma = {
    gallery: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    galleryPhoto: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
    },
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
  return new GalleryService(prisma as unknown as PrismaService);
}

export const GALLERY = {
  id: 'g1',
  title: 'Kup utakmica',
  slug: 'kup-utakmica',
  description: null,
  status: 'DRAFT',
};
