import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MuseumAdminFormSheet } from './MuseumAdminFormSheet';

const state = vi.hoisted(() => ({
  create: vi.fn(),
  createPending: false,
  createError: null as unknown,
  update: vi.fn(),
  updatePending: false,
  updateError: null as unknown,
  closed: [] as boolean[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-heritage-admin', () => ({
  useCreateMuseumItem: () => ({
    mutateAsync: state.create,
    isPending: state.createPending,
    isError: !!state.createError,
    error: state.createError,
  }),
  useUpdateMuseumItem: () => ({
    mutateAsync: state.update,
    isPending: state.updatePending,
    isError: !!state.updateError,
    error: state.updateError,
  }),
}));
vi.mock('../../lib/api-error', () => ({
  getApiErrorMessage: (err: unknown, fallback: string) =>
    err instanceof Error ? `msg:${err.message}` : fallback,
}));
vi.mock('../../components/admin/AdminFormSheet', async () => ({
  AdminFormSheet: (await import('../../test/doubles/form-sheet-doubles')).AdminFormSheetDouble,
}));
vi.mock('../../components/admin/MediaPicker', async () => ({
  MediaPicker: (await import('../../test/doubles/form-sheet-doubles')).MediaPickerDouble,
}));

const row = (over: Record<string, unknown> = {}) => ({
  id: 'm1',
  title: 'Dres iz 1974.',
  category: 'jersey',
  year: 1974,
  description: 'Dres prvog tima',
  imagePath: 'mediji/dres.jpg',
  ...over,
});

const renderSheet = (over: Record<string, unknown> = {}) =>
  render(
    <MuseumAdminFormSheet
      open
      onOpenChange={(open: boolean) => state.closed.push(open)}
      edit={null}
      {...(over as object)}
    />,
  );

const titleInput = () => screen.getByPlaceholderText('admin.museumForm.title') as HTMLInputElement;

beforeEach(() => {
  state.create.mockReset();
  state.create.mockResolvedValue({});
  state.createPending = false;
  state.createError = null;
  state.update.mockReset();
  state.update.mockResolvedValue({});
  state.updatePending = false;
  state.updateError = null;
  state.closed = [];
});

describe('MuseumAdminFormSheet — kreiranje', () => {
  it('prazna forma ima prazan naslov, kategoriju "artifact" i onemogućeno dugme', () => {
    renderSheet();
    expect(screen.getByRole('heading', { name: 'admin.museumForm.create' })).toBeInTheDocument();
    expect(titleInput()).toHaveValue('');
    expect(screen.getByRole('combobox')).toHaveValue('artifact');
    expect(screen.getByRole('button', { name: 'actions.create' })).toBeDisabled();
  });

  it('lista svih kategorija muzeja', () => {
    renderSheet();
    const options = screen.getAllByRole('option').map((o) => o.textContent);
    expect(options).toEqual(['Artefakt', 'Fotografija', 'Dres', 'Trofej', 'Dokument', 'Ostalo']);
  });

  it('kreiranje šalje broj za godinu i null za praznu sliku', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.type(titleInput(), 'Pehar');
    await user.selectOptions(screen.getByRole('combobox'), 'trophy');
    await user.type(screen.getByPlaceholderText('admin.trophyForm.year'), '1968');
    await user.click(screen.getByRole('button', { name: 'actions.create' }));
    await waitFor(() =>
      expect(state.create).toHaveBeenCalledWith({
        title: 'Pehar',
        category: 'trophy',
        year: 1968,
        description: undefined,
        imagePath: null,
      }),
    );
    expect(state.closed).toEqual([false]);
  });

  it('opis i slika ulaze u zahtjev kad su popunjeni', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.type(titleInput(), 'Zastava');
    await user.type(screen.getByPlaceholderText('admin.cmsWidget.description'), 'Stara zastava');
    await user.click(screen.getByRole('button', { name: 'odaberi-medij' }));
    await user.click(screen.getByRole('button', { name: 'actions.create' }));
    await waitFor(() =>
      expect(state.create.mock.calls[0][0]).toMatchObject({
        description: 'Stara zastava',
        imagePath: 'media/novo.jpg',
        year: undefined,
      }),
    );
  });

  it('greška spremanja ne zatvara formu i prikazuje poruku iz mutacije', async () => {
    const user = userEvent.setup();
    state.create.mockRejectedValue(new Error('puklo'));
    renderSheet();
    await user.type(titleInput(), 'X');
    await user.click(screen.getByRole('button', { name: 'actions.create' }));
    await waitFor(() => expect(state.create).toHaveBeenCalled());
    expect(state.closed).toEqual([]);
    state.createError = new Error('server');
    renderSheet();
    expect(screen.getByText('msg:server')).toBeInTheDocument();
  });
});

describe('MuseumAdminFormSheet — izmjena', () => {
  it('prefill-a zapis, naslov je "edit" i dugme je Sačuvaj', () => {
    renderSheet({ edit: row() });
    expect(screen.getByRole('heading', { name: 'admin.museumForm.edit' })).toBeInTheDocument();
    expect(titleInput()).toHaveValue('Dres iz 1974.');
    expect(screen.getByRole('combobox')).toHaveValue('jersey');
    expect(screen.getByPlaceholderText('admin.trophyForm.year')).toHaveValue(1974);
    expect(screen.getByRole('button', { name: 'actions.save' })).toBeInTheDocument();
    expect(screen.getByText(/mediji\/dres\.jpg/)).toBeInTheDocument();
  });

  it('izmjena šalje id i promijenjena polja', async () => {
    const user = userEvent.setup();
    renderSheet({ edit: row() });
    await user.clear(titleInput());
    await user.type(titleInput(), 'Novi naziv');
    await user.click(screen.getByRole('button', { name: 'actions.save' }));
    await waitFor(() =>
      expect(state.update).toHaveBeenCalledWith(expect.objectContaining({ id: 'm1', title: 'Novi naziv' })),
    );
    expect(state.create).not.toHaveBeenCalled();
  });

  it('zapis bez godine i opisa daje prazna polja', () => {
    renderSheet({ edit: row({ year: undefined, description: undefined, imagePath: undefined }) });
    expect(screen.getByPlaceholderText('admin.trophyForm.year')).toHaveValue(null);
    expect(screen.getByPlaceholderText('admin.cmsWidget.description')).toHaveValue('');
    expect(screen.getByText(/^media:/)).toHaveTextContent(/media:.*-$/);
  });

  it('greška izmjene koristi prijevod kao fallback poruku', () => {
    state.updateError = 'nepoznato';
    renderSheet({ edit: row() });
    expect(screen.getByText('admin.common.saveFailedShort')).toBeInTheDocument();
  });
});
