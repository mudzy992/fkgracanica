import { describe, expect, it } from 'vitest';
import { pickDefaultParticipation, activeSeasonCompetitions } from './club-participation';
import { mapCalendarSeasons, mapCalendarEditions, pickDefaultEditionId, pickDefaultLeagueSeasonId } from './league-season';
import { computeLiveClock, formatLiveMinute } from './live-clock';
import { hasPermission, isStaffUser } from './permissions';
const p = (o: Partial<import('./club-participation').ClubParticipation> & { yearStart: number; competitionName: string }): import('./club-participation').ClubParticipation => ({ seasonId:'s', seasonName:'n', competitionId:'c', isActive:false, isLeague:false, ...o } as import('./club-participation').ClubParticipation);
describe('mob-batch47 — P-MOB47 club/league/live/permissions', () => {
  it('pickDefaultParticipation prefers active league newest', () => {
    const a = p({ yearStart:2023, competitionName:'A', isActive:true, isLeague:true, seasonId:'a' });
    const b = p({ yearStart:2024, competitionName:'B', isActive:true, isLeague:true, seasonId:'b' });
    const c = p({ yearStart:2025, competitionName:'C', isActive:true, isLeague:false, seasonId:'c' });
    expect(pickDefaultParticipation([a,b,c])?.seasonId).toBe('b');
  });
  it('activeSeasonCompetitions sorts league first', () => {
    const a = p({ yearStart:2024, competitionName:'B', isActive:true, isLeague:false });
    const b = p({ yearStart:2024, competitionName:'A', isActive:true, isLeague:true });
    expect(activeSeasonCompetitions([a,b])[0].isLeague).toBe(true);
  });
  it('mapCalendarSeasons filters', () => {
    expect(mapCalendarSeasons([{id:'1',name:'S',isActive:true},{id:'',name:'x'}])).toHaveLength(1);
  });
  it('mapCalendarEditions sorts', () => {
    const cal = { competitions:[{id:'1',competition:{name:'B',isLeague:false}},{id:'2',competition:{name:'A',isLeague:true}}]};
    expect(mapCalendarEditions(cal)[0].id).toBe('2');
  });
  it('pickDefaultEditionId', () => {
    expect(pickDefaultEditionId([{id:'1',isLeague:false},{id:'2',isLeague:true}], '1')).toBe('1');
    expect(pickDefaultEditionId([{id:'1',isLeague:false},{id:'2',isLeague:true}])).toBe('2');
  });
  it('pickDefaultLeagueSeasonId', () => {
    expect(pickDefaultLeagueSeasonId([{id:'1',isActive:false},{id:'2',isActive:true}])).toBe('2');
  });
  it('computeLiveClock null on not LIVE', () => { expect(computeLiveClock({status:'SCHEDULED',clockStartedAt:new Date().toISOString(),matchPeriod:'FIRST_HALF'})).toBeNull(); });
  it('computeLiveClock FIRST_HALF', () => {
    const start = new Date(Date.now()-65*1000).toISOString();
    const c = computeLiveClock({status:'LIVE',clockStartedAt:start,matchPeriod:'FIRST_HALF',stoppageFirstHalf:2}, Date.now());
    expect(c?.displayMinute).toBeGreaterThanOrEqual(1);
  });
  it('formatLiveMinute stoppage', () => { expect(formatLiveMinute({displayMinute:46,displaySecond:5,periodLabel:'2. poluvrijeme',showStoppage:true,stoppage:3},0)).toContain('+3'); });
  it('hasPermission/isStaffUser', () => {
    const u = { permissions:['users.read'] } as unknown as import('../types/api').User;
    expect(hasPermission(u,'users.read')).toBe(true); expect(hasPermission(null,'x')).toBe(false);
    expect(isStaffUser(u)).toBe(true); expect(isStaffUser({permissions:[]} as unknown as import('../types/api').User)).toBe(false);
  });
  it('formatLiveMinute fallback', () => { expect(formatLiveMinute(null,5)).toBe("5'"); });
});
