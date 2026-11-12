import { render, screen, waitFor } from '@testing-library/react';
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

describe('SeasonRoundsPanel — brisanje', () => {
  it('kolo bez utakmica se briše nakon potvrde', async () => {
    const user = userEvent.setup();
    state.rounds = { data: [round()], isLoading: false };
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await waitFor(() => expect(state.remove.mutateAsync).toHaveBeenCalledWith({ id: 'r1', seasonId: 'se1' }));
    expect(state.confirm).toHaveBeenCalledWith({
      title: 'Obrisati kolo?', description: 'Derbi kolo', variant: 'danger', confirmLabel: 'Obriši',
    });
  });

  it('odbijena potvrda ne briše kolo bez utakmica', async () => {
    const user = userEvent.setup();
    state.confirm = vi.fn(async () => false);
    state.rounds = { data: [round()], isLoading: false };
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalledTimes(1));
    expect(state.remove.mutateAsync).not.toHaveBeenCalled();
  });

  it('kolo sa utakmicama prvo učitava uticaj pa traži kaskadnu potvrdu', async () => {
    const user = userEvent.setup();
    state.rounds = { data: [round({ _count: { matches: 3 } })], isLoading: false };
    state.apiGet = vi.fn(async () => ({ data: { matchCount: 3, ticketCount: 12 } }));
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await waitFor(() => expect(screen.getByText('cascade:Derbi kolo:3:false')).toBeInTheDocument());
    expect(state.apiGet).toHaveBeenCalledWith('/rounds/r1/delete-impact');
    expect(state.confirm).not.toHaveBeenCalled();
  });

  it('potvrda kaskade briše sa cascade i čisti izbor kad je kolo bilo aktivno', async () => {
    const user = userEvent.setup();
    state.rounds = { data: [round({ _count: { matches: 3 } })], isLoading: false };
    state.apiGet = vi.fn(async () => ({ data: { matchCount: 3 } }));
    renderPanel({ selectedRoundId: 'r1' });
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await screen.findByText(/^cascade:/);
    await user.click(screen.getByRole('button', { name: 'potvrdi-kaskadu' }));
    await waitFor(() => expect(state.remove.mutateAsync).toHaveBeenCalledWith({
      id: 'r1', seasonId: 'se1', cascade: true,
    }));
    expect(state.onSelectRound).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText(/^cascade:/)).toBeNull());
  });

  it('kaskadno brisanje ne mijenja izbor kad drugo kolo nije aktivno', async () => {
    const user = userEvent.setup();
    state.rounds = { data: [round({ id: 'r2', _count: { matches: 1 } })], isLoading: false };
    state.apiGet = vi.fn(async () => ({ data: { matchCount: 1 } }));
    renderPanel({ selectedRoundId: 'r1' });
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await screen.findByText(/^cascade:/);
    await user.click(screen.getByRole('button', { name: 'potvrdi-kaskadu' }));
    await waitFor(() => expect(state.remove.mutateAsync).toHaveBeenCalled());
    expect(state.onSelectRound).not.toHaveBeenCalled();
  });

  it('zatvaranje kaskadnog dijaloga ne briše kolo', async () => {
    const user = userEvent.setup();
    state.rounds = { data: [round({ _count: { matches: 2 } })], isLoading: false };
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await screen.findByText(/^cascade:/);
    await user.click(screen.getByRole('button', { name: 'zatvori-kaskadu' }));
    await waitFor(() => expect(screen.queryByText(/^cascade:/)).toBeNull());
    expect(state.remove.mutateAsync).not.toHaveBeenCalled();
  });

  it('kad uticaj nije moguće učitati prikazuje se obavještenje bez brisanja', async () => {
    const user = userEvent.setup();
    state.rounds = { data: [round({ _count: { matches: 4 } })], isLoading: false };
    state.apiGet = vi.fn(async () => { throw new Error('x'); });
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalledWith({
      title: 'Brisanje nije moguće',
      description: 'Nije moguće učitati podatke o kolu.',
      confirmLabel: 'U redu',
    }));
    expect(screen.queryByText(/^cascade:/)).toBeNull();
    expect(state.remove.mutateAsync).not.toHaveBeenCalled();
  });

  it('dok je brisanje u toku kaskadni dijalog prikazuje stanje čekanja', async () => {
    const user = userEvent.setup();
    state.rounds = { data: [round({ _count: { matches: 2 } })], isLoading: false };
    state.apiGet = vi.fn(async () => ({ data: { matchCount: 2 } }));
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await screen.findByText('cascade:Derbi kolo:2:false');
    expect(state.cascade.isPending).toBe(false);
  });
});
