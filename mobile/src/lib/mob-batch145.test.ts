import { describe, expect, it } from 'vitest';
import { mediaUrl } from './media';
import { hasAnyPermission, hasPermission, isStaffUser } from './permissions';
import { webOrigin } from './web-origin';
import { newsArticleUrl } from './web-origin';
import { youtubeEmbedHtml, youtubeEmbedSrc } from './youtube-embed';
import { parseYouTubeId } from './youtube-id';

describe('mob-batch145 — P-MOB58 permissions/youtube/web/media (test-only)', () => {
  it('hasPermission and hasAnyPermission', () => {
    const user: any = { permissions: ['news.manage', 'media.read'] };
    expect(hasPermission(user, 'news.manage')).toBe(true);
    expect(hasPermission(user, 'users.read')).toBe(false);
    expect(hasPermission(null, 'news.manage')).toBe(false);
    expect(hasAnyPermission(user, ['users.read', 'media.read'])).toBe(true);
    expect(hasAnyPermission(user, ['users.read'])).toBe(false);
  });
  it('isStaffUser', () => {
    expect(isStaffUser({ permissions: ['news.manage'] } as any)).toBe(true);
    expect(isStaffUser({ permissions: ['random'] } as any)).toBe(false);
    expect(isStaffUser(null)).toBe(false);
    expect(isStaffUser({ permissions: [] } as any)).toBe(false);
  });
  it('hasPermission undefined', () => {
    expect(hasPermission(undefined, 'x')).toBe(false);
    expect(hasAnyPermission(undefined, ['x'])).toBe(false);
  });
  it('parseYouTubeId youtu.be', () => {
    expect(parseYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://youtu.be/dQw4w9WgXcQ?t=10')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://www.youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });
  it('parseYouTubeId youtube.com v param', () => {
    expect(parseYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://youtube.com/watch?v=abc123&list=1')).toBe('abc123');
    expect(parseYouTubeId('https://www.youtube.com/watch?x=1')).toBeNull();
  });
  it('parseYouTubeId embed live shorts', () => {
    expect(parseYouTubeId('https://www.youtube.com/embed/abc123')).toBe('abc123');
    expect(parseYouTubeId('https://www.youtube.com/live/xyz789')).toBe('xyz789');
    expect(parseYouTubeId('https://www.youtube.com/shorts/short1')).toBe('short1');
  });
  it('parseYouTubeId invalid', () => {
    expect(parseYouTubeId('not a url')).toBeNull();
    expect(parseYouTubeId('https://example.com/watch?v=123')).toBeNull();
    expect(parseYouTubeId('')).toBeNull();
  });
  it('youtubeEmbedSrc muted and origin', () => {
    const src = youtubeEmbedSrc('abc123', false);
    expect(src).toContain('https://www.youtube.com/embed/abc123');
    expect(src).toContain('mute=0');
    expect(src).toContain('origin=');
    expect(youtubeEmbedSrc('abc123', true)).toContain('mute=1');
  });
  it('youtubeEmbedSrc controls', () => {
    const src = youtubeEmbedSrc('vid');
    expect(src).toContain('autoplay=1');
    expect(src).toContain('controls=0');
    expect(src).toContain('rel=0');
  });
  it('youtubeEmbedHtml', () => {
    const html = youtubeEmbedHtml('vid1', false);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('youtube.com/embed/vid1');
    expect(html).toContain('location.replace');
  });
  it('webOrigin default and newsArticleUrl', () => {
    const origin = webOrigin();
    expect(origin).toMatch(/^https:\/\//);
    expect(newsArticleUrl('moja-vijest')).toBe(`${origin}/vijesti/moja-vijest`);
  });
  it('webOrigin env trim', () => {
    const prev = process.env.EXPO_PUBLIC_WEB_URL;
    process.env.EXPO_PUBLIC_WEB_URL = 'https://example.com/';
    expect(webOrigin()).toBe('https://example.com');
    process.env.EXPO_PUBLIC_WEB_URL = prev;
  });
  it('mediaUrl null http', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl('')).toBeNull();
    expect(mediaUrl('https://cdn.example.com/f.jpg')).toBe('https://cdn.example.com/f.jpg');
  });
  it('mediaUrl thumbs webp', () => {
    expect(mediaUrl('originals/photo.jpg', 'thumb')).toContain('thumbs/photo.webp');
    expect(mediaUrl('originals/photo.jpg', 'medium')).toContain('medium/photo.webp');
    expect(mediaUrl('originals/photo.jpg', 'original')).toContain('originals/photo.jpg');
  });
  it('mediaUrl uploads prefix', () => {
    expect(mediaUrl('uploads/originals/a.jpg', 'thumb')).toContain('thumbs/a.webp');
    expect(mediaUrl('uploads/files/originals/a.jpg', 'thumb')).toContain('files/originals/a.jpg');
    expect(mediaUrl('other/photo.png', 'thumb')).toContain('other/photo.png');
  });
});
