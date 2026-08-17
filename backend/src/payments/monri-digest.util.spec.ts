import { createHash } from 'crypto';
import {
  hexEqual,
  monriCallbackDigest,
  monriFormDigest,
  monriFormUrl,
  monriOrderNumber,
  monriSuccessDigest,
  parseCallbackAuth,
  parseMonriRef,
  stripMonriDigest,
  toMinorUnits,
} from './monri-digest.util';

describe('monri-digest.util', () => {
  const key = '2345klj';

  it('form digest matches SHA512(key+order+amount+currency)', () => {
    const expected = createHash('sha512').update('2345kljabcdef54321EUR').digest('hex');
    expect(monriFormDigest(key, 'abcdef', '54321', 'EUR')).toBe(expected);
    expect(hexEqual(expected, expected)).toBe(true);
    expect(hexEqual(expected, 'aa')).toBe(false);
  });

  it('minor units and form url', () => {
    expect(toMinorUnits(10.24)).toBe('1024');
    expect(monriFormUrl('test')).toContain('ipgtest');
    expect(monriFormUrl('live')).toBe('https://ipg.monri.com/v2/form');
  });

  it('order number parse', () => {
    expect(parseMonriRef(monriOrderNumber('tickets', 'ord1'))).toEqual({ kind: 'tickets', id: 'ord1' });
    expect(parseMonriRef(monriOrderNumber('membership', 'mem1'))).toEqual({
      kind: 'membership',
      id: 'mem1',
    });
    expect(parseMonriRef(monriOrderNumber('season', 'pass1'))).toEqual({
      kind: 'season',
      id: 'pass1',
    });
  });

  it('success digest uses URL without digest', () => {
    const href =
      'https://x.test/ulaznice?paid=1&order_number=abc&response_code=0000&digest=deadbeef';
    const { url, digest } = stripMonriDigest(href);
    expect(digest).toBe('deadbeef');
    expect(url).not.toContain('digest=');
    const calc = monriSuccessDigest(key, url);
    expect(hexEqual(calc, monriSuccessDigest(key, url))).toBe(true);
  });

  it('callback auth header', () => {
    const body = '{"status":"approved"}';
    const digest = monriCallbackDigest(key, body);
    expect(parseCallbackAuth(`WP3-callback ${digest}`)).toBe(digest);
    expect(hexEqual(digest, monriCallbackDigest(key, body))).toBe(true);
  });

  it('rejects tampered callback body', () => {
    const body = '{"status":"approved"}';
    const digest = monriCallbackDigest(key, body);
    expect(hexEqual(digest, monriCallbackDigest(key, '{"status":"declined"}'))).toBe(false);
    expect(parseCallbackAuth(undefined)).toBe('');
  });
});
