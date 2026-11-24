import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './api-error';
import { activeSeasonCompetitions, pickDefaultParticipation } from './club-participation';
import { mediaUrl } from './media';
import { hasPermission, isStaffUser } from './permissions';
import { parseYouTubeId } from './youtube-id';

describe('mob-batch180 — P-MOB93 api/club/media/permission/youtube (test-only)', () => {
  it('getApiErrorMessage string', () => {
    const err: any = { isAxiosError: true, response: { data: { message: 'Greška' } } };
    expect(getApiErrorMessage(err, 'fb')).toBe('Greška');
  });
  it('getApiErrorMessage array', () => {
    const err: any = { isAxiosError: true, response: { data: { message: ['one', 'two'] } } };
    expect(getApiErrorMessage(err, 'fb')).toBe('one, two');
  });
  it('getApiErrorMessage fallback', () => {
    expect(getApiErrorMessage(new Error('boom'), 'fb')).toBe('boom');
    expect(getApiErrorMessage(null, 'fb')).toBe('fb');
    expect(getApiErrorMessage(new Error(''), 'fb')).toBe('fb');
  });
  it('getApiErrorMessage numeric message', () => {
    const err: any = Object.assign(new Error('msg'), { isAxiosError: true, response: { data: { message: 404 } } });
    expect(getApiErrorMessage(err, 'fb')).toBe('msg');
  });
  it('pickDefaultParticipation league newest', () => {
    const items: any[] = [
      { seasonId: '1', seasonName: 'S', yearStart: 2021, isActive: true, competitionId: 'c1', competitionName: 'Cup', isLeague: false },
      { seasonId: '2', seasonName: 'S', yearStart: 2022, isActive: true, competitionId: 'c2', competitionName: 'Liga', isLeague: true },
      { seasonId: '3', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c3', competitionName: 'Liga', isLeague: true },
    ];
    expect(pickDefaultParticipation(items)?.seasonId).toBe('3');
  });
  it('pickDefaultParticipation fallback active', () => {
    const a: any[] = [{ seasonId: 'a1', seasonName: 'S', yearStart: 2020, isActive: true, competitionId: 'c1', competitionName: 'Kup', isLeague: false }];
    expect(pickDefaultParticipation(a)?.seasonId).toBe('a1');
    const b: any[] = [{ seasonId: 'b1', seasonName: 'S', yearStart: 2019, isActive: false, competitionId: 'c1', competitionName: 'A', isLeague: true }, { seasonId: 'b2', seasonName: 'S', yearStart: 2020, isActive: false, competitionId: 'c2', competitionName: 'B', isLeague: true }];
    expect(pickDefaultParticipation(b)?.seasonId).toBe('b2');
    expect(pickDefaultParticipation([])).toBeUndefined();
  });
  it('activeSeasonCompetitions league priority', () => {
    const items: any[] = [
      { seasonId: '1', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c1', competitionName: 'Z Kup', isLeague: false },
      { seasonId: '2', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c2', competitionName: 'A Liga', isLeague: true },
    ];
    expect(activeSeasonCompetitions(items)[0].isLeague).toBe(true);
  });
  it('activeSeasonCompetitions fallback', () => {
    const items: any[] = [{ seasonId: '1', seasonName: 'S', yearStart: 2022, isActive: false, competitionId: 'c1', competitionName: 'B', isLeague: false }, { seasonId: '2', seasonName: 'S', yearStart: 2022, isActive: false, competitionId: 'c2', competitionName: 'A', isLeague: true }];
    expect(activeSeasonCompetitions(items)[0].isLeague).toBe(true);
  });
  it('mediaUrl null http', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl('')).toBeNull();
    expect(mediaUrl('https://cdn.example.com/a.jpg')).toBe('https://cdn.example.com/a.jpg');
  });
  it('mediaUrl variants', () => {
    expect(mediaUrl('originals/file.jpg', 'thumb')).toContain('thumbs/file.webp');
    expect(mediaUrl('originals/file.jpg', 'medium')).toContain('medium/file.webp');
    expect(mediaUrl('originals/file.jpg', 'original')).toContain('originals/file.jpg');
    expect(mediaUrl('other/file.jpg', 'thumb')).toContain('other/file.jpg');
  });
  it('mediaUrl uploads', () => {
    expect(mediaUrl('uploads/originals/img.jpg', 'thumb')).toContain('thumbs/img.webp');
    expect(mediaUrl('./originals/img.jpg', 'thumb')).toContain('thumbs/img.webp');
  });
  it('hasPermission', () => {
    const u: any = { permissions: ['news.manage'] };
    expect(hasPermission(u, 'news.manage')).toBe(true);
    expect(hasPermission(u, 'nope')).toBe(false);
    expect(hasPermission(null, 'x')).toBe(false);
  });
  it('isStaffUser', () => {
    expect(isStaffUser({ permissions: ['news.manage'] } as any)).toBe(true);
    expect(isStaffUser({ permissions: ['random'] } as any)).toBe(false);
    expect(isStaffUser(null)).toBe(false);
  });
  it('parseYouTubeId basic', () => {
    expect(parseYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://www.youtube.com/watch?v=vid123')).toBe('vid123');
    expect(parseYouTubeId('https://www.youtube.com/embed/e1')).toBe('e1');
    expect(parseYouTubeId('bad')).toBeNull();
  });
  it('parseYouTubeId live shorts', () => {
    expect(parseYouTubeId('https://www.youtube.com/live/live1')).toBe('live1');
    expect(parseYouTubeId('https://www.youtube.com/shorts/s1')).toBe('s1');
    expect(parseYouTubeId('')).toBeNull();
    expect(parseYouTubeId('https://example.com/watch?v=123')).toBeNull();
  });
});
