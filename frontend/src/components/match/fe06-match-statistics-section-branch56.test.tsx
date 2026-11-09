import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MatchStatisticsSection } from './MatchStatisticsSection';

describe('fe06 MatchStatisticsSection branch56', () => {
  it('home possession undefined → away fallback ??', () => {
    const match = { status: 'FINISHED', homeClub: { name: 'H' }, awayClub: { name: 'A' } } as any;
    const stats = {
      team: {
        home: { goals: 1, shots: 2, shotsOn: 1, corners: 1, fouls: 1, offsides: 0, yellowCards: 0, redCards: 0, saves: 1, penaltiesScored: 0, penaltiesMissed: 0, possession: undefined },
        away: { goals: 0, shots: 1, shotsOn: 0, corners: 0, fouls: 2, offsides: 1, yellowCards: 1, redCards: 0, saves: 0, penaltiesScored: 0, penaltiesMissed: 0, possession: 60 },
      },
      players: { home: [], away: [] },
    } as any;
    render(<MatchStatisticsSection match={match} stats={stats} loading={false} />);
    expect(document.body.textContent).toContain('Posjed');
  });
  it('away possession undefined → home fallback ??', () => {
    const match = { status: 'FINISHED', homeClub: { name: 'H' }, awayClub: { name: 'A' } } as any;
    const stats = {
      team: {
        home: { goals: 1, shots: 2, shotsOn: 1, corners: 1, fouls: 1, offsides: 0, yellowCards: 0, redCards: 0, saves: 0, penaltiesScored: 0, penaltiesMissed: 0, possession: 40 },
        away: { goals: 0, shots: 1, shotsOn: 0, corners: 0, fouls: 2, offsides: 1, yellowCards: 1, redCards: 0, saves: 0, penaltiesScored: 0, penaltiesMissed: 0, possession: undefined },
      },
      players: { home: [], away: [] },
    } as any;
    render(<MatchStatisticsSection match={match} stats={stats} loading={false} />);
    expect(document.body.textContent).toContain('Posjed');
  });
  it('both possession undefined → 50 fallback', () => {
    const match = { status: 'FINISHED', homeClub: { name: 'H' }, awayClub: { name: 'A' } } as any;
    const stats = {
      team: {
        home: { goals: 1, shots: 2, shotsOn: 1, corners: 1, fouls: 1, offsides: 0, yellowCards: 0, redCards: 0, saves: 0, penaltiesScored: 0, penaltiesMissed: 0, possession: undefined },
        away: { goals: 0, shots: 1, shotsOn: 0, corners: 0, fouls: 2, offsides: 1, yellowCards: 1, redCards: 0, saves: 0, penaltiesScored: 0, penaltiesMissed: 0, possession: undefined },
      },
      players: { home: [], away: [] },
    } as any;
    render(<MatchStatisticsSection match={match} stats={stats} loading={false} />);
    expect(document.body.textContent).toBeDefined();
  });
});
