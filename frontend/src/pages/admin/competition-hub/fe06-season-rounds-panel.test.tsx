import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SeasonRoundsPanel } from './SeasonRoundsPanel';
import { seasonRoundsState as state } from '../../../test/doubles/season-rounds-doubles';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../lib/api', () => ({ api: { get: (url: string) => state.apiGet(url) } }));
vi.mock('../../../hooks/use-rounds', () => ({
  useRounds: () => state.rounds,
  useDeleteRound: () => state.remove,
}));
vi.mock('../../../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: state.confirm, dialog: null }),
}));
vi.mock('./RoundFormSheet', async () => ({
  RoundFormSheet: (await import('../../../test/doubles/season-rounds-doubles')).RoundFormSheetDouble,
}));
vi.mock('./RoundCascadeDeleteDialog', async () => ({
  RoundCascadeDeleteDialog: (await import('../../../test/doubles/season-rounds-doubles')).RoundCascadeDeleteDialogDouble,
}));

const round = (over: Record<string, unknown> = {}) => ({
  id: 'r1', number: 3, name: 'Derbi kolo', seasonId: 'se1', _count: { matches: 0 },
  ...over,
});

const renderPanel = (props: Partial<Parameters<typeof SeasonRoundsPanel>[0]> = {}) =>
  render(
    <SeasonRoundsPanel
      seasonId="se1"
      selectedRoundId={null}
      onSelectRound={state.onSelectRound}
      canManage
      {...props}
    />,
  );

beforeEach(() => {
  state.rounds = { data: [], isLoading: false };
  state.remove = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.confirm = vi.fn(async () => true);
  state.apiGet = vi.fn(async () => ({ data: {} as Record<string, unknown> }));
  state.onSelectRound = vi.fn();
  state.form = {} as typeof state.form;
  state.cascade = {} as typeof state.cascade;
});

describe('SeasonRoundsPanel — prikaz', () => {
  it('dok se kola učitavaju prikazuje poruku, bez liste', () => {
    state.rounds = { data: [], isLoading: true };
    renderPanel();
    expect(screen.getByText('admin.common.loading')).toBeInTheDocument();
    expect(screen.queryByText('admin.roundsPanel.empty')).toBeNull();
  });

  it('prazna sezona prikazuje poruku', () => {
    renderPanel();
    expect(screen.getByText('admin.roundsPanel.empty')).toBeInTheDocument();
  });

  it('kola prikazuju naziv ili broj i broj utakmica', () => {
    state.rounds = {
      data: [round(), round({ id: 'r2', name: null, number: 5, _count: undefined })],
      isLoading: false,
    };
    renderPanel();
    expect(screen.getByText('Derbi kolo')).toBeInTheDocument();
    expect(screen.getByText('5. kolo')).toBeInTheDocument();
    expect(screen.getAllByText(/admin.roundsPanel.matches/)).toHaveLength(2);
  });

  it('bez dozvole nema akcija ni dugmeta za novo kolo', () => {
    state.rounds = { data: [round()], isLoading: false };
    renderPanel({ canManage: false });
    expect(screen.queryByRole('button', { name: 'actions.edit' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'actions.delete' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'admin.roundsPanel.round' })).toBeNull();
  });

  it('selektovano kolo dobija istaknutu klasu', () => {
    state.rounds = { data: [round()], isLoading: false };
    renderPanel({ selectedRoundId: 'r1' });
    expect(screen.getByText('Derbi kolo').closest('button')?.className).toContain('bg-primary/5');
  });
});

describe('SeasonRoundsPanel — obrasci kola', () => {
  it('novo kolo otvara prazan obrazac', async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'admin.roundsPanel.round' }));
    expect(screen.getByText('form:true:-:se1')).toBeInTheDocument();
  });

  it('uređivanje otvara obrazac sa postojećim kolom', async () => {
    const user = userEvent.setup();
    state.rounds = { data: [round()], isLoading: false };
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'actions.edit' }));
    expect(screen.getByText('form:true:r1:se1')).toBeInTheDocument();
  });

  it('klik na kolo bira to kolo', async () => {
    const user = userEvent.setup();
    state.rounds = { data: [round()], isLoading: false };
    renderPanel();
    await user.click(screen.getByText('Derbi kolo'));
    expect(state.onSelectRound).toHaveBeenCalledWith('r1');
  });

  it('zatvaranje obrasca kola sklanja odabrano kolo', async () => {
    const user = userEvent.setup();
    state.rounds = { data: [round()], isLoading: false };
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'actions.edit' }));
    await user.click(screen.getByRole('button', { name: 'zatvori-formu' }));
    expect(screen.getByText('form:false:-:se1')).toBeInTheDocument();
  });

  it('kaskadni dijalog je zatvoren i bez uticaja dok se ništa ne briše', () => {
    renderPanel();
    expect(state.cascade).toMatchObject({ open: false, roundLabel: '', isPending: false });
  });
});
