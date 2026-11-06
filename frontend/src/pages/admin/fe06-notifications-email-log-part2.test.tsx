import type { ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmailLogPanel } from './EmailLogPanel';

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

const meta = (totalPages: number) => ({ total: 40, page: 1, limit: 20, totalPages });

describe('EmailLogPanel', () => {
  beforeEach(() => {
    state.email = { data: undefined, isLoading: false };
    state.queries = [];
  });

  it('dok se učitava prikazuje poruku', () => {
    state.email = { data: undefined, isLoading: true };
    render(<EmailLogPanel />);
    expect(screen.getByText('admin.common.loading')).toBeTruthy();
  });

  it('bez grešaka prikazuje poruku o uspješnoj dostavi', () => {
    state.email = { data: { data: [], meta: meta(1) }, isLoading: false };
    render(<EmailLogPanel />);
    expect(screen.getByText('admin.emailLog.noErrors')).toBeTruthy();
    expect(screen.getByText('admin.emailLog.allDelivered')).toBeTruthy();
  });

  it('red prikazuje primaoca, predmet, grešku i datum', () => {
    state.email = {
      data: {
        data: [
          {
            id: 'e1',
            to: 'clan@example.com',
            subject: 'Potvrda',
            error: 'SMTP timeout',
            createdAt: '2026-05-01T10:30:00.000Z',
          },
        ],
        meta: meta(1),
      },
      isLoading: false,
    };
    render(<EmailLogPanel />);
    const row = screen.getByTestId('row-e1');
    expect(within(row).getByText('clan@example.com')).toBeTruthy();
    expect(within(row).getByText('Potvrda')).toBeTruthy();
    expect(within(row).getByText('SMTP timeout')).toBeTruthy();
  });

  it('upit koristi stranicu i limit 20', () => {
    state.email = { data: { data: [], meta: meta(1) }, isLoading: false };
    render(<EmailLogPanel />);
    expect(state.queries.at(-1)?.queryKey).toEqual(['email-log', 1]);
  });

  it('paginacija mijenja stranicu upita', async () => {
    state.email = {
      data: { data: [{ id: 'e1', to: 'a@b.c', subject: 's', error: 'x', createdAt: '2026-05-01T10:30:00.000Z' }], meta: meta(2) },
      isLoading: false,
    };
    render(<EmailLogPanel />);
    await userEvent.click(screen.getByRole('button', { name: 'Sljedeća' }));
    expect(state.queries.at(-1)?.queryKey).toEqual(['email-log', 2]);
  });
});
