import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isPaymentSessionConfirmed, markPaymentSessionConfirmed, type PaymentSession } from './payment-session';

const session: PaymentSession = { kind: 'tickets', sessionId: 'fixture-1', userId: 'user-1', provider: 'stripe' };

describe('payment confirmation marker', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => { vi.restoreAllMocks(); sessionStorage.clear(); });

  it('odvaja sesije, tipove, korisnike i providere', () => {
    expect(isPaymentSessionConfirmed(session)).toBe(false);
    markPaymentSessionConfirmed(session);
    expect(isPaymentSessionConfirmed(session)).toBe(true);
    expect(isPaymentSessionConfirmed({ ...session, sessionId: 'fixture-2' })).toBe(false);
    expect(isPaymentSessionConfirmed({ ...session, kind: 'membership' })).toBe(false);
    expect(isPaymentSessionConfirmed({ ...session, userId: 'user-2' })).toBe(false);
    expect(isPaymentSessionConfirmed({ ...session, provider: 'paypal' })).toBe(false);
  });

  it('ne vjeruje starom markeru koji je mogao nastati pri neplaćenoj sesiji', () => {
    sessionStorage.setItem('fk_confirm_tickets:fixture-1', '1');
    expect(isPaymentSessionConfirmed(session)).toBe(false);
  });

  it('nedostupan storage ne prijavljuje potvrdu i ne ruši UI', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('storage disabled'); });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('storage disabled'); });
    expect(() => markPaymentSessionConfirmed(session)).not.toThrow();
    expect(isPaymentSessionConfirmed(session)).toBe(false);
  });
});
