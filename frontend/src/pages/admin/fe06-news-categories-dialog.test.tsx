import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsCategoriesDialog } from './NewsCategoriesDialog';

const state = vi.hoisted(() => ({
  categories: undefined as unknown,
  create: vi.fn(),
  creating: false,
  remove: vi.fn(),
  removing: false,
  closed: [] as boolean[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-news-admin', () => ({
  useNewsCategories: () => ({ data: state.categories }),
  useCreateNewsCategory: () => ({ mutateAsync: state.create, isPending: state.creating }),
  useDeleteNewsCategory: () => ({ mutateAsync: state.remove, isPending: state.removing }),
}));
vi.mock('../../components/ui/dialog', () => ({
  Dialog: ({ open, children, preventClose }: { open: boolean; children: React.ReactNode; preventClose?: boolean }) =>
    open ? <div data-testid="dialog" data-prevent={String(!!preventClose)}>{children}</div> : null,
  DialogHeader: ({ children, onClose, preventClose }: {
    children: React.ReactNode; onClose: () => void; preventClose?: boolean;
  }) => (
    <header><h2>{children}</h2>
      <button onClick={onClose} disabled={preventClose} aria-label="actions.close">x</button></header>
  ),
  DialogBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <footer>{children}</footer>,
}));

const cat = (over: Record<string, unknown> = {}) => ({
  id: 'k1',
  name: 'Vijesti',
  slug: 'vijesti',
  ...over,
});

const renderDialog = (over: Record<string, unknown> = {}) =>
  render(
    <NewsCategoriesDialog open onOpenChange={(o: boolean) => state.closed.push(o)} {...(over as object)} />,
  );

const nameInput = () => screen.getByPlaceholderText('admin.newsCategories.newPlaceholder') as HTMLInputElement;

beforeEach(() => {
  state.categories = [cat(), cat({ id: 'k2', name: 'Intervju', slug: 'intervju' })];
  state.create.mockReset();
  state.create.mockResolvedValue({});
  state.creating = false;
  state.remove.mockReset();
  state.remove.mockResolvedValue({});
  state.removing = false;
  state.closed = [];
});

describe('NewsCategoriesDialog — prikaz', () => {
  it('zatvoren dijalog ne prikazuje sadržaj', () => {
    render(
      <NewsCategoriesDialog open={false} onOpenChange={() => {}} />,
    );
    expect(screen.queryByTestId('dialog')).toBeNull();
  });

  it('prikazuje kategorije sa slugom', () => {
    renderDialog();
    expect(screen.getByText('Kategorije vijesti')).toBeInTheDocument();
    expect(screen.getByText('Vijesti')).toBeInTheDocument();
    expect(screen.getByText('vijesti')).toBeInTheDocument();
    expect(screen.getByText('Intervju')).toBeInTheDocument();
  });

  it('prazna lista, omotač data i undefined daju poruku praznog stanja', () => {
    for (const value of [{ data: [] }, undefined, null, 'x']) {
      state.categories = value;
      const { unmount } = renderDialog();
      expect(screen.getByText('admin.newsCategories.empty')).toBeInTheDocument();
      unmount();
    }
  });

  it('Zatvori i X prijavljuju zatvaranje kad forma nije prljava', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole('button', { name: 'Zatvori' }));
    await user.click(screen.getByRole('button', { name: 'actions.close' }));
    expect(state.closed).toEqual([false, false]);
  });
});

describe('NewsCategoriesDialog — dodavanje', () => {
  it('Dodaj je onemogućen bez naziva i za same razmake', async () => {
    const user = userEvent.setup();
    renderDialog();
    const add = screen.getByRole('button', { name: 'Dodaj' });
    expect(add).toBeDisabled();
    await user.type(nameInput(), '   ');
    expect(add).toBeDisabled();
  });

  it('dodavanje šalje očišćen naziv i prazni polje', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(nameInput(), '  Analiza  ');
    await user.click(screen.getByRole('button', { name: 'Dodaj' }));
    await waitFor(() => expect(state.create).toHaveBeenCalledWith({ name: 'Analiza' }));
    expect(nameInput()).toHaveValue('');
  });

  it('Enter na prazno polje ne šalje zahtjev', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(nameInput(), '{Enter}');
    expect(state.create).not.toHaveBeenCalled();
  });

  it('Enter u polju pokreće dodavanje', async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(nameInput(), 'Enter kategorija{Enter}');
    await waitFor(() => expect(state.create).toHaveBeenCalledWith({ name: 'Enter kategorija' }));
  });

  it('greška kreiranja prikazuje poruku i zadržava naziv', async () => {
    const user = userEvent.setup();
    state.create.mockRejectedValue(new Error('duplikat'));
    renderDialog();
    await user.type(nameInput(), 'Vijesti');
    await user.click(screen.getByRole('button', { name: 'Dodaj' }));
    await waitFor(() =>
      expect(screen.getByText('Greška pri kreiranju kategorije')).toBeInTheDocument(),
    );
    expect(nameInput()).toHaveValue('Vijesti');
  });

  it('uspješno dodavanje briše prethodnu grešku', async () => {
    const user = userEvent.setup();
    state.create.mockRejectedValueOnce(new Error('x')).mockResolvedValueOnce({});
    renderDialog();
    await user.type(nameInput(), 'Prva');
    await user.click(screen.getByRole('button', { name: 'Dodaj' }));
    await waitFor(() => expect(screen.getByText(/Greška pri kreiranju/)).toBeInTheDocument());
    await user.type(nameInput(), 'Druga');
    await user.click(screen.getByRole('button', { name: 'Dodaj' }));
    await waitFor(() => expect(screen.queryByText(/Greška pri kreiranju/)).toBeNull());
  });

  it('dok kreiranje traje dugme je onemogućeno', () => {
    state.creating = true;
    renderDialog();
    expect(screen.getByRole('button', { name: 'Dodaj' })).toBeDisabled();
  });
});

describe('NewsCategoriesDialog — brisanje i zaštita nespremljenog', () => {
  it('prljavo polje blokira zatvaranje dijaloga', async () => {
    const user = userEvent.setup();
    renderDialog();
    expect(screen.getByTestId('dialog')).toHaveAttribute('data-prevent', 'false');
    await user.type(nameInput(), 'Nova');
    expect(screen.getByTestId('dialog')).toHaveAttribute('data-prevent', 'true');
    expect(screen.getByRole('button', { name: 'actions.close' })).toBeDisabled();
  });

  it('brisanje traži potvrdu i briše tek nakon potvrde', async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderDialog();
    const item = screen.getByText('Intervju').closest('li') as HTMLElement;
    await user.click(within(item).getByRole('button', { name: 'Obriši' }));
    expect(confirm).toHaveBeenCalledWith('Obrisati kategoriju "Intervju"?');
    await waitFor(() => expect(state.remove).toHaveBeenCalledWith('k2'));
    confirm.mockRestore();
  });

  it('odricanje potvrde ne briše kategoriju', async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderDialog();
    const item = screen.getByText('Vijesti').closest('li') as HTMLElement;
    await user.click(within(item).getByRole('button', { name: 'Obriši' }));
    expect(confirm).toHaveBeenCalled();
    expect(state.remove).not.toHaveBeenCalled();
    confirm.mockRestore();
  });

  it('dok brisanje traje sva dugmad su onemogućena', () => {
    state.removing = true;
    renderDialog();
    const buttons = screen.getAllByRole('button', { name: 'Obriši' });
    buttons.forEach((b) => expect(b).toBeDisabled());
  });
});
