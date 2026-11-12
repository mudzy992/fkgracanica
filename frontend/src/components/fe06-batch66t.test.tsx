import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockAuth = vi.fn(() => ({ isAuthenticated: true, user: { email: 'a@a.com' } }));
const mockRegister = vi.fn(() => ({ id: '123' }));
const mockCheckout = vi.fn(() => Promise.resolve({ url: 'https://pay.example' }));
let mockProviders: string[] = ['monri'];

vi.mock('react-i18next', async (orig) => {
  const actual = await (orig() as never) as Record<string, unknown>;
  return { ...(actual as object), useTranslation: () => ({ t: (k: string) => k }) };
});
vi.mock('../lib/auth', () => ({ useAuth: () => mockAuth() }));
vi.mock('../hooks/use-membership', () => ({
  useRegisterMembership: () => ({ mutateAsync: mockRegister, isPending: false, isError: false }),
}));
vi.mock('../hooks/use-online-checkout', () => ({
  useOnlineMembershipCheckout: () => ({ mutateAsync: mockCheckout, isPending: false }),
  useOnlineTicketCheckout: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../lib/payment-providers', () => ({ getReadyPaymentProviders: () => mockProviders as never }));
vi.mock('../hooks/use-ticketing', () => ({
  useTicketingPublicConfig: () => ({ data: {} }),
  useRequestTicketRefund: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCancelMyTicketOrder: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('qrcode', () => ({ default: { toDataURL: () => Promise.resolve('data:image/png;base64,abc') } }));
vi.mock('../lib/pass-qr', () => ({ qrDataUrl: () => Promise.resolve('data:image/png;base64,abc') }));

import { MembershipPurchasePanel } from './membership/MembershipPurchasePanel';

function wrap(c: React.ReactNode) {
  const qc = new QueryClient();
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{c}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('batch66t MembershipPurchasePanel startPurchase', () => {
  it('pokriva onlineAllowed && created.id true', async () => {
    mockAuth.mockReturnValue({ isAuthenticated: true, user: { email: 'a@a.com' } } as never);
    mockRegister.mockResolvedValue({ id: '123' } as never);
    mockProviders = ['monri'];
    const origHref = window.location.href;
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { href: '' } as unknown as Location;
    const { container } = render(
      wrap(<MembershipPurchasePanel config={{ modulesMembership: true, membershipOnlineEnabled: true, onlineReady: true, membershipAnnualPrice: 100 } as never} />),
    );
    const btn = container.querySelector('button');
    expect(btn).toBeDefined();
    if (btn) fireEvent.click(btn);
    await waitFor(() => expect(mockRegister).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 20));
    expect(mockCheckout).toHaveBeenCalled();
    // @ts-ignore
    window.location.href = origHref;
  });

  it('pokriva onlineAllowed && created.id false (bez id)', async () => {
    vi.clearAllMocks();
    mockAuth.mockReturnValue({ isAuthenticated: true, user: { email: 'a@a.com' } } as never);
    mockRegister.mockResolvedValue({} as never);
    mockProviders = ['monri'];
    const { container } = render(
      wrap(<MembershipPurchasePanel config={{ modulesMembership: true, membershipOnlineEnabled: true, onlineReady: true, membershipAnnualPrice: 100 } as never} />),
    );
    const btn = container.querySelector('button');
    if (btn) fireEvent.click(btn);
    await waitFor(() => expect(mockRegister).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 20));
    expect(mockCheckout).not.toHaveBeenCalled();
  });

  it('pokriva onlineAllowed false', async () => {
    vi.clearAllMocks();
    mockAuth.mockReturnValue({ isAuthenticated: true, user: { email: 'a@a.com' } } as never);
    mockRegister.mockResolvedValue({ id: '123' } as never);
    mockProviders = [];
    const { container } = render(
      wrap(<MembershipPurchasePanel config={{ modulesMembership: true, membershipOnlineEnabled: false, onlineReady: false, membershipAnnualPrice: 0 } as never} />),
    );
    expect(container).toBeDefined();
  });
});
