import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationsPage } from './NotificationsPage';
import { CommsAdminPage } from './CommsAdminPage';
import { EmailLogPanel } from './EmailLogPanel';
import { LivePendingPage } from './LivePendingPage';

const state = vi.hoisted(() => ({
  notifications: {
    data: undefined as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  } as Record<string, unknown>,
  emailLog: {
    data: undefined as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  } as Record<string, unknown>,
  pending: {
    data: undefined as unknown,
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  } as Record<string, unknown>,
  perms: [] as string[],
  moduleFlags: {} as Record<string, string>,
  markRead: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  markAll: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  approve: { mutateAsync: vi.fn(async () => ({})), isPending: false },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, opts?: unknown) => {
      if (typeof opts === 'string') return opts;
      const o = opts as Record<string, unknown> | undefined;
      if (o?.defaultValue) {
        let s = o.defaultValue as string;
        if (o.time) s = s.replace('{{time}}', o.time as string);
        return s;
      }
      return k;
    },
  }),
}));

vi.mock('../../hooks/use-notifications', () => ({
  useNotifications: () => state.notifications,
  useMarkNotificationRead: () => state.markRead,
  useMarkAllNotificationsRead: () => state.markAll,
  useEmailLog: (_page: number) => {
    // record query for pagination tests if needed
    return state.emailLog as never;
  },
  useNotificationRealtime: () => {},
  useSettingsRealtime: () => {},
}));

vi.mock('../../hooks/use-live-admin', () => ({
  usePendingLiveReports: () => state.pending,
  useApproveMatchReport: () => state.approve,
}));

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ user: { permissions: state.perms } }),
}));

vi.mock('../../hooks', () => ({
  useModuleFlags: () => ({ data: state.moduleFlags }),
}));

vi.mock('../../components/seo/Seo', () => ({
  Seo: () => null,
}));

vi.mock('./ContactAdminPage', () => ({
  ContactAdminPage: (props: Record<string, unknown>) => <div>kontakt-ugrađen:{String(props.embedded)}</div>,
}));
vi.mock('./NewsletterAdminPage', () => ({
  NewsletterAdminPage: (props: Record<string, unknown>) => <div>newsletter-ugrađen:{String(props.embedded)}</div>,
}));

// keep real AdminPageShell and AdminDataTable for integration tests
// but we need to mock useConfirm etc if needed – LivePendingPage uses runAction which is trivial

beforeEach(() => {
  state.notifications = {
    data: { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 1 } },
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  } as Record<string, unknown>;
  state.emailLog = {
    data: { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 1 } },
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  } as Record<string, unknown>;
  state.pending = {
    data: [],
    isLoading: false,
    isError: false,
    isFetching: false,
    dataUpdatedAt: 0,
    refetch: vi.fn(),
  } as Record<string, unknown>;
  state.perms = [];
  state.moduleFlags = {};
  state.markRead = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.markAll = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  state.approve = { mutateAsync: vi.fn(async () => ({})), isPending: false };
});

describe('F-04 Notifications — loading aria-busy (P2-2)', () => {
  it('isLoading prikazuje skeleton aria-busy', () => {
    state.notifications = {
      data: undefined,
      isLoading: true,
      isError: false,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as Record<string, unknown>;
    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>,
    );
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
  });
});

