import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketsPage } from './TicketsPage';

const state = vi.hoisted(() => ({
  auth: { isAuthenticated: false, isLoading: false, user: null as unknown },
  search: '',
  config: undefined as unknown,
  ticketReturn: {} as Record<string, unknown>,
  seasonReturn: {} as Record<string, unknown>,
  clearCalls: [] as boolean[],
  ticketArgs: {} as Record<string, unknown>,
  seasonArgs: {} as Record<string, unknown>,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-ticketing', () => ({
  useTicketingPublicConfig: () => ({ data: state.config }),
}));
vi.mock('../../hooks/use-ticket-payment-return', () => ({
  useTicketPaymentReturn: (args: Record<string, unknown>) => {
    state.ticketArgs = args;
    return { confirming: false, activated: false, status: 'none', retry: vi.fn(), ...state.ticketReturn };
  },
}));
vi.mock('../../hooks/use-season-pass-payment-return', () => ({
  useSeasonPassPaymentReturn: (args: Record<string, unknown>) => {
    state.seasonArgs = args;
    return { confirming: false, activated: false, status: 'none', retry: vi.fn(), ...state.seasonReturn };
  },
}));
vi.mock('../../hooks/use-clear-payment-params', () => ({
  useClearPaymentParams: (enabled: boolean) => state.clearCalls.push(enabled),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => state.auth }));
vi.mock('../../lib/payment-providers', () => ({
  parsePaymentProvider: (provider: string | null) => (provider === 'stripe' ? 'stripe' : null),
}));
vi.mock('../../components/ticketing/MyTicketsPanel', () => ({
  MyTicketsPanel: ({ paymentSuccess }: { paymentSuccess: boolean }) => (
    <div>moje-karte:{String(paymentSuccess)}</div>
  ),
}));
vi.mock('../../components/ticketing/TicketsReserveForm', () => ({
  TicketsReserveForm: ({ onSuccess }: { onSuccess: () => void }) => (
    <button onClick={onSuccess}>rezervisi</button>
  ),
}));
vi.mock('../../components/ticketing/SeasonPassPanel', () => ({
  SeasonPassPanel: (props: Record<string, unknown>) => (
    <div>
      sezonska:{String(props.paymentSuccess)}:{String(props.paymentCancelled)}
    </div>
  ),
}));
vi.mock('../../components/payments/PaymentReturnNotice', () => ({
  PaymentReturnNotice: ({ status }: { status: string }) => <div>obavjest:{status}</div>,
}));
vi.mock('../../components/public/forms/FormShell', () => ({
  FormShell: ({ children, layout }: { children: React.ReactNode; layout: string }) => (
    <div>
      forma:{layout}
      {children}
    </div>
  ),
}));
vi.mock('../../components/public/shell/PageHeroHeader', () => ({
  PageHeroHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));
vi.mock('../../components/seo/Seo', () => ({
  Seo: ({ title }: { title: string }) => <div>seo:{title}</div>,
}));
vi.mock('../../components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

const config = (over: Record<string, unknown> = {}) => ({
  modulesTicketing: true,
  salesModes: { boxOffice: true, online: true },
  seasonPassAvailable: true,
  ...over,
});

const renderPage = (search = '') =>
  render(
    <MemoryRouter initialEntries={[`/ulaznice${search}`]}>
      <Routes>
        <Route path="/ulaznice" element={<TicketsPage />} />
        <Route path="/prijava" element={<p>stranica prijave</p>} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  state.auth = { isAuthenticated: false, isLoading: false, user: null };
  state.config = config();
  state.ticketReturn = {};
  state.seasonReturn = {};
  state.clearCalls = [];
  state.ticketArgs = {};
  state.seasonArgs = {};
});

describe('TicketsPage — gost i učitavanje', () => {
  it('dok traje provjera sesije prikazuje skeleton', () => {
    state.auth = { isAuthenticated: false, isLoading: true, user: null };
    renderPage();
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    expect(screen.queryByText('seo:pages.tickets.seoTitle')).toBeNull();
  });

  it('potvrda plaćanja takođe drži skeleton', () => {
    state.auth = { isAuthenticated: true, isLoading: false, user: { id: 'u1' } };
    state.ticketReturn = { confirming: true };
    renderPage();
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('gost dobija poziv na prijavu sa opisom', () => {
    renderPage();
    expect(screen.getByText('pages.tickets.guestInfo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'pages.tickets.signIn' })).toHaveAttribute('href', '/prijava');
  });

  it('gost sa session_id dobija poruku o prijavi za nastavak plaćanja', () => {
    renderPage('?paid=1&session_id=abc');
    expect(screen.getByText('paymentReturn.signIn')).toBeInTheDocument();
  });

  it('parametri se čiste kad nema plaćanja ili je aktivirano', () => {
    renderPage();
    expect(state.clearCalls.at(-1)).toBe(true);
  });

  it('nepoznat provajder se normalizuje na null', () => {
    renderPage('?paid=1&session_id=abc&provider=paypal');
    expect(state.ticketArgs.provider).toBeNull();
  });

  it('split raspored za goste, full za prijavljene', async () => {
    const user = userEvent.setup();
    const { unmount } = renderPage();
    expect(screen.getByText('forma:split')).toBeInTheDocument();
    unmount();
    state.auth = { isAuthenticated: true, isLoading: false, user: { id: 'u1', email: 'a@mail.ba' } };
    renderPage();
    expect(screen.getByText('forma:full')).toBeInTheDocument();
    void user;
  });
});
