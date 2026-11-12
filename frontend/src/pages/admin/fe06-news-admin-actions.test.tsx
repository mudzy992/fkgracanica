import { render, screen, waitFor } from '@testing-library/react';
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

describe('NewsAdminPage — akcije po statusu i dozvolama', () => {
  it('novinar bez odobrenja na nacrtu dobija predaju na pregled', async () => {
    const user = userEvent.setup();
    state.perms = ['news.submit'];
    state.list = { ...state.list, data: [news()] };
    renderPage();
    expect(screen.queryByRole('button', { name: 'Objavi' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Predaj na pregled' }));
    await waitFor(() => expect(state.submit.mutateAsync).toHaveBeenCalledWith('n1'));
  });

  it('odobravatelj objavljuje nacrt i odobrava vijest na pregledu', async () => {
    const user = userEvent.setup();
    state.perms = ['news.approve'];
    state.list = {
      ...state.list,
      data: [news({ id: 'd1' }), news({ id: 'p1', title: 'Na pregledu', status: 'PENDING' })],
    };
    renderPage();
    expect(screen.queryByRole('button', { name: 'Predaj na pregled' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Objavi' }));
    await waitFor(() => expect(state.updateStatus.mutateAsync).toHaveBeenCalledWith({ id: 'd1', status: 'PUBLISHED' }));
    await user.click(screen.getByRole('button', { name: 'Odobri i objavi' }));
    await waitFor(() => expect(state.updateStatus.mutateAsync).toHaveBeenCalledWith({ id: 'p1', status: 'PUBLISHED' }));
  });

  it('objavljena vijest nudi pregled na sajtu i arhiviranje', async () => {
    const user = userEvent.setup();
    state.list = { ...state.list, data: [news({ status: 'PUBLISHED' })] };
    renderPage();
    expect(screen.getByRole('link', { name: 'Pregled' })).toHaveAttribute('href', '/vijesti/naslov-vijesti');
    await user.click(screen.getByRole('button', { name: 'Arhiviraj' }));
    await waitFor(() => expect(state.updateStatus.mutateAsync).toHaveBeenCalledWith({ id: 'n1', status: 'ARCHIVED' }));
  });

  it('dugmad su onemogućena dok je mutacija u toku', () => {
    state.perms = ['news.submit'];
    state.submit = { ...state.submit, isPending: true };
    state.updateStatus = { ...state.updateStatus, isPending: true };
    state.list = { ...state.list, data: [news()] };
    renderPage();
    expect(screen.getByRole('button', { name: 'Predaj na pregled' })).toBeDisabled();
  });

  it('brisanje traži potvrdu sa naslovom i šalje ID', async () => {
    const user = userEvent.setup();
    state.list = { ...state.list, data: [news()] };
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Obriši' }));
    expect(screen.getByText(
      'brisanje:admin.newsAdmin.deleteTitle:admin.newsAdmin.deleteConfirm:Naslov vijesti:false',
    )).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'potvrdi-brisanje' }));
    await waitFor(() => expect(state.remove.mutateAsync).toHaveBeenCalledWith('n1'));
    await waitFor(() => expect(state.confirm?.open).toBe(false));
  });

  it('otkazano brisanje ne šalje zahtjev', async () => {
    const user = userEvent.setup();
    state.list = { ...state.list, data: [news()] };
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Obriši' }));
    await user.click(screen.getByRole('button', { name: 'otkaži-brisanje' }));
    expect(state.confirm?.open).toBe(false);
    expect(state.remove.mutateAsync).not.toHaveBeenCalled();
  });
});
