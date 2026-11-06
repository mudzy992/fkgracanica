import { describe, expect, it } from 'vitest';
import { getReadyPaymentProviders, parsePaymentProvider } from './payment-providers';

const config = (over: Record<string, unknown>) => over as never;

describe('payment-providers', () => {
  it('prihvata samo poznate provajdere', () => {
    expect(parsePaymentProvider('stripe')).toBe('stripe');
    expect(parsePaymentProvider('paypal')).toBe('paypal');
    expect(parsePaymentProvider('monri')).toBe('monri');
  });

  it('odbija nepoznat, prazan i null unos', () => {
    expect(parsePaymentProvider('bank')).toBeUndefined();
    expect(parsePaymentProvider('')).toBeUndefined();
    expect(parsePaymentProvider(null)).toBeUndefined();
  });

  it('readyProviders ima prednost nad online fallbackom', () => {
    expect(getReadyPaymentProviders(config({ readyProviders: ['paypal', 'monri'] })))
      .toEqual(['paypal', 'monri']);
    expect(getReadyPaymentProviders(config({
      readyProviders: [], salesModes: { online: false }, onlineReady: true,
    }))).toEqual([]);
  });

  it('online prodaja sa spremnim stripeom daje fallback', () => {
    expect(getReadyPaymentProviders(config({
      salesModes: { online: true }, onlineReady: true,
    }))).toEqual(['stripe']);
    expect(getReadyPaymentProviders(config({
      salesModes: { online: true }, onlineReady: false,
    }))).toEqual([]);
  });

  it('bez konfiguracije nema spremnih provajdera', () => {
    expect(getReadyPaymentProviders()).toEqual([]);
  });
});
