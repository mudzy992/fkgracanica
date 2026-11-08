import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MembershipPendingStatus } from './MembershipPendingStatus';

describe('MembershipPendingStatus — varijante (3 grane)', () => {
  it('onlineAllowed false prikazuje blagajnu poruku', () => {
    render(<MembershipPendingStatus onlineAllowed={false} />);
    expect(screen.getByText(/uplate na blagajni/)).toBeInTheDocument();
    expect(screen.queryByText(/Dovršite online uplatu/)).toBeNull();
  });

  it('onlineAllowed true prikazuje online poruku', () => {
    render(<MembershipPendingStatus onlineAllowed />);
    expect(screen.getByText(/Dovršite online uplatu/)).toBeInTheDocument();
  });

  it('showPayButton sa providerima prikazuje OnlinePaymentChoice', () => {
    const onPay = vi.fn();
    render(
      <MembershipPendingStatus onlineAllowed showPayButton onPayOnline={onPay} providers={['monri']} />,
    );
    expect(screen.getByText(/Monri/i)).toBeInTheDocument();
  });

  it('showPayButton bez onPayOnline ili praznih providera ne prikazuje izbor', () => {
    render(<MembershipPendingStatus onlineAllowed showPayButton providers={[]} onPayOnline={vi.fn()} />);
    expect(screen.queryByText(/Monri/i)).toBeNull();
    render(<MembershipPendingStatus onlineAllowed showPayButton={false} onPayOnline={vi.fn()} providers={['monri']} />);
    expect(screen.queryByText(/Monri/i)).toBeNull();
  });

  it('userEmail prikazuje prijavu', () => {
    render(<MembershipPendingStatus onlineAllowed userEmail="test@fk.ba" />);
    expect(screen.getByText(/test@fk.ba/)).toBeInTheDocument();
  });

  it('bez userEmail ne prikazuje prijavu', () => {
    render(<MembershipPendingStatus onlineAllowed />);
    expect(screen.queryByText(/Prijavljeni ste kao/)).toBeNull();
  });
});
