import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationsPage } from './NotificationsPage';

vi.mock('../../components/admin/AdminPageShell', () => ({
  AdminPageShell: ({ title, isLoading, isError, onRetry, actions, children }: {
    title: string; isLoading?: boolean; isError?: boolean;
    onRetry?: () => void; actions?: ReactNode; children: ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      <div data-testid="actions">{actions}</div>
      {isError && <button onClick={() => onRetry?.()}>pokušaj-ponovo</button>}
      {isLoading ? <p>učitavanje</p> : children}
    </div>
  ),
  AdminDataTable: ({ rows, empty, columns }: {
    rows: Array<Record<string, unknown> & { id: string }>;
    empty?: string;
    columns: Array<{ key: string; render: (row: never) => ReactNode }>;
  }) =>
    rows.length === 0 ? (
      <p>{empty}</p>
    ) : (
      <div>
        {rows.map((row) => (
          <div key={row.id} data-testid={`row-${row.id}`}>
            {columns.map((column) => (
              <span key={column.key} data-col={column.key}>{column.render(row as never)}</span>
            ))}
          </div>
        ))}
      </div>
    ),
}));

const state = vi.hoisted(() => ({
  list: { data: undefined as unknown, isLoading: false, isError: false, refetch: vi.fn() },
  markRead: { mutateAsync: vi.fn(async () => ({})) },
  markAll: { mutateAsync: vi.fn(async () => ({})) },
  seo: [] as (string | undefined)[],
  queries: [] as { queryKey: unknown[] }[],
  email: { data: undefined as unknown, isLoading: false },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-notifications', () => ({
  useNotifications: () => state.list,
  useMarkNotificationRead: () => state.markRead,
  useMarkAllNotificationsRead: () => state.markAll,
}));
vi.mock('../../components/seo/Seo', () => ({
  Seo: ({ title }: { title?: string }) => {
    state.seo.push(title);
    return null;
  },
}));
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('@tanstack/react-query');
  return {
    ...actual,
    useQuery: (options: { queryKey: unknown[] }) => {
      state.queries.push(options);
      return state.email;
    },
  };
});

const notification = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  title: `Naslov ${id}`,
  body: `Tijelo ${id}`,
  type: 'info',
  isRead: false,
  createdAt: '2026-05-01T10:30:00.000Z',
  metadata: null,
  ...over,
});

const meta = (totalPages: number) => ({ total: 40, page: 1, limit: 20, totalPages });

describe('NotificationsPage', () => {
  beforeEach(() => {
    state.list = { data: { data: [], meta: meta(1) }, isLoading: false, isError: false, refetch: vi.fn() };
    state.markRead = { mutateAsync: vi.fn(async () => ({})) };
    state.markAll = { mutateAsync: vi.fn(async () => ({})) };
    state.seo = [];
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>,
    );

  it('postavlja naslov i SEO', () => {
    renderPage();
    expect(state.seo).toContain('notifications.title');
    expect(screen.getByRole('heading', { name: 'notifications.title' })).toBeTruthy();
  });

  it('bez obavještenja prikazuje prazno stanje', () => {
    renderPage();
    expect(screen.getByText('notifications.empty')).toBeTruthy();
  });

  it('dugme Označi sve pročitano šalje zahtjev', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'notifications.markAllRead' }));
    expect(state.markAll.mutateAsync).toHaveBeenCalled();
  });

  it('nepročitano obavještenje ima dugme Označi pročitano', async () => {
    state.list = {
      data: { data: [notification('n1')], meta: meta(1) },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'notifications.markRead' }));
    expect(state.markRead.mutateAsync).toHaveBeenCalledWith('n1');
  });

  it('pročitano obavještenje nema dugme', () => {
    state.list = {
      data: { data: [notification('n1', { isRead: true })], meta: meta(1) },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderPage();
    expect(screen.queryByRole('button', { name: 'notifications.markRead' })).toBeNull();
  });

  it('deep link iz metadata pretvara naslov u link', () => {
    state.list = {
      data: { data: [notification('n1', { metadata: { path: '/admin/news' } })], meta: meta(1) },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderPage();
    expect(screen.getByRole('link', { name: 'Naslov n1' }).getAttribute('href')).toBe('/admin/news');
    expect(screen.getByText('Tijelo n1')).toBeTruthy();
  });

  it('bez deep linka naslov je običan tekst', () => {
    state.list = {
      data: { data: [notification('n1')], meta: meta(1) },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderPage();
    expect(screen.queryByRole('link', { name: 'Naslov n1' })).toBeNull();
    expect(screen.getByText('Naslov n1')).toBeTruthy();
  });

  it('paginacija se prikazuje samo kad ima više stranica i mijenja stranicu', async () => {
    state.list = {
      data: { data: [notification('n1')], meta: meta(3) },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderPage();
    expect(screen.getByText('1 / 3')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Sljedeća' }));
    expect(screen.getByText('2 / 3')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Prethodna' }));
    expect(screen.getByText('1 / 3')).toBeTruthy();
  });

  it('greška nudi ponovno učitavanje', async () => {
    state.list = { data: undefined, isLoading: false, isError: true, refetch: vi.fn() };
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'pokušaj-ponovo' }));
    expect(state.list.refetch).toHaveBeenCalled();
  });
});
