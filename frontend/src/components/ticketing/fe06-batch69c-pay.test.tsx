import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

const checkoutState = vi.hoisted(() => ({
  url: 'https://pay.example/1' as string | null,
  shouldFail: false,
}));

vi.mock('../../hooks/use-ticketing', () => ({
  useTicketingPublicConfig: () => ({ data: { providers: [{ key: 'monri' }] } }),
  useRequestTicketRefund: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCancelMyTicketOrder: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('../../hooks/use-online-checkout', () => ({
  useOnlineTicketCheckout: () => ({
    mutateAsync: vi.fn(async () => {
      if (checkoutState.shouldFail) throw new Error('fail');
      return checkoutState.url ? { url: checkoutState.url } : {};
    }),
    isPending: false,
  }),
}));

vi.mock('../../lib/payment-providers', () => ({
  getReadyPaymentProviders: () => [{ key: 'monri', label: 'Monri' }],
}));

vi.mock('../../lib/action-errors', async () => {
  const actual = await vi.importActual('../../lib/action-errors') as Record<string, unknown>;
  return {
    ...actual,
    runAction: vi.fn(async (p: Promise<unknown>) => {
      try {
        const v = await p;
        return { ok: true, value: v as never };
      } catch {
        return { ok: false } as never;
      }
    }),
  };
});

import { TicketOrderCard } from './TicketOrderCard';

function wrap(c: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{c}</QueryClientProvider>;
}

const baseOrder = {
  id: 'o1',
  status: 'pending',
  total: 20,
  createdAt: new Date().toISOString(),
  tickets: [{ id: 't1', status: 'RESERVED' }],
  payment: { status: 'PENDING_ONLINE' },
} as never;

describe('TicketOrderCard — payOnline grana result.ok && url', () => {
  beforeEach(() => {
    checkoutState.url = 'https://pay.example/1';
    checkoutState.shouldFail = false;
    // @ts-ignore mock location
    delete (window as unknown as { location?: unknown }).location;
    // @ts-ignore
    window.location = { href: '' } as unknown as Location;
  });

  it('kada je result.ok && url truthy -> redirect', async () => {
    checkoutState.url = 'https://pay.example/1';
    const { container } = render(wrap(<TicketOrderCard order={baseOrder} />));
    const monriBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes('Monri')) || container.querySelector('button');
    if (monriBtn) fireEvent.click(monriBtn);
    await waitFor(() => expect(window.location.href).toBe('https://pay.example/1'), { timeout: 1000 });
  });

  it('kada je result.ok true ali url falsy -> nema redirect', async () => {
    checkoutState.url = null;
    const { container } = render(wrap(<TicketOrderCard order={baseOrder} />));
    const monriBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes('Monri')) || container.querySelector('button');
    if (monriBtn) fireEvent.click(monriBtn);
    await new Promise((r) => setTimeout(r, 50));
    expect(window.location.href).not.toBe('https://pay.example/1');
    expect(window.location.href).toBe('');
  });

  it('kada je result.ok false -> nema redirect', async () => {
    checkoutState.shouldFail = true;
    const { container } = render(wrap(<TicketOrderCard order={baseOrder} />));
    const monriBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes('Monri')) || container.querySelector('button');
    if (monriBtn) fireEvent.click(monriBtn);
    await new Promise((r) => setTimeout(r, 50));
    expect(window.location.href).toBe('');
  });
});
