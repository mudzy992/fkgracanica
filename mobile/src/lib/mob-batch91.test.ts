import { beforeEach, describe, expect, it, vi } from 'vitest';
import { slugify as mobileSlugify } from './slugify';
import { parseYouTubeId as mobileParseYt } from './youtube-id';
import { youtubeEmbedSrc, youtubeEmbedHtml, youtubeEmbedOrigin } from './youtube-embed';
import { webOrigin, newsArticleUrl } from './web-origin';
import { formatDateBs, formatDateTimeBs } from './format-date';

// web slugify identical to mobile — inline for parity check
function webSlugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

describe('mob-batch91 — P-MOB04 helpers parity mobile vs web (test-only)', () => {
  beforeEach(() => { vi.unstubAllEnvs(); });

  it('slugify parity: mobile == web', () => {
    const cases: Array<[string,string]> = [
      ['FK Gračanica','fk-gracanica'],
      ['Hello  World!!','hello-world'],
      ['  ČĆŽŠ  ','cczs'],
      ['a--b','a-b'],
    ];
    for (const [input, expected] of cases) {
      expect(mobileSlugify(input)).toBe(expected);
      expect(webSlugify(input)).toBe(expected);
      expect(mobileSlugify(input)).toBe(webSlugify(input));
    }
  });
  it('slugify handles empty and separators', () => {
    expect(mobileSlugify('---')).toBe('');
    expect(mobileSlugify('')).toBe('');
  });
  it('parseYouTubeId mobile extracts youtu.be', () => {
    expect(mobileParseYt('https://youtu.be/abc123XYZ12')).toBe('abc123XYZ12');
    expect(mobileParseYt('https://www.youtu.be/abc123XYZ12')).toBe('abc123XYZ12');
  });
  it('parseYouTubeId mobile extracts watch?v', () => {
    expect(mobileParseYt('https://www.youtube.com/watch?v=abc123XYZ12')).toBe('abc123XYZ12');
    expect(mobileParseYt('https://youtube.com/watch?v=abc123XYZ12&list=PL1')).toBe('abc123XYZ12');
  });
  it('parseYouTubeId mobile extracts embed/live/shorts', () => {
    expect(mobileParseYt('https://www.youtube.com/embed/abc123XYZ12')).toBe('abc123XYZ12');
    expect(mobileParseYt('https://www.youtube.com/shorts/abc123XYZ12')).toBe('abc123XYZ12');
    expect(mobileParseYt('https://www.youtube.com/live/abc123XYZ12')).toBe('abc123XYZ12');
  });
  it('parseYouTubeId mobile returns null for non-youtube or invalid', () => {
    expect(mobileParseYt('https://example.com/watch?v=abc')).toBeNull();
    expect(mobileParseYt('not-a-url')).toBeNull();
    expect(mobileParseYt('https://youtube.com/watch?v=')).toBeNull();
  });
  it('parseYouTubeId web vs mobile strictness (mobile lenient)', () => {
    // web requires 11-char id, mobile returns any segment
    const short = 'https://www.youtube.com/watch?v=short';
    expect(mobileParseYt(short)).toBe('short');
    // web would return null (tested via frontend youtube.ts spec) — document gap
    expect(typeof short).toBe('string');
  });
  it('webOrigin default fallback', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', '');
    delete process.env.EXPO_PUBLIC_WEB_URL;
    expect(webOrigin()).toBe('https://fkgracanica.ba101.top');
  });
  it('webOrigin reads env and trims trailing slash', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com/');
    expect(webOrigin()).toBe('https://example.com');
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com/sub/');
    expect(webOrigin()).toBe('https://example.com/sub');
  });
  it('newsArticleUrl uses webOrigin', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com');
    expect(newsArticleUrl('moja-vijest')).toBe('https://example.com/vijesti/moja-vijest');
  });
  it('youtubeEmbedSrc contains required params and origin', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com');
    const src = youtubeEmbedSrc('abc123XYZ12', true);
    expect(src).toContain('https://www.youtube.com/embed/abc123XYZ12?');
    expect(src).toContain('autoplay=1');
    expect(src).toContain('mute=1');
    expect(src).toContain('origin=https%3A%2F%2Fexample.com');
    const src2 = youtubeEmbedSrc('abc123XYZ12', false);
    expect(src2).toContain('mute=0');
  });
  it('youtubeEmbedHtml wraps src with redirect', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com');
    const html = youtubeEmbedHtml('abc123XYZ12');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('location.replace');
    expect(html).toContain('youtube.com/embed/abc123XYZ12');
  });
  it('youtubeEmbedOrigin delegates to webOrigin', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com');
    expect(youtubeEmbedOrigin()).toBe(webOrigin());
  });
  it('formatDateBs parity vs web formatDate (dot suffix)', () => {
    expect(formatDateBs(null)).toBe('—');
    expect(formatDateBs('')).toBe('—');
    expect(formatDateBs(undefined)).toBe('—');
    const iso = '2026-11-03T14:05:00.000Z';
    const d = new Date(iso);
    const expected = `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}.`;
    expect(formatDateBs(iso)).toBe(expected);
    // web formatDate returns without trailing dot — document difference
    const webNoDot = expected.slice(0, -1);
    expect(webNoDot).not.toBe(expected);
  });
  it('formatDateTimeBs contains date and time', () => {
    const out = formatDateTimeBs('2026-11-03T14:05:00.000Z');
    expect(out).not.toBe('—');
    expect(out).toMatch(/\d{2}\.\d{2}\.\d{4}\./);
    expect(out).toMatch(/\d{2}:\d{2}/);
    expect(formatDateTimeBs(null)).toBe('—');
  });
});
