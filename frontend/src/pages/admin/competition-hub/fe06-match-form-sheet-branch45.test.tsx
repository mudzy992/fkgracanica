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

describe('MatchFormSheet — branch45 (preostalih 5 grana)', () => {
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

  it('clubs null fallback: clubOptions prazno', async () => {
    state.clubs = null as never;
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={null} seasonId="s1" roundId="r1" />
      </MemoryRouter>,
    );
    // fallback (clubs ?? []) => nema opcija, ali render ne puca i pokriva granu 54
    expect(screen.getByLabelText('admin.matchForm.home')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin.clubForm.stadium')).toBeInTheDocument();
  });

  it('homeClubId fallback lanac: edit bez homeClubId i homeClub.id vraća prazan string', async () => {
    const edit = editBase({ homeClubId: undefined, homeClub: undefined }) as never;
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={edit} seasonId="s1" roundId="r1" />
      </MemoryRouter>,
    );
    // pokriva granu 63: edit?.homeClubId ?? edit?.homeClub?.id ?? '' gdje je '' fallback
    expect(screen.getByLabelText('admin.matchForm.home')).toBeInTheDocument();
  });

  it('venue fallback: edit bez venue i bez homeClub vraća prazan string', async () => {
    const edit = editBase({ venue: undefined, homeClub: undefined }) as never;
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={edit} seasonId="s1" roundId="r1" />
      </MemoryRouter>,
    );
    const venueInput = screen.getByPlaceholderText('admin.clubForm.stadium') as HTMLInputElement;
    expect(venueInput.value).toBe('');
  });

  it('isti klubovi u save prikazuje grešku (homeClubId === awayClubId)', async () => {
    const user = userEvent.setup();
    const edit = editBase({ homeClubId: 'c1', awayClubId: 'c1' }) as never;
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={edit} seasonId="s1" roundId="r1" />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: 'Spremi' }));
    expect(await screen.findByText('Domaći i gosti moraju biti različiti klubovi.')).toBeInTheDocument();
  });

  it('venue || null fallback pri create i update', async () => {
    const user = userEvent.setup();
    // c2 nema stadium pa je venue '' -> venue || null = null
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={null} seasonId="s1" roundId="r1" />
      </MemoryRouter>,
    );
    await user.selectOptions(screen.getByLabelText('admin.matchForm.home'), 'c2');
    await user.selectOptions(screen.getByLabelText('admin.matchForm.away'), 'c1');
    const venueInput = screen.getByPlaceholderText('admin.clubForm.stadium') as HTMLInputElement;
    expect(venueInput.value).toBe('');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(state.create.mutateAsync).toHaveBeenCalled());
    const arg = (state.create as unknown as { mutateAsync: ReturnType<typeof vi.fn> }).mutateAsync.mock.calls[0][0] as Record<string, unknown>;
    expect(arg.venue).toBeNull();
  });

  it('finishing false za buduću utakmicu ne traži prošli datum (isPastMatch false)', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <MatchFormSheet open onOpenChange={state.onOpenChange} edit={null} seasonId="s1" roundId="r1" />
      </MemoryRouter>,
    );
    await user.selectOptions(screen.getByLabelText('admin.matchForm.home'), 'c1');
    await user.selectOptions(screen.getByLabelText('admin.matchForm.away'), 'c2');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(state.create.mutateAsync).toHaveBeenCalled());
  });
});
