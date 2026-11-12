import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TicketsPage } from './TicketsPage';

const state = vi.hoisted(() => ({
  config: undefined as unknown,
  ticketArgs: {} as Record<string, unknown>,
  seasonArgs: {} as Record<string, unknown>,
  clearCalls: [] as boolean[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks/use-ticketing', () => ({
  useTicketingPublicConfig: () => ({ data: state.config }),
}));
vi.mock('../../hooks/use-ticket-payment-return', () => ({
  useTicketPaymentReturn: (args: Record<string, unknown>) => {
    state.ticketArgs = args;
    return { confirming: false, activated: false, status: 'none', retry: vi.fn() };
  },
}));
vi.mock('../../hooks/use-season-pass-payment-return', () => ({
  useSeasonPassPaymentReturn: (args: Record<string, unknown>) => {
    state.seasonArgs = args;
    return { confirming: false, activated: false, status: 'none', retry: vi.fn() };
  },
}));
vi.mock('../../hooks/use-clear-payment-params', () => ({
  useClearPaymentParams: (enabled: boolean) => state.clearCalls.push(enabled),
}));
vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ isAuthenticated: true, isLoading: false, user: { id: 'u1', email: 'a@mail.ba' } }),
}));
vi.mock('../../lib/payment-providers', () => ({ parsePaymentProvider: () => null }));
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
    <div>sezonska:{String(props.paymentSuccess)}:{String(props.paymentCancelled)}</div>
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
vi.mock('../../components/ui/skeleton', () => ({ Skeleton: () => <div data-testid="skeleton" /> }));

const config = (over: Record<string, unknown> = {}) => ({
  modulesTicketing: true,
  salesModes: { boxOffice: true, online: true },
  seasonPassAvailable: true,
  ...over,
});

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/ulaznice']}>
      <Routes>
        <Route path="/ulaznice" element={<TicketsPage />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  state.config = config();
  state.ticketArgs = {};
  state.seasonArgs = {};
  state.clearCalls = [];
});

describe('TicketsPage — prijavljeni korisnik', () => {
  it('prikazuje email, obavijest o plaćanju i tab za rezervaciju', () => {
    renderPage();
    expect(screen.getByText('pages.tickets.signedInAs')).toBeInTheDocument();
    expect(screen.getByText('obavjest:none')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'rezervisi' })).toBeInTheDocument();
    expect(screen.getByText('forma:full')).toBeInTheDocument();
  });

  it('neaktivan modul ulaznica prikazuje poruku', () => {
    state.config = config({ modulesTicketing: false });
    renderPage();
    expect(screen.getByText('pages.tickets.moduleInactive')).toBeInTheDocument();
  });

  it('prelazak na tab narudžbi i nazad na rezervaciju', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'pages.tickets.tabsOrders' }));
    expect(screen.getByText('moje-karte:false')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'pages.tickets.tabsReserve' }));
    expect(screen.getByRole('button', { name: 'rezervisi' })).toBeInTheDocument();
  });

  it('uspješna rezervacija prebacuje na tab narudžbi', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'rezervisi' }));
    expect(screen.getByText('moje-karte:false')).toBeInTheDocument();
  });

  it('tab sezone je vidljiv kad je sezonska dostupna i prikazuje panel', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'pages.tickets.tabsSeason' }));
    expect(screen.getByText('sezonska:false:false')).toBeInTheDocument();
  });

  it('tab sezone je skriven bez sezonske karte', () => {
    state.config = config({ seasonPassAvailable: false });
    renderPage();
    expect(screen.queryByRole('button', { name: 'pages.tickets.tabsSeason' })).toBeNull();
  });

  it('otkazano plaćanje prikazuje poruku', () => {
    render(
      <MemoryRouter initialEntries={['/ulaznice?cancelled=1']}>
        <Routes>
          <Route path="/ulaznice" element={<TicketsPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('pages.tickets.paymentCancelled')).toBeInTheDocument();
  });

  it('samo blagajna i oba kanala daju različite napomene', () => {
    state.config = config({ salesModes: { boxOffice: true, online: false } });
    const { unmount } = renderPage();
    expect(screen.getByText('pages.tickets.onlyBoxOffice')).toBeInTheDocument();
    unmount();
    state.config = config({ salesModes: { boxOffice: true, online: true } });
    renderPage();
    expect(screen.getByText('pages.tickets.onlineOrBoxOffice')).toBeInTheDocument();
  });
});
