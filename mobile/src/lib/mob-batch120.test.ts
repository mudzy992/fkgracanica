import { beforeEach, describe, expect, it, vi } from 'vitest';
import { slugify } from './slugify';
import { formatDateBs, formatDateTimeBs } from './format-date';
import { parseYouTubeId } from './youtube-id';
import { webOrigin, newsArticleUrl } from './web-origin';
import { youtubeEmbedSrc, youtubeEmbedHtml, youtubeEmbedOrigin } from './youtube-embed';

describe('mob-batch120 — P-MOB33 helpers (test-only)', () => {
  beforeEach(() => { vi.unstubAllEnvs(); });

  it('slugify basic', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('  spaced  ')).toBe('spaced');
    expect(slugify('a---b__c')).toBe('a-b-c');
    expect(slugify('')).toBe('');
  });
  it('slugify diacritics', () => {
    expect(slugify('ČĆŽŠ')).toBe('cczs');
    expect(slugify('FK Gračanica')).toBe('fk-gracanica');
  });
  it('slugify numbers and punctuation', () => {
    expect(slugify('2024! Champion')).toBe('2024-champion');
    expect(slugify('---')).toBe('');
  });
  it('formatDateBs null and pattern', () => {
    expect(formatDateBs(null)).toBe('—');
    expect(formatDateBs(undefined)).toBe('—');
    expect(formatDateBs('2024-03-15T00:00:00Z')).toMatch(/^\d{2}\.\d{2}\.\d{4}\.$/);
  });
  it('formatDateBs dot suffix', () => {
    const out = formatDateBs('2023-11-20T00:00:00Z');
    expect(out.endsWith('.')).toBe(true);
    expect(out).toContain('.11.');
  });
  it('formatDateTimeBs', () => {
    expect(formatDateTimeBs(null)).toBe('—');
    expect(formatDateTimeBs('2024-06-15T08:05:00Z')).toMatch(/^\d{2}\.\d{2}\.\d{4}\. \d{2}:\d{2}$/);
  });
  it('parseYouTubeId youtu.be', () => {
    expect(parseYouTubeId('https://youtu.be/ABC123')).toBe('ABC123');
    expect(parseYouTubeId('https://www.youtu.be/xyz')).toBe('xyz');
  });
  it('parseYouTubeId watch v', () => {
    expect(parseYouTubeId('https://www.youtube.com/watch?v=VID123')).toBe('VID123');
    expect(parseYouTubeId('https://youtube.com/watch?v=abc&list=1')).toBe('abc');
  });
  it('parseYouTubeId embed/shorts/live', () => {
    expect(parseYouTubeId('https://www.youtube.com/embed/EMB')).toBe('EMB');
    expect(parseYouTubeId('https://www.youtube.com/shorts/SH1')).toBe('SH1');
    expect(parseYouTubeId('https://www.youtube.com/live/LV1')).toBe('LV1');
  });
  it('parseYouTubeId invalid', () => {
    expect(parseYouTubeId('not-url')).toBeNull();
    expect(parseYouTubeId('https://example.com/watch?v=abc')).toBeNull();
    expect(parseYouTubeId('  https://youtu.be/trim  ')).toBe('trim');
  });
  it('webOrigin default', () => {
    delete process.env.EXPO_PUBLIC_WEB_URL;
    expect(webOrigin()).toBe('https://fkgracanica.ba101.top');
  });
  it('webOrigin env and newsArticleUrl', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com/');
    expect(webOrigin()).toBe('https://example.com');
    expect(newsArticleUrl('test-slug')).toBe('https://example.com/vijesti/test-slug');
  });
  it('youtubeEmbedOrigin', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com');
    expect(youtubeEmbedOrigin()).toBe('https://example.com');
  });
  it('youtubeEmbedSrc', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com');
    const src = youtubeEmbedSrc('VID1');
    expect(src).toContain('https://www.youtube.com/embed/VID1?');
    expect(src).toContain('mute=0');
    expect(youtubeEmbedSrc('VID1', true)).toContain('mute=1');
    expect(src).toContain('origin=https%3A%2F%2Fexample.com');
  });
  it('youtubeEmbedHtml', () => {
    const html = youtubeEmbedHtml('VID999');
    expect(html).toContain('VID999');
    expect(html).toContain('viewport');
  });
});
