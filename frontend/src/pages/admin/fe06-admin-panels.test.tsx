import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommentatorReportControls } from './commentator/CommentatorReportControls';

const state = vi.hoisted(() => ({
  confirm: vi.fn(),
  del: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => `t:${k}` }) }));
vi.mock('../../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: state.confirm, dialog: <div data-testid="confirm" /> }),
}));
vi.mock('../../hooks/use-live-report', () => ({
  useDeleteReportEvent: () => ({ mutateAsync: state.del, isPending: false }),
}));
vi.mock('./commentator/CommentatorRetrospectiveBar', () => ({
  CommentatorRetrospectiveBar: ({ onMinuteChange }: { onMinuteChange: (n: number) => void }) => (
    <button onClick={() => onMinuteChange(45)}>postavi-minutu</button>
  ),
}));
vi.mock('./commentator/CommentatorTeamBoard', () => ({
  CommentatorTeamColumn: ({ side, disabled }: { side: string; disabled?: boolean }) => (
    <div data-testid={`team-${side}`}>{disabled ? 'zaključano' : 'otvoreno'}</div>
  ),
}));
vi.mock('./commentator/CommentatorCommentPanel', () => ({
  CommentatorCommentPanel: () => <div data-testid="comments" />,
}));
vi.mock('./commentator/CommentatorEventLog', () => ({
  CommentatorEventLog: ({ onDelete }: { onDelete?: (id: string) => void }) =>
    onDelete ? <button onClick={() => onDelete('e1')}>obriši-zapis</button> : <div>log</div>,
}));

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

const match = (over: Record<string, unknown> = {}) => ({
  id: 'm1',
  status: 'FINISHED',
  reportStatus: 'DRAFT',
  homeScore: 1,
  awayScore: 0,
  minute: 20,
  seasonId: 's1',
  homeClubId: 'k1',
  awayClubId: 'k2',
  scheduledAt: '2026-05-01T17:00:00.000Z',
  homeClub: { name: 'FK Gračanica' },
  awayClub: { name: 'FK Slavija' },
  ...over,
});

beforeEach(() => {
  state.confirm = vi.fn().mockResolvedValue(true);
  state.del = vi.fn().mockResolvedValue(undefined);
});

describe('CommentatorReportControls', () => {
  it('prikazuje sve dijelove i prosljeđuje minutu', async () => {
    wrap(<CommentatorReportControls match={match() as never} />);
    expect(screen.getByTestId('confirm')).toBeInTheDocument();
    expect(screen.getByTestId('team-home')).toHaveTextContent('otvoreno');
    expect(screen.getByTestId('team-away')).toHaveTextContent('otvoreno');
    expect(screen.getByTestId('comments')).toBeInTheDocument();
    await userEvent.click(screen.getByText('postavi-minutu'));
    expect(screen.getByText('postavi-minutu')).toBeInTheDocument();
  });

  it('zaključana utakmica onemogućava kolone i brisanje', () => {
    wrap(
      <CommentatorReportControls
        match={match({ status: 'FINISHED', reportStatus: 'APPROVED' }) as never}
      />,
    );
    expect(screen.getByTestId('team-home')).toHaveTextContent('zaključano');
    expect(screen.getByTestId('team-away')).toHaveTextContent('zaključano');
    expect(screen.queryByText('obriši-zapis')).toBeNull();
  });

  it('brisanje zapisa traži potvrdu pa poziva mutaciju', async () => {
    wrap(<CommentatorReportControls match={match() as never} />);
    await userEvent.click(screen.getByText('obriši-zapis'));
    expect(state.confirm).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Obrisati zapis iz izvještaja?', variant: 'danger' }),
    );
    await waitFor(() => expect(state.del).toHaveBeenCalledWith({ matchId: 'm1', eventId: 'e1' }));
  });

  it('otkazana potvrda ne briše zapis', async () => {
    state.confirm = vi.fn().mockResolvedValue(false);
    wrap(<CommentatorReportControls match={match() as never} />);
    await userEvent.click(screen.getByText('obriši-zapis'));
    expect(state.del).not.toHaveBeenCalled();
  });
});
