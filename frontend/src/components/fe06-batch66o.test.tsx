import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, vi, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', async (orig) => {
  const actual = await (orig() as never) as Record<string, unknown>;
  return { ...(actual as object), useTranslation: () => ({ t: (k: string) => k }) };
});
vi.mock('../lib/auth', () => ({ useAuth: () => ({ isAuthenticated: false, user: null }) }));
vi.mock('../hooks/use-membership', () => ({
  useRegisterMembership: () => ({ mutateAsync: vi.fn(), isPending: false, isError: false }),
}));
vi.mock('../hooks/use-online-checkout', () => ({
  useOnlineMembershipCheckout: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useOnlineTicketCheckout: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('qrcode', () => ({ default: { toDataURL: (v: string) => (v === 'fail' ? Promise.reject(new Error('fail')) : Promise.resolve('data:image/png;base64,abc')) } }));
vi.mock('../lib/pass-qr', () => ({ qrDataUrl: (v: string) => (v === 'fail' ? Promise.reject(new Error('fail')) : Promise.resolve('data:image/png;base64,abc')) }));
vi.mock('../lib/payment-providers', () => ({ getReadyPaymentProviders: () => [] }));
vi.mock('../hooks/use-ticketing', () => ({
  useTicketingPublicConfig: () => ({ data: {} }),
  useRequestTicketRefund: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCancelMyTicketOrder: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

import { MembershipPurchasePanel } from './membership/MembershipPurchasePanel';
import { MembershipQrCode } from './membership/MembershipQrCode';
import { PassQrCode } from './pass/PassQrCode';

function wrap(c: React.ReactNode) {
  const qc = new QueryClient();
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{c}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('batch66o membership', () => {
  it('MembershipPurchasePanel pokriva moduleOn', () => {
    const { container: c1 } = render(wrap(<MembershipPurchasePanel config={{ modulesMembership: false } as never} />));
    expect(c1.textContent).toContain('Članstvo trenutno nije dostupno');
    const { container: c2 } = render(wrap(<MembershipPurchasePanel config={{ modulesMembership: true, membershipOnlineEnabled: false } as never} />));
    expect(c2).toBeDefined();
    const { container: c3 } = render(wrap(<MembershipPurchasePanel confirmingPayment />));
    expect(c3.textContent).toContain('Potvrđujemo uplatu');
  });

  it('MembershipQrCode pokriva', async () => {
    const { container: c1 } = render(wrap(<MembershipQrCode value="ok" />));
    await new Promise((r) => setTimeout(r, 20));
    expect(c1.innerHTML).toContain('img');
    const { container: c2 } = render(wrap(<MembershipQrCode value="fail" />));
    await new Promise((r) => setTimeout(r, 20));
    expect(c2.textContent).toContain('QR kod nije dostupan');
  });

  it('PassQrCode pokriva', async () => {
    const { container: c1 } = render(wrap(<PassQrCode value="ok" />));
    await new Promise((r) => setTimeout(r, 20));
    expect(c1.innerHTML).toContain('img');
    const { container: c2 } = render(wrap(<PassQrCode value="fail" />));
    await new Promise((r) => setTimeout(r, 20));
    expect(c2.textContent).toContain('QR kod nije dostupan');
  });
});
