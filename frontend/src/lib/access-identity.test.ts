import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getApiErrorMessage } from './api-error';
import { hasPermission } from './permissions';
import { hasStaffAccess } from './staff-access';
import { getOrCreateVisitorId, markVisitSent, wasVisitSentThisSession } from './visitor-identity';

describe('access helpers and API errors', () => {
  it('traži tačnu dozvolu i ne tretira prazan spisak kao pristup osoblja', () => {
    expect(hasPermission(undefined, 'users.read')).toBe(false);
    expect(hasPermission(['users.read'], 'users.read')).toBe(true);
    expect(hasPermission(['users.read'], 'users.manage')).toBe(false);
    expect(hasStaffAccess(undefined)).toBe(false);
    expect(hasStaffAccess([])).toBe(false);
    expect(hasStaffAccess(['dashboard.read'])).toBe(true);
  });

  it('uzima axios poruku ili niz grešaka, a zatim Error odnosno fallback', () => {
    expect(getApiErrorMessage({ isAxiosError: true, response: { data: { message: 'Zauzeto' } } }, 'fallback')).toBe('Zauzeto');
    expect(getApiErrorMessage({ isAxiosError: true, response: { data: { message: ['Prvo', 'Drugo'] } } }, 'fallback')).toBe('Prvo, Drugo');
    expect(getApiErrorMessage(new Error('offline'), 'fallback')).toBe('offline');
    expect(getApiErrorMessage(null, 'fallback')).toBe('fallback');
  });
});

describe('identitet web posjete', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
  afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); sessionStorage.clear(); });

  it('čuva nasumični identitet lokalno, dok je marker posjete vezan za sesiju', () => {
    const id = getOrCreateVisitorId();
    expect(id).toMatch(/^[0-9a-f]{32}$/);
    expect(getOrCreateVisitorId()).toBe(id);
    expect(wasVisitSentThisSession()).toBe(false);
    markVisitSent();
    expect(wasVisitSentThisSession()).toBe(true);
    sessionStorage.clear();
    expect(wasVisitSentThisSession()).toBe(false);
    expect(getOrCreateVisitorId()).toBe(id);
  });

  it('ne ruši aplikaciju kada je storage zabranjen', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('disabled'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('disabled'); });
    expect(getOrCreateVisitorId()).toMatch(/^[0-9a-f]{32}$/);
    expect(wasVisitSentThisSession()).toBe(false);
    expect(() => markVisitSent()).not.toThrow();
  });
});
