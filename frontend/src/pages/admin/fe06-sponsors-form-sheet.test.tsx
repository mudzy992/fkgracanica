import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SponsorsAdminFormSheet } from './SponsorsAdminFormSheet';
import { formSheetState } from '../../test/doubles/form-sheet-doubles';

const state = vi.hoisted(() => ({
  create: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  update: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  onOpenChange: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-content-admin', () => ({
  useCreateSponsor: () => state.create,
  useUpdateSponsor: () => state.update,
}));
vi.mock('../../components/admin/AdminFormSheet', async () => ({
  AdminFormSheet: (await import('../../test/doubles/form-sheet-doubles')).AdminFormSheetDouble,
}));
vi.mock('../../components/admin/MediaPicker', async () => ({
  MediaPicker: (await import('../../test/doubles/form-sheet-doubles')).MediaPickerDouble,
}));

const sponsor = (over: Record<string, unknown> = {}) => ({
  id: 'sp1', name: 'Bank', tier: 'GOLD', url: 'https://bank.ba', logoPath: 'logos/bank.png',
  ...over,
});

const renderSheet = (edit: Record<string, unknown> | null = null) =>
  render(<SponsorsAdminFormSheet open onOpenChange={state.onOpenChange} edit={edit as never} />);

beforeEach(() => {
  state.create = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.update = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.onOpenChange = vi.fn();
});

describe('SponsorsAdminFormSheet', () => {
  it('novi sponzor ima prazna polja, PARTNER kategoriju i onemogućeno dugme', () => {
    renderSheet();
    expect(formSheetState.title).toBe('admin.sponsorForm.create');
    expect(screen.getByPlaceholderText('admin.rolesForm.name')).toHaveValue('');
    expect(screen.getByRole('combobox')).toHaveValue('PARTNER');
    expect(screen.getByRole('button', { name: 'actions.create' })).toBeDisabled();
    expect(screen.getByText('media:admin.sponsorForm.logo:-')).toBeInTheDocument();
  });

  it('kreiranje šalje sva polja i zatvara sheet', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.type(screen.getByPlaceholderText('admin.rolesForm.name'), 'Bank');
    await user.selectOptions(screen.getByRole('combobox'), 'GOLD');
    await user.type(screen.getByPlaceholderText('admin.sponsorForm.url'), 'https://bank.ba');
    await user.click(screen.getByRole('button', { name: 'odaberi-medij' }));
    await user.click(screen.getByRole('button', { name: 'actions.create' }));
    await waitFor(() => expect(state.create.mutateAsync).toHaveBeenCalledWith({
      name: 'Bank', tier: 'GOLD', url: 'https://bank.ba', logoPath: 'media/novo.jpg',
    }));
    expect(state.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('prazni opcioni podaci se ne šalju', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.type(screen.getByPlaceholderText('admin.rolesForm.name'), 'Bank');
    await user.click(screen.getByRole('button', { name: 'actions.create' }));
    await waitFor(() => expect(state.create.mutateAsync).toHaveBeenCalledWith({
      name: 'Bank', tier: 'PARTNER', url: undefined, logoPath: undefined,
    }));
  });

  it('izmjena popunjava polja i šalje ID', async () => {
    const user = userEvent.setup();
    renderSheet(sponsor());
    expect(formSheetState.title).toBe('admin.sponsorForm.edit');
    expect(screen.getByDisplayValue('Bank')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('GOLD');
    expect(screen.getByDisplayValue('https://bank.ba')).toBeInTheDocument();
    expect(screen.getByText('media:admin.sponsorForm.logo:logos/bank.png')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'actions.save' }));
    await waitFor(() => expect(state.update.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      id: 'sp1', name: 'Bank', tier: 'GOLD',
    })));
  });

  it('sponzor bez opcionih polja ostaje prazan pri izmjeni', () => {
    renderSheet(sponsor({ tier: null, url: null, logoPath: null }));
    expect(screen.getByRole('combobox')).toHaveValue('PARTNER');
    expect(screen.getByText('media:admin.sponsorForm.logo:-')).toBeInTheDocument();
  });

  it('greška spremanja ostaje u sheetu', async () => {
    const user = userEvent.setup();
    state.create = { ...state.create, mutateAsync: vi.fn(async () => { throw new Error('x'); }) };
    const { rerender } = renderSheet();
    await user.type(screen.getByPlaceholderText('admin.rolesForm.name'), 'Bank');
    await user.click(screen.getByRole('button', { name: 'actions.create' }));
    await waitFor(() => expect(screen.getByText('Spremanje nije uspjelo. Pokušajte ponovo.')).toBeInTheDocument());
    expect(state.onOpenChange).not.toHaveBeenCalled();
    rerender(<SponsorsAdminFormSheet open={false} onOpenChange={state.onOpenChange} edit={null} />);
    rerender(<SponsorsAdminFormSheet open onOpenChange={state.onOpenChange} edit={null} />);
    expect(screen.queryByText('Spremanje nije uspjelo. Pokušajte ponovo.')).toBeNull();
  });

  it('dok je mutacija u toku dugme je onemogućeno', () => {
    state.update = { ...state.update, isPending: true };
    renderSheet(sponsor());
    expect(screen.getByRole('button', { name: 'actions.save' })).toBeDisabled();
  });
});
