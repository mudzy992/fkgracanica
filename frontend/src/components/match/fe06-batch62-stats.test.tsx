import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/motion/Reveal', () => ({ Reveal: ({ children }: any) => <div>{children}</div> }));

describe('batch62 stats — possession fallback', () => {
  it('home null away 60 -> home 40', async () => {
    const { MatchStatisticsSection } = await import('./MatchStatisticsSection');
    const match: any = { status: 'FINISHED', homeClub: { name: 'H' }, awayClub: { name: 'A' } };
    const stats: any = {
      team: {
        home: { goals: 1, shots: 1, shotsOn: 0, corners: 0, fouls: 0, offsides: 0, yellowCards: 0, redCards: 0, saves: 0, penaltiesScored: 0, penaltiesMissed: 0, possession: null },
        away: { goals: 0, shots: 0, shotsOn: 0, corners: 0, fouls: 0, offsides: 0, yellowCards: 0, redCards: 0, saves: 0, penaltiesScored: 0, penaltiesMissed: 0, possession: 60 },
      },
      players: { home: [], away: [] },
    };
    const { container } = render(<MatchStatisticsSection match={match} stats={stats} loading={false} />);
    expect(container.textContent).toContain('40');
  });
  it('away null home 60 -> away 40', async () => {
    const { MatchStatisticsSection } = await import('./MatchStatisticsSection');
    const match: any = { status: 'FINISHED', homeClub: { name: 'H' }, awayClub: { name: 'A' } };
    const stats: any = {
      team: {
        home: { goals: 1, shots: 1, shotsOn: 0, corners: 0, fouls: 0, offsides: 0, yellowCards: 0, redCards: 0, saves: 0, penaltiesScored: 0, penaltiesMissed: 0, possession: 60 },
        away: { goals: 0, shots: 0, shotsOn: 0, corners: 0, fouls: 0, offsides: 0, yellowCards: 0, redCards: 0, saves: 0, penaltiesScored: 0, penaltiesMissed: 0, possession: null },
      },
      players: { home: [], away: [] },
    };
    const { container } = render(<MatchStatisticsSection match={match} stats={stats} loading={false} />);
    expect(container.textContent).toContain('40');
  });
  it('both null -> no possession bar', async () => {
    const { MatchStatisticsSection } = await import('./MatchStatisticsSection');
    const match: any = { status: 'FINISHED', homeClub: { name: 'H' }, awayClub: { name: 'A' } };
    const stats: any = {
      team: {
        home: { goals: 1, shots: 1, shotsOn: 0, corners: 0, fouls: 0, offsides: 0, yellowCards: 0, redCards: 0, saves: 0, penaltiesScored: 0, penaltiesMissed: 0, possession: null },
        away: { goals: 0, shots: 0, shotsOn: 0, corners: 0, fouls: 0, offsides: 0, yellowCards: 0, redCards: 0, saves: 0, penaltiesScored: 0, penaltiesMissed: 0, possession: null },
      },
      players: { home: [], away: [] },
    };
    const { container } = render(<MatchStatisticsSection match={match} stats={stats} loading={false} />);
    // When both null, possession bar not rendered, but still has stats
    expect(container.textContent).toContain('Golovi');
    expect(container.textContent).not.toContain('Posjed');
  });
});
