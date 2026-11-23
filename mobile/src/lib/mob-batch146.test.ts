import { describe, expect, it } from 'vitest';
import { activeSeasonCompetitions, pickDefaultParticipation } from './club-participation';
import { KPI_LABELS, kpiLabel } from './dashboard-kpi-labels';
import { computeLiveClock, formatLiveMinute } from './live-clock';
import { matchEventLabelKey } from './match-events';
import { matchMetaLine, matchStatusKey } from './match-status';

describe('mob-batch146 — P-MOB59 kpi/live/match/club (test-only)', () => {
  it('kpiLabel known and fallback', () => {
    expect(kpiLabel('users')).toBe('Korisnici');
    expect(kpiLabel('ticketsSold')).toBe('Prodane ulaznice');
    expect(kpiLabel('unknown')).toBe('unknown');
    expect(KPI_LABELS.pendingNews).toBe('Vijesti na odobrenju');
  });
  it('kpiLabel all staff', () => {
    expect(kpiLabel('pendingGalleries')).toBe('Galerije na odobrenju');
    expect(kpiLabel('uniqueVisitorsTotal30d')).toBe('Ukupni posjetioci (30d)');
    expect(Object.keys(KPI_LABELS).length).toBeGreaterThan(10);
  });
  it('computeLiveClock null', () => {
    expect(computeLiveClock({ status: 'SCHEDULED', clockStartedAt: new Date().toISOString(), matchPeriod: 'FIRST_HALF' })).toBeNull();
    expect(computeLiveClock({ status: 'LIVE', clockStartedAt: null, matchPeriod: 'FIRST_HALF' })).toBeNull();
    expect(computeLiveClock({ status: 'LIVE', clockStartedAt: new Date().toISOString(), matchPeriod: 'FOO' })).toBeNull();
  });
  it('computeLiveClock FIRST_HALF', () => {
    const start = new Date(Date.now() - 90_000).toISOString();
    const c = computeLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod: 'FIRST_HALF' }, Date.now());
    expect(c?.displayMinute).toBe(1);
    expect(c?.periodLabel).toBe('1. poluvrijeme');
    expect(c?.displaySecond).toBe(30);
  });
  it('computeLiveClock SECOND_HALF with stoppage', () => {
    const start = new Date(Date.now() - 46 * 60_000).toISOString();
    const c = computeLiveClock({ status: 'LIVE', clockStartedAt: start, matchPeriod: 'SECOND_HALF', stoppageSecondHalf: 5 }, Date.now());
    expect(c?.displayMinute).toBeGreaterThan(90);
    expect(c?.showStoppage).toBe(true);
    expect(c?.stoppage).toBe(5);
  });
  it('formatLiveMinute', () => {
    expect(formatLiveMinute(null, 7)).toBe("7'");
    expect(formatLiveMinute({ displayMinute: 46, displaySecond: 5, periodLabel: '2', showStoppage: true, stoppage: 4 })).toBe('46:05 (+4)');
    expect(formatLiveMinute({ displayMinute: 10, displaySecond: 0, periodLabel: '1', showStoppage: false, stoppage: 0 })).toBe('10:00');
  });
  it('matchEventLabelKey known', () => {
    expect(matchEventLabelKey('GOAL')).toBe('eventGoal');
    expect(matchEventLabelKey('YELLOW_CARD')).toBe('eventYellow');
    expect(matchEventLabelKey('RED_CARD')).toBe('eventRed');
    expect(matchEventLabelKey('SUBSTITUTION')).toBe('eventSub');
  });
  it('matchEventLabelKey fallback', () => {
    expect(matchEventLabelKey('KICKOFF')).toBe('eventKickoff');
    expect(matchEventLabelKey('HALFTIME')).toBe('eventHalftime');
    expect(matchEventLabelKey('FULL_TIME')).toBe('eventFullTime');
    expect(matchEventLabelKey('UNKNOWN')).toBe('eventOther');
    expect(matchEventLabelKey('')).toBe('eventOther');
  });
  it('matchStatusKey', () => {
    expect(matchStatusKey('LIVE')).toBe('matchLive');
    expect(matchStatusKey('FINISHED')).toBe('matchFinished');
    expect(matchStatusKey('CANCELLED')).toBe('matchCancelled');
    expect(matchStatusKey('weird')).toBe('matchScheduled');
  });
  it('matchMetaLine', () => {
    expect(matchMetaLine({ season: { competition: { name: 'Premijer' } }, roundRel: { number: 3, name: 'Kolo 3' } }, (n) => `Kolo ${n}`)).toBe('Premijer · Kolo 3');
    expect(matchMetaLine({ roundRel: { number: 0, name: 'Custom' } }, (n) => `Kolo ${n}`)).toBe('Custom');
    expect(matchMetaLine({}, (n) => `Kolo ${n}`)).toBe('');
  });
  it('pickDefaultParticipation league newest', () => {
    const items: any[] = [
      { seasonId: '1', seasonName: 'S', yearStart: 2022, isActive: true, competitionId: 'c1', competitionName: 'Cup', isLeague: false },
      { seasonId: '2', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c2', competitionName: 'Liga', isLeague: true },
      { seasonId: '3', seasonName: 'S', yearStart: 2024, isActive: true, competitionId: 'c3', competitionName: 'Liga', isLeague: true },
    ];
    expect(pickDefaultParticipation(items)?.seasonId).toBe('3');
  });
  it('pickDefaultParticipation fallback active then all', () => {
    const a: any[] = [{ seasonId: '1', seasonName: 'S', yearStart: 2021, isActive: true, competitionId: 'c1', competitionName: 'Kup', isLeague: false }];
    expect(pickDefaultParticipation(a)?.seasonId).toBe('1');
    const b: any[] = [{ seasonId: '1', seasonName: 'S', yearStart: 2020, isActive: false, competitionId: 'c1', competitionName: 'A', isLeague: true }, { seasonId: '2', seasonName: 'S', yearStart: 2021, isActive: false, competitionId: 'c2', competitionName: 'B', isLeague: true }];
    expect(pickDefaultParticipation(b)?.seasonId).toBe('2');
    expect(pickDefaultParticipation([])).toBeUndefined();
  });
  it('activeSeasonCompetitions league first', () => {
    const items: any[] = [
      { seasonId: '1', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c1', competitionName: 'Z Cup', isLeague: false },
      { seasonId: '2', seasonName: 'S', yearStart: 2023, isActive: true, competitionId: 'c2', competitionName: 'A Liga', isLeague: true },
    ];
    const res = activeSeasonCompetitions(items);
    expect(res[0].isLeague).toBe(true);
  });
  it('activeSeasonCompetitions no active', () => {
    const items: any[] = [{ seasonId: '1', seasonName: 'S', yearStart: 2022, isActive: false, competitionId: 'c1', competitionName: 'B', isLeague: false }, { seasonId: '2', seasonName: 'S', yearStart: 2022, isActive: false, competitionId: 'c2', competitionName: 'A', isLeague: true }];
    expect(activeSeasonCompetitions(items)[0].isLeague).toBe(true);
  });
  it('matchStatusKey all statuses', () => {
    expect(matchStatusKey('HALFTIME')).toBe('matchHalftime');
    expect(matchStatusKey('SCHEDULED')).toBe('matchScheduled');
    expect(matchStatusKey('POSTPONED')).toBe('matchPostponed');
  });
});
