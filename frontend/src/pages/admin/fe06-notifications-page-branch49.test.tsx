import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationsPage } from './NotificationsPage';

const state = vi.hoisted(() => ({
  data: undefined as unknown,
  isLoading: false,
  isError: false,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string, d?: string) => d ?? k }) }));
vi.mock('../../hooks/use-notifications', () => ({
  useNotifications: () => ({ data: state.data, isLoading: state.isLoading, isError: state.isError, refetch: vi.fn() }),
  useMarkNotificationRead: () => ({ mutateAsync: vi.fn() }),
  useMarkAllNotificationsRead: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../../components/admin/AdminPageShell', () => ({
  AdminPageShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('../../components/admin/AdminPagination', () => ({
  AdminPagination: () => <div>pagination</div>,
}));
vi.mock('../../lib/utils', async () => {
  const actual = await vi.importActual<typeof import('../../lib/utils')>('../../lib/utils');
  return { ...actual, formatDateTime: (s: string) => s };
});

describe('NotificationsPage — branch49 (data?.data ?? [] i icon fallback)', () => {
  beforeEach(() => {
    state.data = undefined as unknown as never;
  });

  it('data undefined fallback na prazan niz i prazno stanje', () => {
    render(<NotificationsPage />);
    expect(screen.getByText(/Nema obavještenja/)).toBeInTheDocument();
  });

  it('data null fallback i data.data null', () => {
    state.data = null as unknown as never;
    render(<NotificationsPage />);
    expect(screen.getByText(/Nema obavještenja/)).toBeInTheDocument();
    state.data = { data: null as unknown as never } as never;
    render(<NotificationsPage />);
    expect(screen.getAllByText(/Nema obavještenja/).length).toBeGreaterThanOrEqual(1);
  });

  it('items sa type fallback na Bell i unread vs read', () => {
    state.data = {
      data: [
        { id: 'n1', title: 'Naslov', body: 'Body', type: 'unknown', isRead: false, createdAt: '2026-01-01', metadata: null },
        { id: 'n2', title: 'Drugi', body: 'Body2', type: 'info', isRead: true, createdAt: '2026-01-02', metadata: { path: '/admin/news' } },
      ],
      meta: { page: 1, limit: 10, total: 2 },
    } as unknown as never;
    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Naslov')).toBeInTheDocument();
    expect(screen.getByText('Drugi')).toBeInTheDocument();
    expect(screen.getByText('Drugi').closest('a')).not.toBeNull();
  });

  it('data.data prazan niz i data.meta fallback', () => {
    state.data = { data: [], meta: null as unknown as never } as never;
    render(<NotificationsPage />);
    expect(screen.getByText(/Nema obavještenja/)).toBeInTheDocument();
    // meta null ne prikazuje paginaciju
    expect(screen.queryByText('pagination')).toBeNull();
  });
});
