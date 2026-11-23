import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './api-error';
import { activeSeasonCompetitions, pickDefaultParticipation } from './club-participation';
import { mediaUrl } from './media';
import { hasPermission, isStaffUser } from './permissions';
import { parseYouTubeId } from './youtube-id';

describe('mob-batch168 — P-MOB81 api/club/media/permission/youtube (test-only)', () => {
  it('getApiErrorMessage string', () => {
    const err: any = { isAxiosError: true, response: { data: { message: 'Greška servera' } } };
    expect(getApiErrorMessage(err, 'fb')).toBe('Greška servera');
  });
  it('getApiErrorMessage array join', () => {
    const err: any = { isAxiosError: true, response: { data: { message: ['polje1', 'polje2'] } } };
    expect(getApiErrorMessage(err, 'fb')).toBe('polje1, polje2');
  });
  it('getApiErrorMessage error fallback', () => {
    expect(getApiErrorMessage(new Error('boom'), 'fb')).toBe('boom');
    expect(getApiErrorMessage(null, 'fb')).toBe('fb');
    expect(getApiErrorMessage(new Error(''), 'fb')).toBe('fb');
  });
  it('getApiErrorMessage non-string message', () => {
    const err: any = Object.assign(new Error('msg'), { isAxiosError: true, response: { data: { message: 999 } } });
    expect(getApiErrorMessage(err, 'fb')).toBe('msg');
  });
  it('pickDefaultParticipation prefers active league newest', () => {
    const items: any[] = [
      { seasonId: '1', seasonName: 'S', yearStart: 2021, isActive: true, competitionId: 'c1', competitionName: 'Kup', isLeague: false },
      { seasonId: '2', seasonName: 'S', yearStart: 2022, isActive: true, competitionId: 'c2', competitionName: 'Liga', isLeague: true },
      { seasonId: '3', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c3', competitionName: 'Liga 2', isLeague: true },
    ];
    expect(pickDefaultParticipation(items)?.seasonId).toBe('3');
  });
  it('pickDefaultParticipation fallback active then all', () => {
    const active: any[] = [{ seasonId: 'a1', seasonName: 'S', yearStart: 2020, isActive: true, competitionId: 'c1', competitionName: 'Kup', isLeague: false }];
    expect(pickDefaultParticipation(active)?.seasonId).toBe('a1');
    const inactive: any[] = [{ seasonId: 'i1', seasonName: 'S', yearStart: 2019, isActive: false, competitionId: 'c1', competitionName: 'A', isLeague: true }, { seasonId: 'i2', seasonName: 'S', yearStart: 2020, isActive: false, competitionId: 'c2', competitionName: 'B', isLeague: true }];
    expect(pickDefaultParticipation(inactive)?.seasonId).toBe('i2');
    expect(pickDefaultParticipation([])).toBeUndefined();
  });
  it('activeSeasonCompetitions league first', () => {
    const items: any[] = [
      { seasonId: '1', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c1', competitionName: 'Z Kup', isLeague: false },
      { seasonId: '2', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c2', competitionName: 'A Liga', isLeague: true },
    ];
    expect(activeSeasonCompetitions(items)[0].isLeague).toBe(true);
  });
  it('activeSeasonCompetitions fallback sorts league', () => {
    const items: any[] = [{ seasonId: '1', seasonName: 'S', yearStart: 2022, isActive: false, competitionId: 'c1', competitionName: 'B', isLeague: false }, { seasonId: '2', seasonName: 'S', yearStart: 2022, isActive: false, competitionId: 'c2', competitionName: 'A', isLeague: true }];
    const sorted = activeSeasonCompetitions(items);
    expect(sorted[0].isLeague).toBe(true);
  });
  it('mediaUrl null and passthrough', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl('')).toBeNull();
    expect(mediaUrl('https://cdn.example.com/pic.jpg')).toBe('https://cdn.example.com/pic.jpg');
    expect(mediaUrl('http://cdn.example.com/pic.jpg')).toBe('http://cdn.example.com/pic.jpg');
  });
  it('mediaUrl variant conversion', () => {
    expect(mediaUrl('originals/photo.jpg', 'thumb')).toContain('thumbs/photo.webp');
    expect(mediaUrl('originals/photo.jpg', 'medium')).toContain('medium/photo.webp');
    expect(mediaUrl('originals/photo.jpg', 'original')).toContain('originals/photo.jpg');
    expect(mediaUrl('other/photo.jpg', 'thumb')).toContain('other/photo.jpg');
  });
  it('mediaUrl normalizes uploads prefix', () => {
    expect(mediaUrl('uploads/originals/a.jpg', 'thumb')).toContain('thumbs/a.webp');
    expect(mediaUrl('./originals/a.jpg', 'thumb')).toContain('thumbs/a.webp');
  });
  it('hasPermission checks', () => {
    const u: any = { permissions: ['news.manage', 'media.read'] };
    expect(hasPermission(u, 'news.manage')).toBe(true);
    expect(hasPermission(u, 'missing')).toBe(false);
    expect(hasPermission(null, 'x')).toBe(false);
    expect(hasPermission(undefined, 'x')).toBe(false);
  });
  it('isStaffUser detects staff', () => {
    expect(isStaffUser({ permissions: ['gallery.manage'] } as any)).toBe(true);
    expect(isStaffUser({ permissions: ['random'] } as any)).toBe(false);
    expect(isStaffUser(null)).toBe(false);
    expect(isStaffUser({ permissions: [] } as any)).toBe(false);
  });
  it('parseYouTubeId youtu.be and watch', () => {
    expect(parseYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://www.youtube.com/watch?v=abcXYZ123')).toBe('abcXYZ123');
    expect(parseYouTubeId('https://www.youtube.com/embed/xyz789')).toBe('xyz789');
    expect(parseYouTubeId('not-a-url')).toBeNull();
  });
  it('parseYouTubeId live shorts and invalid', () => {
    expect(parseYouTubeId('https://www.youtube.com/live/myLiveId')).toBe('myLiveId');
    expect(parseYouTubeId('https://www.youtube.com/shorts/short1')).toBe('short1');
    expect(parseYouTubeId('')).toBeNull();
    expect(parseYouTubeId('https://example.com/watch?v=123')).toBeNull();
    expect(parseYouTubeId('https://youtube.com/watch?x=1')).toBeNull();
  });
});
