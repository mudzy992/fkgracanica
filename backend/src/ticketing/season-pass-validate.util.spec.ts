import { BadRequestException, NotFoundException } from '@nestjs/common';
import { validateSeasonPass } from './season-pass-validate.util';

describe('validateSeasonPass', () => {
  const prisma = {
    seasonPass: { findUnique: jest.fn() },
    match: { findUnique: jest.fn() },
    seasonPassAdmission: { create: jest.fn() },
  };

  beforeEach(() => jest.clearAllMocks());

  it('requires matchId', async () => {
    prisma.seasonPass.findUnique.mockResolvedValue({
      id: 'p1',
      status: 'ACTIVE',
      seasonId: 's1',
      label: 'Sezona',
      season: { name: '2026' },
      user: { email: 'a@b.c' },
    });
    await expect(validateSeasonPass(prisma as never, 'pass_x')).rejects.toThrow(BadRequestException);
  });

  it('throws when pass missing', async () => {
    prisma.seasonPass.findUnique.mockResolvedValue(null);
    await expect(validateSeasonPass(prisma as never, 'x', 'm1')).rejects.toThrow(NotFoundException);
  });

  it('creates admission once', async () => {
    prisma.seasonPass.findUnique.mockResolvedValue({
      id: 'p1',
      status: 'ACTIVE',
      seasonId: 's1',
      label: 'Sezona',
      season: { name: '2026' },
      user: { email: 'a@b.c' },
    });
    prisma.match.findUnique.mockResolvedValue({
      id: 'm1',
      edition: { seasonId: 's1' },
      homeClub: { isOwnClub: true, name: 'FK' },
      awayClub: { name: 'Gost' },
    });
    prisma.seasonPassAdmission.create.mockResolvedValue({});
    const result = await validateSeasonPass(prisma as never, 'pass_x', 'm1');
    expect(result.kind).toBe('pass');
    expect(prisma.seasonPassAdmission.create).toHaveBeenCalled();
  });
});
