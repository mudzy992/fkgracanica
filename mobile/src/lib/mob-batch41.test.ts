import { describe, expect, it, vi } from 'vitest';
import { asArray, asNumber, asRecord, asString } from './content-helpers';
import { slugify } from './slugify';
import { newsArticleUrl, webOrigin } from './web-origin';
import { resolveListStatus } from './screen-state';
import { getApiErrorMessage } from './api-error';
import { formatDateBs, formatDateTimeBs } from './format-date';
describe('mob-batch41 — P-MOB41 small helpers', () => {
  it('asRecord/asString/asNumber/asArray', () => {
    expect(asRecord({ a: 1 }).a).toBe(1); expect(asRecord(null)).toEqual({}); expect(asRecord('x')).toEqual({});
    expect(asString('hi')).toBe('hi'); expect(asString(123, 'fb')).toBe('fb');
    expect(asNumber(5)).toBe(5); expect(asNumber('x', 9)).toBe(9);
    expect(asArray([1, 2])).toEqual([1, 2]); expect(asArray(null)).toEqual([]);
  });
  it('slugify lower/normalize/dash trim', () => {
    expect(slugify('Hello World')).toBe('hello-world'); expect(slugify('Čć Đš Ž')).toBe('cc-s-z');
    expect(slugify('  a--b  ')).toBe('a-b'); expect(slugify('')).toBe('');
  });
  it('webOrigin env i default', () => {
    const orig = process.env.EXPO_PUBLIC_WEB_URL; process.env.EXPO_PUBLIC_WEB_URL = 'https://example.com/';
    expect(webOrigin()).toBe('https://example.com'); expect(newsArticleUrl('my-slug')).toBe('https://example.com/vijesti/my-slug');
    delete process.env.EXPO_PUBLIC_WEB_URL; expect(webOrigin()).toBe('https://fkgracanica.ba101.top');
    if (orig) process.env.EXPO_PUBLIC_WEB_URL = orig;
  });
  it('resolveListStatus loading/error/empty/idle', () => {
    expect(resolveListStatus({ loading: true, error: 'x', itemCount: 5 })).toBe('loading');
    expect(resolveListStatus({ loading: false, error: 'err', itemCount: 5 })).toBe('error');
    expect(resolveListStatus({ loading: false, error: null, itemCount: 0 })).toBe('empty');
    expect(resolveListStatus({ loading: false, error: null, itemCount: 3 })).toBe('idle');
  });
  it('getApiErrorMessage axios string', () => {
    const err = { isAxiosError: true, response: { data: { message: 'Greška' } } } as any;
    expect(getApiErrorMessage(err, 'fb')).toBe('Greška');
  });
  it('getApiErrorMessage axios array', () => {
    expect(getApiErrorMessage({ isAxiosError: true, response: { data: { message: ['a', 'b'] } } } as any, 'fb')).toBe('a, b');
  });
  it('getApiErrorMessage Error fallback', () => {
    expect(getApiErrorMessage(new Error('oops'), 'fb')).toBe('oops');
    expect(getApiErrorMessage({ message: 'x' }, 'fb')).toBe('fb');
    expect(getApiErrorMessage(null, 'fb')).toBe('fb');
  });
  it('formatDateBs null i datum', () => {
    expect(formatDateBs(null)).toBe('—'); expect(formatDateBs(undefined)).toBe('—');
    expect(formatDateBs('2026-01-05T00:00:00Z')).toMatch(/05\.01\.2026\./);
  });
  it('formatDateTimeBs', () => {
    expect(formatDateTimeBs(null)).toBe('—');
    const s = formatDateTimeBs('2026-12-31T15:04:00Z');
    expect(s).toContain('31.12.2026.'); expect(s).toMatch(/\d{2}:\d{2}/);
  });
  it('slugify više razmaka', () => { expect(slugify('a   b')).toBe('a-b'); });
  it('webOrigin bez env', () => {
    delete process.env.EXPO_PUBLIC_WEB_URL;
    expect(newsArticleUrl('x')).toBe('https://fkgracanica.ba101.top/vijesti/x');
  });
});
