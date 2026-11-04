import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isPaymentSessionConfirmed, markPaymentSessionConfirmed } from './payment-session';

describe('payment confirmation marker', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => { vi.restoreAllMocks(); sessionStorage.clear(); });

  it('odvaja sesije i tipove plaćanja i ne potvrđuje druge sesije', () => {
    expect(isPaymentSessionConfirmed('tickets', 'fixture-1')).toBe(false);
    markPaymentSessionConfirmed('tickets', 'fixture-1');
    expect(isPaymentSessionConfirmed('tickets', 'fixture-1')).toBe(true);
    expect(isPaymentSessionConfirmed('tickets', 'fixture-2')).toBe(false);
    expect(isPaymentSessionConfirmed('membership', 'fixture-1')).toBe(false);
    markPaymentSessionConfirmed('membership', 'fixture-1');
    expect(isPaymentSessionConfirmed('membership', 'fixture-1')).toBe(true);
    expect(isPaymentSessionConfirmed('season', 'fixture-1')).toBe(false);
  });

  it('nedostupan storage ne prijavljuje potvrdu i ne ruši UI', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('storage disabled'); });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('storage disabled'); });
    expect(() => markPaymentSessionConfirmed('tickets', 'fixture')).not.toThrow();
    expect(isPaymentSessionConfirmed('tickets', 'fixture')).toBe(false);
  });
});
