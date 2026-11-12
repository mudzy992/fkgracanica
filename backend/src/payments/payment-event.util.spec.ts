import {
  claimPaymentEvent,
  isUniqueViolation,
  paymentEventKey,
  releasePaymentEvent,
  runPaymentEventOnce,
} from './payment-event.util';
import type { PrismaService } from '../prisma/prisma.service';

type PrismaMock = {
  paymentEvent: { create: jest.Mock; delete: jest.Mock };
};

function prismaMock(): PrismaService {
  return {
    paymentEvent: { create: jest.fn(), delete: jest.fn() },
  } as unknown as PrismaService;
}

describe('payment-event.util (BE-07 / P-B07-2 A)', () => {
  it('builds a key only when externalId exists', () => {
    expect(paymentEventKey('stripe', 'cs_1', 'membership', 'm1')).toEqual({
      provider: 'stripe',
      externalId: 'cs_1',
      kind: 'membership',
      refId: 'm1',
    });
    expect(paymentEventKey('stripe', '', 'tickets', 'o1')).toBeNull();
    expect(paymentEventKey('stripe', null, 'tickets', 'o1')).toBeNull();
  });

  it('detects P2002 only', () => {
    expect(isUniqueViolation({ code: 'P2002' })).toBe(true);
    expect(isUniqueViolation({ code: 'P2025' })).toBe(false);
    expect(isUniqueViolation(new Error('boom'))).toBe(false);
  });

  it('claims once, second claim is denied', async () => {
    const prisma = prismaMock() as unknown as PrismaMock;
    prisma.paymentEvent.create
      .mockResolvedValueOnce({ id: 'e1' })
      .mockRejectedValueOnce({ code: 'P2002' });
    const key = paymentEventKey('stripe', 'cs_1', 'membership', 'm1')!;
    await expect(
      claimPaymentEvent(prisma as unknown as PrismaService, key),
    ).resolves.toBe(true);
    await expect(
      claimPaymentEvent(prisma as unknown as PrismaService, key),
    ).resolves.toBe(false);
  });

  it('runs the work only once per payment (double confirm = one extension)', async () => {
    const prisma = prismaMock() as unknown as PrismaMock;
    prisma.paymentEvent.create
      .mockResolvedValueOnce({ id: 'e1' })
      .mockRejectedValueOnce({ code: 'P2002' });
    const key = paymentEventKey('stripe', 'cs_1', 'membership', 'm1');
    const work = jest.fn().mockResolvedValue(true);

    await expect(
      runPaymentEventOnce(prisma as unknown as PrismaService, key, work),
    ).resolves.toBe(true);
    await expect(
      runPaymentEventOnce(prisma as unknown as PrismaService, key, work),
    ).resolves.toBe(false);
    expect(work).toHaveBeenCalledTimes(1);
  });

  it('runs without key when provider has no externalId (box office)', async () => {
    const prisma = prismaMock() as unknown as PrismaMock;
    const work = jest.fn().mockResolvedValue(true);
    await expect(
      runPaymentEventOnce(prisma as unknown as PrismaService, null, work),
    ).resolves.toBe(true);
    expect(prisma.paymentEvent.create).not.toHaveBeenCalled();
  });

  it('releases the claim when the work fails (retry can pass)', async () => {
    const prisma = prismaMock() as unknown as PrismaMock;
    prisma.paymentEvent.create.mockResolvedValue({ id: 'e1' });
    prisma.paymentEvent.delete.mockResolvedValue({ id: 'e1' });
    const key = paymentEventKey('stripe', 'cs_1', 'tickets', 'o1')!;
    const boom = jest.fn().mockRejectedValue(new Error('db down'));

    await expect(
      runPaymentEventOnce(prisma as unknown as PrismaService, key, boom),
    ).rejects.toThrow('db down');
    expect(prisma.paymentEvent.delete).toHaveBeenCalledWith({
      where: {
        provider_externalId: { provider: 'stripe', externalId: 'cs_1' },
      },
    });
  });

  it('release tolerates a missing claim', async () => {
    const prisma = prismaMock() as unknown as PrismaMock;
    prisma.paymentEvent.delete.mockRejectedValue({ code: 'P2025' });
    const key = paymentEventKey('monri', 't-o1', 'tickets', 'o1')!;
    await expect(
      releasePaymentEvent(prisma as unknown as PrismaService, key),
    ).resolves.toBeUndefined();
  });
});
