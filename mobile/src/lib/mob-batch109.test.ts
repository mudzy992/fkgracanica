import { beforeEach, describe, expect, it, vi } from 'vitest';
import { slugify } from './slugify';
import { formatDateBs, formatDateTimeBs } from './format-date';
import { parseYouTubeId } from './youtube-id';
import { webOrigin, newsArticleUrl } from './web-origin';
import { youtubeEmbedOrigin, youtubeEmbedSrc, youtubeEmbedHtml } from './youtube-embed';

describe('mob-batch109 — P-MOB22 helpers (test-only)', () => {
  beforeEach(() => { vi.unstubAllEnvs(); });

  it('slugify basic lower and separators', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('  trim  ')).toBe('trim');
    expect(slugify('a---b')).toBe('a-b');
    expect(slugify('')).toBe('');
  });
  it('slugify diacritics and numbers', () => {
    expect(slugify('ČĆŽŠ')).toBe('cczs');
    expect(slugify('Šampion 2024!')).toBe('sampion-2024');
    expect(slugify('FK Gračanica')).toBe('fk-gracanica');
  });
  it('slugify non-alphanumeric', () => {
    expect(slugify('---')).toBe('');
    expect(slugify('a_b c')).toBe('a-b-c');
  });
  it('formatDateBs null and dot suffix', () => {
    expect(formatDateBs(null)).toBe('—');
    expect(formatDateBs(undefined)).toBe('—');
    expect(formatDateBs('')).toBe('—');
    expect(formatDateBs('2024-01-05T10:00:00Z')).toMatch(/^\d{2}\.\d{2}\.\d{4}\.$/);
  });
  it('formatDateBs specific date', () => {
    // Use local date parsing — check format structure
    const out = formatDateBs('2023-12-31T00:00:00Z');
    expect(out).toContain('.12.');
    expect(out.endsWith('.')).toBe(true);
  });
  it('formatDateTimeBs includes time', () => {
    expect(formatDateTimeBs(null)).toBe('—');
    const out = formatDateTimeBs('2024-06-15T12:34:56Z');
    expect(out).toMatch(/^\d{2}\.\d{2}\.\d{4}\. \d{2}:\d{2}$/);
  });
  it('parseYouTubeId youtu.be', () => {
    expect(parseYouTubeId('https://youtu.be/abc123')).toBe('abc123');
    expect(parseYouTubeId('https://www.youtu.be/xyz?si=1')).toBe('xyz');
  });
  it('parseYouTubeId watch v param', () => {
    expect(parseYouTubeId('https://www.youtube.com/watch?v=VIDEO123')).toBe('VIDEO123');
    expect(parseYouTubeId('https://youtube.com/watch?v=abc&list=1')).toBe('abc');
    expect(parseYouTubeId('https://www.youtube.com/watch?foo=bar')).toBeNull();
  });
  it('parseYouTubeId embed/shorts/live', () => {
    expect(parseYouTubeId('https://www.youtube.com/embed/EMB123')).toBe('EMB123');
    expect(parseYouTubeId('https://www.youtube.com/shorts/SHORT1')).toBe('SHORT1');
    expect(parseYouTubeId('https://www.youtube.com/live/LIVE99')).toBe('LIVE99');
  });
  it('parseYouTubeId invalid and trim', () => {
    expect(parseYouTubeId('not-a-url')).toBeNull();
    expect(parseYouTubeId('https://example.com')).toBeNull();
    expect(parseYouTubeId('  https://youtu.be/trimmed  ')).toBe('trimmed');
  });
  it('webOrigin default and env', () => {
    delete process.env.EXPO_PUBLIC_WEB_URL;
    expect(webOrigin()).toBe('https://fkgracanica.ba101.top');
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com/');
    expect(webOrigin()).toBe('https://example.com');
  });
  it('newsArticleUrl uses webOrigin', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com');
    expect(newsArticleUrl('moja-vijest')).toBe('https://example.com/vijesti/moja-vijest');
    delete process.env.EXPO_PUBLIC_WEB_URL;
    expect(newsArticleUrl('test')).toBe('https://fkgracanica.ba101.top/vijesti/test');
  });
  it('youtubeEmbedOrigin equals webOrigin', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com');
    expect(youtubeEmbedOrigin()).toBe('https://example.com');
  });
  it('youtubeEmbedSrc contains videoId and origin', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com');
    const src = youtubeEmbedSrc('VID123');
    expect(src).toContain('https://www.youtube.com/embed/VID123?');
    expect(src).toContain('origin=https%3A%2F%2Fexample.com');
    expect(src).toContain('mute=0');
    expect(youtubeEmbedSrc('VID123', true)).toContain('mute=1');
  });
  it('youtubeEmbedHtml contains src and viewport', () => {
    const html = youtubeEmbedHtml('VID999');
    expect(html).toContain('VID999');
    expect(html).toContain('viewport');
    expect(html).toContain('www.youtube.com/embed/VID999');
  });
});
