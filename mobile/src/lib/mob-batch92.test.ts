import { describe, expect, it } from 'vitest';
import { pickDefaultParticipation, activeSeasonCompetitions, type ClubParticipation } from './club-participation';
import { mapCalendarSeasons, mapCalendarEditions, pickDefaultEditionId, pickDefaultLeagueSeasonId } from './league-season';
import { matchStatusKey, matchMetaLine } from './match-status';
import { canShowTicketQr, canPayOrderOnline, canCancelOrder, canShowSeasonQr } from './ticketing-status';

function cp(over: Partial<ClubParticipation>): ClubParticipation {
  return { seasonId:'s1', seasonName:'2024/25', yearStart:2024, isActive:true, competitionId:'c1', competitionName:'Liga', isLeague:true, ...over } as ClubParticipation;
}

describe('mob-batch92 — P-MOB05 domain parity (test-only)', () => {
  it('pickDefaultParticipation prefers active league newest', () => {
    const items = [cp({yearStart:2023,isActive:true,isLeague:true}), cp({yearStart:2024,isActive:true,isLeague:true}), cp({yearStart:2025,isActive:true,isLeague:false})];
    expect(pickDefaultParticipation(items)?.yearStart).toBe(2024);
  });
  it('pickDefaultParticipation falls back to active when no active league', () => {
    const items = [cp({yearStart:2023,isActive:true,isLeague:false, competitionName:'Kup'}), cp({yearStart:2024,isActive:true,isLeague:false})];
    expect(pickDefaultParticipation(items)?.yearStart).toBe(2024);
  });
  it('pickDefaultParticipation falls back to all when none active', () => {
    const items = [cp({yearStart:2022,isActive:false}), cp({yearStart:2023,isActive:false})];
    expect(pickDefaultParticipation(items)?.yearStart).toBe(2023);
  });
  it('activeSeasonCompetitions sorts league first then name', () => {
    const items = [cp({competitionName:'Kup',isLeague:false, yearStart:2024}), cp({competitionName:'Liga',isLeague:true, yearStart:2024}), cp({competitionName:'A Liga',isLeague:true, yearStart:2024})];
    const names = activeSeasonCompetitions(items).map(v=>v.competitionName);
    expect(names[0]).toBe('A Liga');
    expect(names[1]).toBe('Liga');
    expect(names[2]).toBe('Kup');
  });
  it('mapCalendarSeasons filters without id and defaults name', () => {
    expect(mapCalendarSeasons([{name:'A'},{id:'1',name:'S1',isActive:true}])).toEqual([{id:'1',name:'S1',isActive:true}]);
    expect(mapCalendarSeasons([{id:'2'}])[0].name).toBe('Sezona');
    expect(mapCalendarSeasons(null)).toEqual([]);
  });
  it('mapCalendarEditions sorts league first', () => {
    const cal = { competitions: [{id:'e2',competition:{name:'Kup',isLeague:false}},{id:'e1',competition:{name:'Liga',isLeague:true}}] };
    const eds = mapCalendarEditions(cal);
    expect(eds[0].isLeague).toBe(true);
    expect(eds[0].id).toBe('e1');
    expect(mapCalendarEditions({}).length).toBe(0);
  });
  it('pickDefaultEditionId respects selected and league fallback', () => {
    const eds = [{id:'e1',isLeague:false},{id:'e2',isLeague:true}];
    expect(pickDefaultEditionId(eds,'e1')).toBe('e1');
    expect(pickDefaultEditionId(eds,'missing')).toBe('e2');
    expect(pickDefaultEditionId(eds)).toBe('e2');
    expect(pickDefaultEditionId([])).toBe('');
  });
  it('pickDefaultLeagueSeasonId respects selected and active fallback', () => {
    const seasons = [{id:'s1',isActive:false},{id:'s2',isActive:true}];
    expect(pickDefaultLeagueSeasonId(seasons,'s1')).toBe('s1');
    expect(pickDefaultLeagueSeasonId(seasons)).toBe('s2');
    expect(pickDefaultLeagueSeasonId([])).toBe('');
  });
  it('matchStatusKey maps known and falls back to scheduled', () => {
    expect(matchStatusKey('LIVE')).toBe('matchLive');
    expect(matchStatusKey('HALFTIME')).toBe('matchHalftime');
    expect(matchStatusKey('FINISHED')).toBe('matchFinished');
    expect(matchStatusKey('UNKNOWN')).toBe('matchScheduled');
  });
  it('matchMetaLine joins competition and roundLabel', () => {
    const m = { season:{competition:{name:'Liga'}}, roundRel:{number:5} };
    expect(matchMetaLine(m, n=>`Kolo ${n}`)).toBe('Liga · Kolo 5');
  });
  it('matchMetaLine uses round name when number missing', () => {
    const m = { roundRel:{number:0, name:'Finale'} } as any;
    expect(matchMetaLine(m, n=>`Kolo ${n}`)).toBe('Finale');
  });
  it('matchMetaLine handles missing competition', () => {
    expect(matchMetaLine({}, n=>`Kolo ${n}`)).toBe('');
    expect(matchMetaLine({season:{competition:{name:'L'}}}, n=>`Kolo ${n}`)).toBe('L');
  });
  it('ticketing-status canShowTicketQr / canShowSeasonQr', () => {
    expect(canShowTicketQr('PAID_AT_BOX_OFFICE')).toBe(true);
    expect(canShowTicketQr('RESERVED')).toBe(false);
    expect(canShowSeasonQr('ACTIVE')).toBe(true);
    expect(canShowSeasonQr('EXPIRED')).toBe(false);
  });
  it('canPayOrderOnline requires pending + all RESERVED', () => {
    expect(canPayOrderOnline({status:'pending', tickets:[{status:'RESERVED'},{status:'RESERVED'}]})).toBe(true);
    expect(canPayOrderOnline({status:'pending', tickets:[{status:'RESERVED'},{status:'PAID'}]})).toBe(false);
    expect(canPayOrderOnline({status:'paid', tickets:[{status:'RESERVED'}]})).toBe(false);
    expect(canPayOrderOnline({status:'pending', tickets:[]})).toBe(false);
  });
  it('canCancelOrder only pending', () => {
    expect(canCancelOrder({status:'pending'})).toBe(true);
    expect(canCancelOrder({status:'paid'})).toBe(false);
    expect(canCancelOrder({status:'cancelled'})).toBe(false);
  });
});
