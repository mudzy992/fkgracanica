import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MatchFormSheet } from './MatchFormSheet';
import { matchFormState as state } from '../../../test/doubles/match-form-sheet-doubles';
import type { Match } from '../../../types';


vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks', () => ({ useClubs: () => ({ data: state.clubs }) }));
vi.mock('../../../hooks/use-competition-admin', () => ({
  useCreateMatch: () => state.create,
  useUpdateMatch: () => state.update,
}));
vi.mock('../../../lib/auth', () => ({ useAuth: () => ({ user: state.user }) }));
vi.mock('../../../components/admin/AdminFormSheet', async () => ({
  AdminFormSheet: (await import('../../../test/doubles/match-form-sheet-doubles')).AdminFormSheetDouble,
}));
vi.mock('../../../components/admin/EntitySelect', async () => ({
  EntitySelect: (await import('../../../test/doubles/match-form-sheet-doubles')).EntitySelectDouble,
}));
vi.mock('./MatchFinishedReadOnly', async () => ({
  MatchFinishedReadOnly: (await import('../../../test/doubles/match-form-sheet-doubles')).MatchFinishedReadOnlyDouble,
}));
vi.mock('./MatchScoreInputs', async () => ({ MatchScoreInputs: (await import('../../../test/doubles/match-form-sheet-doubles')).MatchScoreInputsDouble }));
vi.mock('./MatchLiveLockedNote', () => ({
  MatchLiveLockedNote: ({ status }: { status?: string }) => <div>locked:{status}</div>,
}));
vi.mock('./MatchHighlightsEditor', () => ({
  MatchHighlightsEditor: ({ matchId }: { matchId: string }) => <div>highlights:{matchId}</div>,
}));

const match = (over: Partial<Match> = {}): Match => ({
  id: 'm1', status: 'SCHEDULED', homeClubId: 'c1', awayClubId: 'c2', roundId: 'r1',
  scheduledAt: '2026-05-01T17:00:00.000Z', venue: 'Stadion', homeScore: 1, awayScore: 2,
  ...over,
}) as unknown as Match;

const renderSheet = (edit: Match) =>
  render(
    <MemoryRouter>
      <MatchFormSheet open onOpenChange={state.onOpenChange} edit={edit} seasonId="se1" roundId="r1" />
    </MemoryRouter>,
  );

beforeEach(() => {
  state.clubs = [{ id: 'c1', name: 'FK Graca' }, { id: 'c2', name: 'FK Rival' }];
  state.user = { permissions: [] };
  state.create = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.update = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.onOpenChange = vi.fn();
  state.lastFinishedProps = {};
});

describe('MatchFormSheet — izmjena i zaključane faze', () => {
  it('završena utakmica ide u read-only prikaz', () => {
    renderSheet(match({ status: 'FINISHED' }));
    expect(screen.getByText('finished-readonly:m1')).toBeInTheDocument();
    expect(state.lastFinishedProps.canLive).toBe(false);
  });

  it('uživo utakmica prikazuje zaključanu notu bez ručnog statusa', () => {
    renderSheet(match({ status: 'LIVE' }));
    expect(screen.getByText('locked:LIVE')).toBeInTheDocument();
    expect(screen.queryByLabelText('admin.membershipForm.status')).toBeNull();
    expect(screen.getByText('highlights:m1')).toBeInTheDocument();
  });

  it('izmjena zakazane utakmice šalje status i rezultat uz link komentatora', async () => {
    const user = userEvent.setup();
    state.user = { permissions: ['live.manage'] };
    renderSheet(match());
    expect(screen.getByText('admin.matchForm.openCommentator')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('admin.membershipForm.status'), 'POSTPONED');
    await user.click(screen.getByRole('button', { name: 'Spremi' }));
    await waitFor(() => expect(state.update.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      id: 'm1', status: 'POSTPONED', homeScore: 1, awayScore: 2, roundId: 'r1',
    })));
  });

  it('izmjena u završenu bez datuma u prošlosti se odbija', async () => {
    const user = userEvent.setup();
    renderSheet(match({ scheduledAt: '2999-01-01T10:00:00.000Z' }));
    await user.selectOptions(screen.getByLabelText('admin.membershipForm.status'), 'FINISHED');
    await user.click(screen.getByRole('button', { name: 'Spremi' }));
    expect(screen.getByText('Završena utakmica mora imati datum u prošlosti.')).toBeInTheDocument();
    expect(state.update.mutateAsync).not.toHaveBeenCalled();
  });

  it('izmjena u završenu sa prošlim datumom prolazi', async () => {
    const user = userEvent.setup();
    renderSheet(match({ scheduledAt: '2020-01-01T10:00:00.000Z' }));
    await user.selectOptions(screen.getByLabelText('admin.membershipForm.status'), 'FINISHED');
    await user.click(screen.getByRole('button', { name: 'Spremi' }));
    await waitFor(() => expect(state.update.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      id: 'm1', status: 'FINISHED',
    })));
  });

  it('dok je mutacija u toku dugme je onemogućeno', () => {
    state.update = { ...state.update, isPending: true };
    renderSheet(match());
    expect(screen.getByRole('button', { name: 'Spremi' })).toBeDisabled();
  });
});
