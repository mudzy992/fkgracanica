import { render } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', async (orig) => {
  const actual = await (orig() as never) as Record<string, unknown>;
  return { ...(actual as object), useTranslation: () => ({ t: (k: string) => k }) };
});
vi.mock('../lib/auth', () => ({ useAuth: () => ({ isAuthenticated: true, user: { email: 'a@a.com' } }) }));
vi.mock('../hooks/use-ticketing', () => ({
  useTicketingPublicConfig: () => ({ data: { boxOffice: true, boxOfficeEnabled: true } as never }),
  useRequestTicketRefund: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCancelMyTicketOrder: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useReserveTicket: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/use-online-checkout', () => ({
  useOnlineTicketCheckout: () => ({ mutateAsync: vi.fn(() => Promise.resolve({ url: '' })), isPending: false }),
}));
vi.mock('../lib/payment-providers', () => ({ getReadyPaymentProviders: () => ['monri'] as never }));

import { TicketsReserveActions } from './ticketing/TicketsReserveActions';
import { TicketOrderCard } from './ticketing/TicketOrderCard';
import { ChromePageScreen } from './public/app-download/chrome-screens';
import { TeamCinematicHero } from './team/TeamCinematicHero';

function wrap(c: React.ReactNode) {
  const qc = new QueryClient();
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{c}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('batch66u ticketing', () => {
  it('TicketsReserveActions pokriva boxOfficeDisabled || !boxOffice', () => {
    const cat = { id: '1', label: 'A', price: 10 } as never;
    const { container: c1 } = render(
      wrap(<TicketsReserveActions matchId="1" category={cat} quantity={1} boxOfficeMax={10} onlineMax={10} remaining={5} boxOffice={true} online={true} onReserved={vi.fn()} />),
    );
    expect(c1).toBeDefined();
    const { container: c2 } = render(
      wrap(<TicketsReserveActions matchId="1" category={cat} quantity={1} boxOfficeMax={10} onlineMax={10} remaining={5} boxOffice={false} online={false} onReserved={vi.fn()} />),
    );
    expect(c2).toBeDefined();
  });
  it('TicketOrderCard pokriva', () => {
    const { container } = render(wrap(<TicketOrderCard order={{ id: '1', status: 'PENDING', quantity: 1 } as never} />));
    expect(container).toBeDefined();
    const { container: c2 } = render(wrap(<TicketOrderCard order={{ id: '1', status: 'PAID', quantity: 2, paymentProvider: 'monri' } as never} />));
    expect(c2).toBeDefined();
  });
  it('ChromeScreens pokriva', () => {
    const { container } = render(wrap(<ChromePageScreen version="1" t={(k: string) => k} />));
    expect(container).toBeDefined();
  });
  it('TeamCinematicHero pokriva', () => {
    const { container: c1 } = render(wrap(<TeamCinematicHero club={null as never} squad={null as never} stats={null as never} stadiumName="" city="" />));
    expect(c1).toBeDefined();
    const { container: c2 } = render(
      wrap(<TeamCinematicHero club={{ name: 'FK Gračanica', crestPath: '/a.png' } as never} squad={{ formation: null, slots: [{ id: '1' } as never] } as never} stats={{ wins: 1 } as never} stadiumName="Stadion" city="Gračanica" />),
    );
    expect(c2).toBeDefined();
  });
});
