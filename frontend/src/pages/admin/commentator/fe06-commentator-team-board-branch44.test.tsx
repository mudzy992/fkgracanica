import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommentatorTeamColumn } from './CommentatorTeamBoard';
import {
  boardMatch as match,
  boardState as state,
  resetBoardState,
} from '../../../test/doubles/commentator-team-board-doubles';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../lib/match-event-labels', () => ({
  matchEventLabel: (type: string) => `label:${type}`,
}));
vi.mock('../../../hooks/use-live-admin', async () =>
  (await import('../../../test/doubles/commentator-team-board-doubles')).liveAdminModule(),
);
vi.mock('../../../hooks/use-live-report', async () =>
  (await import('../../../test/doubles/commentator-team-board-doubles')).liveReportModule(),
);
vi.mock('../../../components/admin/EntitySelect', async () => ({
  EntitySelect: (await import('../../../test/doubles/form-sheet-doubles')).EntitySelectDouble,
}));

const renderColumn = (over: Record<string, unknown> = {}) =>
  render(
    <CommentatorTeamColumn match={match()} side="home" clubName="FK Gračanica" clubId="c1" disabled={false} {...over} />,
  );

beforeEach(() => {
  resetBoardState();
});

describe('CommentatorTeamBoard — branch44 (3 grane)', () => {
  it('players sa undefined lineup koristi prazan niz', () => {
    renderColumn({ match: match({ lineup: undefined, lineups: undefined }) });
    // nema igrača, samo prazna opcija
    expect(screen.getByLabelText('admin.commentatorBoard.player')).toBeInTheDocument();
  });

  it('doSub bez oba polja ne šalje zahtjev', async () => {
    const user = userEvent.setup();
    renderColumn();
    const btn = screen.getByRole('button', { name: 'Potvrdi' });
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(state.live.mutateAsync).not.toHaveBeenCalled();
  });

  it('doSub sa oba polja šalje zahtjev', async () => {
    const user = userEvent.setup();
    renderColumn();
    // odaberi out i in
    await user.selectOptions(screen.getByLabelText('admin.commentatorBoard.out'), 'p1');
    await user.selectOptions(screen.getByLabelText('admin.commentatorBoard.in'), 'p2');
    await user.click(screen.getByRole('button', { name: 'Potvrdi' }));
    expect(state.live.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SUBSTITUTION', playerId: 'p1', relatedPlayerId: 'p2' }),
    );
  });

  it('fireWithPlayer bez odabranog igrača: dugme je onemogućeno', () => {
    renderColumn();
    expect(screen.getByRole('button', { name: 'label:GOAL' })).toBeDisabled();
  });
});
