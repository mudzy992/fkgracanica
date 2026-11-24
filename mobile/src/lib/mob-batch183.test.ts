import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './api-error';
import { activeSeasonCompetitions, pickDefaultParticipation } from './club-participation';
import { mediaUrl } from './media';
import { hasPermission, isStaffUser } from './permissions';
import { parseYouTubeId } from './youtube-id';

describe('mob-batch183 — P-MOB96 api/club/media/permission/youtube (test-only)', () => {
  it('getApiErrorMessage string', () => {
    const err: any = { isAxiosError: true, response: { data: { message: 'Fehler' } } };
    expect(getApiErrorMessage(err, 'fb')).toBe('Fehler');
  });
  it('getApiErrorMessage array', () => {
    const err: any = { isAxiosError: true, response: { data: { message: ['e1', 'e2'] } } };
    expect(getApiErrorMessage(err, 'fb')).toBe('e1, e2');
  });
  it('getApiErrorMessage fallback', () => {
    expect(getApiErrorMessage(new Error('boom'), 'fb')).toBe('boom');
    expect(getApiErrorMessage(null, 'fb')).toBe('fb');
    expect(getApiErrorMessage(new Error(''), 'fb')).toBe('fb');
  });
  it('getApiErrorMessage numeric fallback', () => {
    const err: any = Object.assign(new Error('inner'), { isAxiosError: true, response: { data: { message: 123 } } });
    expect(getApiErrorMessage(err, 'fb')).toBe('inner');
  });
  it('pickDefaultParticipation league newest', () => {
    const items: any[] = [
      { seasonId: '1', seasonName: 'S', yearStart: 2021, isActive: true, competitionId: 'c1', competitionName: 'Cup', isLeague: false },
      { seasonId: '2', seasonName: 'S', yearStart: 2022, isActive: true, competitionId: 'c2', competitionName: 'Liga', isLeague: true },
      { seasonId: '3', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c3', competitionName: 'Liga', isLeague: true },
    ];
    expect(pickDefaultParticipation(items)?.seasonId).toBe('3');
  });
  it('pickDefaultParticipation fallback', () => {
    const a: any[] = [{ seasonId: 'a', seasonName: 'S', yearStart: 2020, isActive: true, competitionId: 'c', competitionName: 'Kup', isLeague: false }];
    expect(pickDefaultParticipation(a)?.seasonId).toBe('a');
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
  it('activeSeasonCompetitions fallback no active', () => {
    const items: any[] = [{ seasonId: '1', seasonName: 'S', yearStart: 2022, isActive: false, competitionId: 'c1', competitionName: 'B', isLeague: false }, { seasonId: '2', seasonName: 'S', yearStart: 2022, isActive: false, competitionId: 'c2', competitionName: 'A', isLeague: true }];
    expect(activeSeasonCompetitions(items)[0].isLeague).toBe(true);
  });
  it('mediaUrl null http passthrough', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl('')).toBeNull();
    expect(mediaUrl('https://example.com/a.jpg')).toBe('https://example.com/a.jpg');
  });
  it('mediaUrl variants', () => {
    expect(mediaUrl('originals/p.jpg', 'thumb')).toContain('thumbs/p.webp');
    expect(mediaUrl('originals/p.jpg', 'medium')).toContain('medium/p.webp');
    expect(mediaUrl('originals/p.jpg', 'original')).toContain('originals/p.jpg');
    expect(mediaUrl('other/p.jpg', 'thumb')).toContain('other/p.jpg');
  });
  it('mediaUrl uploads', () => {
    expect(mediaUrl('uploads/originals/a.jpg', 'thumb')).toContain('thumbs/a.webp');
    expect(mediaUrl('./originals/a.jpg', 'thumb')).toContain('thumbs/a.webp');
  });
  it('hasPermission', () => {
    const u: any = { permissions: ['news.manage'] };
    expect(hasPermission(u, 'news.manage')).toBe(true);
    expect(hasPermission(u, 'no')).toBe(false);
    expect(hasPermission(null, 'x')).toBe(false);
  });
  it('isStaffUser', () => {
    expect(isStaffUser({ permissions: ['gallery.manage'] } as any)).toBe(true);
    expect(isStaffUser({ permissions: ['random'] } as any)).toBe(false);
    expect(isStaffUser(null)).toBe(false);
  });
  it('parseYouTubeId basic', () => {
    expect(parseYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(parseYouTubeId('https://www.youtube.com/watch?v=vid999')).toBe('vid999');
    expect(parseYouTubeId('https://www.youtube.com/embed/emb1')).toBe('emb1');
    expect(parseYouTubeId('bad url')).toBeNull();
  });
  it('parseYouTubeId live shorts', () => {
    expect(parseYouTubeId('https://www.youtube.com/live/liveXYZ')).toBe('liveXYZ');
    expect(parseYouTubeId('https://www.youtube.com/shorts/sh1')).toBe('sh1');
    expect(parseYouTubeId('')).toBeNull();
    expect(parseYouTubeId('https://example.com/watch?v=123')).toBeNull();
  });
});
