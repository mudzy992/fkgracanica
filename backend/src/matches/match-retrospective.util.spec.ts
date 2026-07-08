import { MatchReportStatus, MatchStatus } from '@prisma/client';
import { assertRetrospectiveCreate, isRetrospectiveMatch } from './match-retrospective.util';

describe('match-retrospective.util', () => {
  it('detects retrospective match', () => {
    expect(
      isRetrospectiveMatch({
        status: MatchStatus.FINISHED,
        clockStartedAt: null,
        reportStatus: MatchReportStatus.DRAFT,
      }),
    ).toBe(true);
    expect(
      isRetrospectiveMatch({
        status: MatchStatus.FINISHED,
        clockStartedAt: new Date(),
        reportStatus: MatchReportStatus.DRAFT,
      }),
    ).toBe(false);
    expect(
      isRetrospectiveMatch({
        status: MatchStatus.FINISHED,
        clockStartedAt: null,
        reportStatus: MatchReportStatus.APPROVED,
      }),
    ).toBe(false);
  });

  it('requires past date and scores for FINISHED create', () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    expect(() =>
      assertRetrospectiveCreate({
        status: MatchStatus.FINISHED,
        scheduledAt: past,
        homeScore: 1,
        awayScore: 0,
      }),
    ).not.toThrow();
    expect(() =>
      assertRetrospectiveCreate({
        status: MatchStatus.FINISHED,
        scheduledAt: new Date(Date.now() + 86_400_000).toISOString(),
        homeScore: 1,
        awayScore: 0,
      }),
    ).toThrow('Retroaktivna utakmica mora imati datum u prošlosti.');
    expect(() =>
      assertRetrospectiveCreate({
        status: MatchStatus.FINISHED,
        scheduledAt: past,
      }),
    ).toThrow('unesite rezultat');
  });
});
