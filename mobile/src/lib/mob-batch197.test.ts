import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './api-error';
import { asArray, asNumber, asRecord, asString } from './content-helpers';
import { kpiLabel } from './dashboard-kpi-labels';
import { mediaUrl } from './media';
import { brand, colors, darkColors, spacing, typography } from './theme';
import { newsArticleUrl, webOrigin } from './web-origin';
import { youtubeEmbedHtml, youtubeEmbedSrc } from './youtube-embed';
import { parseYouTubeId } from './youtube-id';

describe('mob-batch197 — P-MOB110 media/youtube/theme/helpers/web/api (test-only)', () => {
  it('mediaUrl null http variant', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl('')).toBeNull();
    expect(mediaUrl('https://cdn.example/img.jpg')).toBe('https://cdn.example/img.jpg');
    expect(mediaUrl('originals/photo.jpg', 'thumb')).toContain('thumbs/photo.webp');
    expect(mediaUrl('originals/photo.jpg', 'medium')).toContain('medium/photo.webp');
    expect(mediaUrl('originals/photo.jpg', 'original')).toContain('originals/photo.jpg');
  });
  it('mediaUrl uploads prefix', () => {
    expect(mediaUrl('uploads/originals/a.png', 'medium')).toContain('medium/a.webp');
    expect(mediaUrl('./originals/b.jpg', 'thumb')).toContain('thumbs/b.webp');
    expect(mediaUrl('other/path.jpg')).toContain('other/path.jpg');
  });
  it('parseYouTubeId youtu.be and youtube.com', () => {
    expect(parseYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://www.youtube.com/live/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });
  it('parseYouTubeId invalid', () => {
    expect(parseYouTubeId('https://example.com')).toBeNull();
    expect(parseYouTubeId('not a url')).toBeNull();
    expect(parseYouTubeId('https://www.youtube.com/watch?x=1')).toBeNull();
  });
  it('youtubeEmbedSrc muted', () => {
    const src = youtubeEmbedSrc('abc123', false);
    expect(src).toContain('https://www.youtube.com/embed/abc123');
    expect(src).toContain('mute=0');
    expect(src).toContain('autoplay=1');
    expect(youtubeEmbedSrc('abc123', true)).toContain('mute=1');
  });
  it('youtubeEmbedHtml contains src', () => {
    const html = youtubeEmbedHtml('vid1', true);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('vid1');
    expect(html).toContain('mute=1');
  });
  it('theme brand and darkColors', () => {
    expect(brand.primary).toBe('#1E3A8A');
    expect(darkColors.background).toBe('#050A14');
    expect(colors.surface).toBe('#0A1525');
    expect(spacing.md).toBe(16);
    expect(typography.title.fontSize).toBe(24);
  });
  it('typography display and spacing', () => {
    expect(typography.display.letterSpacing).toBe(-1);
    expect(spacing.xs).toBe(4);
    expect(spacing.xl).toBe(32);
  });
  it('content helpers asRecord', () => {
    expect(asRecord({ a: 1 })).toEqual({ a: 1 });
    expect(asRecord(null)).toEqual({});
    expect(asRecord('x')).toEqual({});
  });
  it('asString asNumber', () => {
    expect(asString('hi')).toBe('hi');
    expect(asString(123, 'fb')).toBe('fb');
    expect(asNumber(5)).toBe(5);
    expect(asNumber('5', 9)).toBe(9);
  });
  it('asArray', () => {
    expect(asArray([1, 2])).toEqual([1, 2]);
    expect(asArray('x')).toEqual([]);
    expect(asArray(null)).toEqual([]);
  });
  it('kpiLabel known and fallback', () => {
    expect(kpiLabel('users')).toBe('Korisnici');
    expect(kpiLabel('goals')).toBe('Golovi');
    expect(kpiLabel('unknown_xyz')).toBe('unknown_xyz');
  });
  it('webOrigin default and newsArticleUrl', () => {
    expect(webOrigin()).toContain('https://');
    expect(newsArticleUrl('moja-vijest')).toBe(`${webOrigin()}/vijesti/moja-vijest`);
  });
  it('getApiErrorMessage fallback and Error', () => {
    expect(getApiErrorMessage(new Error('oops'), 'fb')).toBe('oops');
    expect(getApiErrorMessage(null, 'fallback')).toBe('fallback');
    expect(getApiErrorMessage('', 'fb2')).toBe('fb2');
  });
  it('getApiErrorMessage axios array', () => {
    const err = Object.assign(new Error('m'), { isAxiosError: true, response: { data: { message: ['a', 'b'] } } });
    expect(getApiErrorMessage(err, 'fb')).toBe('a, b');
    const err2 = Object.assign(new Error('m'), { isAxiosError: true, response: { data: { message: 'single' } } });
    expect(getApiErrorMessage(err2, 'fb')).toBe('single');
  });
});
