import { NotFoundException } from '@nestjs/common';
import { MembershipStatus } from '@prisma/client';
import { validateMembershipCard } from './membership-validate.util';

describe('validateMembershipCard', () => {
  const prisma = {
    membershipCard: { findUnique: jest.fn() },
  };

  beforeEach(() => jest.clearAllMocks());

  it('throws when QR is unknown', async () => {
    prisma.membershipCard.findUnique.mockResolvedValue(null);
    await expect(validateMembershipCard(prisma as never, 'missing')).rejects.toThrow(NotFoundException);
  });

  it('returns ACTIVE membership', async () => {
    prisma.membershipCard.findUnique.mockResolvedValue({
      id: 'c1',
      membership: {
        status: MembershipStatus.ACTIVE,
        user: { firstName: 'Ana', lastName: 'Hodzic', email: 'ana@test.com' },
      },
    });
    const result = await validateMembershipCard(prisma as never, 'member-1_abc');
    expect(result).toEqual({ kind: 'membership', id: 'c1', status: 'ACTIVE', name: 'Ana Hodzic' });
  });
});
