import { BadRequestException } from '@nestjs/common';
import { RoundsService } from './rounds.service';
import { cascadeDeleteRound, getRoundDeleteImpact } from './round-cascade-delete.util';

jest.mock('./round-cascade-delete.util', () => ({
  getRoundDeleteImpact: jest.fn(),
  cascadeDeleteRound: jest.fn(),
}));

describe('RoundsService.remove', () => {
  const prismaMock = {
    round: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    match: {
      count: jest.fn(),
    },
  };
  const service = new RoundsService(prismaMock as never);

  beforeEach(() => jest.clearAllMocks());

  it('deletes empty round without cascade', async () => {
    prismaMock.round.findUnique.mockResolvedValue({ id: 'r1', seasonId: 's1', number: 1 });
    prismaMock.match.count.mockResolvedValue(0);
    prismaMock.round.delete.mockResolvedValue({ id: 'r1' });
    await expect(service.remove('r1', false)).resolves.toEqual({ id: 'r1' });
  });

  it('rejects delete when matches exist without cascade', async () => {
    prismaMock.round.findUnique.mockResolvedValue({ id: 'r1', seasonId: 's1', number: 1 });
    prismaMock.match.count.mockResolvedValue(2);
    await expect(service.remove('r1', false)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('cascade deletes round with matches', async () => {
    prismaMock.round.findUnique.mockResolvedValue({ id: 'r1', seasonId: 's1', number: 1 });
    prismaMock.match.count.mockResolvedValue(2);
    (cascadeDeleteRound as jest.Mock).mockResolvedValue({ deletedMatches: 2, statsRebuilt: true });
    await expect(service.remove('r1', true)).resolves.toEqual({ deletedMatches: 2, statsRebuilt: true });
    expect(cascadeDeleteRound).toHaveBeenCalledWith(prismaMock, 'r1', 's1');
  });

  it('returns delete impact', async () => {
    prismaMock.round.findUnique.mockResolvedValue({ id: 'r1', seasonId: 's1', number: 1 });
    (getRoundDeleteImpact as jest.Mock).mockResolvedValue({ matchCount: 1, approvedReportCount: 0 });
    await expect(service.getDeleteImpact('r1')).resolves.toEqual({ matchCount: 1, approvedReportCount: 0 });
  });
});
