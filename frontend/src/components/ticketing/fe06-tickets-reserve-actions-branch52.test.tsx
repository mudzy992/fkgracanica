import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const reserveState = { isPending: false, error: null as unknown, mutateAsync: vi.fn() };
const checkoutState = { isPending: false, error: null as unknown, mutateAsync: vi.fn() };
vi.mock('../../hooks/use-online-checkout', () => ({ useOnlineTicketCheckout: () => checkoutState }));
vi.mock('../../hooks/use-ticketing', () => ({ useReserveTicket: () => reserveState, useTicketingPublicConfig: () => ({ data: { providers: [] } }) }));
vi.mock('../../lib/payment-providers', () => ({ getReadyPaymentProviders: () => [] }));
vi.mock('../payments/OnlinePaymentChoice', () => ({ OnlinePaymentChoice: () => <div data-testid="online-choice" /> }));

import { TicketsReserveActions } from './TicketsReserveActions';

const cat = { id: 'c1', label: 'Tribina', price: 10 };

describe('fe06 TicketsReserveActions branch52', () => {
  beforeEach(() => {
    reserveState.isPending = false;
    checkoutState.isPending = false;
    reserveState.error = null;
    checkoutState.error = null;
    vi.clearAllMocks();
  });
  it('boxOffice false, online false → fallback grana disabled || !boxOffice', () => {
    render(<TicketsReserveActions matchId="m1" category={cat} quantity={1} boxOfficeMax={4} onlineMax={4} remaining={10} boxOffice={false} online={false} onReserved={vi.fn()} />);
    expect(screen.getByText('Rezerviši ulaznice')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /Rezerviši ulaznice/ });
    expect(btn).toBeDisabled(); // boxOfficeDisabled false || !false => true via !boxOffice
  });
  it('busy true pokazuje Rezervacija...', () => {
    reserveState.isPending = true;
    render(<TicketsReserveActions matchId="m1" category={cat} quantity={1} boxOfficeMax={4} onlineMax={4} remaining={10} boxOffice={false} online={false} onReserved={vi.fn()} />);
    expect(screen.getByText('Rezervacija...')).toBeInTheDocument();
  });
  it('boxOffice && online true prikazuje oba izbora', () => {
    render(<TicketsReserveActions matchId="m1" category={cat} quantity={1} boxOfficeMax={4} onlineMax={4} remaining={10} boxOffice={true} online={true} onReserved={vi.fn()} />);
    expect(screen.getByTestId('online-choice')).toBeInTheDocument();
    expect(screen.getByText('Rezerviši za blagajnu')).toBeInTheDocument();
  });
});
