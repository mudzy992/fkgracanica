import {
  DEFAULT_MEMBERSHIP_PRICE,
  readMembershipAmount,
} from './membership-price.util';
import type { PrismaService } from '../prisma/prisma.service';

function prismaWith(value: string | undefined) {
  return {
    setting: {
      findUnique: jest
        .fn()
        .mockResolvedValue(value === undefined ? null : { value }),
    },
  } as unknown as PrismaService;
}

describe('readMembershipAmount (BE-07 / P-B07-1)', () => {
  it('reads price from settings (server-side amount)', async () => {
    await expect(readMembershipAmount(prismaWith('80'))).resolves.toBe(80);
  });

  it('falls back to default when setting missing', async () => {
    await expect(readMembershipAmount(prismaWith(undefined))).resolves.toBe(
      DEFAULT_MEMBERSHIP_PRICE,
    );
  });

  it('never returns 0 / negative / NaN (client could have paid 0.01)', async () => {
    await expect(readMembershipAmount(prismaWith('0'))).resolves.toBe(
      DEFAULT_MEMBERSHIP_PRICE,
    );
    await expect(readMembershipAmount(prismaWith('-5'))).resolves.toBe(
      DEFAULT_MEMBERSHIP_PRICE,
    );
    await expect(readMembershipAmount(prismaWith('abc'))).resolves.toBe(
      DEFAULT_MEMBERSHIP_PRICE,
    );
  });
});
