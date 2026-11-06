import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClubsAdminFormSheet } from './ClubsAdminFormSheet';
import { formSheetState } from '../../test/doubles/form-sheet-doubles';

const state = vi.hoisted(() => ({
  create: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  update: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  onOpenChange: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-competition-admin', () => ({
  useCreateClub: () => state.create,
  useUpdateClub: () => state.update,
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

const club = (over: Record<string, unknown> = {}) => ({
  id: 'cl1', name: 'FK Graca', city: 'Sarajevo', stadium: 'Gradski', description: 'Klub',
  crestPath: 'crests/graca.png', isOwnClub: true,
  ...over,
});

const renderSheet = (edit: Record<string, unknown> | null = null) =>
  render(<ClubsAdminFormSheet open onOpenChange={state.onOpenChange} edit={edit as never} />);

beforeEach(() => {
  state.create = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.update = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.onOpenChange = vi.fn();
});

describe('ClubsAdminFormSheet', () => {
  it('novi klub ima prazna polja i onemogućeno dugme', () => {
    renderSheet();
    expect(formSheetState.title).toBe('admin.clubForm.create');
    expect(screen.getByPlaceholderText('admin.club.nameRequired')).toHaveValue('');
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('button', { name: 'Kreiraj' })).toBeDisabled();
  });

  it('kreiranje šalje sva polja uključujući vlastiti klub', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.type(screen.getByPlaceholderText('admin.club.nameRequired'), 'FK Novi');
    await user.type(screen.getByPlaceholderText('admin.club.city'), 'Mostar');
    await user.type(screen.getByPlaceholderText('admin.clubForm.stadium'), 'Stadion pod Bijelim');
    await user.type(screen.getByPlaceholderText('admin.clubForm.descriptionPublic'), 'Historija kluba');
    await user.click(screen.getByRole('button', { name: 'odaberi-medij' }));
    await user.click(screen.getByRole('switch'));
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(state.create.mutateAsync).toHaveBeenCalledWith({
      name: 'FK Novi', city: 'Mostar', stadium: 'Stadion pod Bijelim',
      description: 'Historija kluba', crestPath: 'media/novo.jpg', isOwnClub: true,
    }));
    expect(state.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('prazna opciona polja se izostavljaju', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.type(screen.getByPlaceholderText('admin.club.nameRequired'), 'FK Novi');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(state.create.mutateAsync).toHaveBeenCalledWith({
      name: 'FK Novi', city: undefined, stadium: undefined,
      description: undefined, crestPath: undefined, isOwnClub: false,
    }));
  });

  it('izmjena popunjava polja, uključujući logo kao rezervni grb', async () => {
    const user = userEvent.setup();
    renderSheet(club({ crestPath: null, logoPath: 'logos/graca.png' }));
    expect(formSheetState.title).toBe('admin.clubForm.edit');
    expect(screen.getByDisplayValue('FK Graca')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Sarajevo')).toBeInTheDocument();
    expect(screen.getByText('media:admin.club.crest:logos/graca.png')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('button', { name: 'Spremi' }));
    await waitFor(() => expect(state.update.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      id: 'cl1', name: 'FK Graca', isOwnClub: true,
    })));
  });

  it('klub bez opcionih podataka ostavlja polja prazna', () => {
    renderSheet(club({ city: null, stadium: null, description: null, crestPath: null, isOwnClub: null }));
    expect(screen.getByText('media:admin.club.crest:-')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('greška spremanja prikazuje poruku i ne zatvara sheet', async () => {
    const user = userEvent.setup();
    state.create = { ...state.create, mutateAsync: vi.fn(async () => { throw new Error('x'); }) };
    const { rerender } = renderSheet();
    await user.type(screen.getByPlaceholderText('admin.club.nameRequired'), 'FK Novi');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(screen.getByText('admin.common.saveFailed')).toBeInTheDocument());
    expect(state.onOpenChange).not.toHaveBeenCalled();
    rerender(<ClubsAdminFormSheet open={false} onOpenChange={state.onOpenChange} edit={null} />);
    rerender(<ClubsAdminFormSheet open onOpenChange={state.onOpenChange} edit={null} />);
    expect(screen.queryByText('admin.common.saveFailed')).toBeNull();
  });

  it('dok je mutacija u toku dugme je onemogućeno', () => {
    state.create = { ...state.create, isPending: true };
    renderSheet(club());
    expect(screen.getByRole('button', { name: 'Spremi' })).toBeDisabled();
  });
});
