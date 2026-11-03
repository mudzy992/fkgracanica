import { BadRequestException } from '@nestjs/common';
import {
  parsePageNumber,
  parseProviderId,
  requireHttpUrl,
  requireId,
} from './checkout-validate.util';

describe('checkout-validate.util (BE-07 / P-B07-4)', () => {
  it('accepts known providers only', () => {
    expect(parseProviderId('stripe')).toBe('stripe');
    expect(parseProviderId(' PayPal ')).toBe('paypal');
    expect(parseProviderId('monri')).toBe('monri');
    expect(parseProviderId(undefined)).toBeUndefined();
    expect(parseProviderId('')).toBeUndefined();
  });

  it('rejects unknown provider with 400 (was 500 TypeError)', () => {
    expect(() => parseProviderId('bitcoin')).toThrow(BadRequestException);
  });

  it('requires non-empty ids', () => {
    expect(requireId(' abc ', 'Nedostaje')).toBe('abc');
    expect(() => requireId('', 'Nedostaje')).toThrow(BadRequestException);
    expect(() => requireId(undefined, 'Nedostaje')).toThrow(
      BadRequestException,
    );
  });

  it('accepts http(s) urls only', () => {
    expect(requireHttpUrl('https://fkgracanica.ba/ulaznice', 'URL')).toBe(
      'https://fkgracanica.ba/ulaznice',
    );
    expect(() => requireHttpUrl('javascript:alert(1)', 'URL')).toThrow(
      BadRequestException,
    );
    expect(() => requireHttpUrl('nije-url', 'URL')).toThrow(
      BadRequestException,
    );
  });

  it('keeps pagination sane', () => {
    expect(parsePageNumber('3', 1)).toBe(3);
    expect(parsePageNumber('abc', 1)).toBe(1);
    expect(parsePageNumber('-5', 7)).toBe(7);
    expect(parsePageNumber(undefined, 20)).toBe(20);
  });
});
