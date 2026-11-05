import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HallOfFameAdminFormSheet } from './HallOfFameAdminFormSheet';

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
  useCreateHallOfFame: () => ({
    mutateAsync: state.create,
    isPending: state.createPending,
    isError: !!state.createError,
    error: state.createError,
  }),
  useUpdateHallOfFame: () => ({
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

const entry = (over: Record<string, unknown> = {}) => ({
  id: 'h1',
  name: 'Asim Softić',
  role: 'Napadač',
  years: '1965–1978',
  bio: 'Legenda kluba',
  imagePath: 'mediji/asim.jpg',
  ...over,
});

const renderSheet = (over: Record<string, unknown> = {}) =>
  render(
    <HallOfFameAdminFormSheet
      open
      onOpenChange={(open: boolean) => state.closed.push(open)}
      edit={null}
      {...(over as object)}
    />,
  );

const name = () => screen.getByPlaceholderText('admin.hofForm.name') as HTMLInputElement;
const role = () => screen.getByPlaceholderText('admin.hofForm.role') as HTMLInputElement;

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

describe('HallOfFameAdminFormSheet — kreiranje', () => {
  it('prazna forma traži ime i ulogu prije slanja', async () => {
    const user = userEvent.setup();
    renderSheet();
    expect(screen.getByRole('heading', { name: 'admin.hofForm.create' })).toBeInTheDocument();
    const button = screen.getByRole('button', { name: 'actions.create' });
    expect(button).toBeDisabled();
    await user.type(name(), 'Asim');
    expect(button).toBeDisabled();
    await user.type(role(), 'Napadač');
    expect(button).toBeEnabled();
  });

  it('kreiranje šalje popunjena polja i zatvara formu', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.type(name(), 'Asim Softić');
    await user.type(role(), 'Napadač');
    await user.type(screen.getByPlaceholderText('admin.hofForm.years'), '1965–1978');
    await user.type(screen.getByPlaceholderText('admin.hofForm.bio'), 'Legenda');
    await user.click(screen.getByRole('button', { name: 'odaberi-medij' }));
    await user.click(screen.getByRole('button', { name: 'actions.create' }));
    await waitFor(() =>
      expect(state.create).toHaveBeenCalledWith({
        name: 'Asim Softić',
        role: 'Napadač',
        years: '1965–1978',
        bio: 'Legenda',
        imagePath: 'media/novo.jpg',
      }),
    );
    expect(state.closed).toEqual([false]);
  });

  it('prazne godine, biografija i slika idu kao undefined/null', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.type(name(), 'Neko');
    await user.type(role(), 'Trener');
    await user.click(screen.getByRole('button', { name: 'actions.create' }));
    await waitFor(() =>
      expect(state.create).toHaveBeenCalledWith({
        name: 'Neko',
        role: 'Trener',
        years: undefined,
        bio: undefined,
        imagePath: null,
      }),
    );
  });

  it('greška spremanja drži formu otvorenom i prikazuje poruku', async () => {
    const user = userEvent.setup();
    state.create.mockRejectedValue(new Error('puklo'));
    renderSheet();
    await user.type(name(), 'X');
    await user.type(role(), 'Y');
    await user.click(screen.getByRole('button', { name: 'actions.create' }));
    await waitFor(() => expect(state.create).toHaveBeenCalled());
    expect(state.closed).toEqual([]);
  });

  it('greška iz mutacije koristi generičku poruku', () => {
    state.createError = new Error('server');
    renderSheet();
    expect(screen.getByText('msg:server')).toBeInTheDocument();
  });
});

describe('HallOfFameAdminFormSheet — izmjena', () => {
  it('prefill-a zapis i nudi Sačuvaj', () => {
    renderSheet({ edit: entry() });
    expect(screen.getByRole('heading', { name: 'admin.hofForm.edit' })).toBeInTheDocument();
    expect(name()).toHaveValue('Asim Softić');
    expect(role()).toHaveValue('Napadač');
    expect(screen.getByPlaceholderText('admin.hofForm.years')).toHaveValue('1965–1978');
    expect(screen.getByPlaceholderText('admin.hofForm.bio')).toHaveValue('Legenda kluba');
    expect(screen.getByText(/mediji\/asim\.jpg/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'actions.save' })).toBeInTheDocument();
  });

  it('koristi photoPath kad nema imagePath i prazna polja bez vrijednosti', () => {
    renderSheet({ edit: entry({ imagePath: null, photoPath: 'mediji/stara.jpg', years: null, bio: null }) });
    expect(screen.getByText(/mediji\/stara\.jpg/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin.hofForm.years')).toHaveValue('');
    expect(screen.getByPlaceholderText('admin.hofForm.bio')).toHaveValue('');
  });

  it('izmjena šalje id i ne zove kreiranje', async () => {
    const user = userEvent.setup();
    renderSheet({ edit: entry() });
    await user.clear(name());
    await user.type(name(), 'Novo ime');
    await user.click(screen.getByRole('button', { name: 'actions.save' }));
    await waitFor(() =>
      expect(state.update).toHaveBeenCalledWith(expect.objectContaining({ id: 'h1', name: 'Novo ime' })),
    );
    expect(state.create).not.toHaveBeenCalled();
    expect(state.closed).toEqual([false]);
  });

  it('spremanje u toku gasi dugme', () => {
    state.updatePending = true;
    renderSheet({ edit: entry() });
    expect(screen.getByRole('button', { name: 'actions.save' })).toBeDisabled();
  });

  it('greška izmjene koristi generičku poruku', () => {
    state.updateError = 'nepoznato';
    renderSheet({ edit: entry() });
    expect(screen.getByText('Spremanje nije uspjelo.')).toBeInTheDocument();
  });
});
