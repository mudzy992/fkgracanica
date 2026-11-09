import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../lib/auth', () => ({ useAuth: vi.fn() }));
vi.mock('../../hooks/use-membership', () => ({ useRegisterMembership: () => ({ mutateAsync: vi.fn(), isPending: false, isError: false }) }));
vi.mock('../../hooks/use-online-checkout', () => ({ useOnlineMembershipCheckout: () => ({ mutateAsync: vi.fn(), isPending: false }) }));
vi.mock('../../lib/payment-providers', () => ({ getReadyPaymentProviders: () => [] }));
vi.mock('./MembershipJoinForm', () => ({ MembershipJoinForm: () => <div>JoinForm</div> }));
vi.mock('./MembershipBoxOfficeInfo', () => ({ MembershipBoxOfficeInfo: () => <div>BoxOffice</div> }));
vi.mock('./MembershipCardPanel', () => ({ MembershipCardPanel: () => <div>CardPanel</div> }));
vi.mock('./MembershipInactivePanel', () => ({ MembershipInactivePanel: () => <div>InactivePanel</div> }));
vi.mock('./MembershipPendingStatus', () => ({ MembershipPendingStatus: () => <div>PendingStatus</div> }));
vi.mock('../payments/OnlinePaymentChoice', () => ({ OnlinePaymentChoice: () => <div>Choice</div> }));
vi.mock('../ui/skeleton', () => ({ Skeleton: () => <div>Skeleton</div> }));

import { useAuth } from '../../lib/auth';
import { MembershipPurchasePanel } from './MembershipPurchasePanel';

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}

describe('fe06 MembershipPurchasePanel branch52', () => {
  it('memberships undefined → current undefined (bid2 false)', () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isAuthenticated: false, user: null });
    render(wrap(<MembershipPurchasePanel config={{ modulesMembership: true, membershipOnlineEnabled: true, onlineReady: true, membershipAnnualPrice: 10 } as never} />));
    expect(screen.getByText('JoinForm')).toBeInTheDocument();
  });
  it('memberships empty array → current undefined', () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isAuthenticated: false, user: null });
    render(wrap(<MembershipPurchasePanel config={{ modulesMembership: true, membershipOnlineEnabled: true, onlineReady: true, membershipAnnualPrice: 10 } as never} memberships={[]} />));
    expect(screen.getByText('JoinForm')).toBeInTheDocument();
  });
  it('moduleOn false → nije dostupno', () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ isAuthenticated: false, user: null });
    render(wrap(<MembershipPurchasePanel config={{ modulesMembership: false } as never} />));
    expect(screen.getByText(/Članstvo trenutno nije dostupno/)).toBeInTheDocument();
  });
});
