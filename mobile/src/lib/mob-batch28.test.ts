import { describe, expect, it, vi } from 'vitest';
import { asArray, asRecord, asString } from '../lib/content-helpers';
import { resolveListStatus } from '../lib/screen-state';
import { getApiErrorMessage } from '../lib/api-error';
import { formatDateBs } from '../lib/format-date';
import { isAxiosError } from 'axios';

vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios');
  return { ...actual, isAxiosError: vi.fn((e: unknown) => !!(e as { isAxiosError?: boolean })?.isAxiosError) };
});

describe('mob-batch28 — P-MOB28 pure helpers', () => {
  it('asArray vraća niz ili prazno', () => {
    expect(asArray([1, 2, 3])).toEqual([1, 2, 3]);
    expect(asArray(null)).toEqual([]);
    expect(asArray(undefined)).toEqual([]);
    expect(asArray({})).toEqual([]);
    expect(asArray('string')).toEqual([]);
  });

  it('asRecord vraća objekat ili prazno', () => {
    expect(asRecord({ a: 1 })).toEqual({ a: 1 });
    expect(asRecord(null)).toEqual({});
    expect(asRecord(undefined)).toEqual({});
    expect(asRecord('x')).toEqual({});
    expect(asRecord(123)).toEqual({});
  });

  it('asString vraća string ili fallback', () => {
    expect(asString('hello')).toBe('hello');
    expect(asString('', 'fallback')).toBe('');
    expect(asString(null, 'fb')).toBe('fb');
    expect(asString(undefined, 'fb')).toBe('fb');
    expect(asString(123 as unknown as string, 'fb')).toBe('fb');
  });

  it('resolveListStatus loading/error/empty/idle', () => {
    expect(resolveListStatus({ loading: true, error: null, itemCount: 5 })).toBe('loading');
    expect(resolveListStatus({ loading: false, error: 'greška', itemCount: 0 })).toBe('error');
    expect(resolveListStatus({ loading: false, error: null, itemCount: 0 })).toBe('empty');
    expect(resolveListStatus({ loading: false, error: null, itemCount: 3 })).toBe('idle');
  });

  it('getApiErrorMessage axios string', () => {
    vi.mocked(isAxiosError).mockReturnValue(true);
    const err = { isAxiosError: true, response: { data: { message: 'API greška' } } } as unknown;
    expect(getApiErrorMessage(err, 'fallback')).toBe('API greška');
  });

  it('getApiErrorMessage axios array', () => {
    vi.mocked(isAxiosError).mockReturnValue(true);
    const err = { isAxiosError: true, response: { data: { message: ['a', 'b'] } } } as unknown;
    expect(getApiErrorMessage(err, 'fb')).toBe('a, b');
  });

  it('getApiErrorMessage axios bez message fallback na Error', () => {
    vi.mocked(isAxiosError).mockReturnValue(true);
    const err = Object.assign(new Error('network'), { isAxiosError: true, response: { data: {} } });
    expect(getApiErrorMessage(err, 'fb')).toBe('network');
  });

  it('getApiErrorMessage non-axios Error', () => {
    vi.mocked(isAxiosError).mockReturnValue(false);
    const err = new Error('oops');
    expect(getApiErrorMessage(err, 'fb')).toBe('oops');
  });

  it('getApiErrorMessage fallback', () => {
    vi.mocked(isAxiosError).mockReturnValue(false);
    expect(getApiErrorMessage(null, 'fallback')).toBe('fallback');
    expect(getApiErrorMessage(undefined, 'fb')).toBe('fb');
    expect(getApiErrorMessage({}, 'fb')).toBe('fb');
  });

  it('formatDateBs formatira datum', () => {
    const s = formatDateBs('2024-01-15T12:00:00Z');
    expect(typeof s).toBe('string');
    expect(s.length).toBeGreaterThan(0);
    expect(formatDateBs(null as unknown as string) ?? '').toBeDefined();
  });

  it('formatDateBs prazno', () => {
    expect(formatDateBs('')).toBe('—');
    expect(formatDateBs(undefined as unknown as string)).toBe('—');
  });
});
