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
    <CommentatorTeamColumn
      match={match()}
      side="home"
      clubName="FK Gračanica"
      clubId="c1"
      disabled={false}
      {...over}
    />,
  );

const playerSelect = () =>
  screen.getByLabelText('admin.commentatorBoard.player') as HTMLSelectElement;
beforeEach(() => {
  resetBoardState();
});

describe('CommentatorTeamColumn — dodatni događaji', () => {
  it('autogol traži igrača, ostali dodatni rade i bez njega', async () => {
    const user = userEvent.setup();
    renderColumn();
    expect(screen.getByRole('button', { name: 'label:OWN_GOAL' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'label:CORNER' }));
    expect(state.live.mutateAsync).toHaveBeenCalledWith({
      matchId: 'm1',
      type: 'CORNER',
      teamSide: 'home',
    });
    await user.selectOptions(playerSelect(), 'p1');
    expect(screen.getByRole('button', { name: 'label:OWN_GOAL' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'label:OWN_GOAL' }));
    expect(state.live.mutateAsync).toHaveBeenLastCalledWith({
      matchId: 'm1',
      type: 'OWN_GOAL',
      teamSide: 'home',
      playerId: 'p1',
    });
  });

  it('izabrani igrač ide uz običan dodatni događaj', async () => {
    const user = userEvent.setup();
    renderColumn();
    await user.selectOptions(playerSelect(), 'p2');
    await user.click(screen.getByRole('button', { name: 'label:SHOT_ON_TARGET' }));
    expect(state.live.mutateAsync).toHaveBeenCalledWith({
      matchId: 'm1',
      type: 'SHOT_ON_TARGET',
      teamSide: 'home',
      playerId: 'p2',
    });
  });

  it('pending stanje blokira sve akcije', async () => {
    const user = userEvent.setup();
    state.report.isPending = true;
    renderColumn();
    await user.selectOptions(playerSelect(), 'p1');
    expect(screen.getByRole('button', { name: 'label:GOAL' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'label:CORNER' })).toBeDisabled();
  });
});

describe('CommentatorTeamColumn — zamjena', () => {
  it('potvrda traži igrača koji izlazi i koji ulazi pa šalje SUBSTITUTION', async () => {
    const user = userEvent.setup();
    renderColumn();
    const confirm = screen.getByRole('button', { name: 'Potvrdi' });
    expect(confirm).toBeDisabled();
    await user.selectOptions(screen.getByLabelText('admin.commentatorBoard.out'), 'p1');
    expect(confirm).toBeDisabled();
    await user.selectOptions(screen.getByLabelText('admin.commentatorBoard.in'), 'p2');
    await user.click(confirm);
    expect(state.live.mutateAsync).toHaveBeenCalledWith({
      matchId: 'm1',
      type: 'SUBSTITUTION',
      teamSide: 'home',
      playerId: 'p1',
      relatedPlayerId: 'p2',
    });
    expect((screen.getByLabelText('admin.commentatorBoard.out') as HTMLSelectElement).value).toBe('');
  });
});

describe('CommentatorTeamColumn — report režim', () => {
  it('izvještaj šalje minut i stranu kroz report hook', async () => {
    const user = userEvent.setup();
    renderColumn({ reportMode: true, side: 'away', eventMinute: 55 });
    await user.selectOptions(playerSelect(), 'p1');
    await user.click(screen.getByRole('button', { name: 'label:RED_CARD' }));
    expect(state.report.mutateAsync).toHaveBeenCalledWith({
      matchId: 'm1',
      type: 'RED_CARD',
      minute: 55,
      teamSide: 'away',
      playerId: 'p1',
    });
    expect(state.live.mutateAsync).not.toHaveBeenCalled();
  });

  it('bez zadanog minuta koristi nulu', async () => {
    const user = userEvent.setup();
    renderColumn({ reportMode: true });
    await user.click(screen.getByRole('button', { name: 'label:FOUL' }));
    expect(state.report.mutateAsync).toHaveBeenCalledWith({
      matchId: 'm1',
      type: 'FOUL',
      minute: 0,
      teamSide: 'home',
    });
  });
});
