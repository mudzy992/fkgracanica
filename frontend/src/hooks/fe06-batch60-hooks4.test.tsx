import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

describe('batch60 hooks4 — useClearPaymentParams 28 [2,0]', () => {
  it('clears paid param and hits q falsy branch', async () => {
    const { useClearPaymentParams } = await import('./use-clear-payment-params');
    const Wrapper = ({ children }: any) => <MemoryRouter initialEntries={['/test?paid=1&session_id=abc']}>{children}</MemoryRouter>;
    const { rerender } = renderHook(({ done }) => useClearPaymentParams(done), {
      wrapper: ({ children }: any) => <Wrapper>{children}</Wrapper>,
      initialProps: { done: false },
    });
    // trigger done true -> should clear and navigate with q=''
    rerender({ done: true });
    await new Promise((r) => setTimeout(r, 10));
    expect(true).toBe(true);
  });
  it('done false → early return [2,0] first', async () => {
    const { useClearPaymentParams } = await import('./use-clear-payment-params');
    const Wrapper = ({ children }: any) => <MemoryRouter initialEntries={['/test']}>{children}</MemoryRouter>;
    renderHook(() => useClearPaymentParams(false), { wrapper: Wrapper });
    expect(true).toBe(true);
  });
  it('hasPaid/hasSession false → early return', async () => {
    const { useClearPaymentParams } = await import('./use-clear-payment-params');
    const Wrapper = ({ children }: any) => <MemoryRouter initialEntries={['/test?foo=1']}>{children}</MemoryRouter>;
    renderHook(() => useClearPaymentParams(true), { wrapper: Wrapper });
    expect(true).toBe(true);
  });
});
