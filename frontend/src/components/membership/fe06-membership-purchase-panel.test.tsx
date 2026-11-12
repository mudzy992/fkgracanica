import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MembershipPurchasePanel } from './MembershipPurchasePanel';
import type { MembershipRow } from '../../types/membership';
import type { TicketingPublicConfig } from '../../types/ticketing-config';

const state = vi.hoisted(() => ({
  auth: { isAuthenticated: true, user: { email: 'marko@fk.ba' } as { email: string } | null },
  register: { mutateAsync: vi.fn(async () => ({ id: 'm-new' })), isPending: false, isError: false },
  checkout: { mutateAsync: vi.fn(async () => ({ url: '' })), isPending: false },
  payProviders: ['stripe'] as string[],
}));

vi.mock('../../hooks/use-membership', () => ({ useRegisterMembership: () => state.register }));
vi.mock('../../hooks/use-online-checkout', () => ({ useOnlineMembershipCheckout: () => state.checkout }));
vi.mock('../../lib/auth', () => ({ useAuth: () => state.auth }));
vi.mock('../../lib/payment-providers', () => ({ getReadyPaymentProviders: () => state.payProviders }));
vi.mock('../payments/OnlinePaymentChoice', () => ({
  OnlinePaymentChoice: ({ providers, onSelect, disabled }: {
    providers: string[]; onSelect: (p: string) => void; disabled?: boolean;
  }) => (
    <div>
      <span>providers:{providers.join(',')}</span>
      {providers.map((p) => (
        <button key={p} disabled={disabled} onClick={() => onSelect(p)}>plati-{p}</button>
      ))}
    </div>
  ),
}));
vi.mock('./MembershipJoinForm', () => ({
  MembershipJoinForm: ({ annualPrice, onJoined }: { annualPrice: number; onJoined: (id: string) => void }) => (
    <div>
      <span>join-form:{annualPrice}</span>
      <button onClick={() => void onJoined('m-joined')}>pridruži-se</button>
    </div>
  ),
}));
vi.mock('./MembershipBoxOfficeInfo', () => ({ MembershipBoxOfficeInfo: () => <div>blagajna-info</div> }));
vi.mock('./MembershipCardPanel', () => ({
  MembershipCardPanel: ({ membership }: { membership: MembershipRow }) => <div>kartica:{membership.id}</div>,
}));
vi.mock('./MembershipInactivePanel', () => ({
  MembershipInactivePanel: ({ current, onPay, onRejoin, registerError, busy }: {
    current: MembershipRow; onPay: (p: string) => void; onRejoin: () => void;
    registerError?: boolean; busy?: boolean;
  }) => (
    <div>
      <span>neaktivno:{current.status} greska:{String(!!registerError)} cekanje:{String(!!busy)}</span>
      <button onClick={() => onPay('monri')}>obnovi-online</button>
      <button onClick={onRejoin}>ponovo-pridruži</button>
    </div>
  ),
}));
vi.mock('./MembershipPendingStatus', () => ({
  MembershipPendingStatus: ({ showPayButton, onPayOnline, onlineAllowed, userEmail }: {
    showPayButton: boolean; onPayOnline: (p: string) => void; onlineAllowed: boolean; userEmail?: string;
  }) => (
    <div>
      <span>na-cekanju:{userEmail} online:{String(onlineAllowed)} dugme:{String(showPayButton)}</span>
      {showPayButton && <button onClick={() => onPayOnline('stripe')}>plati-sada</button>}
    </div>
  ),
}));

const cfg = (over: Partial<TicketingPublicConfig> = {}) => ({
  modulesMembership: true,
  membershipOnlineEnabled: true,
  onlineReady: true,
  membershipAnnualPrice: 50,
  readyProviders: ['stripe'],
  ...over,
}) as unknown as TicketingPublicConfig;

const row = (status: MembershipRow['status'], id = 'm1'): MembershipRow => ({ id, status });

beforeEach(() => {
  state.auth = { isAuthenticated: true, user: { email: 'marko@fk.ba' } };
  state.register = { mutateAsync: vi.fn(async () => ({ id: 'm-new' })), isPending: false, isError: false };
  state.checkout = { mutateAsync: vi.fn(async () => ({ url: '' })), isPending: false };
  state.payProviders = ['stripe'];
});

