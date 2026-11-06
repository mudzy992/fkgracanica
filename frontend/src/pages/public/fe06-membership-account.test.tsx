import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MembershipPage } from './MembershipPage';

const state = vi.hoisted(() => ({
  auth: { isAuthenticated: false, isLoading: false, user: undefined as unknown },
  config: { data: undefined as unknown, isLoading: false },
  membership: { data: undefined as unknown, isLoading: false },
  paymentReturn: { confirming: false, activated: false, status: 'idle', retry: vi.fn() },
  paymentArgs: [] as Record<string, unknown>[],
  clearArgs: [] as boolean[],
  seo: [] as Record<string, unknown>[],
  shells: [] as Record<string, unknown>[],
  tabs: [] as Record<string, unknown>[],
  panels: [] as Record<string, unknown>[],
  tickets: [] as Record<string, unknown>[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => state.auth }));
vi.mock('../../hooks/use-membership', () => ({ useMyMembership: () => state.membership }));
vi.mock('../../hooks/use-ticketing', () => ({ useTicketingPublicConfig: () => state.config }));
vi.mock('../../hooks/use-membership-payment-return', () => ({
  useMembershipPaymentReturn: (args: Record<string, unknown>) => {
    state.paymentArgs.push(args);
    return state.paymentReturn;
  },
}));
vi.mock('../../hooks/use-clear-payment-params', () => ({
  useClearPaymentParams: (enabled: boolean) => {
    state.clearArgs.push(enabled);
  },
}));
vi.mock('../../lib/payment-providers', () => ({
  parsePaymentProvider: (raw: string | null) => (raw === 'monri' ? 'MONRI' : null),
}));
vi.mock('../../components/seo/Seo', () => ({
  Seo: (props: Record<string, unknown>) => {
    state.seo.push(props);
    return null;
  },
}));
vi.mock('../../components/public/shell/PageHeroHeader', () => ({
  PageHeroHeader: () => <div data-testid="hero" />,
}));
vi.mock('../../components/public/forms/FormShell', () => ({
  FormShell: ({ children, ...rest }: Record<string, unknown>) => {
    state.shells.push(rest);
    return <div data-testid="form-shell">{children as never}</div>;
  },
}));
vi.mock('../../components/account/AccountSectionTabs', () => ({
  AccountSectionTabs: (props: Record<string, unknown>) => {
    state.tabs.push(props);
    return (
      <div data-testid="tabs">
        <button onClick={() => (props.onChange as (t: string) => void)('tickets')}>tab-tickets</button>
        <button onClick={() => (props.onChange as (t: string) => void)('membership')}>
          tab-membership
        </button>
      </div>
    );
  },
}));
vi.mock('../../components/membership/MembershipPurchasePanel', () => ({
  MembershipPurchasePanel: (props: Record<string, unknown>) => {
    state.panels.push(props);
    return <div data-testid="purchase-panel" />;
  },
}));
vi.mock('../../components/ticketing/MyTicketsPanel', () => ({
  MyTicketsPanel: (props: Record<string, unknown>) => {
    state.tickets.push(props);
    return <div data-testid="my-tickets" />;
  },
}));
vi.mock('../../components/membership/MemberHomeStrip', () => ({
  MemberHomeStrip: () => <div data-testid="home-strip" />,
}));
vi.mock('../../components/account/ProfileAvatarEditor', () => ({
  ProfileAvatarEditor: () => <div data-testid="avatar-editor" />,
}));
vi.mock('../../components/account/LiveNotifyToggle', () => ({
  LiveNotifyToggle: () => <div data-testid="notify-toggle" />,
}));
vi.mock('../../components/payments/PaymentReturnNotice', () => ({
  PaymentReturnNotice: ({ status }: { status: string }) => (
    <div data-testid="payment-notice" data-status={status} />
  ),
}));

const renderPage = (query = '') =>
  render(
    <MemoryRouter initialEntries={[`/clanstvo${query}`]}>
      <MembershipPage />
    </MemoryRouter>,
  );

const reset = () => {
  state.auth = { isAuthenticated: false, isLoading: false, user: undefined };
  state.config = { data: undefined, isLoading: false };
  state.membership = { data: undefined, isLoading: false };
  state.paymentReturn = { confirming: false, activated: false, status: 'idle', retry: vi.fn() };
  state.paymentArgs = [];
  state.clearArgs = [];
  state.seo = [];
  state.shells = [];
  state.tabs = [];
  state.panels = [];
  state.tickets = [];
};


describe('MembershipPage — račun', () => {
  beforeEach(() => {
    reset();
    state.auth = { isAuthenticated: true, isLoading: false, user: { id: 'u1' } };
  });

  it('prijavljeni korisnik dobija računski režim i sve sekcije', () => {
    renderPage();
    expect(state.shells[0].layout).toBe('full');
    expect(screen.getByTestId('home-strip')).toBeTruthy();
    expect(screen.getByTestId('avatar-editor')).toBeTruthy();
    expect(screen.getByTestId('notify-toggle')).toBeTruthy();
    expect(screen.getByTestId('tabs')).toBeTruthy();
    expect(screen.getByTestId('payment-notice')).toBeTruthy();
    expect(state.seo[0].title).toBe('pages.membership.seoTitleAccount');
    expect(state.tabs[0].showTickets).toBe(true);
  });

  it('modul ulaznica isključen skriva karticu ulaznica', () => {
    state.config = { data: { modulesTicketing: false }, isLoading: false };
    renderPage();
    expect(state.tabs[0].showTickets).toBe(false);
  });

  it('potvrda plaćanja prikazuje skeleton i prosljeđuje parametre', () => {
    state.paymentReturn = { confirming: true, activated: false, status: 'confirming', retry: vi.fn() };
    const { container } = renderPage('?paid=1&session_id=s1&provider=monri');
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
    expect(state.paymentArgs[0]).toEqual({
      paid: true,
      sessionId: 's1',
      provider: 'MONRI',
      userId: 'u1',
      enabled: true,
    });
    expect(state.clearArgs).toEqual([false]);
  });

  it('token se koristi kada nema session_id', () => {
    renderPage('?paid=1&token=tok');
    expect(state.paymentArgs[0].sessionId).toBe('tok');
  });

  it('uspješno plaćanje se prosljeđuje panelu i čisti parametre', () => {
    state.paymentReturn = { confirming: false, activated: true, status: 'success', retry: vi.fn() };
    renderPage('?paid=1&session_id=s1');
    expect(state.panels[0].paymentSuccess).toBe(true);
    expect(state.clearArgs.at(-1)).toBe(true);
  });

  it('kartica ulaznica zamjenjuje panel kupovine', async () => {
    renderPage();
    await userEvent.click(screen.getByText('tab-tickets'));
    expect(screen.getByTestId('my-tickets')).toBeTruthy();
    expect(screen.queryByTestId('purchase-panel')).toBeNull();
    expect(state.tickets[0]).toEqual({ paymentSuccess: false });
  });

  it('povratak na karticu članstva vraća panel kupovine', async () => {
    renderPage();
    await userEvent.click(screen.getByText('tab-tickets'));
    await userEvent.click(screen.getByText('tab-membership'));
    expect(screen.getByTestId('purchase-panel')).toBeTruthy();
    expect(screen.queryByTestId('my-tickets')).toBeNull();
  });

  it('članstvo koje se učitava prikazuje skeleton', () => {
    state.membership = { data: undefined, isLoading: true };
    const { container } = renderPage();
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });
});
