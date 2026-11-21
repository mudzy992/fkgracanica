import { beforeEach, describe, expect, it, vi } from 'vitest';
import { slugify } from './slugify';
import { formatDateBs, formatDateTimeBs } from './format-date';
import { parseYouTubeId } from './youtube-id';
import { webOrigin, newsArticleUrl } from './web-origin';
import { youtubeEmbedSrc, youtubeEmbedHtml, youtubeEmbedOrigin } from './youtube-embed';

describe('mob-batch118 — P-MOB31 helpers (test-only)', () => {
  beforeEach(() => { vi.unstubAllEnvs(); });

  it('slugify basic', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('  trim  ')).toBe('trim');
    expect(slugify('a---b')).toBe('a-b');
    expect(slugify('')).toBe('');
  });
  it('slugify diacritics', () => {
    expect(slugify('ČĆŽŠ')).toBe('cczs');
    expect(slugify('FK Gračanica')).toBe('fk-gracanica');
    expect(slugify('Šampion 2024!')).toBe('sampion-2024');
  });
  it('slugify non-alpha', () => {
    expect(slugify('---')).toBe('');
    expect(slugify('a_b c')).toBe('a-b-c');
  });
  it('formatDateBs null dot', () => {
    expect(formatDateBs(null)).toBe('—');
    expect(formatDateBs(undefined)).toBe('—');
    expect(formatDateBs('')).toBe('—');
    expect(formatDateBs('2024-01-05T10:00:00Z')).toMatch(/^\d{2}\.\d{2}\.\d{4}\.$/);
  });
  it('formatDateBs contains month', () => {
    const out = formatDateBs('2023-12-31T00:00:00Z');
    expect(out).toContain('.12.');
    expect(out.endsWith('.')).toBe(true);
  });
  it('formatDateTimeBs time', () => {
    expect(formatDateTimeBs(null)).toBe('—');
    expect(formatDateTimeBs('2024-06-15T12:34:56Z')).toMatch(/^\d{2}\.\d{2}\.\d{4}\. \d{2}:\d{2}$/);
  });
  it('parseYouTubeId youtu.be', () => {
    expect(parseYouTubeId('https://youtu.be/abc123')).toBe('abc123');
    expect(parseYouTubeId('https://www.youtu.be/xyz?si=1')).toBe('xyz');
  });
  it('parseYouTubeId watch', () => {
    expect(parseYouTubeId('https://www.youtube.com/watch?v=VIDEO123')).toBe('VIDEO123');
    expect(parseYouTubeId('https://youtube.com/watch?v=abc&list=1')).toBe('abc');
  });
  it('parseYouTubeId embed/shorts/live', () => {
    expect(parseYouTubeId('https://www.youtube.com/embed/EMB123')).toBe('EMB123');
    expect(parseYouTubeId('https://www.youtube.com/shorts/SHORT1')).toBe('SHORT1');
    expect(parseYouTubeId('https://www.youtube.com/live/LIVE99')).toBe('LIVE99');
  });
  it('parseYouTubeId invalid trim', () => {
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
  it('newsArticleUrl', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com');
    expect(newsArticleUrl('moja-vijest')).toBe('https://example.com/vijesti/moja-vijest');
  });
  it('youtubeEmbedOrigin equals webOrigin', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com');
    expect(youtubeEmbedOrigin()).toBe('https://example.com');
  });
  it('youtubeEmbedSrc muted and origin', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL', 'https://example.com');
    const src = youtubeEmbedSrc('VID123');
    expect(src).toContain('https://www.youtube.com/embed/VID123?');
    expect(src).toContain('origin=https%3A%2F%2Fexample.com');
    expect(src).toContain('mute=0');
    expect(youtubeEmbedSrc('VID123', true)).toContain('mute=1');
  });
  it('youtubeEmbedHtml contains', () => {
    const html = youtubeEmbedHtml('VID999');
    expect(html).toContain('VID999');
    expect(html).toContain('viewport');
    expect(html).toContain('www.youtube.com/embed/VID999');
  });
});