describe('MembershipPurchasePanel', () => {
  it('isključen modul i potvrda uplate imaju svoje panele', () => {
    const { unmount } = render(<MembershipPurchasePanel config={cfg({ modulesMembership: false })} />);
    expect(screen.getByText(/Članstvo trenutno nije dostupno/i)).toBeInTheDocument();
    unmount();
    render(<MembershipPurchasePanel config={cfg()} confirmingPayment />);
    expect(screen.getByText(/Potvrđujemo uplatu/i)).toBeInTheDocument();
  });

  it('aktivno članstvo prikazuje karticu uz poruku o uspjehu', () => {
    render(<MembershipPurchasePanel config={cfg()} memberships={[row('ACTIVE')]} paymentSuccess />);
    expect(screen.getByText(/Uplata je uspješna/i)).toBeInTheDocument();
    expect(screen.getByText('kartica:m1')).toBeInTheDocument();
  });

  it('na čekanju nudi plaćanje samo kad je online spreman uz cijenu', () => {
    const { unmount } = render(
      <MembershipPurchasePanel config={cfg()} memberships={[row('PENDING')]} paymentCancelled />,
    );
    expect(screen.getByText(/Online uplata je otkazana/i)).toBeInTheDocument();
    expect(screen.getByText('na-cekanju:marko@fk.ba online:true dugme:true')).toBeInTheDocument();
    unmount();
    render(<MembershipPurchasePanel config={cfg({ membershipAnnualPrice: 0 })} memberships={[row('PENDING')]} />);
    expect(screen.getByText('na-cekanju:marko@fk.ba online:true dugme:false')).toBeInTheDocument();
  });

  it('neaktivno članstvo vodi u panel obnove sa mutacijama', async () => {
    const user = userEvent.setup();
    render(<MembershipPurchasePanel config={cfg()} memberships={[row('EXPIRED')]} />);
    expect(screen.getByText(/neaktivno:EXPIRED/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ponovo-pridruži' }));
    await waitFor(() => expect(state.register.mutateAsync).toHaveBeenCalled());
  });

  it('neprijavljeni korisnik dobija formu za pristup, a jedan provajder plaća odmah', async () => {
    const user = userEvent.setup();
    state.auth = { isAuthenticated: false, user: null };
    render(<MembershipPurchasePanel config={cfg()} />);
    expect(screen.getByText('join-form:50')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'pridruži-se' }));
    await waitFor(() => expect(state.checkout.mutateAsync).toHaveBeenCalledWith({
      membershipId: 'm-joined', amount: 50, provider: 'stripe',
    }));
  });

  it('više provajdera otvara izbor načina plaćanja nakon pristupa', async () => {
    const user = userEvent.setup();
    state.auth = { isAuthenticated: false, user: null };
    state.payProviders = ['stripe', 'monri'];
    render(<MembershipPurchasePanel config={cfg()} />);
    await user.click(screen.getByRole('button', { name: 'pridruži-se' }));
    await waitFor(() => expect(screen.getByText('providers:stripe,monri')).toBeInTheDocument());
    expect(screen.getByText(/Odaberite način online plaćanja/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'plati-monri' }));
    await waitFor(() => expect(state.checkout.mutateAsync).toHaveBeenCalledWith({
      membershipId: 'm-joined', amount: 50, provider: 'monri',
    }));
  });

  it('prijavljeni korisnik bez članstva kupuje direktno i vidi grešku registracije', async () => {
    const user = userEvent.setup();
    state.register = { ...state.register, isError: true };
    render(<MembershipPurchasePanel config={cfg()} />);
    expect(screen.getByText(/Prijavljeni ste kao/i)).toBeInTheDocument();
    expect(screen.getByText(/Godišnja članarina: 50 KM/i)).toBeInTheDocument();
    expect(screen.getByText(/Kupovina nije uspjela/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'plati-stripe' }));
    await waitFor(() => expect(state.register.mutateAsync).toHaveBeenCalled());
    await waitFor(() => expect(state.checkout.mutateAsync).toHaveBeenCalledWith({
      membershipId: 'm-new', amount: 50, provider: 'stripe',
    }));
  });

  it('paneli na čekanju i obnove prosljeđuju odabrani provajder u checkout', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<MembershipPurchasePanel config={cfg()} memberships={[row('PENDING')]} />);
    await user.click(screen.getByRole('button', { name: 'plati-sada' }));
    await waitFor(() => expect(state.checkout.mutateAsync).toHaveBeenCalledWith({
      membershipId: 'm1', amount: 50, provider: 'stripe',
    }));
    unmount();
    render(<MembershipPurchasePanel config={cfg()} memberships={[row('EXPIRED')]} />);
    await user.click(screen.getByRole('button', { name: 'obnovi-online' }));
    await waitFor(() => expect(state.checkout.mutateAsync).toHaveBeenCalledWith({
      membershipId: 'm1', amount: 50, provider: 'monri',
    }));
  });

  it('URL provajdera preusmjerava stranicu na naplatu', async () => {
    const user = userEvent.setup();
    state.checkout = { ...state.checkout, mutateAsync: vi.fn(async () => ({ url: '#naplata' })) };
    render(<MembershipPurchasePanel config={cfg()} memberships={[row('PENDING')]} />);
    await user.click(screen.getByRole('button', { name: 'plati-sada' }));
    await waitFor(() => expect(window.location.hash).toBe('#naplata'));
  });

  it('bez online prodaje prikazuje informacije sa blagajne', () => {
    render(<MembershipPurchasePanel config={cfg({ membershipOnlineEnabled: false })} />);
    expect(screen.getByText('blagajna-info')).toBeInTheDocument();
  });
});
