import { MatchReportStatus } from '@prisma/client';
import { getRoundDeleteImpact } from './round-cascade-delete.util';

describe('round-cascade-delete.util', () => {
  it('aggregates delete impact for round matches', async () => {
    const prisma = {
      match: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'm1',
            reportStatus: MatchReportStatus.APPROVED,
            _count: { events: 3, lineup: 22, liveComments: 1, tickets: 5 },
          },
          {
            id: 'm2',
            reportStatus: MatchReportStatus.DRAFT,
            _count: { events: 0, lineup: 0, liveComments: 0, tickets: 0 },
          },
        ]),
      },
    };
    const impact = await getRoundDeleteImpact(prisma as never, 'r1');
    expect(impact).toEqual({
      matchCount: 2,
      approvedReportCount: 1,
      ticketCount: 5,
      eventCount: 3,
      lineupCount: 22,
      commentCount: 1,
    });
  });
});
