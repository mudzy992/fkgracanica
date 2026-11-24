import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './api-error';
import { activeSeasonCompetitions, pickDefaultParticipation } from './club-participation';
import { mediaUrl } from './media';
import { hasAnyPermission, hasPermission, isStaffUser } from './permissions';
import { parseYouTubeId } from './youtube-id';
import { slugify } from './slugify';

describe('mob-batch198 — P-MOB111 api/club/media/permission/youtube/slugify (test-only)', () => {
  it('getApiErrorMessage string', () => {
    const err: any = { isAxiosError: true, response: { data: { message: 'Oops' } } };
    expect(getApiErrorMessage(err, 'fb')).toBe('Oops');
  });
  it('getApiErrorMessage array join', () => {
    const err: any = { isAxiosError: true, response: { data: { message: ['x', 'y'] } } };
    expect(getApiErrorMessage(err, 'fb')).toBe('x, y');
  });
  it('getApiErrorMessage fallback', () => {
    expect(getApiErrorMessage(new Error('boom'), 'fb')).toBe('boom');
    expect(getApiErrorMessage(null, 'fb')).toBe('fb');
    expect(getApiErrorMessage(new Error(''), 'fb')).toBe('fb');
  });
  it('pickDefaultParticipation newest active league', () => {
    const items: any[] = [
      { seasonId: '1', seasonName: 'S', yearStart: 2021, isActive: true, competitionId: 'c1', competitionName: 'Kup', isLeague: false },
      { seasonId: '2', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c2', competitionName: 'Liga', isLeague: true },
      { seasonId: '3', seasonName: 'S', yearStart: 2024, isActive: true, competitionId: 'c3', competitionName: 'Liga', isLeague: true },
    ];
    expect(pickDefaultParticipation(items)?.seasonId).toBe('3');
  });
  it('pickDefaultParticipation fallback inactive', () => {
    const b: any[] = [{ seasonId: 'a', seasonName: 'S', yearStart: 2020, isActive: false, competitionId: 'c1', competitionName: 'A', isLeague: true }, { seasonId: 'b', seasonName: 'S', yearStart: 2021, isActive: false, competitionId: 'c2', competitionName: 'B', isLeague: true }];
    expect(pickDefaultParticipation(b)?.seasonId).toBe('b');
    expect(pickDefaultParticipation([])).toBeUndefined();
  });
  it('activeSeasonCompetitions league first', () => {
    const items: any[] = [
      { seasonId: '1', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c1', competitionName: 'Z Kup', isLeague: false },
      { seasonId: '2', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c2', competitionName: 'A Liga', isLeague: true },
    ];
    expect(activeSeasonCompetitions(items)[0].isLeague).toBe(true);
    expect(activeSeasonCompetitions(items)[1].competitionName).toBe('Z Kup');
  });
  it('mediaUrl null and passthrough', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl(undefined)).toBeNull();
    expect(mediaUrl('http://cdn/x.jpg')).toBe('http://cdn/x.jpg');
  });
  it('mediaUrl thumb medium original', () => {
    expect(mediaUrl('originals/p.jpg', 'thumb')).toContain('thumbs/p.webp');
    expect(mediaUrl('originals/p.jpg', 'medium')).toContain('medium/p.webp');
    expect(mediaUrl('originals/p.jpg', 'original')).toContain('originals/p.jpg');
  });
  it('mediaUrl uploads prefix dot', () => {
    expect(mediaUrl('uploads/originals/a.jpg', 'thumb')).toContain('thumbs/a.webp');
    expect(mediaUrl('./originals/b.jpg', 'medium')).toContain('medium/b.webp');
  });
  it('hasPermission checks', () => {
    const u: any = { permissions: ['news.manage', 'media.read'] };
    expect(hasPermission(u, 'news.manage')).toBe(true);
    expect(hasPermission(u, 'missing')).toBe(false);
    expect(hasPermission(null, 'x')).toBe(false);
  });
  it('hasAnyPermission', () => {
    const u: any = { permissions: ['a', 'b'] };
    expect(hasAnyPermission(u, ['x', 'a'])).toBe(true);
    expect(hasAnyPermission(u, ['x', 'y'])).toBe(false);
    expect(hasAnyPermission(null, ['a'])).toBe(false);
  });
  it('isStaffUser', () => {
    expect(isStaffUser({ permissions: ['news.manage'] } as any)).toBe(true);
    expect(isStaffUser({ permissions: ['other'] } as any)).toBe(false);
    expect(isStaffUser(undefined)).toBe(false);
  });
  it('parseYouTubeId youtu.be and watch', () => {
    expect(parseYouTubeId('https://youtu.be/abc123')).toBe('abc123');
    expect(parseYouTubeId('https://www.youtube.com/watch?v=vid999')).toBe('vid999');
  });
  it('parseYouTubeId embed live shorts', () => {
    expect(parseYouTubeId('https://www.youtube.com/embed/xyz')).toBe('xyz');
    expect(parseYouTubeId('https://www.youtube.com/live/live1')).toBe('live1');
    expect(parseYouTubeId('https://www.youtube.com/shorts/s2')).toBe('s2');
  });
  it('parseYouTubeId invalid and slugify', () => {
    expect(parseYouTubeId('https://example.com')).toBeNull();
    expect(parseYouTubeId('bad url')).toBeNull();
    expect(slugify('FK Gračanica 2024')).toBe('fk-gracanica-2024');
  });
});
