import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from './api-error';
import { activeSeasonCompetitions, pickDefaultParticipation } from './club-participation';
import { KPI_LABELS, kpiLabel } from './dashboard-kpi-labels';
import { computeLiveClock, formatLiveMinute } from './live-clock';
import { mediaUrl } from './media';

describe('mob-batch142 — P-MOB55 api-error/club-participation/kpi/media/live-clock (test-only)', () => {
  it('getApiErrorMessage axios string', () => {
    const err: any = { isAxiosError: true, response: { data: { message: 'Greška' } } };
    expect(getApiErrorMessage(err, 'fallback')).toBe('Greška');
  });
  it('getApiErrorMessage axios array join', () => {
    const err: any = { isAxiosError: true, response: { data: { message: ['a', 'b'] } } };
    expect(getApiErrorMessage(err, 'fb')).toBe('a, b');
  });
  it('getApiErrorMessage axios no message falls to Error', () => {
    const err: any = { isAxiosError: true, response: { data: { message: 123 } }, message: 'from err' };
    err.message = 'from err';
    Object.setPrototypeOf(err, Error.prototype);
    expect(getApiErrorMessage(err, 'fb')).toBe('from err');
  });
  it('getApiErrorMessage plain Error and fallback', () => {
    expect(getApiErrorMessage(new Error('boom'), 'fb')).toBe('boom');
    expect(getApiErrorMessage(null, 'fallback')).toBe('fallback');
    expect(getApiErrorMessage(new Error(''), 'fb')).toBe('fb');
  });
  it('pickDefaultParticipation active league newest', () => {
    const items: any[] = [
      { seasonId: '1', seasonName: 'S', yearStart: 2022, isActive: true, competitionId: 'c1', competitionName: 'Cup', isLeague: false },
      { seasonId: '2', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c2', competitionName: 'Premijer', isLeague: true },
      { seasonId: '3', seasonName: 'S', yearStart: 2024, isActive: true, competitionId: 'c3', competitionName: 'Premijer2', isLeague: true },
    ];
    expect(pickDefaultParticipation(items)?.seasonId).toBe('3');
  });
  it('pickDefaultParticipation active non-league fallback', () => {
    const items: any[] = [
      { seasonId: '1', seasonName: 'S', yearStart: 2021, isActive: true, competitionId: 'c1', competitionName: 'Kup', isLeague: false },
      { seasonId: '2', seasonName: 'S', yearStart: 2022, isActive: true, competitionId: 'c2', competitionName: 'Premijer', isLeague: false },
    ];
    expect(pickDefaultParticipation(items)?.seasonId).toBe('2');
  });
  it('pickDefaultParticipation no active falls to all', () => {
    const items: any[] = [
      { seasonId: '1', seasonName: 'S', yearStart: 2020, isActive: false, competitionId: 'c1', competitionName: 'A', isLeague: true },
      { seasonId: '2', seasonName: 'S', yearStart: 2021, isActive: false, competitionId: 'c2', competitionName: 'B', isLeague: true },
    ];
    expect(pickDefaultParticipation(items)?.seasonId).toBe('2');
    expect(pickDefaultParticipation([])).toBeUndefined();
  });
  it('activeSeasonCompetitions sorts league first name', () => {
    const items: any[] = [
      { seasonId: '1', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c1', competitionName: 'Z Cup', isLeague: false },
      { seasonId: '2', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c2', competitionName: 'A Liga', isLeague: true },
      { seasonId: '3', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c3', competitionName: 'B Cup', isLeague: false },
    ];
    const res = activeSeasonCompetitions(items);
    expect(res[0].isLeague).toBe(true);
    expect(res[1].competitionName).toBe('B Cup');
  });
  it('activeSeasonCompetitions no active falls to all', () => {
    const items: any[] = [
      { seasonId: '1', seasonName: 'S', yearStart: 2022, isActive: false, competitionId: 'c1', competitionName: 'A', isLeague: false },
      { seasonId: '2', seasonName: 'S', yearStart: 2022, isActive: false, competitionId: 'c2', competitionName: 'B', isLeague: true },
    ];
    expect(activeSeasonCompetitions(items)[0].isLeague).toBe(true);
  });
  it('kpiLabel known and fallback', () => {
    expect(kpiLabel('users')).toBe('Korisnici');
    expect(kpiLabel('pendingNews')).toBe('Vijesti na odobrenju');
    expect(kpiLabel('unknownKey')).toBe('unknownKey');
    expect(KPI_LABELS.ticketsSold).toBe('Prodane ulaznice');
  });
  it('mediaUrl null and http passthrough', () => {
    expect(mediaUrl(null)).toBeNull();
    expect(mediaUrl('')).toBeNull();
    expect(mediaUrl('https://cdn.example.com/file.jpg')).toBe('https://cdn.example.com/file.jpg');
    expect(mediaUrl('http://cdn.example.com/file.jpg')).toBe('http://cdn.example.com/file.jpg');
  });
  it('mediaUrl variant thumbs webp', () => {
    expect(mediaUrl('originals/photo.jpg', 'thumb')).toContain('thumbs/photo.webp');
    expect(mediaUrl('originals/photo.jpg', 'medium')).toContain('medium/photo.webp');
    expect(mediaUrl('originals/photo.jpg', 'original')).toContain('originals/photo.jpg');
    expect(mediaUrl('other/photo.jpg', 'thumb')).toContain('other/photo.jpg');
  });
  it('computeLiveClock null when not LIVE', () => {
    expect(computeLiveClock({ status: 'SCHEDULED', clockStartedAt: new Date().toISOString(), matchPeriod: 'FIRST_HALF' })).toBeNull();
    expect(computeLiveClock({ status: 'LIVE', clockStartedAt: null, matchPeriod: 'FIRST_HALF' })).toBeNull();
    expect(computeLiveClock({ status: 'LIVE', clockStartedAt: new Date().toISOString(), matchPeriod: 'UNKNOWN' })).toBeNull();
  });
  it('computeLiveClock FIRST_HALF elapsed', () => {
    const start = new Date(Date.now() - 125_000).toISOString();
    const c = computeLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod: 'FIRST_HALF', stoppageFirstHalf: 3 }, Date.now());
    expect(c?.displayMinute).toBe(2);
    expect(c?.displaySecond).toBe(5);
    expect(c?.periodLabel).toBe('1. poluvrijeme');
  });
  it('formatLiveMinute with stoppage and fallback', () => {
    expect(formatLiveMinute(null, 7)).toBe("7'");
    expect(formatLiveMinute({ displayMinute: 46, displaySecond: 5, periodLabel: '2. poluvrijeme', showStoppage: true, stoppage: 4 })).toBe('46:05 (+4)');
    expect(formatLiveMinute({ displayMinute: 46, displaySecond: 5, periodLabel: '2', showStoppage: false, stoppage: 4 })).toBe('46:05');
  });
});
