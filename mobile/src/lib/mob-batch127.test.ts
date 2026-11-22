import { beforeEach, describe, expect, it, vi } from 'vitest';
import { slugify } from './slugify';
import { formatDateBs, formatDateTimeBs } from './format-date';
import { parseYouTubeId } from './youtube-id';
import { webOrigin, newsArticleUrl } from './web-origin';
import { youtubeEmbedHtml, youtubeEmbedOrigin, youtubeEmbedSrc } from './youtube-embed';

describe('mob-batch127 — P-MOB40 helpers (test-only)', () => {
  beforeEach(() => { vi.unstubAllEnvs(); });

  it('slugify basic lower and trim', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('  spaced   out  ')).toBe('spaced-out');
    expect(slugify('')).toBe('');
  });
  it('slugify separators collapse', () => {
    expect(slugify('a---b___c')).toBe('a-b-c');
    expect(slugify('---')).toBe('');
    expect(slugify('a  b   c')).toBe('a-b-c');
  });
  it('slugify diacritics and numbers', () => {
    expect(slugify('ČĆŽŠ')).toBe('cczs');
    expect(slugify('FK Gračanica 2024')).toBe('fk-gracanica-2024');
    expect(slugify('2024! Champion')).toBe('2024-champion');
  });
  it('formatDateBs null fallback', () => {
    expect(formatDateBs(null)).toBe('—');
    expect(formatDateBs(undefined)).toBe('—');
    expect(formatDateBs('')).toBe('—');
  });
  it('formatDateBs valid dot suffix', () => {
    const out = formatDateBs('2023-11-20T00:00:00Z');
    expect(out).toMatch(/^\d{2}\.\d{2}\.\d{4}\.$/);
    expect(out.endsWith('.')).toBe(true);
    expect(out).toContain('.11.');
  });
  it('formatDateTimeBs null and pattern', () => {
    expect(formatDateTimeBs(null)).toBe('—');
    expect(formatDateTimeBs(undefined)).toBe('—');
    expect(formatDateTimeBs('2024-06-15T08:05:00Z')).toMatch(/^\d{2}\.\d{2}\.\d{4}\. \d{2}:\d{2}$/);
  });
  it('parseYouTubeId youtu.be variants', () => {
    expect(parseYouTubeId('https://youtu.be/ABC123')).toBe('ABC123');
    expect(parseYouTubeId('https://www.youtu.be/xyz')).toBe('xyz');
    expect(parseYouTubeId('  https://youtu.be/trim  ')).toBe('trim');
  });
  it('parseYouTubeId watch with v param', () => {
    expect(parseYouTubeId('https://www.youtube.com/watch?v=VID123')).toBe('VID123');
    expect(parseYouTubeId('https://youtube.com/watch?v=abc&list=1')).toBe('abc');
    expect(parseYouTubeId('https://m.youtube.com/watch?v=mid')).toBe('mid');
  });
  it('parseYouTubeId embed shorts live', () => {
    expect(parseYouTubeId('https://www.youtube.com/embed/EMB')).toBe('EMB');
    expect(parseYouTubeId('https://www.youtube.com/shorts/SH1')).toBe('SH1');
    expect(parseYouTubeId('https://www.youtube.com/live/LV1')).toBe('LV1');
  });
  it('parseYouTubeId invalid and empty', () => {
    expect(parseYouTubeId('not-url')).toBeNull();
    expect(parseYouTubeId('')).toBeNull();
    expect(parseYouTubeId('https://example.com/watch?v=abc')).toBeNull();
    expect(parseYouTubeId('https://youtube.com/watch?x=1')).toBeNull();
  });
  it('webOrigin default and env trim slash', () => {
    delete process.env.EXPO_PUBLIC_WEB_URL;
    expect(webOrigin()).toBe('https://fkgracanica.ba101.top');
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com/');
    expect(webOrigin()).toBe('https://example.com');
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com');
    expect(webOrigin()).toBe('https://example.com');
  });
  it('newsArticleUrl uses webOrigin and slug', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com');
    expect(newsArticleUrl('test-slug')).toBe('https://example.com/vijesti/test-slug');
    expect(newsArticleUrl('a')).toBe('https://example.com/vijesti/a');
  });
  it('youtubeEmbedOrigin equals webOrigin', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com');
    expect(youtubeEmbedOrigin()).toBe('https://example.com');
    expect(youtubeEmbedOrigin()).toBe(webOrigin());
  });
  it('youtubeEmbedSrc contains mute and origin', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com');
    const src = youtubeEmbedSrc('VID1');
    expect(src).toContain('https://www.youtube.com/embed/VID1?');
    expect(src).toContain('mute=0');
    expect(youtubeEmbedSrc('VID1', true)).toContain('mute=1');
    expect(src).toContain('origin=https%3A%2F%2Fexample.com');
  });
  it('youtubeEmbedHtml contains viewport and script src', () => {
    const html = youtubeEmbedHtml('VID999');
    expect(html).toContain('VID999');
    expect(html).toContain('viewport');
    expect(html).toContain('location.replace');
    expect(html).toContain('youtube.com/embed');
  });
});
