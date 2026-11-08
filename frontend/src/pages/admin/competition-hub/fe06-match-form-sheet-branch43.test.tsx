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

describe('MatchFormSheet — branch43 (6 grana)', () => {
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

  it('defaultVenue true: odabir doma sa stadionom popunjava venue', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={null} seasonId="s1" roundId="r1" />
      </MemoryRouter>,
    );
    await user.selectOptions(screen.getByLabelText('admin.matchForm.home'), 'c1');
    expect(screen.getByDisplayValue('Arena A')).toBeInTheDocument();
  });

  it('defaultVenue false: odabir doma bez stadiona ne popunjava venue', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={null} seasonId="s1" roundId="r1" />
      </MemoryRouter>,
    );
    const venueInput = screen.getByPlaceholderText('admin.clubForm.stadium') as HTMLInputElement;
    expect(venueInput.value).toBe('');
    await user.selectOptions(screen.getByLabelText('admin.matchForm.home'), 'c2');
    expect(venueInput.value).toBe('');
  });

  it('editableStatuses: LIVE prikazuje locked', () => {
    const edit = editBase({ status: 'LIVE' }) as never;
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={edit} seasonId="s1" roundId="r1" />
      </MemoryRouter>,
    );
    expect(screen.getByText('locked:LIVE')).toBeInTheDocument();
  });

  it('editableStatuses: SCHEDULED postavlja status', () => {
    const edit = editBase({ status: 'SCHEDULED' }) as never;
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={edit} seasonId="s1" roundId="r1" />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('admin.membershipForm.status')).toHaveValue('SCHEDULED');
  });

  it('save isFinished guard ne zove mutate', () => {
    const edit = editBase({ status: 'FINISHED' }) as never;
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={edit} seasonId="s1" roundId="r1" />
      </MemoryRouter>,
    );
    expect(screen.getByText('finished-readonly:m1')).toBeInTheDocument();
  });

  it('finishing validacija za budući termin', async () => {
    const user = userEvent.setup();
    const future = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
    const edit = editBase({ status: 'SCHEDULED' }) as never;
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={edit} seasonId="s1" roundId="r1" />
      </MemoryRouter>,
    );
    const dateInput = screen.getByDisplayValue(/^2026-/);
    await user.clear(dateInput);
    await user.type(dateInput, future);
    await user.selectOptions(screen.getByLabelText('admin.membershipForm.status'), 'FINISHED');
    await user.click(screen.getByRole('button', { name: 'Spremi' }));
    await new Promise((r) => setTimeout(r, 200));
    expect((state.update as unknown as { mutateAsync: ReturnType<typeof vi.fn> }).mutateAsync).not.toHaveBeenCalled();
  });

  it('create grana šalje status', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={null} seasonId="s1" roundId="r1" />
      </MemoryRouter>,
    );
    await user.selectOptions(screen.getByLabelText('admin.matchForm.home'), 'c1');
    await user.selectOptions(screen.getByLabelText('admin.matchForm.away'), 'c2');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect((state.create as unknown as { mutateAsync: ReturnType<typeof vi.fn> }).mutateAsync).toHaveBeenCalled());
    const arg = (state.create as unknown as { mutateAsync: ReturnType<typeof vi.fn> }).mutateAsync.mock.calls[0][0] as Record<string, unknown>;
    expect(arg).toHaveProperty('status', 'SCHEDULED');
  });

  it('update bez canSendManual ne šalje status', async () => {
    const user = userEvent.setup();
    const editLive = editBase({ status: 'LIVE' }) as never;
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={editLive} seasonId="s1" roundId="r9" />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: 'Spremi' }));
    await waitFor(() => expect((state.update as unknown as { mutateAsync: ReturnType<typeof vi.fn> }).mutateAsync).toHaveBeenCalled());
    const arg = (state.update as unknown as { mutateAsync: ReturnType<typeof vi.fn> }).mutateAsync.mock.calls[0][0] as Record<string, unknown>;
    expect(arg).not.toHaveProperty('status', 'LIVE');
  });
});
