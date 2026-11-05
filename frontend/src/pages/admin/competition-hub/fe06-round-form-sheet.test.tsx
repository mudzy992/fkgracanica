import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoundFormSheet } from './RoundFormSheet';
import { formSheetState } from '../../../test/doubles/form-sheet-doubles';

const state = vi.hoisted(() => ({
  create: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  update: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  onOpenChange: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks/use-rounds', () => ({
  useCreateRound: () => state.create,
  useUpdateRound: () => state.update,
}));
vi.mock('../../../components/admin/AdminFormSheet', async () => ({
  AdminFormSheet: (await import('../../../test/doubles/form-sheet-doubles')).AdminFormSheetDouble,
}));

const round = (over: Record<string, unknown> = {}) => ({
  id: 'r1', number: 5, name: 'Derbi', seasonId: 'se1',
  startsAt: '2026-03-01T10:00:00.000Z', endsAt: '2026-03-08T10:00:00.000Z',
  ...over,
});

const renderSheet = (edit: Record<string, unknown> | null = null) =>
  render(<RoundFormSheet open onOpenChange={state.onOpenChange} edit={edit as never} seasonId="se1" />);

beforeEach(() => {
  state.create = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.update = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.onOpenChange = vi.fn();
});

describe('RoundFormSheet', () => {
  it('novo kolo kreće od broja 1 sa praznim datumima', () => {
    renderSheet();
    expect(formSheetState.title).toBe('Novo kolo');
    expect(screen.getByPlaceholderText('admin.roundForm.numberPlaceholder')).toHaveValue(1);
    expect(screen.getByPlaceholderText('admin.roundForm.namePlaceholder')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Kreiraj' })).toBeEnabled();
  });

  it('kreiranje šalje sezonu, broj i datume', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.clear(screen.getByPlaceholderText('admin.roundForm.numberPlaceholder'));
    await user.type(screen.getByPlaceholderText('admin.roundForm.numberPlaceholder'), '3');
    await user.type(screen.getByPlaceholderText('admin.roundForm.namePlaceholder'), 'Kolo 3');
    const dates = screen.getAllByDisplayValue('');
    await user.type(dates[dates.length - 2] as HTMLElement, '2026-04-01');
    await user.type(dates[dates.length - 1] as HTMLElement, '2026-04-08');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(state.create.mutateAsync).toHaveBeenCalledWith({
      seasonId: 'se1', number: 3, name: 'Kolo 3', startsAt: '2026-04-01', endsAt: '2026-04-08',
    }));
    expect(state.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('prazan naziv i datumi se izostavljaju', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(state.create.mutateAsync).toHaveBeenCalledWith({
      seasonId: 'se1', number: 1, name: undefined, startsAt: undefined, endsAt: undefined,
    }));
  });

  it('izmjena prikazuje samo datum bez vremena i šalje ID', async () => {
    const user = userEvent.setup();
    renderSheet(round());
    expect(formSheetState.title).toBe('Uredi kolo');
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Derbi')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-03-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-03-08')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Spremi' }));
    await waitFor(() => expect(state.update.mutateAsync).toHaveBeenCalledWith({
      id: 'r1', seasonId: 'se1', number: 5, name: 'Derbi',
      startsAt: '2026-03-01', endsAt: '2026-03-08',
    }));
  });

  it('kolo bez datuma ostavlja polja prazna', () => {
    renderSheet(round({ startsAt: null, endsAt: null, name: null }));
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Derbi')).toBeNull();
  });

  it('greška servera se prikazuje, a nepoznata greška daje generičku poruku', async () => {
    const user = userEvent.setup();
    state.create = { ...state.create, mutateAsync: vi.fn(async () => { throw new Error('Kolo postoji'); }) };
    const view = renderSheet();
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(screen.getByText('Kolo postoji')).toBeInTheDocument());
    expect(state.onOpenChange).not.toHaveBeenCalled();
    view.unmount();
    state.create = { ...state.create, mutateAsync: vi.fn(async () => { throw 'pad'; }) };
    renderSheet();
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(screen.getByText('Spremanje nije uspjelo.')).toBeInTheDocument());
  });

  it('dok je mutacija u toku dugme je onemogućeno', () => {
    state.update = { ...state.update, isPending: true };
    renderSheet(round());
    expect(screen.getByRole('button', { name: 'Spremi' })).toBeDisabled();
  });
});
