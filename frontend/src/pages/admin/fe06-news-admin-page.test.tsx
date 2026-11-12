import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsAdminPage } from './NewsAdminPage';
import { newsAdminState as state } from '../../test/doubles/news-admin-doubles';
import { adminShellState } from '../../test/doubles/admin-shell-doubles';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string, o?: { title?: string }) => (o?.title ? `${k}:${o.title}` : k) }),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.perms } }) }));
vi.mock('../../hooks', () => ({
  useNewsList: (...args: unknown[]) => {
    state.listArgs = args;
    return state.list;
  },
}));
vi.mock('../../hooks/use-news-admin', () => ({
  useNewsCategories: () => ({ data: state.categories }),
  useUpdateNewsStatus: () => state.updateStatus,
  useSubmitNewsForReview: () => state.submit,
  useDeleteNews: () => state.remove,
}));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/admin/AdminPageShell', async () => {
  const d = await import('../../test/doubles/admin-shell-doubles');
  return { AdminPageShell: d.AdminPageShellDouble, AdminDataTable: d.AdminDataTableDouble };
});
vi.mock('./NewsCategoriesDialog', async () => ({
  NewsCategoriesDialog: (await import('../../test/doubles/news-admin-doubles')).NewsCategoriesDialogDouble,
}));
vi.mock('../../components/admin/ConfirmDialog', async () => ({
  ConfirmDialog: (await import('../../test/doubles/news-admin-doubles')).ConfirmDialogDouble,
}));

const news = (over: Record<string, unknown> = {}) => ({
  id: 'n1', title: 'Naslov vijesti', slug: 'naslov-vijesti', status: 'DRAFT',
  category: { id: 'c1', name: 'Klub' },
  ...over,
});

const renderPage = () => render(<MemoryRouter><NewsAdminPage /></MemoryRouter>);

beforeEach(() => {
  state.perms = [];
  state.list = { data: [], isLoading: false, isError: false, refetch: vi.fn() };
  state.categories = [{ id: 'c1', name: 'Klub' }, { id: 'c2', name: 'Omladinski' }];
  state.listArgs = [];
  state.updateStatus = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.submit = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.remove = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.categoriesDialog = null;
  state.confirm = null;
  adminShellState.retried = 0;
});

describe('NewsAdminPage — prikaz i filteri', () => {
  it('prikazuje naslov, praznu listu i kategorije u filteru', () => {
    renderPage();
    expect(screen.getByText('admin.news')).toBeInTheDocument();
    expect(screen.getByText('Nema vijesti — kreirajte prvu.')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'admin.newsAdmin.allCategories' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Omladinski' })).toBeInTheDocument();
  });

  it('odabir kategorije prosljeđuje filter listi', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(state.listArgs).toEqual([undefined, undefined]);
    await user.selectOptions(screen.getByRole('combobox'), 'c2');
    await waitFor(() => expect(state.listArgs).toEqual([undefined, 'c2']));
    await user.selectOptions(screen.getByRole('combobox'), '');
    await waitFor(() => expect(state.listArgs).toEqual([undefined, undefined]));
  });

  it('red prikazuje naslov kao link, kategoriju i status', () => {
    state.list = { ...state.list, data: [news()] };
    renderPage();
    const row = screen.getByTestId('row-n1');
    expect(within(row).getByRole('link', { name: 'Naslov vijesti' })).toHaveAttribute('href', '/admin/news/n1/edit');
    expect(within(row).getByText('Klub')).toBeInTheDocument();
    expect(within(row).getByText('Nacrt')).toBeInTheDocument();
  });

  it('vijest bez kategorije prikazuje crticu, a objavljena zeleni status', () => {
    state.list = { ...state.list, data: [news({ category: null, status: 'PUBLISHED' })] };
    renderPage();
    const row = screen.getByTestId('row-n1');
    expect(within(row).getByText('—')).toBeInTheDocument();
    expect(within(row).getByText('Objavljeno')).toBeInTheDocument();
  });

  it('greška učitavanja nudi ponovni pokušaj', async () => {
    const user = userEvent.setup();
    state.list = { ...state.list, isError: true };
    renderPage();
    await user.click(screen.getByRole('button', { name: 'pokušaj-ponovo' }));
    expect(state.list.refetch).toHaveBeenCalledTimes(1);
  });

  it('dugme za kategorije vidi samo news.manage, a nova vijest je uvijek dostupna', async () => {
    const user = userEvent.setup();
    const { unmount } = renderPage();
    expect(screen.queryByRole('button', { name: 'admin.newsAdmin.categories' })).toBeNull();
    expect(screen.getByRole('link', { name: 'admin.content.newNews' })).toHaveAttribute('href', '/admin/news/new');
    unmount();
    state.perms = ['news.manage'];
    renderPage();
    await user.click(screen.getByRole('button', { name: 'admin.newsAdmin.categories' }));
    expect(screen.getByText('kategorije:true')).toBeInTheDocument();
  });
});
