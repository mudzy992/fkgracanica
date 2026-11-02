import { isCheckoutImplemented, toProviderGate } from './provider-gate.util';

describe('toProviderGate', () => {
  it('stripe keys → checkoutReady', () => {
    expect(toProviderGate('stripe', true)).toEqual({
      keysOk: true,
      checkoutReady: true,
    });
  });

  it('paypal keys → checkoutReady', () => {
    expect(isCheckoutImplemented('paypal')).toBe(true);
    expect(toProviderGate('paypal', true)).toEqual({
      keysOk: true,
      checkoutReady: true,
    });
  });

  it('monri keys → checkoutReady', () => {
    expect(isCheckoutImplemented('monri')).toBe(true);
    expect(toProviderGate('monri', true)).toEqual({
      keysOk: true,
      checkoutReady: true,
    });
  });
});
