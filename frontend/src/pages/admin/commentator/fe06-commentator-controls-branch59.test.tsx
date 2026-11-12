import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CommentatorControls } from './CommentatorControls';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('./CommentatorClockBar', () => ({ CommentatorClockBar: () => <div data-testid="clock" /> }));
vi.mock('./CommentatorPenaltiesBoard', () => ({ CommentatorPenaltiesBoard: () => <div data-testid="pen" /> }));
vi.mock('./CommentatorTeamBoard', () => ({
  CommentatorTeamColumn: ({ clubName, side }: { clubName: string; side: string }) => (
    <div data-testid={`team-${side}`}>{clubName}</div>
  ),
}));
vi.mock('./CommentatorCommentPanel', () => ({ CommentatorCommentPanel: () => <div /> }));
vi.mock('./CommentatorEventLog', () => ({ CommentatorEventLog: () => <div /> }));
vi.mock('../../../lib/match-live-phase', () => ({ isPenaltiesPhase: () => false }));

const match = (over: Record<string, unknown> = {}) => ({
  id: 'm1',
  status: 'LIVE',
  matchPeriod: 'FIRST_HALF',
  homeClub: { name: 'FK Gračanica' },
  awayClub: { name: 'FK Slavija' },
  homeClubId: 'k1',
  awayClubId: 'k2',
  ...over,
});

describe('CommentatorControls branch59 coverable ??', () => {
  it('homeClub null → fallback Domaći', () => {
    render(<CommentatorControls match={match({ homeClub: null }) as never} />);
    expect(screen.getByTestId('team-home')).toHaveTextContent('Domaći');
  });
  it('awayClub undefined → fallback Gosti', () => {
    render(<CommentatorControls match={match({ awayClub: undefined }) as never} />);
    expect(screen.getByTestId('team-away')).toHaveTextContent('Gosti');
  });
  it('homeClub without name → fallback Domaći', () => {
    render(<CommentatorControls match={match({ homeClub: {} }) as never} />);
    expect(screen.getByTestId('team-home')).toHaveTextContent('Domaći');
  });
});
