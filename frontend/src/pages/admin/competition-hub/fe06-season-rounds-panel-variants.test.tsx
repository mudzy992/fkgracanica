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
  state.rounds = { data: [], isLoading: false } as unknown as typeof state.rounds;
  state.remove = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof state.remove;
  state.confirm = vi.fn(async () => true) as unknown as typeof state.confirm;
  state.apiGet = vi.fn(async () => ({ data: { matchCount: 1, approvedReportCount: 0, ticketCount: 0, eventCount: 0, lineupCount: 0, commentCount: 0 } })) as unknown as typeof state.apiGet;
  state.onSelectRound = vi.fn() as unknown as typeof state.onSelectRound;
  (state as unknown as Record<string, unknown>).form = {} as unknown;
  (state as unknown as Record<string, unknown>).cascade = {} as unknown;
});

describe('SeasonRoundsPanel — varijante (6 grana)', () => {
  it('round bez _count koristi ?? 0 fallback', () => {
    state.rounds = { data: [round({ _count: undefined })], isLoading: false } as unknown as typeof state.rounds;
    renderPanel();
    expect(screen.getByText('Derbi kolo')).toBeInTheDocument();
  });

  it('rounds null/undefined pokriva ?? [] fallbackove', () => {
    state.rounds = { data: null as unknown as Array<Record<string, unknown>>, isLoading: false } as unknown as typeof state.rounds;
    renderPanel();
    expect(screen.getByText('admin.roundsPanel.empty')).toBeInTheDocument();
    state.rounds = { data: undefined as unknown as Array<Record<string, unknown>>, isLoading: false } as unknown as typeof state.rounds;
    renderPanel();
    expect(screen.getAllByText('admin.roundsPanel.empty').length).toBeGreaterThan(0);
  });

  it('onCascadeConfirm bez cascadeRound pokriva if (!cascadeRound) return', async () => {
    renderPanel();
    const onConfirm = (state as unknown as { cascade: { onConfirm: () => Promise<void> } }).cascade.onConfirm;
    if (onConfirm) {
      await onConfirm();
      expect(state.remove.mutateAsync).not.toHaveBeenCalled();
    }
  });

  it('kaskadni dijalog onOpenChange true pokriva if (!o) false granu', async () => {
    state.rounds = { data: [round({ _count: { matches: 2 } })], isLoading: false } as unknown as typeof state.rounds;
    state.apiGet = vi.fn(async () => ({ data: { matchCount: 2, approvedReportCount: 1, ticketCount: 5, eventCount: 0, lineupCount: 1, commentCount: 2 } })) as unknown as typeof state.apiGet;
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await waitFor(() => expect((state as unknown as { cascade: { open: boolean } }).cascade.open).toBe(true));
    const c = (state as unknown as { cascade: { onOpenChange: (o: boolean) => void; open: boolean } }).cascade;
    c.onOpenChange(true);
    expect(c.open).toBe(true);
    c.onOpenChange(false);
  });

  it('RoundFormSheet onOpenChange true pokriva false granu', async () => {
    const user = userEvent.setup();
    state.rounds = { data: [round()], isLoading: false } as unknown as typeof state.rounds;
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'actions.edit' }));
    expect((state as unknown as { form: { open: boolean } }).form.open).toBe(true);
    (state as unknown as { form: { onOpenChange: (o: boolean) => void } }).form.onOpenChange(true);
    await waitFor(() => expect((state as unknown as { form: { open: boolean } }).form.open).toBe(true));
    (state as unknown as { form: { onOpenChange: (o: boolean) => void } }).form.onOpenChange(false);
    await waitFor(() => expect((state as unknown as { form: { open: boolean } }).form.open).toBe(false));
  });

  it('brisanje kola sa matches 0 ide direktno bez kaskade', async () => {
    const user = userEvent.setup();
    state.rounds = { data: [round({ _count: { matches: 0 } })], isLoading: false } as unknown as typeof state.rounds;
    state.confirm = vi.fn(async () => true) as unknown as typeof state.confirm;
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await waitFor(() => expect(state.remove.mutateAsync).toHaveBeenCalledWith({ id: 'r1', seasonId: 'se1' }));
  });

  it('brisanje kola sa matches >0 i uspješan api otvara kaskadu, potvrda briše', async () => {
    const user = userEvent.setup();
    state.rounds = { data: [round({ _count: { matches: 3 } })], isLoading: false } as unknown as typeof state.rounds;
    state.apiGet = vi.fn(async () => ({ data: { matchCount: 3, approvedReportCount: 0, ticketCount: 1, eventCount: 1, lineupCount: 0, commentCount: 0 } })) as unknown as typeof state.apiGet;
    state.remove = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof state.remove;
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await waitFor(() => expect((state as unknown as { cascade: { open: boolean } }).cascade.open).toBe(true));
    await user.click(screen.getByText('potvrdi-kaskadu'));
    await waitFor(() => expect(state.remove.mutateAsync).toHaveBeenCalledWith({ id: 'r1', seasonId: 'se1', cascade: true }));
  });

  it('api greška pri kaskadi prikazuje confirm error dijalog', async () => {
    const user = userEvent.setup();
    state.rounds = { data: [round({ _count: { matches: 2 } })], isLoading: false } as unknown as typeof state.rounds;
    state.apiGet = vi.fn(async () => { throw new Error('fail'); }) as unknown as typeof state.apiGet;
    state.confirm = vi.fn(async () => true) as unknown as typeof state.confirm;
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'actions.delete' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalledWith(expect.objectContaining({ title: 'Brisanje nije moguće' })));
  });
});
