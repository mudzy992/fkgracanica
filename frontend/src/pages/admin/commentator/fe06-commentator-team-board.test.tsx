import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommentatorTeamColumn } from './CommentatorTeamBoard';
import {
  boardMatch as match,
  boardLineup as lineup,
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
const assistSelect = () =>
  screen.getByLabelText('admin.commentatorBoard.assist') as HTMLSelectElement;

beforeEach(() => {
  resetBoardState();
});

describe('CommentatorTeamColumn — sastav i izbor', () => {
  it('prikazuje naziv kluba i samo igrače traženog kluba sa oznakom rezerve', () => {
    renderColumn();
    expect(screen.getByText('FK Gračanica')).toBeInTheDocument();
    const options = within(playerSelect()).getAllByRole('option');
    expect(options.map((o) => o.textContent)).toEqual(['—', 'Ana Anić', 'Bora Borić (rez)']);
  });

  it('pada na match.lineups kad lineup nije postavljen', () => {
    renderColumn({ match: match({ lineup: undefined, lineups: [lineup({})] }) });
    expect(within(playerSelect()).getAllByRole('option')).toHaveLength(2);
  });

  it('prazan sastav daje samo praznu opciju', () => {
    renderColumn({ match: match({ lineup: [] }) });
    expect(within(playerSelect()).getAllByRole('option')).toHaveLength(1);
  });

  it('brza dugmad su onemogućena bez izabranog igrača', () => {
    renderColumn();
    for (const name of ['label:GOAL', 'label:YELLOW_CARD', 'label:RED_CARD']) {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    }
  });

  it('izbor igrača uklanja ga iz liste asistencija', async () => {
    const user = userEvent.setup();
    renderColumn();
    await user.selectOptions(playerSelect(), 'p1');
    const assists = within(assistSelect()).getAllByRole('option').map((o) => o.textContent);
    expect(assists).toEqual(['—', 'Bora Borić (rez)']);
  });

  it('onemogućen panel gasi sva dugmad', async () => {
    const user = userEvent.setup();
    renderColumn({ disabled: true });
    await user.selectOptions(playerSelect(), 'p1');
    expect(screen.getByRole('button', { name: 'label:GOAL' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Potvrdi' })).toBeDisabled();
  });
});

describe('CommentatorTeamColumn — brzi događaji', () => {
  it('gol nosi igrača i asistenciju kad su različiti', async () => {
    const user = userEvent.setup();
    renderColumn();
    await user.selectOptions(playerSelect(), 'p1');
    await user.selectOptions(assistSelect(), 'p2');
    await user.click(screen.getByRole('button', { name: 'label:GOAL' }));
    expect(state.live.mutateAsync).toHaveBeenCalledWith({
      matchId: 'm1',
      type: 'GOAL',
      teamSide: 'home',
      playerId: 'p1',
      relatedPlayerId: 'p2',
    });
    expect(playerSelect().value).toBe('');
  });

  it('kad je asistencija isti igrač, ne šalje se relatedPlayerId', async () => {
    const user = userEvent.setup();
    renderColumn();
    // asistencija se bira prije igrača, pa oba polja pokazuju isti id
    await user.selectOptions(assistSelect(), 'p1');
    await user.selectOptions(playerSelect(), 'p1');
    await user.click(screen.getByRole('button', { name: 'label:GOAL' }));
    expect(state.live.mutateAsync).toHaveBeenCalledWith({
      matchId: 'm1',
      type: 'GOAL',
      teamSide: 'home',
      playerId: 'p1',
    });
  });

  it('kartica se šalje bez asistencije i čisti izbor', async () => {
    const user = userEvent.setup();
    renderColumn();
    await user.selectOptions(playerSelect(), 'p2');
    await user.selectOptions(assistSelect(), 'p1');
    await user.click(screen.getByRole('button', { name: 'label:YELLOW_CARD' }));
    expect(state.live.mutateAsync).toHaveBeenCalledWith({
      matchId: 'm1',
      type: 'YELLOW_CARD',
      teamSide: 'home',
      playerId: 'p2',
    });
    expect(assistSelect().value).toBe('');
  });
});
