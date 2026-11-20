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

describe('mob-batch103 — P-MOB16 content/media/permissions/visitor (test-only)', () => {
  beforeEach(() => { vi.clearAllMocks(); (Platform as any).OS = 'ios'; vi.unstubAllEnvs(); });

  it('asRecord handles plain object vs primitives', () => {
    expect(asRecord({ x: 1, y: 2 })).toEqual({ x: 1, y: 2 });
    expect(asRecord(undefined)).toEqual({});
    expect(asRecord(42)).toEqual({});
    expect(asRecord([])).toEqual([]);
  });
  it('asString returns string or fallback variants', () => {
    expect(asString('hello')).toBe('hello');
    expect(asString('', 'fb')).toBe('');
    expect(asString(null)).toBe('');
    expect(asString(undefined, 'fallback')).toBe('fallback');
  });
  it('asNumber returns number or fallback', () => {
    expect(asNumber(0)).toBe(0);
    expect(asNumber(123)).toBe(123);
    expect(asNumber(null, 7)).toBe(7);
    expect(asNumber(undefined)).toBe(0);
  });
  it('asArray returns array only', () => {
    expect(asArray([1, 2, 3])).toEqual([1, 2, 3]);
    expect(asArray('nope')).toEqual([]);
    expect(asArray(null)).toEqual([]);
    expect(asArray(undefined)).toEqual([]);
  });
  it('mediaUrl returns null for falsy and passes http through', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl(undefined)).toBeNull();
    expect(mediaUrl('http://example.com/a.jpg')).toBe('http://example.com/a.jpg');
    expect(mediaUrl('https://cdn.example/a.png')).toBe('https://cdn.example/a.png');
  });
  it('mediaUrl converts originals to thumbs webp', () => {
    expect(mediaUrl('originals/gallery/img.jpg', 'thumb')).toContain('/uploads/files/thumbs/gallery/img.webp');
    expect(mediaUrl('originals/gallery/img.jpeg', 'thumb')).toContain('.webp');
  });
  it('mediaUrl converts originals to medium webp', () => {
    expect(mediaUrl('originals/photo.png', 'medium')).toContain('/uploads/files/medium/photo.webp');
  });
  it('mediaUrl keeps original variant as-is', () => {
    expect(mediaUrl('originals/photo.jpg', 'original')).toContain('/uploads/files/originals/photo.jpg');
    expect(mediaUrl('originals/photo.jpg', 'original')).not.toContain('.webp');
  });
  it('mediaUrl strips ./ and uploads/ prefix and handles non-originals', () => {
    expect(mediaUrl('./originals/b.jpg', 'thumb')).toContain('/uploads/files/thumbs/b.webp');
    expect(mediaUrl('uploads/originals/c.jpg', 'medium')).toContain('/uploads/files/medium/c.webp');
    expect(mediaUrl('static/other.jpg', 'thumb')).toContain('/uploads/files/static/other.jpg');
  });
  it('hasPermission checks inclusion and null user', () => {
    const u = { permissions: ['media.read', 'media.upload'] } as any;
    expect(hasPermission(u, 'media.read')).toBe(true);
    expect(hasPermission(u, 'media.manage')).toBe(false);
    expect(hasPermission(null, 'media.read')).toBe(false);
    expect(hasPermission(undefined, 'x')).toBe(false);
  });
  it('hasAnyPermission matches any key', () => {
    const u = { permissions: ['news.manage'] } as any;
    expect(hasAnyPermission(u, ['news.manage', 'other'])).toBe(true);
    expect(hasAnyPermission(u, ['a', 'b'])).toBe(false);
    expect(hasAnyPermission(null, ['news.manage'])).toBe(false);
  });
  it('isStaffUser distinguishes staff vs non-staff', () => {
    expect(isStaffUser({ permissions: ['live.manage'] } as any)).toBe(true);
    expect(isStaffUser({ permissions: ['media.read'] } as any)).toBe(true);
    expect(isStaffUser({ permissions: ['custom.only'] } as any)).toBe(false);
    expect(isStaffUser(null)).toBe(false);
  });
  it('openMaps iOS encodes and opens maps scheme', async () => {
    const open = vi.mocked(Linking.openURL);
    open.mockResolvedValueOnce(undefined);
    await openMaps('Titova  12  Mostar');
    expect(open).toHaveBeenCalledWith('maps:0,0?q=Titova%2012%20Mostar');
  });
  it('openMaps fallback on reject and Android geo', async () => {
    const open = vi.mocked(Linking.openURL);
    open.mockRejectedValueOnce(new Error('fail')).mockResolvedValueOnce(undefined);
    await openMaps('Sarajevo');
    expect(open).toHaveBeenCalledTimes(2);
    (Platform as any).OS = 'android';
    open.mockResolvedValueOnce(undefined);
    await openMaps('Banja Luka');
    expect(open).toHaveBeenLastCalledWith('geo:0,0?q=Banja%20Luka');
  });
  it('trackMobileVisit generates hex id and reuses existing', async () => {
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(null);
    await trackMobileVisit();
    const saved = vi.mocked(SecureStore.setItemAsync).mock.calls[0][1] as string;
    expect(saved).toMatch(/^[0-9a-f]{32}$/);
    expect(api.post).toHaveBeenCalledWith('/public-analytics/visit', expect.objectContaining({ platform: 'mobile' }));
    vi.mocked(SecureStore.getItemAsync).mockResolvedValueOnce('abcd'.repeat(8));
    vi.mocked(api.post).mockResolvedValueOnce(undefined);
    await trackMobileVisit();
    expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
  });
});
