import { describe, it, expect } from 'vitest';
import { resolveClubVenue } from './club-venue';
import { slugify } from './slug';
import { parsePaymentProvider, getReadyPaymentProviders } from './payment-providers';

describe('fe06-batch69e club-venue+slug+payment-providers pokriva preostale || i ??', () => {
  it('resolveClubVenue pokriva sve || grane', () => {
    expect(resolveClubVenue(null)).toBe('');
    expect(resolveClubVenue(undefined)).toBe('');
    expect(resolveClubVenue({ stadium: '  Gradski  ', stadiumRel: null } as never)).toBe('Gradski');
    expect(resolveClubVenue({ stadiumRel: { name: '  Stadion G  ' } } as never)).toBe('Stadion G');
    expect(resolveClubVenue({ stadiumRel: { name: '  Rel  ' }, stadium: '  Stad  ' } as never)).toBe('Rel');
    expect(resolveClubVenue({ stadiumRel: { name: '   ' }, stadium: '   ' } as never)).toBe('');
    expect(resolveClubVenue({ stadiumRel: { name: '' }, stadium: '' } as never)).toBe('');
    expect(resolveClubVenue({} as never)).toBe('');
  });

  it('slugify pokriva normalize i replace grane', () => {
    expect(slugify('FK Gračanica Test 123')).toBe('fk-gracanica-test-123');
    expect(slugify('  --Hello--World--  ')).toBe('hello-world');
    expect(slugify('Čović Đuro')).toBe('covic-uro');
    expect(slugify('')).toBe('');
    expect(slugify('---')).toBe('');
  });

  it('parsePaymentProvider pokriva || i undefined', () => {
    expect(parsePaymentProvider('stripe')).toBe('stripe');
    expect(parsePaymentProvider('paypal')).toBe('paypal');
    expect(parsePaymentProvider('monri')).toBe('monri');
    expect(parsePaymentProvider('stripe ')).toBeUndefined();
    expect(parsePaymentProvider('')).toBeUndefined();
    expect(parsePaymentProvider(null)).toBeUndefined();
    expect(parsePaymentProvider('unknown')).toBeUndefined();
  });

  it('getReadyPaymentProviders pokriva sve grane [0,11]', () => {
    expect(getReadyPaymentProviders({ readyProviders: ['paypal', 'monri'] } as never)).toEqual(['paypal', 'monri']);
    expect(getReadyPaymentProviders({ readyProviders: [] } as never)).toEqual([]);
    expect(getReadyPaymentProviders({ salesModes: { online: true }, onlineReady: true } as never)).toEqual(['stripe']);
    expect(getReadyPaymentProviders({ salesModes: { online: true }, onlineReady: false } as never)).toEqual([]);
    expect(getReadyPaymentProviders({ salesModes: { online: false }, onlineReady: true } as never)).toEqual([]);
    expect(getReadyPaymentProviders({} as never)).toEqual([]);
    expect(getReadyPaymentProviders(undefined)).toEqual([]);
    expect(getReadyPaymentProviders({ readyProviders: ['stripe'], salesModes: { online: true }, onlineReady: true } as never)).toEqual(['stripe']);
  });
});
