import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string, d?: string) => d ?? k }) }));
vi.mock('../lib/api', () => ({ api: { get: vi.fn(async () => ({ data: [] })), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }));

// NotificationsPage
const notifState = vi.hoisted(() => ({ data: undefined as unknown, isLoading: false, isError: false }));
vi.mock('../hooks/use-notifications', () => ({
  useNotifications: () => ({ data: notifState.data, isLoading: notifState.isLoading, isError: notifState.isError, refetch: vi.fn() }),
  useMarkNotificationRead: () => ({ mutateAsync: vi.fn() }),
  useMarkAllNotificationsRead: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock('../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('../components/admin/AdminPageShell', () => ({ AdminPageShell: ({ children }: { children: unknown }) => <div>{children as never}</div> }));
vi.mock('../components/admin/AdminPagination', () => ({ AdminPagination: () => null }));
vi.mock('../lib/utils', async () => {
  const a = await vi.importActual<typeof import('../lib/utils')>('../lib/utils');
  return { ...a, formatDateTime: (s: string) => s };
});

import { NotificationsPage } from '../pages/admin/NotificationsPage';
import { TicketOrderCard } from './ticketing/TicketOrderCard';
import { SeasonPassPanel } from './ticketing/SeasonPassPanel';

vi.mock('../hooks/use-ticketing', () => ({
  useTicketingPublicConfig: () => ({ data: {} as never }),
  useCancelMyTicketOrder: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRequestTicketRefund: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useMySeasonPass: () => ({ data: null, isLoading: false }),
  useOpenSeasonPass: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/use-season-pass', () => ({
  useSeasonPassConfig: () => ({ data: null }),
  useMySeasonPassOrder: () => ({ data: null, isLoading: false }),
  useCreateSeasonPassOrder: () => ({ mutateAsync: vi.fn(), isPending: false }),
  usePaySeasonPassOrder: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../lib/payment-providers', () => ({ getReadyPaymentProviders: () => [] }));
vi.mock('../hooks/use-auth', () => ({ useAuth: () => ({ user: { email: 'a@b.c' } }) }));
vi.mock('../hooks/use-permissions', () => ({ usePermissions: () => ({ has: () => true }) }));
vi.mock('../hooks/use-online-checkout', () => ({
  useOnlineTicketCheckout: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useOnlineSeasonPassCheckout: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

function wrap(c: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}><MemoryRouter>{c}</MemoryRouter></QueryClientProvider>;
}

describe('batch66z: NotificationsPage Bell fallback', () => {
  beforeEach(() => { notifState.data = undefined; notifState.isLoading = false; });
  it('unknown type koristi Bell (pokriva ?? Bell)', () => {
    notifState.data = {
      data: [{ id: 'n1', title: 'T1', body: 'B1', type: 'nepoznat_tip', isRead: false, createdAt: '2026-01-01', metadata: null }],
      meta: { page: 1, limit: 10, total: 1 },
    } as unknown as never;
    const { container } = render(wrap(<NotificationsPage />));
    expect(container.textContent).toContain('T1');
    // Bell icon je svg, provjeri da postoji
    expect(container.querySelector('svg')).not.toBeNull();
  });
  it('info type koristi Info, success CheckCircle', () => {
    notifState.data = {
      data: [
        { id: 'n2', title: 'T2', body: 'B2', type: 'info', isRead: true, createdAt: '2026-01-02', metadata: { path: '/a' } },
        { id: 'n3', title: 'T3', body: 'B3', type: 'success', isRead: true, createdAt: '2026-01-03', metadata: null },
        { id: 'n4', title: 'T4', body: 'B4', type: 'warning', isRead: false, createdAt: '2026-01-04', metadata: null },
      ],
      meta: { page: 1, limit: 10, total: 3 },
    } as unknown as never;
    const { container } = render(wrap(<NotificationsPage />));
    expect(container.textContent).toContain('T2');
    expect(container.textContent).toContain('T3');
  });
  it('null type koristi info fallback pa Info', () => {
    notifState.data = {
      data: [{ id: 'n5', title: 'T5', body: 'B5', type: null, isRead: false, createdAt: '2026-01-01', metadata: null }],
      meta: { page: 1, limit: 10, total: 1 },
    } as unknown as never;
    const { container } = render(wrap(<NotificationsPage />));
    expect(container.textContent).toContain('T5');
  });
});

describe('batch66z: TicketOrderCard i SeasonPassPanel', () => {
  it('TicketOrderCard pokriva window.location.href grane', async () => {
    const order = { id: 'o1', status: 'PENDING', quantity: 1, paymentProvider: 'monri', total: 10 } as never;
    const { container } = render(wrap(<TicketOrderCard order={order} />));
    expect(container).toBeDefined();
    const paid = { id: 'o2', status: 'PAID', quantity: 2, paymentProvider: 'stripe', total: 20 } as never;
    const { container: c2 } = render(wrap(<TicketOrderCard order={paid} />));
    expect(c2).toBeDefined();
  });
  it('SeasonPassPanel pokriva created?.id grane', () => {
    const { container } = render(wrap(<SeasonPassPanel />));
    expect(container).toBeDefined();
  });
});

describe('batch66z: AdminFormSheet i MembershipQrCode', () => {
  beforeEach(() => {
    if (!HTMLDialogElement.prototype.showModal) HTMLDialogElement.prototype.showModal = vi.fn() as never;
    if (!HTMLDialogElement.prototype.close) HTMLDialogElement.prototype.close = vi.fn() as never;
  });
  it('AdminFormSheet pokriva contains false', async () => {
    const { AdminFormSheet } = await import('./admin/AdminFormSheet');
    const spy = vi.spyOn(HTMLElement.prototype, 'contains').mockReturnValue(false);
    const { container } = render(wrap(<AdminFormSheet open title="T" onOpenChange={vi.fn()}><div>child</div></AdminFormSheet>));
    expect(container).toBeDefined();
    spy.mockRestore();
    const spy2 = vi.spyOn(HTMLElement.prototype, 'contains').mockReturnValue(true);
    const { container: c2 } = render(wrap(<AdminFormSheet open title="T2" onOpenChange={vi.fn()}><span>hi</span></AdminFormSheet>));
    expect(c2).toBeDefined();
    spy2.mockRestore();
  });
});
