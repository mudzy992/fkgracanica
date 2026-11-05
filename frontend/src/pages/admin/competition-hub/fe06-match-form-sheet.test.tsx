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

const renderSheet = () =>
  render(
    <MemoryRouter>
      <MatchFormSheet open onOpenChange={state.onOpenChange} edit={null} seasonId="se1" roundId="r1" />
    </MemoryRouter>,
  );

beforeEach(() => {
  state.clubs = [
    { id: 'c1', name: 'FK Graca', stadium: 'Gradski stadion' },
    { id: 'c2', name: 'FK Rival' },
  ];
  state.user = { permissions: [] };
  state.create = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.update = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.onOpenChange = vi.fn();
  state.scoreArgs = { homeScore: 0, awayScore: 0 };
});

describe('MatchFormSheet — kreiranje', () => {
  it('bez klubova dugme je onemogućeno, a datum se popunjava', () => {
    renderSheet();
    expect(screen.getByText('admin.matchForm.create')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kreiraj' })).toBeDisabled();
    expect(screen.getByDisplayValue(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)).toBeInTheDocument();
  });

  it('odabir domaćina preuzima stadion kluba, a drugi klub ne prepisuje stadion', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.selectOptions(screen.getByLabelText('admin.matchForm.home'), 'c1');
    await waitFor(() => expect(screen.getByDisplayValue('Gradski stadion')).toBeInTheDocument());
    await user.selectOptions(screen.getByLabelText('admin.matchForm.home'), 'c2');
    expect(screen.getByDisplayValue('Gradski stadion')).toBeInTheDocument();
  });

  it('isti klub na obje strane daje grešku bez poziva API-ja', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.selectOptions(screen.getByLabelText('admin.matchForm.home'), 'c1');
    await user.selectOptions(screen.getByLabelText('admin.matchForm.away'), 'c1');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    expect(screen.getByText('Domaći i gosti moraju biti različiti klubovi.')).toBeInTheDocument();
    expect(state.create.mutateAsync).not.toHaveBeenCalled();
  });

  it('neispravan datum ne pokreće kreiranje', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.selectOptions(screen.getByLabelText('admin.matchForm.home'), 'c1');
    await user.selectOptions(screen.getByLabelText('admin.matchForm.away'), 'c2');
    const dateInput = screen.getByDisplayValue(/^\d{4}-/);
    await user.clear(dateInput);
    await user.type(dateInput, '2999-13-45T99:99');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(state.create.mutateAsync).not.toHaveBeenCalled());
  });

  it('uspješno kreiranje šalje zakazanu utakmicu i zatvara sheet', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.selectOptions(screen.getByLabelText('admin.matchForm.home'), 'c1');
    await user.selectOptions(screen.getByLabelText('admin.matchForm.away'), 'c2');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(state.create.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      seasonId: 'se1', homeClubId: 'c1', awayClubId: 'c2', roundId: 'r1',
      venue: 'Gradski stadion', status: 'SCHEDULED',
    })));
    expect(state.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('oznaka prošle utakmice traži rezultat i šalje završenu utakmicu', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.selectOptions(screen.getByLabelText('admin.matchForm.home'), 'c1');
    await user.selectOptions(screen.getByLabelText('admin.matchForm.away'), 'c2');
    const dateInput = screen.getByDisplayValue(/^\d{4}-/);
    await user.clear(dateInput);
    await user.type(dateInput, '2020-06-01T10:00');
    await user.click(screen.getByRole('checkbox'));
    expect(state.scoreArgs.labeled).toBe(true);
    await user.click(screen.getByRole('button', { name: 'home-plus' }));
    await user.click(screen.getByRole('button', { name: 'away-plus' }));
    expect(screen.getByText('score:1:1')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(state.create.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      status: 'FINISHED', homeScore: 1, awayScore: 1,
    })));
  });

  it('greška API-ja ostaje u sheetu i ne zatvara ga', async () => {
    const user = userEvent.setup();
    state.create = { ...state.create, mutateAsync: vi.fn(async () => { throw new Error('Termin je zauzet'); }) };
    renderSheet();
    await user.selectOptions(screen.getByLabelText('admin.matchForm.home'), 'c1');
    await user.selectOptions(screen.getByLabelText('admin.matchForm.away'), 'c2');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(screen.getByText('Termin je zauzet')).toBeInTheDocument());
    expect(state.onOpenChange).not.toHaveBeenCalled();
  });
});
