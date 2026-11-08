import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MatchFormSheet } from './MatchFormSheet';
import { matchFormState as state } from '../../../test/doubles/match-form-sheet-doubles';

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

const editBase = (over: Record<string, unknown> = {}) => ({
  id: 'm1',
  status: 'SCHEDULED',
  homeClubId: 'c1',
  awayClubId: 'c2',
  venue: 'Stadion',
  scheduledAt: '2026-11-08T10:00:00.000Z',
  roundId: 'r1',
  homeScore: 1,
  awayScore: 0,
  homeClub: { id: 'c1', name: 'A' },
  awayClub: { id: 'c2', name: 'B' },
  ...over,
});

describe('MatchFormSheet — varijante (8 grana)', () => {
  beforeEach(() => {
    state.clubs = [
      { id: 'c1', name: 'Klub A', stadium: 'Arena A' },
      { id: 'c2', name: 'Klub B' },
    ] as never;
    state.user = { permissions: ['live.manage'] } as never;
    state.create = { mutateAsync: vi.fn(async () => ({})), isPending: false } as never;
    state.update = { mutateAsync: vi.fn(async () => ({})), isPending: false } as never;
    state.onOpenChange = vi.fn();
  });

  it('clubs null fallback pokriva ?? [] grane', () => {
    state.clubs = null as unknown as typeof state.clubs;
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={null} seasonId="s1" roundId="r9" />
      </MemoryRouter>,
    );
    expect(screen.getByText('admin.matchForm.create')).toBeInTheDocument();
  });

  it('edit sa venue null i homeClub null pokriva ?? fallback', () => {
    const edit = editBase({ venue: null, homeClub: null, homeClubId: '' }) as never;
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={edit} seasonId="s1" roundId="r1" />
      </MemoryRouter>,
    );
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  it('isFinished early return pokriva guard', () => {
    const edit = editBase({ status: 'FINISHED' }) as never;
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={edit} seasonId="s1" roundId="r1" />
      </MemoryRouter>,
    );
    expect(screen.getByText('finished-readonly:m1')).toBeInTheDocument();
  });

  it('save bez ispravnog scheduledAt pokriva !scheduledIso granu', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={null} seasonId="s1" roundId="r1" />
      </MemoryRouter>,
    );
    await user.selectOptions(screen.getByLabelText('admin.matchForm.home'), 'c1');
    await user.selectOptions(screen.getByLabelText('admin.matchForm.away'), 'c2');
    const dateInput = screen.getByDisplayValue(/^\d{4}-/);
    await user.clear(dateInput);
    await user.type(dateInput, '2999-13-45T99:99');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect((state.create as unknown as { mutateAsync: ReturnType<typeof vi.fn> }).mutateAsync).not.toHaveBeenCalled());
  });

  it('canSendManualStatus grane: editable vs live-locked', async () => {
    const user = userEvent.setup();
    const edit = editBase({ status: 'SCHEDULED' }) as never;
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={edit} seasonId="s1" roundId="r1" />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: 'Spremi' }));
    await waitFor(() => expect((state.update as unknown as { mutateAsync: ReturnType<typeof vi.fn> }).mutateAsync).toHaveBeenCalled());
    const argTrue = (state.update as unknown as { mutateAsync: ReturnType<typeof vi.fn> }).mutateAsync.mock.calls[0][0] as Record<string, unknown>;
    expect(argTrue).toHaveProperty('status', 'SCHEDULED');
    (state.update as unknown as { mutateAsync: ReturnType<typeof vi.fn> }).mutateAsync.mockClear();

    const editLive = editBase({ status: 'LIVE' }) as never;
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={editLive} seasonId="s1" roundId="r9" />
      </MemoryRouter>,
    );
    await user.click(screen.getAllByRole('button', { name: 'Spremi' })[1]);
    await waitFor(() => expect((state.update as unknown as { mutateAsync: ReturnType<typeof vi.fn> }).mutateAsync).toHaveBeenCalled());
    const argFalse = (state.update as unknown as { mutateAsync: ReturnType<typeof vi.fn> }).mutateAsync.mock.calls[0][0] as Record<string, unknown>;
    expect(argFalse).not.toHaveProperty('status', 'LIVE');
  });

  it('venue || null grana: prazan vs popunjen', async () => {
    const user = userEvent.setup();
    state.clubs = [{ id: 'c1', name: 'A' }, { id: 'c2', name: 'B' }] as never;
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={null} seasonId="s1" roundId="r1" />
      </MemoryRouter>,
    );
    await user.selectOptions(screen.getByLabelText('admin.matchForm.home'), 'c1');
    await user.selectOptions(screen.getByLabelText('admin.matchForm.away'), 'c2');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect((state.create as unknown as { mutateAsync: ReturnType<typeof vi.fn> }).mutateAsync).toHaveBeenCalled());
    const argEmpty = (state.create as unknown as { mutateAsync: ReturnType<typeof vi.fn> }).mutateAsync.mock.calls[0][0] as Record<string, unknown>;
    expect(argEmpty.venue).toBe(null);
  });
});
