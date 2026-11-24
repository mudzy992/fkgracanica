import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './api-error';
import { activeSeasonCompetitions, pickDefaultParticipation } from './club-participation';
import { mediaUrl } from './media';
import { hasPermission, isStaffUser } from './permissions';
import { parseYouTubeId } from './youtube-id';

describe('mob-batch177 — P-MOB90 api/club/media/permission/youtube (test-only)', () => {
  it('getApiErrorMessage string', () => {
    const err: any = { isAxiosError: true, response: { data: { message: 'Server error' } } };
    expect(getApiErrorMessage(err, 'fb')).toBe('Server error');
  });
  it('getApiErrorMessage array', () => {
    const err: any = { isAxiosError: true, response: { data: { message: ['a', 'b', 'c'] } } };
    expect(getApiErrorMessage(err, 'fb')).toBe('a, b, c');
  });
  it('getApiErrorMessage fallback Error', () => {
    expect(getApiErrorMessage(new Error('boom'), 'fb')).toBe('boom');
    expect(getApiErrorMessage(null, 'fb')).toBe('fb');
    expect(getApiErrorMessage(new Error(''), 'fb')).toBe('fb');
  });
  it('getApiErrorMessage numeric fallback', () => {
    const err: any = Object.assign(new Error('inner'), { isAxiosError: true, response: { data: { message: 999 } } });
    expect(getApiErrorMessage(err, 'fb')).toBe('inner');
  });
  it('pickDefaultParticipation league newest active', () => {
    const items: any[] = [
      { seasonId: '1', seasonName: 'S', yearStart: 2020, isActive: true, competitionId: 'c1', competitionName: 'Kup', isLeague: false },
      { seasonId: '2', seasonName: 'S', yearStart: 2021, isActive: true, competitionId: 'c2', competitionName: 'Liga', isLeague: true },
      { seasonId: '3', seasonName: 'S', yearStart: 2022, isActive: true, competitionId: 'c3', competitionName: 'Liga', isLeague: true },
    ];
    expect(pickDefaultParticipation(items)?.seasonId).toBe('3');
  });
  it('pickDefaultParticipation fallback', () => {
    const single: any[] = [{ seasonId: 'x', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c', competitionName: 'Kup', isLeague: false }];
    expect(pickDefaultParticipation(single)?.seasonId).toBe('x');
    const inactive: any[] = [{ seasonId: 'i1', seasonName: 'S', yearStart: 2018, isActive: false, competitionId: 'c1', competitionName: 'A', isLeague: true }, { seasonId: 'i2', seasonName: 'S', yearStart: 2019, isActive: false, competitionId: 'c2', competitionName: 'B', isLeague: true }];
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
  it('activeSeasonCompetitions fallback', () => {
    const items: any[] = [{ seasonId: '1', seasonName: 'S', yearStart: 2022, isActive: false, competitionId: 'c1', competitionName: 'B', isLeague: false }, { seasonId: '2', seasonName: 'S', yearStart: 2022, isActive: false, competitionId: 'c2', competitionName: 'A', isLeague: true }];
    expect(activeSeasonCompetitions(items)[0].isLeague).toBe(true);
  });
  it('mediaUrl null and http', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl('')).toBeNull();
    expect(mediaUrl('https://cdn.example.com/file.jpg')).toBe('https://cdn.example.com/file.jpg');
  });
  it('mediaUrl variant conversion', () => {
    expect(mediaUrl('originals/x.jpg', 'thumb')).toContain('thumbs/x.webp');
    expect(mediaUrl('originals/x.jpg', 'medium')).toContain('medium/x.webp');
    expect(mediaUrl('originals/x.jpg', 'original')).toContain('originals/x.jpg');
    expect(mediaUrl('other/x.jpg', 'thumb')).toContain('other/x.jpg');
  });
  it('mediaUrl uploads normalization', () => {
    expect(mediaUrl('uploads/originals/y.jpg', 'thumb')).toContain('thumbs/y.webp');
    expect(mediaUrl('./originals/y.jpg', 'thumb')).toContain('thumbs/y.webp');
  });
  it('hasPermission checks', () => {
    const u: any = { permissions: ['media.read'] };
    expect(hasPermission(u, 'media.read')).toBe(true);
    expect(hasPermission(u, 'missing')).toBe(false);
    expect(hasPermission(null, 'x')).toBe(false);
  });
  it('isStaffUser', () => {
    expect(isStaffUser({ permissions: ['analytics.read'] } as any)).toBe(true);
    expect(isStaffUser({ permissions: ['random'] } as any)).toBe(false);
    expect(isStaffUser(null)).toBe(false);
    expect(isStaffUser({ permissions: [] } as any)).toBe(false);
  });
  it('parseYouTubeId variants', () => {
    expect(parseYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://www.youtube.com/watch?v=abc123')).toBe('abc123');
    expect(parseYouTubeId('https://www.youtube.com/embed/xyz123')).toBe('xyz123');
    expect(parseYouTubeId('oops')).toBeNull();
  });
  it('parseYouTubeId live shorts invalid', () => {
    expect(parseYouTubeId('https://www.youtube.com/live/liveId123')).toBe('liveId123');
    expect(parseYouTubeId('https://www.youtube.com/shorts/short1')).toBe('short1');
    expect(parseYouTubeId('')).toBeNull();
    expect(parseYouTubeId('https://example.com/watch?v=123')).toBeNull();
  });
});
