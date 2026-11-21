import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(async () => null), setItemAsync: vi.fn(async () => {}), deleteItemAsync: vi.fn(async () => {}) }));
vi.mock('react-native', () => ({ Platform: { OS: 'ios' as const }, Linking: { openURL: vi.fn(async () => {}) } }));
vi.mock('./api', () => ({ api: { post: vi.fn(async () => {}) } }));

import * as SecureStore from 'expo-secure-store';
import { Platform, Linking } from 'react-native';
import { api } from './api';
import { asRecord, asString, asNumber, asArray } from './content-helpers';
import { mediaUrl } from './media';
import { hasPermission, hasAnyPermission, isStaffUser } from './permissions';
import { openMaps } from './open-maps';
import { trackMobileVisit } from './visitor';

describe('mob-batch112 — P-MOB25 content/media/permissions/visitor (test-only)', () => {
  beforeEach(() => { vi.clearAllMocks(); (Platform as any).OS = 'ios'; vi.unstubAllEnvs(); });

  it('asRecord returns record or empty', () => {
    expect(asRecord({ a: 1 })).toEqual({ a: 1 });
    expect(asRecord(null)).toEqual({});
    expect(asRecord('x')).toEqual({});
    expect(asRecord(undefined)).toEqual({});
  });
  it('asString with fallback ignores non-string', () => {
    expect(asString('hi')).toBe('hi');
    expect(asString(123, 'fb')).toBe('fb');
    expect(asString(null, 'fb')).toBe('fb');
    expect(asString('', 'fb')).toBe('');
  });
  it('asNumber with fallback', () => {
    expect(asNumber(5)).toBe(5);
    expect(asNumber(0)).toBe(0);
    expect(asNumber('5', 9)).toBe(9);
    expect(asNumber(undefined, 3)).toBe(3);
  });
  it('asArray returns array or empty', () => {
    expect(asArray([1, 2])).toEqual([1, 2]);
    expect(asArray('str')).toEqual([]);
    expect(asArray(null)).toEqual([]);
    expect(asArray({})).toEqual([]);
  });
  it('mediaUrl null and http passthrough', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl('')).toBeNull();
    expect(mediaUrl('http://cdn/x.jpg')).toBe('http://cdn/x.jpg');
    expect(mediaUrl('https://cdn/y.png')).toBe('https://cdn/y.png');
  });
  it('mediaUrl thumbs and medium webp', () => {
    expect(mediaUrl('originals/a.jpg', 'thumb')).toContain('/uploads/files/thumbs/a.webp');
    expect(mediaUrl('originals/b.png', 'medium')).toContain('/uploads/files/medium/b.webp');
    expect(mediaUrl('originals/c.jpg', 'original')).toContain('/uploads/files/originals/c.jpg');
  });
  it('mediaUrl strips prefixes and non-originals unchanged', () => {
    expect(mediaUrl('./uploads/originals/d.jpg', 'thumb')).toContain('/uploads/files/thumbs/d.webp');
    expect(mediaUrl('uploads/originals/e.jpg', 'thumb')).toContain('/uploads/files/thumbs/e.webp');
    expect(mediaUrl('static/file.jpg', 'thumb')).toContain('/uploads/files/static/file.jpg');
  });
  it('hasPermission and hasAnyPermission', () => {
    const u = { permissions: ['users.read', 'news.manage'] } as any;
    expect(hasPermission(u, 'users.read')).toBe(true);
    expect(hasPermission(u, 'missing')).toBe(false);
    expect(hasPermission(null, 'x')).toBe(false);
    expect(hasAnyPermission(u, ['missing', 'news.manage'])).toBe(true);
    expect(hasAnyPermission(u, ['a', 'b'])).toBe(false);
    expect(hasAnyPermission(null, ['x'])).toBe(false);
  });
  it('isStaffUser detects staff', () => {
    expect(isStaffUser({ permissions: ['dashboard.read'] } as any)).toBe(true);
    expect(isStaffUser({ permissions: ['media.upload'] } as any)).toBe(true);
    expect(isStaffUser({ permissions: ['unknown'] } as any)).toBe(false);
    expect(isStaffUser(null)).toBe(false);
  });
  it('openMaps iOS primary', async () => {
    const open = vi.mocked(Linking.openURL);
    open.mockResolvedValueOnce(undefined);
    await openMaps('Kneza Domagoja 12');
    expect(open).toHaveBeenCalledWith('maps:0,0?q=Kneza%20Domagoja%2012');
  });
  it('openMaps fallback and Android geo', async () => {
    const open = vi.mocked(Linking.openURL);
    open.mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce(undefined);
    await openMaps('Mostar');
    expect(open).toHaveBeenCalledTimes(2);
    (Platform as any).OS = 'android';
    open.mockResolvedValueOnce(undefined);
    await openMaps('Sarajevo');
    expect(open).toHaveBeenLastCalledWith('geo:0,0?q=Sarajevo');
  });
  it('openMaps empty does nothing', async () => {
    const open = vi.mocked(Linking.openURL);
    await openMaps('   ');
    expect(open).not.toHaveBeenCalled();
    await openMaps('');
    expect(open).not.toHaveBeenCalled();
  });
  it('trackMobileVisit creates and reuses id', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(null);
    await trackMobileVisit();
    const id = vi.mocked(SecureStore.setItemAsync).mock.calls[0][1] as string;
    expect(id).toMatch(/^[0-9a-f]{32}$/);
    expect(api.post).toHaveBeenCalledWith('/public-analytics/visit', expect.objectContaining({ platform: 'mobile', visitorId: id }));
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('abcd'.repeat(8));
    await trackMobileVisit();
    expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
  });
  it('trackMobileVisit swallows post error', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('existing'.padEnd(32, 'a'));
    vi.mocked(api.post).mockRejectedValueOnce(new Error('net'));
    await expect(trackMobileVisit()).resolves.toBeUndefined();
  });
  it('openMaps trims and encodes spaces', async () => {
    const open = vi.mocked(Linking.openURL);
    open.mockResolvedValueOnce(undefined);
    await openMaps('  Titova   12  ');
    expect(open).toHaveBeenCalledWith('maps:0,0?q=Titova%2012');
  });
});
