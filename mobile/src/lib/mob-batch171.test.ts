import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './api-error';
import { activeSeasonCompetitions, pickDefaultParticipation } from './club-participation';
import { mediaUrl } from './media';
import { hasPermission, isStaffUser } from './permissions';
import { parseYouTubeId } from './youtube-id';

describe('mob-batch171 — P-MOB84 api/club/media/permission/youtube (test-only)', () => {
  it('getApiErrorMessage string direct', () => {
    const err: any = { isAxiosError: true, response: { data: { message: 'Oops' } } };
    expect(getApiErrorMessage(err, 'fb')).toBe('Oops');
  });
  it('getApiErrorMessage array', () => {
    const err: any = { isAxiosError: true, response: { data: { message: ['x', 'y', 'z'] } } };
    expect(getApiErrorMessage(err, 'fb')).toBe('x, y, z');
  });
  it('getApiErrorMessage fallback Error', () => {
    expect(getApiErrorMessage(new Error('boom'), 'fallback')).toBe('boom');
    expect(getApiErrorMessage(null, 'fallback')).toBe('fallback');
    expect(getApiErrorMessage(new Error(''), 'fallback')).toBe('fallback');
  });
  it('getApiErrorMessage numeric message fallback', () => {
    const err: any = Object.assign(new Error('inner'), { isAxiosError: true, response: { data: { message: 42 } } });
    expect(getApiErrorMessage(err, 'fb')).toBe('inner');
  });
  it('pickDefaultParticipation league newest', () => {
    const items: any[] = [
      { seasonId: '1', seasonName: 'S', yearStart: 2020, isActive: true, competitionId: 'c1', competitionName: 'Kup', isLeague: false },
      { seasonId: '2', seasonName: 'S', yearStart: 2021, isActive: true, competitionId: 'c2', competitionName: 'Liga', isLeague: true },
      { seasonId: '3', seasonName: 'S', yearStart: 2022, isActive: true, competitionId: 'c3', competitionName: 'Liga', isLeague: true },
    ];
    expect(pickDefaultParticipation(items)?.seasonId).toBe('3');
  });
  it('pickDefaultParticipation active vs inactive', () => {
    const single: any[] = [{ seasonId: 'a', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c', competitionName: 'Kup', isLeague: false }];
    expect(pickDefaultParticipation(single)?.seasonId).toBe('a');
    const inactive: any[] = [{ seasonId: 'i1', seasonName: 'S', yearStart: 2018, isActive: false, competitionId: 'c1', competitionName: 'X', isLeague: true }, { seasonId: 'i2', seasonName: 'S', yearStart: 2019, isActive: false, competitionId: 'c2', competitionName: 'Y', isLeague: true }];
    expect(pickDefaultParticipation(inactive)?.seasonId).toBe('i2');
    expect(pickDefaultParticipation([])).toBeUndefined();
  });
  it('activeSeasonCompetitions sorts league first', () => {
    const items: any[] = [
      { seasonId: '1', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c1', competitionName: 'Z Kup', isLeague: false },
      { seasonId: '2', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c2', competitionName: 'A Liga', isLeague: true },
    ];
    const sorted = activeSeasonCompetitions(items);
    expect(sorted[0].isLeague).toBe(true);
    expect(sorted[1].competitionName).toBe('Z Kup');
  });
  it('activeSeasonCompetitions fallback when no active', () => {
    const items: any[] = [{ seasonId: '1', seasonName: 'S', yearStart: 2022, isActive: false, competitionId: 'c1', competitionName: 'B', isLeague: false }, { seasonId: '2', seasonName: 'S', yearStart: 2022, isActive: false, competitionId: 'c2', competitionName: 'A', isLeague: true }];
    expect(activeSeasonCompetitions(items)[0].isLeague).toBe(true);
  });
  it('mediaUrl null http passthrough', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl('')).toBeNull();
    expect(mediaUrl('https://example.com/img.jpg')).toBe('https://example.com/img.jpg');
  });
  it('mediaUrl variant paths', () => {
    expect(mediaUrl('originals/a.jpg', 'thumb')).toContain('thumbs/a.webp');
    expect(mediaUrl('originals/a.jpg', 'medium')).toContain('medium/a.webp');
    expect(mediaUrl('originals/a.jpg', 'original')).toContain('originals/a.jpg');
    expect(mediaUrl('other/a.jpg', 'thumb')).toContain('other/a.jpg');
  });
  it('mediaUrl upload normalization', () => {
    expect(mediaUrl('uploads/originals/b.png', 'thumb')).toContain('thumbs/b.webp');
    expect(mediaUrl('./originals/b.png', 'medium')).toContain('medium/b.webp');
  });
  it('hasPermission true false null', () => {
    const u: any = { permissions: ['news.manage'] };
    expect(hasPermission(u, 'news.manage')).toBe(true);
    expect(hasPermission(u, 'other')).toBe(false);
    expect(hasPermission(null, 'x')).toBe(false);
  });
  it('isStaffUser staff detection', () => {
    expect(isStaffUser({ permissions: ['dashboard.read'] } as any)).toBe(true);
    expect(isStaffUser({ permissions: ['nestaff'] } as any)).toBe(false);
    expect(isStaffUser(null)).toBe(false);
    expect(isStaffUser({ permissions: [] } as any)).toBe(false);
  });
  it('parseYouTubeId basic', () => {
    expect(parseYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://www.youtube.com/watch?v=test123')).toBe('test123');
    expect(parseYouTubeId('https://www.youtube.com/embed/emb123')).toBe('emb123');
    expect(parseYouTubeId('blabla')).toBeNull();
  });
  it('parseYouTubeId live shorts invalid', () => {
    expect(parseYouTubeId('https://www.youtube.com/live/liveABC')).toBe('liveABC');
    expect(parseYouTubeId('https://www.youtube.com/shorts/shortXYZ')).toBe('shortXYZ');
    expect(parseYouTubeId('')).toBeNull();
    expect(parseYouTubeId('https://example.com/watch?v=123')).toBeNull();
  });
});
