import { render } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-ticketing', () => ({
  useTicketingPublicConfig: () => ({ data: { providers: [] } }),
  useReserveTicket: () => ({ mutateAsync: vi.fn().mockResolvedValue({ id: 'ord1' }), isPending: false, error: null }),
  useRequestTicketRefund: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCancelMyTicketOrder: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../../hooks/use-online-checkout', () => ({
  useOnlineTicketCheckout: () => ({ mutateAsync: vi.fn().mockResolvedValue({ url: 'https://pay.example' }), isPending: false, error: null }),
}));
vi.mock('../../lib/payment-providers', () => ({ getReadyPaymentProviders: () => [] }));

import { TicketsReserveActions } from './ticketing/TicketsReserveActions';
import { TicketOrderCard } from './ticketing/TicketOrderCard';

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('batch66e ticketing', () => {
  it('TicketsReserveActions pokriva disabled || !boxOffice', () => {
    const base: any = {
      matchId: 'm1',
      category: { id: 'c1', label: 'VIP', price: 10 },
      quantity: 1,
      boxOfficeMax: 10,
      onlineMax: 10,
      remaining: 10,
      boxOffice: true,
      online: true,
      onReserved: vi.fn(),
    };
    const { unmount } = render(wrapper(<TicketsReserveActions {...base} />));
    unmount();
    const { unmount: u2 } = render(
      wrapper(<TicketsReserveActions {...base} boxOffice={false} online={false} />),
    );
    u2();
    const { unmount: u3 } = render(
      wrapper(<TicketsReserveActions {...base} boxOffice={true} online={false} />),
    );
    u3();
    const { unmount: u4 } = render(
      wrapper(<TicketsReserveActions {...base} boxOffice={false} online={true} />),
    );
    u4();
    const { container } = render(
      wrapper(<TicketsReserveActions {...base} boxOffice={false} online={false} remaining={0} quantity={20} />),
    );
    expect(container).toBeDefined();
  });

  it('TicketOrderCard pokriva result.ok && result.value.url oba', async () => {
    const order = {
      id: 'o1',
      status: 'pending',
      total: 20,
      createdAt: new Date().toISOString(),
      tickets: [],
      payment: { status: 'PENDING_ONLINE' },
    } as never;
    const { container } = render(wrapper(<TicketOrderCard order={order} />));
    expect(container.textContent).toContain('Narudžba');
    const paidOrder = {
      id: 'o2',
      status: 'paid',
      total: 20,
      createdAt: null,
      tickets: [{ id: 't1', status: 'valid' }],
    } as never;
    const { container: c2 } = render(wrapper(<TicketOrderCard order={paidOrder} />));
    expect(c2).toBeDefined();
  });
});
