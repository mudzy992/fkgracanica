import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './api-error';
import { activeSeasonCompetitions, pickDefaultParticipation } from './club-participation';
import { mediaUrl } from './media';
import { hasAnyPermission, hasPermission, isStaffUser } from './permissions';
import { parseYouTubeId } from './youtube-id';
import { youtubeEmbedSrc } from './youtube-embed';

describe('mob-batch201 — P-MOB114 api/club/media/permission/youtube (test-only)', () => {
  it('getApiErrorMessage string and array', () => {
    expect(getApiErrorMessage({ isAxiosError: true, response: { data: { message: 'Greška' } } } as any, 'fb')).toBe('Greška');
    expect(getApiErrorMessage({ isAxiosError: true, response: { data: { message: ['a', 'b'] } } } as any, 'fb')).toBe('a, b');
  });
  it('getApiErrorMessage fallback Error', () => {
    expect(getApiErrorMessage(new Error('boom'), 'fb')).toBe('boom');
    expect(getApiErrorMessage(null, 'fb')).toBe('fb');
    expect(getApiErrorMessage(new Error(''), 'fb')).toBe('fb');
  });
  it('getApiErrorMessage non-string message', () => {
    const err = Object.assign(new Error('m'), { isAxiosError: true, response: { data: { message: 500 } } });
    expect(getApiErrorMessage(err, 'fb')).toBe('m');
  });
  it('pickDefaultParticipation active league newest', () => {
    const items: any[] = [
      { seasonId: '1', seasonName: 'S', yearStart: 2022, isActive: true, competitionId: 'c1', competitionName: 'Kup', isLeague: false },
      { seasonId: '2', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c2', competitionName: 'Liga', isLeague: true },
      { seasonId: '3', seasonName: 'S', yearStart: 2024, isActive: true, competitionId: 'c3', competitionName: 'Liga', isLeague: true },
    ];
    expect(pickDefaultParticipation(items)?.seasonId).toBe('3');
  });
  it('pickDefaultParticipation fallback', () => {
    const a: any[] = [{ seasonId: 'x', seasonName: 'S', yearStart: 2021, isActive: true, competitionId: 'c1', competitionName: 'Kup', isLeague: false }];
    expect(pickDefaultParticipation(a)?.seasonId).toBe('x');
    expect(pickDefaultParticipation([])).toBeUndefined();
  });
  it('activeSeasonCompetitions league priority', () => {
    const items: any[] = [
      { seasonId: '1', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c1', competitionName: 'Z Kup', isLeague: false },
      { seasonId: '2', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c2', competitionName: 'A Liga', isLeague: true },
    ];
    expect(activeSeasonCompetitions(items)[0].isLeague).toBe(true);
  });
  it('activeSeasonCompetitions fallback inactive', () => {
    const items: any[] = [{ seasonId: '1', seasonName: 'S', yearStart: 2022, isActive: false, competitionId: 'c1', competitionName: 'B', isLeague: false }, { seasonId: '2', seasonName: 'S', yearStart: 2022, isActive: false, competitionId: 'c2', competitionName: 'A', isLeague: true }];
    expect(activeSeasonCompetitions(items)[0].isLeague).toBe(true);
  });
  it('mediaUrl null http', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl('')).toBeNull();
    expect(mediaUrl('https://cdn.example.com/a.jpg')).toBe('https://cdn.example.com/a.jpg');
  });
  it('mediaUrl variants thumb medium original', () => {
    expect(mediaUrl('originals/p.jpg', 'thumb')).toContain('thumbs/p.webp');
    expect(mediaUrl('originals/p.jpg', 'medium')).toContain('medium/p.webp');
    expect(mediaUrl('originals/p.jpg', 'original')).toContain('originals/p.jpg');
    expect(mediaUrl('other/p.jpg', 'thumb')).toContain('other/p.jpg');
  });
  it('mediaUrl uploads dot', () => {
    expect(mediaUrl('uploads/originals/a.jpg', 'thumb')).toContain('thumbs/a.webp');
    expect(mediaUrl('./originals/a.jpg', 'thumb')).toContain('thumbs/a.webp');
  });
  it('hasPermission and hasAny', () => {
    const u: any = { permissions: ['news.manage', 'media.read'] };
    expect(hasPermission(u, 'news.manage')).toBe(true);
    expect(hasPermission(u, 'x')).toBe(false);
    expect(hasAnyPermission(u, ['x', 'media.read'])).toBe(true);
    expect(hasAnyPermission(u, ['x', 'y'])).toBe(false);
  });
  it('isStaffUser', () => {
    expect(isStaffUser({ permissions: ['news.manage'] } as any)).toBe(true);
    expect(isStaffUser({ permissions: ['random'] } as any)).toBe(false);
    expect(isStaffUser(null)).toBe(false);
  });
  it('parseYouTubeId youtu.be watch embed', () => {
    expect(parseYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://www.youtube.com/watch?v=abc123')).toBe('abc123');
    expect(parseYouTubeId('https://www.youtube.com/embed/xyz')).toBe('xyz');
  });
  it('parseYouTubeId live shorts invalid', () => {
    expect(parseYouTubeId('https://www.youtube.com/live/liveId')).toBe('liveId');
    expect(parseYouTubeId('https://www.youtube.com/shorts/s1')).toBe('s1');
    expect(parseYouTubeId('not a url')).toBeNull();
    expect(parseYouTubeId('https://example.com/watch?v=123')).toBeNull();
  });
  it('youtubeEmbedSrc origin mute', () => {
    const src = youtubeEmbedSrc('vid123', true);
    expect(src).toContain('vid123');
    expect(src).toContain('mute=1');
    expect(youtubeEmbedSrc('vid123', false)).toContain('mute=0');
  });
});
