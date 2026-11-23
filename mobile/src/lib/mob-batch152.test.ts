import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './api-error';
import { asArray, asNumber, asRecord, asString } from './content-helpers';
import { mediaUrl } from './media';
import { hasPermission, hasAnyPermission, isStaffUser } from './permissions';
import { parseYouTubeId } from './youtube-id';

describe('mob-batch152 — P-MOB65 api/helpers/media/permission/youtube (test-only)', () => {
  it('getApiErrorMessage axios string', () => {
    const err: any = { isAxiosError: true, response: { data: { message: 'Greška' } } };
    expect(getApiErrorMessage(err, 'fb')).toBe('Greška');
  });
  it('getApiErrorMessage axios array', () => {
    const err: any = { isAxiosError: true, response: { data: { message: ['a', 'b'] } } };
    expect(getApiErrorMessage(err, 'fb')).toBe('a, b');
  });
  it('getApiErrorMessage fallback', () => {
    expect(getApiErrorMessage(new Error('boom'), 'fb')).toBe('boom');
    expect(getApiErrorMessage(null, 'fallback')).toBe('fallback');
    expect(getApiErrorMessage(new Error(''), 'fb')).toBe('fb');
    expect(getApiErrorMessage({ isAxiosError: true, response: { data: {} } } as any, 'fb')).toBe('fb');
  });
  it('asRecord', () => {
    expect(asRecord({ a: 1 })).toEqual({ a: 1 });
    expect(asRecord(null)).toEqual({});
    expect(asRecord(undefined)).toEqual({});
    expect(asRecord('str')).toEqual({});
  });
  it('asString asNumber', () => {
    expect(asString('hi')).toBe('hi');
    expect(asString(123, 'fb')).toBe('fb');
    expect(asString('', 'fb')).toBe('');
    expect(asNumber(5)).toBe(5);
    expect(asNumber('5', 7)).toBe(7);
    expect(asNumber(0)).toBe(0);
  });
  it('asArray', () => {
    expect(asArray([1, 2])).toEqual([1, 2]);
    expect(asArray(null)).toEqual([]);
    expect(asArray(undefined)).toEqual([]);
    expect(asArray('x')).toEqual([]);
  });
  it('mediaUrl null http', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl('')).toBeNull();
    expect(mediaUrl('https://cdn.example.com/a.jpg')).toBe('https://cdn.example.com/a.jpg');
    expect(mediaUrl('http://cdn.example.com/a.jpg')).toBe('http://cdn.example.com/a.jpg');
  });
  it('mediaUrl variants', () => {
    expect(mediaUrl('originals/p.jpg', 'thumb')).toContain('thumbs/p.webp');
    expect(mediaUrl('originals/p.jpg', 'medium')).toContain('medium/p.webp');
    expect(mediaUrl('originals/p.jpg', 'original')).toContain('originals/p.jpg');
    expect(mediaUrl('other/p.jpg', 'thumb')).toContain('other/p.jpg');
  });
  it('mediaUrl uploads', () => {
    expect(mediaUrl('uploads/originals/a.jpg', 'thumb')).toContain('thumbs/a.webp');
    expect(mediaUrl('./originals/a.jpg', 'thumb')).toContain('thumbs/a.webp');
    expect(mediaUrl('uploads/files/a.jpg', 'thumb')).toContain('files/a.jpg');
  });
  it('hasPermission', () => {
    const u: any = { permissions: ['news.manage', 'media.read'] };
    expect(hasPermission(u, 'news.manage')).toBe(true);
    expect(hasPermission(u, 'users.read')).toBe(false);
    expect(hasPermission(null, 'x')).toBe(false);
    expect(hasPermission(undefined, 'x')).toBe(false);
  });
  it('hasAnyPermission', () => {
    const u: any = { permissions: ['news.manage'] };
    expect(hasAnyPermission(u, ['news.manage', 'other'])).toBe(true);
    expect(hasAnyPermission(u, ['other'])).toBe(false);
    expect(hasAnyPermission(null, ['x'])).toBe(false);
  });
  it('isStaffUser', () => {
    expect(isStaffUser({ permissions: ['news.manage'] } as any)).toBe(true);
    expect(isStaffUser({ permissions: ['dashboard.read'] } as any)).toBe(true);
    expect(isStaffUser({ permissions: ['random'] } as any)).toBe(false);
    expect(isStaffUser(null)).toBe(false);
    expect(isStaffUser({ permissions: [] } as any)).toBe(false);
  });
  it('parseYouTubeId youtu.be', () => {
    expect(parseYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://www.youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });
  it('parseYouTubeId youtube.com', () => {
    expect(parseYouTubeId('https://www.youtube.com/watch?v=abc123')).toBe('abc123');
    expect(parseYouTubeId('https://www.youtube.com/embed/xyz')).toBe('xyz');
    expect(parseYouTubeId('https://www.youtube.com/live/liveId')).toBe('liveId');
    expect(parseYouTubeId('https://www.youtube.com/shorts/s1')).toBe('s1');
  });
  it('parseYouTubeId invalid', () => {
    expect(parseYouTubeId('not a url')).toBeNull();
    expect(parseYouTubeId('')).toBeNull();
    expect(parseYouTubeId('https://example.com/watch?v=123')).toBeNull();
    expect(parseYouTubeId('https://youtube.com/watch?x=1')).toBeNull();
  });
});