describe('F-04 Notifications — error role=alert + retry disabled (P2-2)', () => {
  it('isError prikazuje role=alert i retry je disabled dok je isFetching', async () => {
    const refetch = vi.fn();
    state.notifications = {
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch,
    } as Record<string, unknown>;
    const { rerender } = render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    const btn = within(alert).getByRole('button', { name: 'Pokušaj ponovo' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(refetch).toHaveBeenCalled();

    state.notifications = {
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch,
    } as Record<string, unknown>;
    rerender(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>,
    );
    const alert2 = screen.getByRole('alert');
    expect(within(alert2).getByRole('button')).toBeDisabled();
  });
});

describe('F-04 Notifications — lastUpdated/Osvježi + pagination aria-live (P2-2)', () => {
  it('success prikazuje lastUpdated i Osvježi poziva refetch, pagination aria-live', async () => {
    const ts = Date.now();
    const refetch = vi.fn();
    state.notifications = {
      data: {
        data: [{ id: 'n1', title: 'T', body: 'B', type: 'info', isRead: false, createdAt: '2026-05-01T10:30:00.000Z', metadata: null }],
        meta: { total: 40, page: 1, limit: 20, totalPages: 3 },
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: ts,
      refetch,
    } as Record<string, unknown>;
    const { rerender } = render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Ažurirano/)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'Osvježi' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(refetch).toHaveBeenCalled();

    const live = screen.getByText('1 / 3');
    expect(live).toHaveAttribute('aria-live', 'polite');

    // isFetching disables retry/pagination
    state.notifications = {
      data: {
        data: [{ id: 'n1', title: 'T', body: 'B', type: 'info', isRead: false, createdAt: '2026-05-01T10:30:00.000Z', metadata: null }],
        meta: { total: 40, page: 1, limit: 20, totalPages: 3 },
      },
      isLoading: false,
      isError: false,
      isFetching: true,
      dataUpdatedAt: ts,
      refetch,
    } as Record<string, unknown>;
    rerender(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>,
    );
    const btn2 = screen.getByRole('button', { name: 'admin.common.loading' });
    expect(btn2).toBeDisabled();
    const prev = screen.getByRole('button', { name: 'Prethodna' });
    expect(prev).toBeDisabled();
  });
});

describe('F-04 Comms — tablist aria-pressed (P2-3)', () => {
  it('tabovi imaju role=tablist i aria-pressed', () => {
    state.perms = ['contact.read', 'newsletter.read', 'settings.read'];
    render(
      <MemoryRouter initialEntries={['/admin/comms?tab=contact']}>
        <Routes>
          <Route path="/admin/comms" element={<CommsAdminPage />} />
        </Routes>
      </MemoryRouter>,
    );
    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs.length).toBeGreaterThanOrEqual(3);
    expect(tabs[0]).toHaveAttribute('aria-pressed', 'true');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('F-04 EmailLog — loading/error/lastUpdated (P2-4/P2-5)', () => {
  it('isLoading prikazuje aria-busy Skeleton', () => {
    state.emailLog = {
      data: undefined,
      isLoading: true,
      isError: false,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as Record<string, unknown>;
    render(<EmailLogPanel />);
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
  });

  it('isError prikazuje role=alert i retry disabled dok je isFetching', async () => {
    const refetch = vi.fn();
    state.emailLog = {
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch,
    } as Record<string, unknown>;
    const { rerender } = render(<EmailLogPanel />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    const btn = within(alert).getByRole('button', { name: 'Pokušaj ponovo' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(refetch).toHaveBeenCalled();

    state.emailLog = {
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch,
    } as Record<string, unknown>;
    rerender(<EmailLogPanel />);
    expect(within(screen.getByRole('alert')).getByRole('button')).toBeDisabled();
  });

  it('success prikazuje lastUpdated i Osvježi, pagination aria-live', async () => {
    const ts = Date.now();
    const refetch = vi.fn();
    state.emailLog = {
      data: {
        data: [{ id: 'e1', to: 'a@b.c', subject: 's', error: 'x', createdAt: '2026-05-01T10:30:00.000Z' }],
        meta: { total: 40, page: 1, limit: 20, totalPages: 2 },
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: ts,
      refetch,
    } as Record<string, unknown>;
    const { rerender } = render(<EmailLogPanel />);
    expect(screen.getByText(/Ažurirano/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Osvježi' })).toBeInTheDocument();
    const live = screen.getByText('1 / 2');
    expect(live).toHaveAttribute('aria-live', 'polite');
    // isFetching disables pagination
    state.emailLog = {
      data: {
        data: [{ id: 'e1', to: 'a@b.c', subject: 's', error: 'x', createdAt: '2026-05-01T10:30:00.000Z' }],
        meta: { total: 40, page: 1, limit: 20, totalPages: 2 },
      },
      isLoading: false,
      isError: false,
      isFetching: true,
      dataUpdatedAt: ts,
      refetch,
    } as Record<string, unknown>;
    rerender(<EmailLogPanel />);
    expect(screen.getByRole('button', { name: 'Prethodna' })).toBeDisabled();
  });
});

describe('F-04 LivePending — loading/error/lastUpdated (P2-6)', () => {
  it('isLoading prikazuje aria-busy', () => {
    state.pending = {
      data: undefined,
      isLoading: true,
      isError: false,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch: vi.fn(),
    } as Record<string, unknown>;
    render(
      <MemoryRouter>
        <LivePendingPage />
      </MemoryRouter>,
    );
    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy();
  });

  it('isError prikazuje role=alert i retry', async () => {
    const refetch = vi.fn();
    state.pending = {
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: false,
      dataUpdatedAt: 0,
      refetch,
    } as Record<string, unknown>;
    const { rerender } = render(
      <MemoryRouter>
        <LivePendingPage />
      </MemoryRouter>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    const btn = within(alert).getByRole('button', { name: 'Pokušaj ponovo' });
    expect(btn).not.toBeDisabled();
    await userEvent.click(btn);
    expect(refetch).toHaveBeenCalled();

    state.pending = {
      data: undefined,
      isLoading: false,
      isError: true,
      isFetching: true,
      dataUpdatedAt: 0,
      refetch,
    } as Record<string, unknown>;
    rerender(
      <MemoryRouter>
        <LivePendingPage />
      </MemoryRouter>,
    );
    expect(within(screen.getByRole('alert')).getByRole('button')).toBeDisabled();
  });

  it('success prikazuje lastUpdated i Osvježi, Odobri disabled isFetching', async () => {
    const ts = Date.now();
    const refetch = vi.fn();
    state.pending = {
      data: [{ id: 'm1', homeClub: { name: 'A' }, awayClub: { name: 'B' }, homeScore: 1, awayScore: 0, scheduledAt: '2026-05-01T10:30:00.000Z', season: { competition: { name: 'Liga' } } }],
      isLoading: false,
      isError: false,
      isFetching: false,
      dataUpdatedAt: ts,
      refetch,
    } as Record<string, unknown>;
    state.approve = { mutateAsync: vi.fn(async () => ({})), isPending: false };
    const { rerender } = render(
      <MemoryRouter>
        <LivePendingPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Ažurirano/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Osvježi' })).toBeInTheDocument();
    const approveBtn = screen.getByRole('button', { name: 'Odobri' });
    expect(approveBtn).not.toBeDisabled();

    state.pending = {
      data: [{ id: 'm1', homeClub: { name: 'A' }, awayClub: { name: 'B' }, homeScore: 1, awayScore: 0, scheduledAt: '2026-05-01T10:30:00.000Z', season: { competition: { name: 'Liga' } } }],
      isLoading: false,
      isError: false,
      isFetching: true,
      dataUpdatedAt: ts,
      refetch,
    } as Record<string, unknown>;
    rerender(
      <MemoryRouter>
        <LivePendingPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: 'Odobri' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'admin.common.loading' })).toBeDisabled();
  });
});
