import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const ticketingState = vi.hoisted(() => ({
  orders: undefined as unknown,
  seasonPass: undefined as unknown,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: ['ticketing.manage'] } }) }));
vi.mock('../../lib/permissions', () => ({ hasPermission: () => true }));
vi.mock('../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: async () => true, dialog: null }) }));
vi.mock('../../hooks/use-ticketing-admin', async (orig) => {
  const actual = await (orig as unknown as () => Promise<Record<string, unknown>>)();
  return {
    ...(actual as object),
    useTicketingAdminOrders: () => ({ data: ticketingState.orders, isLoading: false }),
    useTicketingOrderDetail: () => ({ data: undefined }),
    useConfirmTicketingPayment: () => ({ mutateAsync: vi.fn() }),
    useConfirmTicketingRefund: () => ({ mutateAsync: vi.fn() }),
    useSeasonPassAdminList: () => ({ data: ticketingState.seasonPass, isLoading: false }),
    useIssueSeasonPass: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useAdminCancelTicketingOrder: () => ({ mutateAsync: vi.fn() }),
  };
});
vi.mock('../../components/admin/AdminPageShell', () => ({
  AdminPageShell: ({ children }: { children: unknown }) => <div>{children as never}</div>,
  AdminDataTable: ({ rows }: { rows: unknown[] }) => <div>rows:{rows.length}</div>,
}));
vi.mock('../../components/ticketing/TicketingValidatePanel', () => ({ TicketingValidatePanel: () => null }));
vi.mock('../../components/ui/badge', () => ({ Badge: ({ children }: { children: unknown }) => <div>{children as never}</div> }));
vi.mock('../../components/ui/button', () => ({ Button: ({ children }: { children: unknown }) => <button>{children as never}</button> }));

import { TicketingOrdersTab } from './ticketing/TicketingOrdersTab';
import { TicketingSeasonTab } from './ticketing/TicketingSeasonTab';

function wrap(c: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}><MemoryRouter>{c}</MemoryRouter></QueryClientProvider>;
}

describe('fe06-batch67c ticketing ?? []', () => {
  beforeEach(() => {
    ticketingState.orders = undefined;
    ticketingState.seasonPass = undefined;
  });

  it('TicketingOrdersTab pokriva data ?? [] oba', () => {
    ticketingState.orders = undefined as unknown as never;
    const { container: c1 } = render(wrap(<TicketingOrdersTab />));
    expect(c1.textContent).toContain('rows:0');
    ticketingState.orders = [{ id: '1', status: 'pending' }] as unknown as never;
    const { container: c2 } = render(wrap(<TicketingOrdersTab />));
    expect(c2.textContent).toContain('rows:1');
  });

  it('TicketingSeasonTab pokriva data ?? [] oba', () => {
    ticketingState.seasonPass = undefined as unknown as never;
    const { container: c1 } = render(wrap(<TicketingSeasonTab />));
    expect(c1.textContent).toContain('rows:0');
    ticketingState.seasonPass = [{ id: '1', user: { email: 'a@b' }, season: { name: 'S1' }, status: 'ACTIVE', price: 10, createdAt: new Date().toISOString() }] as unknown as never;
    const { container: c2 } = render(wrap(<TicketingSeasonTab />));
    expect(c2.textContent).toContain('rows:1');
  });
});
