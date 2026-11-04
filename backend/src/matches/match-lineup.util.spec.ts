import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { validateMatchLineup } from './match-lineup.util';

function fixture() {
  const prisma = {
    match: {
      findUnique: jest
        .fn()
        .mockResolvedValue({ homeClubId: 'home', awayClubId: 'away' }),
    },
    player: { findFirst: jest.fn().mockResolvedValue(null) },
    matchLineup: { findFirst: jest.fn().mockResolvedValue(null) },
  };
  return { prisma, db: prisma as unknown as PrismaService };
}

describe('validacija postave utakmice', () => {
  it('zadržava prethodno spremljeni par igrač/klub i nakon transfera', async () => {
    const { prisma, db } = fixture();
    prisma.matchLineup.findFirst.mockResolvedValue({ id: 'old' });
    await expect(
      validateMatchLineup(db, 'match', [
        { playerId: 'old-player', clubId: 'home' },
      ]),
    ).resolves.toBeUndefined();
    expect(prisma.matchLineup.findFirst).toHaveBeenCalledWith({
      where: { matchId: 'match', clubId: 'home', playerId: 'old-player' },
      select: { id: true },
    });
  });

  it('ne dozvoljava novog igrača koji ne pripada klubu', async () => {
    const { db } = fixture();
    await expect(
      validateMatchLineup(db, 'match', [
        { playerId: 'outsider', clubId: 'home' },
      ]),
    ).rejects.toThrow(BadRequestException);
  });

  it('i dalje odbija duplikate i klubove koji ne igraju utakmicu', async () => {
    const { prisma, db } = fixture();
    prisma.player.findFirst.mockResolvedValue({ id: 'p' });
    await expect(
      validateMatchLineup(db, 'match', [
        { playerId: 'p', clubId: 'home' },
        { playerId: 'p', clubId: 'away' },
      ]),
    ).rejects.toThrow('Igrač ne može biti duplo u postavi.');
    await expect(
      validateMatchLineup(db, 'match', [{ playerId: 'p', clubId: 'other' }]),
    ).rejects.toThrow('Igrač mora pripadati domaćem ili gostujućem klubu.');
  });
});
