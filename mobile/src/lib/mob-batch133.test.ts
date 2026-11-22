import { beforeEach, describe, expect, it, vi } from 'vitest';
import { slugify } from './slugify';
import { formatDateBs, formatDateTimeBs } from './format-date';
import { parseYouTubeId } from './youtube-id';
import { newsArticleUrl, webOrigin } from './web-origin';
import { youtubeEmbedHtml, youtubeEmbedOrigin, youtubeEmbedSrc } from './youtube-embed';

describe('mob-batch133 — P-MOB46 helpers (test-only)', () => {
  beforeEach(() => { vi.unstubAllEnvs(); });

  it('slugify basic lower and hyphen', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('  spaced  ')).toBe('spaced');
    expect(slugify('')).toBe('');
  });
  it('slugify collapse separators', () => {
    expect(slugify('a---b__c')).toBe('a-b-c');
    expect(slugify('---')).toBe('');
    expect(slugify('a  b   c')).toBe('a-b-c');
  });
  it('slugify diacritics and fallback', () => {
    expect(slugify('ČĆŽŠ')).toBe('cczs');
    expect(slugify('FK Gračanica')).toBe('fk-gracanica');
    expect(slugify('2024! Champion')).toBe('2024-champion');
  });
  it('formatDateBs null and invalid', () => {
    expect(formatDateBs(null)).toBe('—');
    expect(formatDateBs(undefined)).toBe('—');
    expect(formatDateBs('')).toBe('—');
  });
  it('formatDateBs pattern dot', () => {
    const out = formatDateBs('2024-03-15T00:00:00Z');
    expect(out).toMatch(/^\d{2}\.\d{2}\.\d{4}\.$/);
    expect(out.endsWith('.')).toBe(true);
  });
  it('formatDateTimeBs pattern', () => {
    expect(formatDateTimeBs(null)).toBe('—');
    expect(formatDateTimeBs('2024-06-15T08:05:00Z')).toMatch(/^\d{2}\.\d{2}\.\d{4}\. \d{2}:\d{2}$/);
    expect(formatDateTimeBs('2023-01-02T03:04:00Z')).toContain('03:04');
  });
  it('parseYouTubeId youtu.be', () => {
    expect(parseYouTubeId('https://youtu.be/ABC123')).toBe('ABC123');
    expect(parseYouTubeId('https://www.youtu.be/xyz')).toBe('xyz');
    expect(parseYouTubeId('  https://youtu.be/trim  ')).toBe('trim');
  });
  it('parseYouTubeId watch v param', () => {
    expect(parseYouTubeId('https://www.youtube.com/watch?v=VID123')).toBe('VID123');
    expect(parseYouTubeId('https://youtube.com/watch?v=abc&list=1')).toBe('abc');
  });
  it('parseYouTubeId embed shorts live', () => {
    expect(parseYouTubeId('https://www.youtube.com/embed/EMB')).toBe('EMB');
    expect(parseYouTubeId('https://www.youtube.com/shorts/SH1')).toBe('SH1');
    expect(parseYouTubeId('https://www.youtube.com/live/LV1')).toBe('LV1');
  });
  it('parseYouTubeId invalid returns null', () => {
    expect(parseYouTubeId('not-url')).toBeNull();
    expect(parseYouTubeId('')).toBeNull();
    expect(parseYouTubeId('https://example.com/watch?v=abc')).toBeNull();
  });
  it('webOrigin default fallback', () => {
    delete process.env.EXPO_PUBLIC_WEB_URL;
    expect(webOrigin()).toBe('https://fkgracanica.ba101.top');
  });
  it('webOrigin trims trailing slash', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com/');
    expect(webOrigin()).toBe('https://example.com');
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com');
    expect(webOrigin()).toBe('https://example.com');
  });
  it('newsArticleUrl and youtubeEmbedOrigin', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com');
    expect(newsArticleUrl('test-slug')).toBe('https://example.com/vijesti/test-slug');
    expect(youtubeEmbedOrigin()).toBe('https://example.com');
    expect(youtubeEmbedOrigin()).toBe(webOrigin());
  });
  it('youtubeEmbedSrc mute and origin param', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com');
    const src = youtubeEmbedSrc('VID1');
    expect(src).toContain('https://www.youtube.com/embed/VID1?');
    expect(src).toContain('mute=0');
    expect(youtubeEmbedSrc('VID1', true)).toContain('mute=1');
    expect(src).toContain('origin=https%3A%2F%2Fexample.com');
  });
  it('youtubeEmbedHtml contains script and viewport', () => {
    const html = youtubeEmbedHtml('VID999');
    expect(html).toContain('VID999');
    expect(html).toContain('viewport');
    expect(html).toContain('location.replace');
  });
});
