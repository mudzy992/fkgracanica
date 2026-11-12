import { occupiedForMatch } from './season-pass-capacity.util';

describe('season-pass-capacity', () => {
  it('occupied = tickets + active passes', async () => {
    const prisma = {
      ticket: { count: jest.fn().mockResolvedValue(10) },
      match: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ edition: { seasonId: 's1' } }),
      },
      seasonPass: { count: jest.fn().mockResolvedValue(3) },
    };
    const result = await occupiedForMatch(prisma as never, 'm1');
    expect(result).toEqual({ sold: 10, passes: 3, occupied: 13 });
  });
});
