import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(async () => null), setItemAsync: vi.fn(async () => {}), deleteItemAsync: vi.fn(async () => {}) }));
vi.mock('react-native', () => ({ Platform: { OS: 'ios' as const }, Linking: { openURL: vi.fn(async () => {}) } }));
vi.mock('./api', () => ({ api: { post: vi.fn(async () => {}) } }));

import * as SecureStore from 'expo-secure-store';
import { Platform, Linking } from 'react-native';
import { api } from './api';
import { asArray, asNumber, asRecord, asString } from './content-helpers';
import { mediaUrl } from './media';
import { hasAnyPermission, hasPermission, isStaffUser } from './permissions';
import { openMaps } from './open-maps';
import { trackMobileVisit } from './visitor';

describe('mob-batch122 — P-MOB35 content/media/permissions/visitor (test-only)', () => {
  beforeEach(() => { vi.clearAllMocks(); (Platform as any).OS = 'ios'; vi.unstubAllEnvs(); });

  it('asRecord returns object as-is and {} for others', () => {
    const obj = { a: 1 };
    expect(asRecord(obj)).toBe(obj);
    expect(asRecord(null)).toEqual({});
    expect(asRecord(undefined)).toEqual({});
    expect(asRecord(123)).toEqual({});
  });
  it('asRecord returns array reference for array and {} for string/symbol', () => {
    const arr = [1, 2];
    expect(asRecord(arr)).toBe(arr);
    expect(asRecord('hello')).toEqual({});
    expect(asRecord(Symbol('s'))).toEqual({});
  });
  it('asString returns string value and fallback for non-string', () => {
    expect(asString('hi')).toBe('hi');
    expect(asString('', 'fb')).toBe('');
    expect(asString(123 as any, 'fallback')).toBe('fallback');
    expect(asString(null as any, 'fb2')).toBe('fb2');
  });
  it('asString default fallback empty string', () => {
    expect(asString(undefined as any)).toBe('');
    expect(asString(null as any)).toBe('');
    expect(asString(false as any, '-')).toBe('-');
  });
  it('asNumber returns number including zero and falls back otherwise', () => {
    expect(asNumber(0)).toBe(0);
    expect(asNumber(42)).toBe(42);
    expect(asNumber(NaN as any)).toBeNaN();
    expect(asNumber(undefined as any, 9)).toBe(9);
    expect(asNumber('5' as any, 7)).toBe(7);
  });
  it('asArray returns typed array or empty', () => {
    expect(asArray([1, 2, 3])).toEqual([1, 2, 3]);
    expect(asArray<number>('x' as any)).toEqual([]);
    expect(asArray(null as any)).toEqual([]);
    expect(asArray(undefined as any)).toEqual([]);
  });
  it('mediaUrl null/empty returns null', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl(undefined)).toBeNull();
    expect(mediaUrl('')).toBeNull();
  });
  it('mediaUrl passes through http/https unchanged', () => {
    expect(mediaUrl('http://cdn/x.jpg')).toBe('http://cdn/x.jpg');
    expect(mediaUrl('https://cdn/x.jpg')).toBe('https://cdn/x.jpg');
  });
  it('mediaUrl originals thumb converts to webp thumbs folder', () => {
    const out = mediaUrl('originals/foto.jpg', 'thumb')!;
    expect(out).toContain('/uploads/files/thumbs/foto.webp');
    expect(out).not.toContain('originals');
  });
  it('mediaUrl originals medium converts and original keeps jpg', () => {
    expect(mediaUrl('originals/photo.png', 'medium')!).toContain('/uploads/files/medium/photo.webp');
    expect(mediaUrl('originals/photo.jpg', 'original')!).toContain('/uploads/files/originals/photo.jpg');
    expect(mediaUrl('originals/photo.jpg', 'original')!).not.toContain('.webp');
  });
  it('mediaUrl strips ./ and uploads/ and handles non-originals path', () => {
    expect(mediaUrl('./originals/a.jpg', 'thumb')!).toContain('/uploads/files/thumbs/a.webp');
    expect(mediaUrl('uploads/originals/b.png', 'medium')!).toContain('/uploads/files/medium/b.webp');
    expect(mediaUrl('static/other.jpg', 'thumb')!).toContain('/uploads/files/static/other.jpg');
  });
  it('hasPermission and hasAnyPermission edge cases', () => {
    const u = { permissions: ['gallery.manage', 'media.read'] } as any;
    expect(hasPermission(u, 'gallery.manage')).toBe(true);
    expect(hasPermission(u, 'missing')).toBe(false);
    expect(hasPermission(null, 'gallery.manage')).toBe(false);
    expect(hasAnyPermission(u, [])).toBe(false);
    expect(hasAnyPermission(u, ['a', 'media.read'])).toBe(true);
    expect(hasAnyPermission(null, ['x'])).toBe(false);
  });
  it('isStaffUser distinguishes staff from plain user', () => {
    expect(isStaffUser({ permissions: ['settings.read'] } as any)).toBe(true);
    expect(isStaffUser({ permissions: ['dashboard.read'] } as any)).toBe(true);
    expect(isStaffUser({ permissions: ['media.upload'] } as any)).toBe(true);
    expect(isStaffUser({ permissions: ['custom.only'] } as any)).toBe(false);
    expect(isStaffUser(null)).toBe(false);
    expect(isStaffUser({ permissions: [] } as any)).toBe(false);
  });
  it('openMaps encodes address and uses maps: on iOS, geo: on android, skips empty', async () => {
    const open = vi.mocked(Linking.openURL);
    open.mockResolvedValueOnce(undefined);
    await openMaps(' Kneza 12 Mostar ');
    expect(open).toHaveBeenCalledWith('maps:0,0?q=Kneza%2012%20Mostar');
    vi.clearAllMocks();
    open.mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce(undefined);
    await openMaps('Sarajevo');
    expect(open).toHaveBeenCalledTimes(2);
    expect(open.mock.calls[1][0]).toContain('https://maps.apple.com/');
    (Platform as any).OS = 'android';
    open.mockResolvedValueOnce(undefined);
    await openMaps('Tuzla');
    expect(open).toHaveBeenLastCalledWith('geo:0,0?q=Tuzla');
    vi.clearAllMocks();
    await openMaps('   ');
    await openMaps('');
    expect(open).not.toHaveBeenCalled();
  });
  it('trackMobileVisit generates hex id, reuses existing, swallows failures', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(null);
    await trackMobileVisit();
    const id = vi.mocked(SecureStore.setItemAsync).mock.calls[0]?.[1] as string;
    expect(id).toMatch(/^[0-9a-f]{32}$/);
    expect(api.post).toHaveBeenCalledWith('/public-analytics/visit', expect.objectContaining({ platform: 'mobile', visitorId: id }));
    vi.clearAllMocks();
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('a'.repeat(32));
    await trackMobileVisit();
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(api.post).toHaveBeenCalledWith('/public-analytics/visit', expect.objectContaining({ visitorId: 'a'.repeat(32) }));
    vi.mocked(SecureStore.getItemAsync).mockRejectedValueOnce(new Error('store fail'));
    await expect(trackMobileVisit()).resolves.toBeUndefined();
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('b'.repeat(32));
    vi.mocked(api.post).mockRejectedValueOnce(new Error('net'));
    await expect(trackMobileVisit()).resolves.toBeUndefined();
  });
});
