import { describe, expect, it } from 'vitest';
import { matchEventLabelKey } from './match-events';
import { canShowTicketQr, canShowSeasonQr } from './ticketing-status';
import { stripHtml } from './html-text';
describe('mob-batch46 — P-MOB46 match-event/ticket', () => {
  it('matchEventLabelKey', () => {
    expect(matchEventLabelKey('GOAL')).toBe('eventGoal'); expect(matchEventLabelKey('YELLOW_CARD')).toBe('eventYellow');
    expect(matchEventLabelKey('RED_CARD')).toBe('eventRed'); expect(matchEventLabelKey('SUBSTITUTION')).toBe('eventSub');
    expect(matchEventLabelKey('unknown')).toBe('eventOther');
  });
  it('canShowTicketQr', () => { expect(canShowTicketQr('PAID_AT_BOX_OFFICE')).toBe(true); expect(canShowTicketQr('OTHER')).toBe(false); });
  it('canShowSeasonQr', () => { expect(canShowSeasonQr('ACTIVE')).toBe(true); expect(canShowSeasonQr('INACTIVE')).toBe(false); });
  it('stripHtml basic', () => { expect(stripHtml('<p>hi</p>')).toBe('hi'); });
  it('stripHtml entities', () => { expect(stripHtml('&amp;')).toBe('&'); });
  it('stripHtml br', () => { expect(stripHtml('a<br>b')).toContain('a'); });
  it('matchEventLabelKey KICKOFF', () => { expect(matchEventLabelKey('KICKOFF')).toBe('eventKickoff'); });
  it('matchEventLabelKey HALFTIME', () => { expect(matchEventLabelKey('HALFTIME')).toBe('eventHalftime'); });
  it('matchEventLabelKey FULL_TIME', () => { expect(matchEventLabelKey('FULL_TIME')).toBe('eventFullTime'); });
  it('stripHtml empty', () => { expect(stripHtml('')).toBe(''); });
  it('canShowTicketQr case', () => { expect(canShowTicketQr('PAID_AT_BOX_OFFICE')).toBe(true); });
});
