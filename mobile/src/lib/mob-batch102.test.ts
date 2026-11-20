import { describe, expect, it, vi } from 'vitest';
import { slugify } from './slugify';
import { formatDateBs } from './format-date';
import { parseYouTubeId } from './youtube-id';
import { webOrigin } from './web-origin';
import { stripHtml } from './html-text';

describe('mob-batch102 — P-MOB15 helpers (test-only)', () => {
  it('slugify basics', () => {
    expect(slugify('FK Gračanica')).toBe('fk-gracanica');
    expect(slugify('')).toBe('');
  });
  it('slugify diacritics', () => {
    expect(slugify('ČĆŽŠ')).toBe('cczs');
  });
  it('slugify separators', () => {
    expect(slugify('a--b')).toBe('a-b');
    expect(slugify('---')).toBe('');
  });
  it('formatDateBs null', () => {
    expect(formatDateBs(null)).toBe('—');
    expect(formatDateBs(undefined)).toBe('—');
  });
  it('formatDateBs valid', () => {
    const iso='2026-06-15T12:00:00.000Z';
    const d=new Date(iso);
    const exp=`${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}.`;
    expect(formatDateBs(iso)).toBe(exp);
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
  });
  it('webOrigin default', () => {
    delete process.env.EXPO_PUBLIC_WEB_URL;
    expect(webOrigin()).toBe('https://fkgracanica.ba101.top');
  });
  it('webOrigin env', () => {
    vi.stubEnv('EXPO_PUBLIC_WEB_URL','https://example.com/');
    expect(webOrigin()).toBe('https://example.com');
    vi.unstubAllEnvs();
  });
  it('stripHtml br', () => {
    expect(stripHtml('a<br>b')).toBe('a\nb');
  });
  it('stripHtml entities', () => {
    expect(stripHtml('a &amp; b')).toBe('a & b');
  });
  it('stripHtml empty', () => {
    expect(stripHtml('')).toBe('');
  });
  it('parseYouTubeId shorts', () => {
    expect(parseYouTubeId('https://www.youtube.com/shorts/abc123XYZ12')).toBe('abc123XYZ12');
  });
});
