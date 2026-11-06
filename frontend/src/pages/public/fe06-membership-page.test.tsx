import { render, screen } from '@testing-library/react';
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


describe('MembershipPage — gost', () => {
  beforeEach(reset);

  it('dok se auth učitava prikazuje skeleton', () => {
    state.auth = { isAuthenticated: false, isLoading: true, user: undefined };
    const { container } = renderPage();
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
    expect(screen.queryByTestId('form-shell')).toBeNull();
  });

  it('gost vidi split formu i panel kupovine bez računskih sekcija', () => {
    renderPage();
    expect(state.shells[0].layout).toBe('split');
    expect(screen.getByTestId('purchase-panel')).toBeTruthy();
    expect(screen.queryByTestId('home-strip')).toBeNull();
    expect(screen.queryByTestId('tabs')).toBeNull();
    expect(state.seo[0].title).toBe('pages.membership.seoTitle');
  });

  it('gost sa plaćanjem traži prijavu umjesto panela kupovine', () => {
    renderPage('?paid=1&session_id=s1');
    expect(screen.getByText('paymentReturn.signIn')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'nav.login' }).getAttribute('href')).toBe('/prijava');
    expect(screen.queryByTestId('purchase-panel')).toBeNull();
  });

  it('gost sa paid bez sesije ipak vidi panel kupovine', () => {
    renderPage('?paid=1');
    expect(screen.getByTestId('purchase-panel')).toBeTruthy();
  });

  it('otkazano plaćanje se prosljeđuje panelu', () => {
    renderPage('?cancelled=1');
    expect(state.panels[0].paymentCancelled).toBe(true);
  });

  it('gostu se članstvo ne čeka', () => {
    state.membership = { data: undefined, isLoading: true };
    renderPage();
    expect(screen.getByTestId('purchase-panel')).toBeTruthy();
  });

  it('config se prosljeđuje panelu kupovine', () => {
    state.config = { data: { modulesTicketing: true }, isLoading: false };
    renderPage();
    expect(state.panels[0].config).toEqual({ modulesTicketing: true });
  });

  it('bez parametara plaćanja čiste se odmah', () => {
    renderPage();
    expect(state.clearArgs[0]).toBe(true);
  });
});
