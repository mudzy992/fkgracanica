import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuditPage } from './AuditPage';

const state = vi.hoisted(() => ({
  params: [] as Record<string, unknown>[],
  audit: {
    data: undefined as unknown,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
  seo: [] as (string | undefined)[],
  shell: { isLoading: false, isError: false },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  useAuditLog: (params: Record<string, unknown>) => {
    state.params.push(params);
    return state.audit;
  },
}));
vi.mock('../../components/seo/Seo', () => ({
  Seo: ({ title }: { title?: string }) => {
    state.seo.push(title);
    return null;
  },
}));
vi.mock('../../components/admin/AdminPageShell', () => ({
  AdminPageShell: ({ title, isLoading, isError, onRetry, children }: {
    title: string; isLoading?: boolean; isError?: boolean;
    onRetry?: () => void; children: React.ReactNode;
  }) => {
    state.shell = { isLoading: !!isLoading, isError: !!isError };
    return (
      <div>
        <h1>{title}</h1>
        {isError && <button onClick={() => onRetry?.()}>pokušaj-ponovo</button>}
        {isLoading ? <p>učitavanje</p> : children}
      </div>
    );
  },
  AdminDataTable: ({ rows, columns }: {
    rows: Array<Record<string, unknown> & { id: string }>;
    columns: Array<{ key: string; render: (row: never) => React.ReactNode }>;
  }) => (
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

const entry = (over: Record<string, unknown> = {}) => ({
  id: 'a1',
  action: 'user.login',
  entity: 'User',
  createdAt: '2026-05-10T17:00:00.000Z',
  actor: { email: 'admin@fkgracanica.ba' },
  ...over,
});

const renderPage = () => render(<AuditPage />);

describe('AuditPage', () => {
  beforeEach(() => {
    state.params = [];
    state.seo = [];
    state.audit = {
      data: { data: [entry()], meta: { totalPages: 1 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    state.shell = { isLoading: false, isError: false };
  });

  it('prikazuje naslov, SEO i tabelu sa zapisima', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'admin.auditPage.title' })).toBeTruthy();
    expect(state.seo).toEqual(['admin.auditPage.metaTitle']);
    expect(screen.getByText('admin@fkgracanica.ba')).toBeTruthy();
    expect(screen.getByText('User')).toBeTruthy();
  });

  it('zapis bez aktera i entiteta prikazuje crticu', () => {
    state.audit = {
      ...state.audit,
      data: { data: [entry({ actor: null, entity: null })], meta: { totalPages: 1 } },
    };
    renderPage();
    expect(screen.getAllByText('—')).toHaveLength(2);
  });

  it('bez podataka tabela je prazna, a upit ide bez filtera', () => {
    state.audit = { ...state.audit, data: undefined };
    renderPage();
    expect(state.params[0]).toEqual({ page: 1, action: undefined, entity: undefined, from: undefined, to: undefined });
  });

  it('filteri se prosljeđuju upitu i vraćaju na prvu stranicu ne šalje se bez unosa', async () => {
    state.audit = { ...state.audit, data: { data: [], meta: { totalPages: 3 } } };
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('admin.auditPage.action'), 'user.login');
    await waitFor(() => expect(state.params.at(-1)).toMatchObject({ action: 'user.login', page: 1 }));
    await userEvent.type(screen.getByPlaceholderText('admin.auditPage.entity'), 'User');
    await waitFor(() => expect(state.params.at(-1)).toMatchObject({ entity: 'User' }));
  });

  it('filteri datuma se prosljeđuju upitu', async () => {
    renderPage();
    const dates = document.querySelectorAll('input[type="date"]');
    expect(dates).toHaveLength(2);
    await userEvent.type(dates[0] as HTMLElement, '2026-05-01');
    await waitFor(() => expect(state.params.at(-1)).toMatchObject({ from: '2026-05-01' }));
    await userEvent.type(dates[1] as HTMLElement, '2026-05-31');
    await waitFor(() => expect(state.params.at(-1)).toMatchObject({ to: '2026-05-31' }));
  });

  it('paginacija se prikazuje samo kad ima više stranica', async () => {
    renderPage();
    expect(screen.queryByRole('button', { name: 'Sljedeća' })).toBeNull();

    state.audit = { ...state.audit, data: { data: [entry()], meta: { totalPages: 3 } } };
    const { unmount } = renderPage();
    expect(screen.getByText('1 / 3')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Prethodna' })).toHaveProperty('disabled', true);
    await userEvent.click(screen.getByRole('button', { name: 'Sljedeća' }));
    await waitFor(() => expect(state.params.at(-1)).toMatchObject({ page: 2 }));
    expect(screen.getByText('2 / 3')).toBeTruthy();
    unmount();
  });

  it('povratak na prethodnu stranicu smanjuje broj stranice', async () => {
    state.audit = { ...state.audit, data: { data: [entry()], meta: { totalPages: 2 } } };
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Sljedeća' }));
    await waitFor(() => expect(screen.getByText('2 / 2')).toBeTruthy());
    expect(screen.getByRole('button', { name: 'Sljedeća' })).toHaveProperty('disabled', true);
    await userEvent.click(screen.getByRole('button', { name: 'Prethodna' }));
    await waitFor(() => expect(screen.getByText('1 / 2')).toBeTruthy());
  });

  it('greška učitavanja prikazuje retry koji poziva refetch', async () => {
    state.audit = { ...state.audit, isError: true };
    renderPage();
    expect(state.shell.isError).toBe(true);
    await userEvent.click(screen.getByRole('button', { name: 'pokušaj-ponovo' }));
    expect(state.audit.refetch).toHaveBeenCalledTimes(1);
  });

  it('učitavanje gasi tabelu', () => {
    state.audit = { ...state.audit, isLoading: true };
    renderPage();
    expect(state.shell.isLoading).toBe(true);
    expect(screen.getByText('učitavanje')).toBeTruthy();
  });
});
