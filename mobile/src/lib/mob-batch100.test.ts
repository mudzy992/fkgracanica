import { describe, expect, it, vi } from 'vitest';
import { slugify } from './slugify';
import { formatDateBs, formatDateTimeBs } from './format-date';
import { parseYouTubeId } from './youtube-id';
import { webOrigin, newsArticleUrl } from './web-origin';
import { stripHtml } from './html-text';

describe('mob-batch100 — P-MOB13 helpers comprehensive (test-only)', () => {
  it('slugify handles diacritics and spaces', () => {
    expect(slugify('FK Gračanica')).toBe('fk-gracanica');
    expect(slugify('  ČĆŽŠ  ')).toBe('cczs');
    expect(slugify('Hello---World')).toBe('hello-world');
    expect(slugify('')).toBe('');
  });
  it('slugify lowercases and trims', () => {
    expect(slugify('TEST')).toBe('test');
    expect(slugify(' a b ')).toBe('a-b');
  });
  it('formatDateBs null and valid', () => {
    expect(formatDateBs(null)).toBe('—');
    expect(formatDateBs('')).toBe('—');
    const iso = '2026-01-15T10:00:00.000Z';
    const d = new Date(iso);
    const exp = `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}.`;
    expect(formatDateBs(iso)).toBe(exp);
  });
  it('formatDateTimeBs contains time', () => {
    expect(formatDateTimeBs('2026-01-15T10:05:00.000Z')).toMatch(/\d{2}:\d{2}/);
    expect(formatDateTimeBs(null)).toBe('—');
  });
  it('parseYouTubeId youtu.be', () => {
    expect(parseYouTubeId('https://youtu.be/abc123XYZ12')).toBe('abc123XYZ12');
  });
  it('parseYouTubeId watch', () => {
    expect(parseYouTubeId('https://www.youtube.com/watch?v=abc123XYZ12')).toBe('abc123XYZ12');
  });
  it('parseYouTubeId embed', () => {
    expect(parseYouTubeId('https://www.youtube.com/embed/abc123XYZ12')).toBe('abc123XYZ12');
  });
  it('parseYouTubeId invalid', () => {
    expect(parseYouTubeId('https://example.com')).toBeNull();
    expect(parseYouTubeId('not-url')).toBeNull();
  });
  it('webOrigin default', () => {
    delete process.env.EXPO_PUBLIC_WEB_URL;
    expect(webOrigin()).toBe('https://fkgracanica.ba101.top');
  });
  it('webOrigin env trim', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL','https://example.com/');
    expect(webOrigin()).toBe('https://example.com');
    vi.unstubAllEnvs();
  });
  it('newsArticleUrl', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL','https://example.com');
    expect(newsArticleUrl('slug')).toBe('https://example.com/vijesti/slug');
    vi.unstubAllEnvs();
  });
  it('stripHtml basic', () => {
    expect(stripHtml('<b>bold</b>')).toBe('bold');
    expect(stripHtml('a<br>b')).toBe('a\nb');
  });
  it('stripHtml entities', () => {
    expect(stripHtml('a &amp; b')).toBe('a & b');
    expect(stripHtml('&lt;')).toBe('<');
  });
  it('stripHtml empty', () => {
    expect(stripHtml('')).toBe('');
    expect(stripHtml('<p></p>')).toBe('');
  });
  it('parseYouTubeId shorts and live', () => {
    expect(parseYouTubeId('https://www.youtube.com/shorts/abc123XYZ12')).toBe('abc123XYZ12');
    expect(parseYouTubeId('https://www.youtube.com/live/abc123XYZ12')).toBe('abc123XYZ12');
  });
});
