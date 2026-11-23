import { describe, expect, it } from 'vitest';
import { KPI_LABELS, kpiLabel } from './dashboard-kpi-labels';
import { mediaUrl } from './media';
import { hasPermission, isStaffUser } from './permissions';
import { webOrigin, newsArticleUrl } from './web-origin';
import { youtubeEmbedHtml, youtubeEmbedSrc } from './youtube-embed';
import { parseYouTubeId } from './youtube-id';

describe('mob-batch151 — P-MOB64 kpi/media/permission/youtube/web (test-only)', () => {
  it('kpiLabel', () => {
    expect(kpiLabel('users')).toBe('Korisnici');
    expect(kpiLabel('pendingNews')).toBe('Vijesti na odobrenju');
    expect(kpiLabel('unknown')).toBe('unknown');
    expect(KPI_LABELS.ticketsSold).toBe('Prodane ulaznice');
  });
  it('kpiLabel total', () => {
    expect(KPI_LABELS.uniqueVisitorsTotal30d).toBe('Ukupni posjetioci (30d)');
    expect(Object.keys(KPI_LABELS).length).toBeGreaterThan(10);
  });
  it('mediaUrl null http', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl('')).toBeNull();
    expect(mediaUrl('https://cdn.example.com/f.jpg')).toBe('https://cdn.example.com/f.jpg');
  });
  it('mediaUrl thumb medium original', () => {
    expect(mediaUrl('originals/p.jpg', 'thumb')).toContain('thumbs/p.webp');
    expect(mediaUrl('originals/p.jpg', 'medium')).toContain('medium/p.webp');
    expect(mediaUrl('originals/p.jpg', 'original')).toContain('originals/p.jpg');
    expect(mediaUrl('other/p.jpg', 'thumb')).toContain('other/p.jpg');
  });
  it('mediaUrl uploads', () => {
    expect(mediaUrl('uploads/originals/a.jpg', 'thumb')).toContain('thumbs/a.webp');
    expect(mediaUrl('./originals/a.jpg', 'thumb')).toContain('thumbs/a.webp');
  });
  it('hasPermission', () => {
    const u: any = { permissions: ['news.manage', 'media.read'] };
    expect(hasPermission(u, 'news.manage')).toBe(true);
    expect(hasPermission(u, 'users.read')).toBe(false);
    expect(hasPermission(null, 'x')).toBe(false);
    expect(hasPermission(undefined, 'x')).toBe(false);
  });
  it('isStaffUser', () => {
    expect(isStaffUser({ permissions: ['news.manage'] } as any)).toBe(true);
    expect(isStaffUser({ permissions: ['random'] } as any)).toBe(false);
    expect(isStaffUser(null)).toBe(false);
    expect(isStaffUser({ permissions: [] } as any)).toBe(false);
  });
  it('parseYouTubeId youtu.be', () => {
    expect(parseYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://youtu.be/dQw4w9WgXcQ?t=10')).toBe('dQw4w9WgXcQ');
  });
  it('parseYouTubeId watch v', () => {
    expect(parseYouTubeId('https://www.youtube.com/watch?v=abc123')).toBe('abc123');
    expect(parseYouTubeId('https://youtube.com/watch?v=xyz&list=1')).toBe('xyz');
    expect(parseYouTubeId('https://www.youtube.com/watch?x=1')).toBeNull();
  });
  it('parseYouTubeId embed live shorts invalid', () => {
    expect(parseYouTubeId('https://www.youtube.com/embed/abc123')).toBe('abc123');
    expect(parseYouTubeId('https://www.youtube.com/live/xyz789')).toBe('xyz789');
    expect(parseYouTubeId('https://www.youtube.com/shorts/short1')).toBe('short1');
    expect(parseYouTubeId('not a url')).toBeNull();
    expect(parseYouTubeId('https://example.com/watch?v=123')).toBeNull();
  });
  it('youtubeEmbedSrc', () => {
    const src = youtubeEmbedSrc('abc', false);
    expect(src).toContain('https://www.youtube.com/embed/abc');
    expect(src).toContain('mute=0');
    expect(youtubeEmbedSrc('abc', true)).toContain('mute=1');
    expect(src).toContain('autoplay=1');
  });
  it('youtubeEmbedHtml', () => {
    const html = youtubeEmbedHtml('vid', false);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('youtube.com/embed/vid');
    expect(html).toContain('location.replace');
  });
  it('webOrigin default', () => {
    const origin = webOrigin();
    expect(origin).toMatch(/^https:\/\//);
    expect(newsArticleUrl('moja')).toBe(`${origin}/vijesti/moja`);
  });
  it('webOrigin env trim', () => {
    const prev = process.env.EXPO_PUBLIC_WEB_URL;
    process.env.EXPO_PUBLIC_WEB_URL = 'https://example.com/';
    expect(webOrigin()).toBe('https://example.com');
    process.env.EXPO_PUBLIC_WEB_URL = prev;
  });
  it('newsArticleUrl with slug', () => {
    const o = webOrigin();
    expect(newsArticleUrl('a-b-c')).toBe(`${o}/vijesti/a-b-c`);
  });
});
