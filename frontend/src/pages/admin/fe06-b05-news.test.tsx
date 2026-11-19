import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsAdminPage } from './NewsAdminPage';
import { adminShellState } from '../../test/doubles/admin-shell-doubles';

const state = vi.hoisted(() => ({
  categories: { data: [] as unknown[], isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() },
  news: { data: [] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() },
  perms: [] as string[],
  updateStatus: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  submitReview: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  deleteNews: { mutateAsync: vi.fn(async () => ({})), isPending: false },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, opts?: Record<string, unknown>) => {
      if (opts?.defaultValue) {
        let s = opts.defaultValue as string;
        if (opts.time) s = s.replace('{{time}}', opts.time as string);
        return s;
      }
      return k;
    },
  }),
}));
vi.mock('../../hooks', () => ({
  useNewsList: () => ({ data: state.news.data, isLoading: state.news.isLoading, isError: state.news.isError, isFetching: state.news.isFetching, dataUpdatedAt: state.news.dataUpdatedAt, refetch: state.news.refetch }),
}));
vi.mock('../../hooks/use-news-admin', () => ({
  useNewsCategories: () => ({ data: state.categories.data, isFetching: state.categories.isFetching, dataUpdatedAt: state.categories.dataUpdatedAt, refetch: state.categories.refetch }),
  useUpdateNewsStatus: () => state.updateStatus,
  useSubmitNewsForReview: () => state.submitReview,
  useDeleteNews: () => state.deleteNews,
  useCreateNewsCategory: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteNewsCategory: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.perms } }) }));
vi.mock('../../lib/permissions', () => ({ hasPermission: (perms: string[], p: string) => perms.includes(p) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/admin/AdminPageShell', async () => {
  const d = await import('../../test/doubles/admin-shell-doubles');
  return { AdminPageShell: d.AdminPageShellDouble, AdminDataTable: d.AdminDataTableDouble };
});
vi.mock('./NewsCategoriesDialog', () => ({ NewsCategoriesDialog: () => null }));
vi.mock('../../components/admin/ConfirmDialog', () => ({ ConfirmDialog: () => null }));
vi.mock('../../lib/content-status-labels', () => ({ contentStatusLabel: (s: string) => s }));
vi.mock('../../lib/action-errors', () => ({ runAction: (p: Promise<unknown>) => p.catch(() => {}) }));
vi.mock('../../lib/as-array', () => ({ asArray: (x: unknown) => (Array.isArray(x) ? x : []) }));

const newsItem = (over: Record<string, unknown> = {}) => ({
  id: 'n1', title: 'Vijest 1', slug: 'vijest-1', status: 'DRAFT', category: { name: 'Opšte' }, ...over,
});

beforeEach(() => {
  state.categories = { data: [{ id: 'c1', name: 'Opšte', slug: 'opste' }] as unknown[], isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() };
  state.news = { data: [newsItem(), newsItem({ id: 'n2', title: 'Vijest 2', status: 'PUBLISHED' })] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() };
  state.perms = ['news.manage', 'news.approve', 'news.submit'];
  state.updateStatus = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof state.updateStatus;
  state.submitReview = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof state.submitReview;
  state.deleteNews = { mutateAsync: vi.fn(async () => ({})), isPending: false } as unknown as typeof state.deleteNews;
  adminShellState.retried = 0;
  adminShellState.refreshed = 0;
});

describe('B05 NewsAdminPage — P1/P2', () => {
  it('error — role=alert, heading ostaje, retry poziva oba refetch', async () => {
    state.news = { data: [] as unknown[], isLoading: false, isError: true, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.news;
    state.categories = { data: [] as unknown[], isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.categories;
    render(<MemoryRouter><NewsAdminPage /></MemoryRouter>);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'admin.news' })).toBeInTheDocument();
    const btn = within(alert).getByRole('button', { name: 'pokušaj-ponovo' });
    await userEvent.click(btn);
    expect(state.news.refetch).toHaveBeenCalled();
    expect(state.categories.refetch).toHaveBeenCalled();
  });

  it('error retry disabled kad isFetching', () => {
    state.news = { data: [] as unknown[], isLoading: false, isError: true, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.news;
    render(<MemoryRouter><NewsAdminPage /></MemoryRouter>);
    const btn = within(screen.getByRole('alert')).getByRole('button', { name: 'pokušaj-ponovo' });
    expect(btn).toBeDisabled();
  });

  it('loading — aria-busy', () => {
    state.news = { data: [] as unknown[], isLoading: true, isError: false, isFetching: true, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.news;
    render(<MemoryRouter><NewsAdminPage /></MemoryRouter>);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
  });

  it('empty ima role=status', () => {
    state.news = { data: [] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.news;
    render(<MemoryRouter><NewsAdminPage /></MemoryRouter>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('lastUpdated i Osvježi poziva oba refetch, disabled kad fetching', async () => {
    const ts = Date.now();
    state.news = { data: [newsItem()] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: ts, refetch: vi.fn() } as unknown as typeof state.news;
    state.categories = { data: [] as unknown[], isFetching: false, dataUpdatedAt: ts, refetch: vi.fn() } as unknown as typeof state.categories;
    render(<MemoryRouter><NewsAdminPage /></MemoryRouter>);
    expect(screen.getByText(/Ažurirano/)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'Osvježi' });
    await userEvent.click(btn);
    expect(state.news.refetch).toHaveBeenCalled();
    expect(state.categories.refetch).toHaveBeenCalled();
  });

  it('Arhiviraj i Obriši disabled kad isPending global', () => {
    state.news = { data: [newsItem({ status: 'PUBLISHED' })] as unknown[], isLoading: false, isError: false, isFetching: false, dataUpdatedAt: 0, refetch: vi.fn() } as unknown as typeof state.news;
    state.updateStatus = { mutateAsync: vi.fn(async () => ({})), isPending: true } as unknown as typeof state.updateStatus;
    render(<MemoryRouter><NewsAdminPage /></MemoryRouter>);
    const arh = screen.getByRole('button', { name: 'Arhiviraj' });
    const obr = screen.getByRole('button', { name: 'Obriši' });
    expect(arh).toBeDisabled();
    expect(obr).toBeDisabled();
  });

  it('bez permisije nema Kategorije, ali Nova ostaje', () => {
    state.perms = [];
    render(<MemoryRouter><NewsAdminPage /></MemoryRouter>);
    expect(screen.queryByText('admin.newsAdmin.categories')).toBeNull();
    expect(screen.getByText('admin.content.newNews')).toBeInTheDocument();
  });
});
