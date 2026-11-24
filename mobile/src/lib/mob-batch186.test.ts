import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './api-error';
import { activeSeasonCompetitions, pickDefaultParticipation } from './club-participation';
import { mediaUrl } from './media';
import { hasPermission, isStaffUser } from './permissions';
import { parseYouTubeId } from './youtube-id';

describe('mob-batch186 — P-MOB99 api/club/media/permission/youtube (test-only)', () => {
  it('getApiErrorMessage string', () => {
    const err: any = { isAxiosError: true, response: { data: { message: 'Greška' } } };
    expect(getApiErrorMessage(err, 'fb')).toBe('Greška');
  });
  it('getApiErrorMessage array join', () => {
    const err: any = { isAxiosError: true, response: { data: { message: ['x', 'y'] } } };
    expect(getApiErrorMessage(err, 'fb')).toBe('x, y');
  });
  it('getApiErrorMessage fallback Error empty', () => {
    expect(getApiErrorMessage(new Error('boom'), 'fb')).toBe('boom');
    expect(getApiErrorMessage(null, 'fb')).toBe('fb');
    expect(getApiErrorMessage(new Error(''), 'fb')).toBe('fb');
  });
  it('getApiErrorMessage numeric fallback', () => {
    const err: any = Object.assign(new Error('m'), { isAxiosError: true, response: { data: { message: 404 } } });
    expect(getApiErrorMessage(err, 'fb')).toBe('m');
  });
  it('pickDefaultParticipation league newest', () => {
    const items: any[] = [
      { seasonId: '1', seasonName: 'S', yearStart: 2022, isActive: true, competitionId: 'c1', competitionName: 'Cup', isLeague: false },
      { seasonId: '2', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c2', competitionName: 'Liga', isLeague: true },
      { seasonId: '3', seasonName: 'S', yearStart: 2024, isActive: true, competitionId: 'c3', competitionName: 'Liga', isLeague: true },
    ];
    expect(pickDefaultParticipation(items)?.seasonId).toBe('3');
  });
  it('pickDefaultParticipation fallback', () => {
    const a: any[] = [{ seasonId: 'a1', seasonName: 'S', yearStart: 2021, isActive: true, competitionId: 'c1', competitionName: 'Kup', isLeague: false }];
    expect(pickDefaultParticipation(a)?.seasonId).toBe('a1');
    const b: any[] = [{ seasonId: '1', seasonName: 'S', yearStart: 2019, isActive: false, competitionId: 'c1', competitionName: 'A', isLeague: true }, { seasonId: '2', seasonName: 'S', yearStart: 2020, isActive: false, competitionId: 'c2', competitionName: 'B', isLeague: true }];
    expect(pickDefaultParticipation(b)?.seasonId).toBe('2');
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
    expect(mediaUrl('originals/p.jpg', 'thumb')).toContain('thumbs/p.webp');
    expect(mediaUrl('originals/p.jpg', 'medium')).toContain('medium/p.webp');
    expect(mediaUrl('originals/p.jpg', 'original')).toContain('originals/p.jpg');
    expect(mediaUrl('other/p.jpg', 'thumb')).toContain('other/p.jpg');
  });
  it('mediaUrl uploads dot slash', () => {
    expect(mediaUrl('uploads/originals/a.jpg', 'thumb')).toContain('thumbs/a.webp');
    expect(mediaUrl('./originals/a.jpg', 'thumb')).toContain('thumbs/a.webp');
  });
  it('hasPermission true false', () => {
    const u: any = { permissions: ['news.manage', 'media.read'] };
    expect(hasPermission(u, 'news.manage')).toBe(true);
    expect(hasPermission(u, 'x')).toBe(false);
    expect(hasPermission(null, 'x')).toBe(false);
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
    expect(parseYouTubeId('bad url')).toBeNull();
  });
  it('parseYouTubeId live shorts', () => {
    expect(parseYouTubeId('https://www.youtube.com/live/liveId')).toBe('liveId');
    expect(parseYouTubeId('https://www.youtube.com/shorts/s1')).toBe('s1');
    expect(parseYouTubeId('')).toBeNull();
    expect(parseYouTubeId('https://example.com/watch?v=123')).toBeNull();
  });
});
