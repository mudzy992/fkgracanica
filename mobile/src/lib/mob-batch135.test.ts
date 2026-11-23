import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(async () => null), setItemAsync: vi.fn(async () => {}), deleteItemAsync: vi.fn(async () => {}) }));
vi.mock('react-native', () => ({ Platform: { OS: 'ios' as const }, Linking: { openURL: vi.fn(async () => {}) } }));
vi.mock('./api', () => ({ api: { post: vi.fn(async () => {}) } }));

import * as SecureStore from 'expo-secure-store';
import { Linking, Platform } from 'react-native';
import { api } from './api';
import { asArray, asNumber, asRecord, asString } from './content-helpers';
import { mediaUrl } from './media';
import { hasAnyPermission, hasPermission, isStaffUser } from './permissions';
import { openMaps } from './open-maps';
import { trackMobileVisit } from './visitor';

describe('mob-batch135 — P-MOB48 content/media/permissions/visitor (test-only)', () => {
  beforeEach(() => { vi.clearAllMocks(); (Platform as any).OS = 'ios'; vi.unstubAllEnvs(); });

  it('asRecord returns object and {} for primitives', () => {
    expect(asRecord({ a: 1 })).toEqual({ a: 1 });
    expect(asRecord(null)).toEqual({});
    expect(asRecord('x')).toEqual({});
    expect(asRecord(42)).toEqual({});
  });
  it('asRecord handles array and undefined', () => {
    const arr = [1];
    expect(asRecord(arr)).toBe(arr);
    expect(asRecord(undefined)).toEqual({});
  });
  it('asString returns string or fallback', () => {
    expect(asString('hi')).toBe('hi');
    expect(asString('', 'fb')).toBe('');
    expect(asString(null as any, 'fallback')).toBe('fallback');
    expect(asString(undefined as any)).toBe('');
  });
  it('asNumber returns number or fallback', () => {
    expect(asNumber(0)).toBe(0);
    expect(asNumber(5)).toBe(5);
    expect(asNumber(null as any, 7)).toBe(7);
    expect(asNumber('5' as any, 9)).toBe(9);
  });
  it('asArray returns array only', () => {
    expect(asArray([1, 2])).toEqual([1, 2]);
    expect(asArray('nope' as any)).toEqual([]);
    expect(asArray(null as any)).toEqual([]);
  });
  it('mediaUrl null/empty/http passthrough', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl('')).toBeNull();
    expect(mediaUrl('http://cdn/x.jpg')).toBe('http://cdn/x.jpg');
    expect(mediaUrl('https://cdn/x.jpg')).toBe('https://cdn/x.jpg');
  });
  it('mediaUrl thumbs/medium conversion', () => {
    expect(mediaUrl('originals/foto.jpg', 'thumb')!).toContain('/uploads/files/thumbs/foto.webp');
    expect(mediaUrl('originals/photo.png', 'medium')!).toContain('/uploads/files/medium/photo.webp');
  });
  it('mediaUrl original keeps and non-originals untouched', () => {
    expect(mediaUrl('originals/photo.jpg', 'original')!).toContain('/uploads/files/originals/photo.jpg');
    expect(mediaUrl('static/other.jpg', 'thumb')!).toContain('/uploads/files/static/other.jpg');
  });
  it('mediaUrl strips prefixes', () => {
    expect(mediaUrl('./originals/a.jpg', 'thumb')!).toContain('/uploads/files/thumbs/a.webp');
    expect(mediaUrl('uploads/originals/b.jpg', 'medium')!).toContain('/uploads/files/medium/b.webp');
  });
  it('hasPermission and hasAnyPermission', () => {
    const u = { permissions: ['media.read', 'news.manage'] } as any;
    expect(hasPermission(u, 'media.read')).toBe(true);
    expect(hasPermission(u, 'missing')).toBe(false);
    expect(hasPermission(null, 'x')).toBe(false);
    expect(hasAnyPermission(u, ['a', 'news.manage'])).toBe(true);
    expect(hasAnyPermission(u, ['a'])).toBe(false);
    expect(hasAnyPermission(null, ['x'])).toBe(false);
  });
  it('isStaffUser distinguishes staff', () => {
    expect(isStaffUser({ permissions: ['live.manage'] } as any)).toBe(true);
    expect(isStaffUser({ permissions: ['dashboard.read'] } as any)).toBe(true);
    expect(isStaffUser({ permissions: ['custom.only'] } as any)).toBe(false);
    expect(isStaffUser(null)).toBe(false);
  });
  it('openMaps encodes and uses correct scheme', async () => {
    const open = vi.mocked(Linking.openURL);
    open.mockResolvedValueOnce(undefined);
    await openMaps('Kneza 12 Mostar');
    expect(open).toHaveBeenCalledWith('maps:0,0?q=Kneza%2012%20Mostar');
    vi.clearAllMocks();
    open.mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce(undefined);
    await openMaps('Sarajevo');
    expect(open).toHaveBeenCalledTimes(2);
    (Platform as any).OS = 'android';
    open.mockResolvedValueOnce(undefined);
    await openMaps('Tuzla');
    expect(open).toHaveBeenLastCalledWith('geo:0,0?q=Tuzla');
  });
  it('openMaps skips empty address', async () => {
    const open = vi.mocked(Linking.openURL);
    await openMaps('   ');
    await openMaps('');
    expect(open).not.toHaveBeenCalled();
  });
  it('trackMobileVisit generates hex id and posts', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(null);
    await trackMobileVisit();
    const id = vi.mocked(SecureStore.setItemAsync).mock.calls[0]?.[1] as string;
    expect(id).toMatch(/^[0-9a-f]{32}$/);
    expect(api.post).toHaveBeenCalledWith('/public-analytics/visit', expect.objectContaining({ platform: 'mobile' }));
  });
  it('trackMobileVisit reuses existing and swallows errors', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('a'.repeat(32));
    await trackMobileVisit();
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    vi.mocked(SecureStore.getItemAsync).mockRejectedValueOnce(new Error('fail'));
    await expect(trackMobileVisit()).resolves.toBeUndefined();
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('b'.repeat(32));
    vi.mocked(api.post).mockRejectedValueOnce(new Error('net'));
    await expect(trackMobileVisit()).resolves.toBeUndefined();
  });
});
