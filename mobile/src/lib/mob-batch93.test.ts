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

describe('mob-batch93 — P-MOB06 content/media/permissions/visitor (test-only)', () => {
  beforeEach(() => { vi.clearAllMocks(); (Platform as any).OS = 'ios'; vi.unstubAllEnvs(); });

  it('asRecord returns object or empty', () => {
    expect(asRecord({a:1})).toEqual({a:1});
    expect(asRecord(null)).toEqual({});
    expect(asRecord('str')).toEqual({});
  });
  it('asString with fallback', () => {
    expect(asString('hi')).toBe('hi');
    expect(asString(123,'fb')).toBe('fb');
    expect(asString(null,'fb')).toBe('fb');
  });
  it('asNumber with fallback', () => {
    expect(asNumber(5)).toBe(5);
    expect(asNumber('5',9)).toBe(9);
  });
  it('asArray filters non-array', () => {
    expect(asArray([1,2])).toEqual([1,2]);
    expect(asArray(null)).toEqual([]);
    expect(asArray({})).toEqual([]);
  });
  it('mediaUrl null for empty and passthrough http', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl('')).toBeNull();
    expect(mediaUrl('https://cdn.test/img.jpg')).toBe('https://cdn.test/img.jpg');
  });
  it('mediaUrl resolves originals to thumbs/medium webp', () => {
    // API_URL je evaluiran pri importu — očekujemo default base
    expect(mediaUrl('originals/photo.jpg','thumb')).toContain('/uploads/files/thumbs/photo.webp');
    expect(mediaUrl('originals/photo.jpg','medium')).toContain('/uploads/files/medium/photo.webp');
    expect(mediaUrl('originals/photo.jpg','original')).toContain('/uploads/files/originals/photo.jpg');
    expect(mediaUrl('originals/photo.jpg','thumb')).toContain('fkgracanica');
  });
  it('mediaUrl strips ./ and uploads/ prefix', () => {
    expect(mediaUrl('./uploads/originals/a.png','thumb')).toContain('/uploads/files/thumbs/a.webp');
  });
  it('mediaUrl non-original path unchanged variant', () => {
    expect(mediaUrl('other/file.jpg','thumb')).toContain('/uploads/files/other/file.jpg');
  });
  it('hasPermission and hasAnyPermission', () => {
    const user = { permissions:['users.read','news.manage'] } as any;
    expect(hasPermission(user,'users.read')).toBe(true);
    expect(hasPermission(user,'missing')).toBe(false);
    expect(hasPermission(null,'x')).toBe(false);
    expect(hasAnyPermission(user,['missing','news.manage'])).toBe(true);
    expect(hasAnyPermission(user,['a','b'])).toBe(false);
  });
  it('isStaffUser detects staff keys', () => {
    expect(isStaffUser({permissions:['dashboard.read']} as any)).toBe(true);
    expect(isStaffUser({permissions:['unknown']} as any)).toBe(false);
    expect(isStaffUser(null)).toBe(false);
  });
  it('openMaps iOS primary scheme and fallback', async () => {
    const open = vi.mocked(Linking.openURL);
    open.mockResolvedValueOnce(undefined);
    await openMaps('Kneza Domagoja 12');
    expect(open).toHaveBeenCalledWith('maps:0,0?q=Kneza%20Domagoja%2012');
    open.mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce(undefined);
    await openMaps('Mostar');
    expect(open).toHaveBeenCalledTimes(3);
  });
  it('openMaps Android uses geo scheme', async () => {
    (Platform as any).OS = 'android';
    const open = vi.mocked(Linking.openURL);
    open.mockResolvedValueOnce(undefined);
    await openMaps('Sarajevo');
    expect(open).toHaveBeenCalledWith('geo:0,0?q=Sarajevo');
  });
  it('openMaps empty address does nothing', async () => {
    const open = vi.mocked(Linking.openURL);
    await openMaps('   ');
    expect(open).not.toHaveBeenCalled();
  });
  it('trackMobileVisit creates id when missing and posts', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(null);
    await trackMobileVisit();
    expect(SecureStore.setItemAsync).toHaveBeenCalled();
    const id = vi.mocked(SecureStore.setItemAsync).mock.calls[0][1] as string;
    expect(id).toMatch(/^[0-9a-f]{32}$/);
    expect(api.post).toHaveBeenCalledWith('/public-analytics/visit', expect.objectContaining({ platform:'mobile', visitorId: id }));
  });
  it('trackMobileVisit reuses existing id and swallows error', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('existing123456789012345678901234');
    vi.mocked(api.post).mockRejectedValueOnce(new Error('network'));
    await expect(trackMobileVisit()).resolves.toBeUndefined();
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(api.post).toHaveBeenCalled();
  });
});
