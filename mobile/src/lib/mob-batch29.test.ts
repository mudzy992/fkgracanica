import { describe, expect, it } from 'vitest';
import { parseYouTubeId } from '../lib/youtube-id';
import { mediaUrl } from '../lib/media';
import { flattenSeasonEditions } from '../lib/flatten-editions';
import { kpiLabel } from '../lib/dashboard-kpi-labels';
import { describe as deskDescribe } from 'vitest';

describe('mob-batch29 — P-MOB29 media + youtube + editions', () => {
  it('parseYouTubeId youtu.be', () => {
    expect(parseYouTubeId('https://youtu.be/abc123XYZ12')).toBe('abc123XYZ12');
    expect(parseYouTubeId('https://www.youtu.be/abc123XYZ12')).toBe('abc123XYZ12');
  });

  it('parseYouTubeId youtube.com watch', () => {
    expect(parseYouTubeId('https://www.youtube.com/watch?v=abc123XYZ12')).toBe('abc123XYZ12');
    expect(parseYouTubeId('https://youtube.com/watch?v=abc123XYZ12&list=PL123')).toBe('abc123XYZ12');
  });

  it('parseYouTubeId embed/live/shorts', () => {
    expect(parseYouTubeId('https://www.youtube.com/embed/abc123XYZ12')).toBe('abc123XYZ12');
    expect(parseYouTubeId('https://www.youtube.com/live/abc123XYZ12')).toBe('abc123XYZ12');
    expect(parseYouTubeId('https://www.youtube.com/shorts/abc123XYZ12')).toBe('abc123XYZ12');
  });

  it('parseYouTubeId nevažeći', () => {
    expect(parseYouTubeId('https://example.com')).toBeNull();
    expect(parseYouTubeId('not a url')).toBeNull();
    expect(parseYouTubeId('')).toBeNull();
    expect(parseYouTubeId('https://www.youtube.com/')).toBeNull();
  });

  it('mediaUrl null/undefined/http', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl(undefined)).toBeNull();
    expect(mediaUrl('')).toBeNull();
    expect(mediaUrl('https://example.com/img.jpg')).toBe('https://example.com/img.jpg');
    expect(mediaUrl('http://example.com/img.jpg')).toBe('http://example.com/img.jpg');
  });

  it('mediaUrl originals variant', () => {
    const url = mediaUrl('originals/photo.jpg', 'original');
    expect(url).toContain('/uploads/files/originals/photo.jpg');
    const thumb = mediaUrl('originals/photo.jpg', 'thumb');
    expect(thumb).toContain('/thumbs/photo.webp');
    const medium = mediaUrl('originals/photo.png', 'medium');
    expect(medium).toContain('/medium/photo.webp');
  });

  it('mediaUrl non-originals ne mijenja', () => {
    const url = mediaUrl('other/photo.jpg', 'thumb');
    expect(url).toContain('other/photo.jpg');
    expect(url).not.toContain('thumbs');
  });

  it('mediaUrl normalizuje ./ i uploads/', () => {
    expect(mediaUrl('./originals/x.jpg', 'original')).toContain('originals/x.jpg');
    expect(mediaUrl('uploads/originals/x.jpg', 'original')).toContain('originals/x.jpg');
  });

  it('flattenSeasonEditions prazno', () => {
    expect(flattenSeasonEditions(null)).toEqual([]);
    expect(flattenSeasonEditions([])).toEqual([]);
    expect(flattenSeasonEditions([{ id: 'c1', name: 'Sezona', competitions: [] }])).toEqual([]);
  });

  it('flattenSeasonEditions mapira', () => {
    const data = [{ id: 'cal1', name: '2024/25', competitions: [{ id: 'ed1', competition: { name: 'Liga' } }, { id: '', competition: {} }] }];
    const res = flattenSeasonEditions(data);
    expect(res.length).toBe(1);
    expect(res[0].id).toBe('ed1');
    expect(res[0].calendarName).toBe('2024/25');
    expect(res[0].name).toContain('Liga');
  });

  it('kpiLabel poznat i fallback', () => {
    expect(kpiLabel('users')).toBe('Korisnici');
    expect(kpiLabel('nepoznat')).toBe('nepoznat');
    expect(kpiLabel('')).toBe('');
  });
});
