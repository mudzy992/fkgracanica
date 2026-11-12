import type { ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LivePendingPage } from './LivePendingPage';

vi.mock('../../components/admin/AdminPageShell', () => ({
  AdminPageShell: ({ title, isError, onRetry, children }: {
    title: string; isError?: boolean; onRetry?: () => void; children: ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      {isError && <button onClick={() => onRetry?.()}>pokušaj-ponovo</button>}
      {children}
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
  create: {
    mutateAsync: vi.fn(async () => ({})),
    isPending: false,
    isError: false,
    error: undefined as unknown,
  },
  pending: { data: undefined as unknown, isLoading: false, isError: false, refetch: vi.fn() },
  approve: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  seo: [] as (string | undefined)[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-users-admin', () => ({ useCreateRole: () => state.create }));
vi.mock('../../hooks/use-live-admin', () => ({
  usePendingLiveReports: () => state.pending,
  useApproveMatchReport: () => state.approve,
}));
vi.mock('../../components/seo/Seo', () => ({
  Seo: ({ title }: { title?: string }) => {
    state.seo.push(title);
    return null;
  },
}));
vi.mock('../../components/admin/AdminFormSheet', () => ({
  AdminFormSheet: ({ open, title, children }: { open: boolean; title: string; children: ReactNode }) =>
    open ? <section aria-label={title}>{children}</section> : null,
}));

describe('LivePendingPage', () => {
  const report = (id: string, over: Record<string, unknown> = {}) => ({
    id,
    homeClub: { name: 'FK Gračanica' },
    awayClub: { name: 'FK Slavija' },
    homeScore: 2,
    awayScore: 1,
    scheduledAt: '2026-05-01T10:30:00.000Z',
    season: { competition: { name: 'Premijer liga' } },
    ...over,
  });

  beforeEach(() => {
    state.pending = { data: undefined, isLoading: false, isError: false, refetch: vi.fn() };
    state.approve = { mutateAsync: vi.fn(async () => ({})), isPending: false };
    state.seo = [];
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <LivePendingPage />
      </MemoryRouter>,
    );

  it('dok se učitava prikazuje poruku u praznom stanju', () => {
    state.pending = { data: undefined, isLoading: true, isError: false, refetch: vi.fn() };
    renderPage();
    expect(screen.getByRole('heading', { name: 'admin.livePendingPage.title' })).toBeTruthy();
    expect(screen.getByText('admin.common.loading')).toBeTruthy();
    expect(state.seo).toContain('admin.livePending');
  });

  it('bez zapisa prikazuje prazno stanje', () => {
    state.pending = { data: [], isLoading: false, isError: false, refetch: vi.fn() };
    renderPage();
    expect(screen.getByText('admin.livePendingPage.empty')).toBeTruthy();
  });

  it('red prikazuje rezultat, takmičenje, datum i status', () => {
    state.pending = { data: [report('m1')], isLoading: false, isError: false, refetch: vi.fn() };
    renderPage();
    const row = screen.getByTestId('row-m1');
    expect(within(row).getByText('FK Gračanica 2:1 FK Slavija')).toBeTruthy();
    expect(within(row).getByText('Premijer liga')).toBeTruthy();
    expect(within(row).getByText('admin.commentator.awaitingApproval')).toBeTruthy();
  });

  it('nedostupno takmičenje prikazuje crticu', () => {
    state.pending = {
      data: [report('m1', { season: undefined })],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    renderPage();
    expect(within(screen.getByTestId('row-m1')).getByText('—')).toBeTruthy();
  });

  it('pregled vodi na javnu stranicu utakmice', () => {
    state.pending = { data: [report('m1')], isLoading: false, isError: false, refetch: vi.fn() };
    renderPage();
    expect(screen.getByRole('link', { name: 'Pregled' }).getAttribute('href')).toBe('/utakmice/m1');
  });

  it('odobravanje šalje ID utakmice', async () => {
    state.pending = { data: [report('m1')], isLoading: false, isError: false, refetch: vi.fn() };
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Odobri' }));
    expect(state.approve.mutateAsync).toHaveBeenCalledWith('m1');
  });

  it('tokom odobravanja dugme je onemogućeno', () => {
    state.pending = { data: [report('m1')], isLoading: false, isError: false, refetch: vi.fn() };
    state.approve = { mutateAsync: vi.fn(async () => ({})), isPending: true };
    renderPage();
    expect(screen.getByRole('button', { name: 'Odobri' })).toHaveProperty('disabled', true);
  });

  it('greška nudi ponovno učitavanje', async () => {
    state.pending = { data: undefined, isLoading: false, isError: true, refetch: vi.fn() };
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'pokušaj-ponovo' }));
    expect(state.pending.refetch).toHaveBeenCalled();
  });
});
