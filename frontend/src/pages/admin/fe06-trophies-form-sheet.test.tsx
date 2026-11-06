import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TrophiesAdminFormSheet } from './TrophiesAdminFormSheet';
import { formSheetState } from '../../test/doubles/form-sheet-doubles';

const state = vi.hoisted(() => ({
  create: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  update: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  onOpenChange: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-content-admin', () => ({
  useCreateTrophy: () => state.create,
  useUpdateTrophy: () => state.update,
}));
vi.mock('../../components/admin/AdminFormSheet', async () => ({
  AdminFormSheet: (await import('../../test/doubles/form-sheet-doubles')).AdminFormSheetDouble,
}));
vi.mock('../../components/admin/MediaPicker', async () => ({
  MediaPicker: (await import('../../test/doubles/form-sheet-doubles')).MediaPickerDouble,
}));
vi.mock('../../components/ui/switch', async () => ({
  Switch: (await import('../../test/doubles/form-sheet-doubles')).SwitchDouble,
}));

const trophy = (over: Record<string, unknown> = {}) => ({
  id: 'tr1', name: 'Kup BiH', year: 2019, competition: 'Kup', description: 'Finale',
  imagePath: 'trophies/kup.png', featured: true,
  ...over,
});

const renderSheet = (edit: Record<string, unknown> | null = null) =>
  render(<TrophiesAdminFormSheet open onOpenChange={state.onOpenChange} edit={edit as never} />);

beforeEach(() => {
  state.create = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.update = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.onOpenChange = vi.fn();
});

describe('TrophiesAdminFormSheet', () => {
  it('novi trofej koristi tekuću godinu i onemogućeno dugme', () => {
    renderSheet();
    expect(formSheetState.title).toBe('admin.trophyForm.create');
    expect(screen.getByPlaceholderText('admin.trophyForm.year')).toHaveValue(new Date().getFullYear());
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('button', { name: 'Kreiraj' })).toBeDisabled();
  });

  it('kreiranje šalje sva polja i istaknutost', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.type(screen.getByPlaceholderText('admin.trophyForm.nameRequired'), 'Kup BiH');
    await user.clear(screen.getByPlaceholderText('admin.trophyForm.year'));
    await user.type(screen.getByPlaceholderText('admin.trophyForm.year'), '2020');
    await user.type(screen.getByPlaceholderText('admin.calendar.competition'), 'Kup');
    await user.type(screen.getByPlaceholderText('admin.trophyForm.description'), 'Finale');
    await user.click(screen.getByRole('button', { name: 'odaberi-medij' }));
    await user.click(screen.getByRole('switch'));
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(state.create.mutateAsync).toHaveBeenCalledWith({
      name: 'Kup BiH', year: 2020, competition: 'Kup', description: 'Finale',
      imagePath: 'media/novo.jpg', featured: true,
    }));
    expect(state.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('prazna opciona polja se izostavljaju, a slika je null', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.type(screen.getByPlaceholderText('admin.trophyForm.nameRequired'), 'Kup');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(state.create.mutateAsync).toHaveBeenCalledWith({
      name: 'Kup', year: new Date().getFullYear(), competition: undefined,
      description: undefined, imagePath: null, featured: false,
    }));
  });

  it('izmjena popunjava polja i šalje ID', async () => {
    const user = userEvent.setup();
    renderSheet(trophy());
    expect(formSheetState.title).toBe('admin.trophyForm.edit');
    expect(screen.getByDisplayValue('Kup BiH')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2019')).toBeInTheDocument();
    expect(screen.getByText('media:admin.trophyForm.image:trophies/kup.png')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('button', { name: 'Spremi' }));
    await waitFor(() => expect(state.update.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      id: 'tr1', name: 'Kup BiH', year: 2019, featured: true,
    })));
  });

  it('trofej bez opcionih podataka koristi tekuću godinu i praznu sliku', () => {
    renderSheet(trophy({ year: null, competition: null, description: null, imagePath: null, featured: null }));
    expect(screen.getByPlaceholderText('admin.trophyForm.year')).toHaveValue(new Date().getFullYear());
    expect(screen.getByText('media:admin.trophyForm.image:-')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('greška spremanja ostaje u sheetu', async () => {
    const user = userEvent.setup();
    state.create = { ...state.create, mutateAsync: vi.fn(async () => { throw new Error('x'); }) };
    const { rerender } = renderSheet();
    await user.type(screen.getByPlaceholderText('admin.trophyForm.nameRequired'), 'Kup');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(screen.getByText('admin.common.saveFailed')).toBeInTheDocument());
    expect(state.onOpenChange).not.toHaveBeenCalled();
    rerender(<TrophiesAdminFormSheet open={false} onOpenChange={state.onOpenChange} edit={null} />);
    rerender(<TrophiesAdminFormSheet open onOpenChange={state.onOpenChange} edit={null} />);
    expect(screen.queryByText('admin.common.saveFailed')).toBeNull();
  });

  it('dok je mutacija u toku dugme je onemogućeno', () => {
    state.update = { ...state.update, isPending: true };
    renderSheet(trophy());
    expect(screen.getByRole('button', { name: 'Spremi' })).toBeDisabled();
  });
});
