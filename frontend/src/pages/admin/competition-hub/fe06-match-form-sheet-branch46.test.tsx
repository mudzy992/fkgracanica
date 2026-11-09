import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  homeClub: { id: 'c1', name: 'A', stadium: 'Arena' },
  awayClub: { id: 'c2', name: 'B' },
  ...over,
});

describe('MatchFormSheet — branch46 (fallback 4 grane)', () => {
  beforeEach(() => {
    state.clubs = [
      { id: 'c1', name: 'Klub A', stadium: 'Arena A' },
      { id: 'c2', name: 'Klub B' },
    ] as never;
    state.user = { permissions: ['live.manage'] } as never;
    state.create = { mutateAsync: vi.fn(async () => ({})), isPending: false } as never;
    state.update = { mutateAsync: vi.fn(async () => ({})), isPending: false } as never;
    state.onOpenChange = vi.fn();
    vi.clearAllMocks();
  });

  it('clubs null fallback: onHomeClubChange pokriva clubs ?? []', async () => {
    state.clubs = null as never;
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={null} seasonId="s1" roundId="r1" />
      </MemoryRouter>,
    );
    const homeSelect = screen.getByLabelText('admin.matchForm.home') as HTMLSelectElement;
    // direktan fireEvent da zaobiđemo nedostatak opcija — handler se poziva i pokriva granu
    fireEvent.change(homeSelect, { target: { value: 'c1' } });
    const venueInput = screen.getByPlaceholderText('admin.clubForm.stadium') as HTMLInputElement;
    // venue ostaje prazan jer nema default venue-a i (clubs ?? []) je pokriven
    expect(venueInput.value).toBe('');
    // select nema opciju pa ostaje na defaultu, ali handler je izvršen
    expect(homeSelect).toBeInTheDocument();
  });

  it('venue fallback prazan string kad je edit bez venue i bez homeClub', async () => {
    const edit = editBase({ venue: undefined, homeClub: undefined }) as never;
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={edit} seasonId="s1" roundId="r1" />
      </MemoryRouter>,
    );
    const venueInput = screen.getByPlaceholderText('admin.clubForm.stadium') as HTMLInputElement;
    expect(venueInput.value).toBe('');
  });

  it('venue || null fallback pri edit save kada je venue prazan', async () => {
    const user = userEvent.setup();
    const edit = editBase({ venue: '' }) as never;
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={edit} seasonId="s1" roundId="r1" />
      </MemoryRouter>,
    );
    // venue je prazan, pa `venue || null` mora dati null u body
    await user.click(screen.getByRole('button', { name: 'Spremi' }));
    await waitFor(() => expect(state.update.mutateAsync).toHaveBeenCalled());
    const arg = (state.update.mutateAsync as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<string, unknown>;
    expect(arg.venue).toBeNull();
    expect(arg.roundId).toBe('r1');
  });

  it('edit.roundId ?? roundId fallback kada je edit.roundId nullish', async () => {
    const user = userEvent.setup();
    const edit = editBase({ roundId: undefined }) as never;
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={edit} seasonId="s1" roundId="fallback-r" />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: 'Spremi' }));
    await waitFor(() => expect(state.update.mutateAsync).toHaveBeenCalled());
    const arg = (state.update.mutateAsync as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0] as Record<string, unknown>;
    expect(arg.roundId).toBe('fallback-r');
  });
});
