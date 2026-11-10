import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CommentatorReportControls } from './CommentatorReportControls';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('./CommentatorRetrospectiveBar', () => ({ CommentatorRetrospectiveBar: () => <div /> }));
vi.mock('./CommentatorTeamBoard', () => ({
  CommentatorTeamColumn: ({ clubName, side }: { clubName: string; side: string }) => (
    <div data-testid={`team-${side}`}>{clubName}</div>
  ),
}));
vi.mock('./CommentatorCommentPanel', () => ({ CommentatorCommentPanel: () => <div /> }));
vi.mock('./CommentatorEventLog', () => ({ CommentatorEventLog: () => <div /> }));
vi.mock('../../../hooks/use-live-report', () => ({ useDeleteReportEvent: () => ({ mutateAsync: vi.fn(), isPending: false }) }));
vi.mock('../../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: vi.fn(), dialog: null }) }));
vi.mock('../../../lib/match-report', () => ({ canEditReport: () => true }));

const match = (over: Record<string, unknown> = {}) => ({
  id: 'm1',
  status: 'FINISHED',
  homeClub: { name: 'FK Gračanica' },
  awayClub: { name: 'FK Slavija' },
  homeClubId: 'k1',
  awayClubId: 'k2',
  ...over,
});

describe('CommentatorReportControls branch59 coverable ??', () => {
  it('homeClub null → Domaći', () => {
    render(
      <MemoryRouter>
        <CommentatorReportControls match={match({ homeClub: null }) as never} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('team-home')).toHaveTextContent('Domaći');
  });
  it('awayClub without name → Gosti', () => {
    render(
      <MemoryRouter>
        <CommentatorReportControls match={match({ awayClub: {} }) as never} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('team-away')).toHaveTextContent('Gosti');
  });
});
