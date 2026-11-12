import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CmsPageCreateDialog } from './CmsPageCreateDialog';

const state = vi.hoisted(() => ({
  create: vi.fn(),
  pending: false,
  closed: [] as boolean[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks/use-cms-pages', () => ({
  useCreateCmsPage: () => ({ mutateAsync: state.create, isPending: state.pending }),
}));
vi.mock('../../../components/ui/dialog', () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogHeader: ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
    <header>
      <h2>{children}</h2>
      <button type="button" onClick={onClose} aria-label="zatvori">x</button>
    </header>
  ),
  DialogBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <footer>{children}</footer>,
}));

const renderDialog = (over: Record<string, unknown> = {}) =>
  render(
    <CmsPageCreateDialog open onOpenChange={(open: boolean) => state.closed.push(open)} {...(over as object)} />,
  );

const titleInput = () => screen.getByPlaceholderText('admin.cmsPages.titleRequired');
const slugInput = () => screen.getByPlaceholderText('admin.cmsPages.slugRequired');

beforeEach(() => {
  state.create.mockReset().mockResolvedValue(undefined);
  state.pending = false;
  state.closed = [];
});

describe('CmsPageCreateDialog', () => {
  it('ne prikazuje ništa dok je zatvoren', () => {
    renderDialog({ open: false });
    expect(screen.queryByTestId('dialog')).toBeNull();
  });

  it('prikazuje naslov i prazna polja', () => {
    renderDialog();
    expect(screen.getByRole('heading', { name: 'admin.cmsPages.create' })).toBeInTheDocument();
    expect(titleInput()).toHaveValue('');
    expect(slugInput()).toHaveValue('');
    expect(screen.queryByText(/obavezni/)).toBeNull();
  });

  it('bez slug-a i naslova prikazuje grešku i ne šalje zahtjev', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    expect(screen.getByText('Slug i naslov su obavezni')).toBeInTheDocument();
    expect(state.create).not.toHaveBeenCalled();
  });

  it('sa samo razmacima u poljima takođe prijavljuje grešku', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(titleInput(), '   ');
    await user.type(slugInput(), '   ');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    expect(screen.getByText('Slug i naslov su obavezni')).toBeInTheDocument();
    expect(state.create).not.toHaveBeenCalled();
  });

  it('korektan unos kreira stranicu kao nacrt i zatvara dijalog', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(titleInput(), '  O nama  ');
    await user.type(slugInput(), '  o-nama  ');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(state.create).toHaveBeenCalledTimes(1));
    expect(state.create).toHaveBeenCalledWith({ slug: 'o-nama', title: 'O nama', status: 'DRAFT' });
    expect(state.closed).toEqual([false]);
  });

  it('greška servera prikazuje poruku bez zatvaranja', async () => {
    const user = userEvent.setup();
    state.create.mockRejectedValue(new Error('puklo'));
    renderDialog();
    await user.type(titleInput(), 'O nama');
    await user.type(slugInput(), 'o-nama');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    expect(await screen.findByText('Greška pri kreiranju')).toBeInTheDocument();
    expect(state.closed).toEqual([]);
  });

  it('nakon uspješnog kreiranja polja su ponovo prazna', async () => {
    const user = userEvent.setup();
    const { rerender } = renderDialog();
    await user.type(titleInput(), 'O nama');
    await user.type(slugInput(), 'o-nama');
    await user.click(screen.getByRole('button', { name: 'Kreiraj' }));
    await waitFor(() => expect(state.create).toHaveBeenCalled());
    rerender(
      <CmsPageCreateDialog open onOpenChange={(open: boolean) => state.closed.push(open)} />,
    );
    expect(titleInput()).toHaveValue('');
    expect(slugInput()).toHaveValue('');
  });

  it('dok traje kreiranje dugme je onemogućeno', () => {
    state.pending = true;
    renderDialog();
    expect(screen.getByRole('button', { name: 'Kreiraj' })).toBeDisabled();
  });

  it('Odustani i zaglavlje zatvaraju dijalog', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Odustani' }));
    await user.click(screen.getByRole('button', { name: 'zatvori' }));
    expect(state.closed).toEqual([false, false]);
  });
});
