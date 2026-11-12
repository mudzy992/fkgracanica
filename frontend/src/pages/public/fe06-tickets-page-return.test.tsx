import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketsPage } from './TicketsPage';

const state = vi.hoisted(() => ({
  config: undefined as unknown,
  ticketReturn: {} as Record<string, unknown>,
  seasonReturn: {} as Record<string, unknown>,
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
vi.mock('../../hooks/use-clear-payment-params', () => ({ useClearPaymentParams: () => undefined }));
vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ isAuthenticated: true, isLoading: false, user: { id: 'u1', email: 'a@mail.ba' } }),
}));
vi.mock('../../lib/payment-providers', () => ({
  parsePaymentProvider: (provider: string | null) => (provider === 'stripe' ? 'stripe' : null),
}));
vi.mock('../../components/ticketing/MyTicketsPanel', () => ({
  MyTicketsPanel: ({ paymentSuccess }: { paymentSuccess: boolean }) => (
    <div>moje-karte:{String(paymentSuccess)}</div>
  ),
}));
vi.mock('../../components/ticketing/TicketsReserveForm', () => ({
  TicketsReserveForm: () => <div>rezervacije</div>,
}));
vi.mock('../../components/ticketing/SeasonPassPanel', () => ({
  SeasonPassPanel: (props: Record<string, unknown>) => (
    <div>sezonska:{String(props.paymentSuccess)}:{String(props.paymentCancelled)}</div>
  ),
}));
vi.mock('../../components/payments/PaymentReturnNotice', () => ({
  PaymentReturnNotice: ({ status }: { status: string }) => <div>obavjest:{status}</div>,
}));
vi.mock('../../components/public/forms/FormShell', () => ({
  FormShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('../../components/public/shell/PageHeroHeader', () => ({
  PageHeroHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));

const renderPage = (search: string) =>
  render(
    <MemoryRouter initialEntries={[`/ulaznice${search}`]}>
      <Routes>
        <Route path="/ulaznice" element={<TicketsPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  state.config = { modulesTicketing: true, salesModes: { boxOffice: true, online: true }, seasonPassAvailable: true };
  state.ticketReturn = {};
  state.seasonReturn = {};
  state.ticketArgs = {};
  state.seasonArgs = {};
});

describe('TicketsPage — povratak sa plaćanja', () => {
  it('uspješan povratak otvara tab narudžbi i prijavljuje uspjeh', () => {
    state.ticketReturn = { activated: true };
    renderPage('?paid=1&session_id=abc&provider=stripe');
    expect(screen.getByText('moje-karte:true')).toBeInTheDocument();
    expect(state.ticketArgs).toMatchObject({
      paid: true,
      sessionId: 'abc',
      provider: 'stripe',
      userId: 'u1',
    });
  });

  it('sezonski povratak otvara tab sezone i prijavljuje uspjeh', () => {
    state.seasonReturn = { activated: true };
    renderPage('?paid=1&kind=season&token=tok1');
    expect(screen.getByText('sezonska:true:false')).toBeInTheDocument();
    expect(state.seasonArgs).toMatchObject({ paid: true, sessionId: 'tok1', userId: 'u1' });
    expect(state.ticketArgs.paid).toBe(false);
  });

  it('sezonski otkazani povratak se prikazuje tek na tabu sezone', async () => {
    const user = userEvent.setup();
    renderPage('?cancelled=1&kind=season');
    expect(screen.queryByText(/sezonska:/)).toBeNull();
    await user.click(screen.getByRole('button', { name: 'pages.tickets.tabsSeason' }));
    expect(screen.getByText('sezonska:false:true')).toBeInTheDocument();
  });
});
