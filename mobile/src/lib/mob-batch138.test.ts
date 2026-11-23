import { describe, expect, it } from 'vitest';
import { asArray, asNumber, asRecord, asString } from './content-helpers';
import { flattenSeasonEditions } from './flatten-editions';
import { canCancelOrder, canPayOrderOnline, canShowSeasonQr, canShowTicketQr } from './ticketing-status';
import { matchEventLabelKey } from './match-events';

describe('mob-batch138 — P-MOB51 helpers (test-only)', () => {
  it('asRecord asString asNumber asArray basics', () => {
    expect(asRecord({ a: 1 })).toEqual({ a: 1 });
    expect(asRecord(null)).toEqual({});
    expect(asString('hi')).toBe('hi');
    expect(asString(null as any, 'fb')).toBe('fb');
    expect(asNumber(5)).toBe(5);
    expect(asNumber('x' as any, 7)).toBe(7);
    expect(asArray([1])).toEqual([1]);
    expect(asArray('x' as any)).toEqual([]);
  });
  it('asRecord handles array and symbol', () => {
    const arr = [1, 2];
    expect(asRecord(arr)).toBe(arr);
    expect(asRecord(Symbol('s') as any)).toEqual({});
    expect(asRecord(undefined)).toEqual({});
  });
  it('asString fallback empty', () => {
    expect(asString(undefined as any)).toBe('');
    expect(asString(null as any)).toBe('');
    expect(asString(123 as any, '-')).toBe('-');
  });
  it('asNumber zero and fallback', () => {
    expect(asNumber(0)).toBe(0);
    expect(asNumber(undefined as any)).toBe(0);
    expect(asNumber(null as any, 9)).toBe(9);
  });
  it('asArray null undefined', () => {
    expect(asArray(null as any)).toEqual([]);
    expect(asArray(undefined as any)).toEqual([]);
    expect(asArray([])).toEqual([]);
  });
  it('flattenSeasonEditions maps', () => {
    const data = [{ id: 'cal1', name: '2024/25', competitions: [{ id: 'ed1', competition: { name: 'Premijer' } }] }] as any;
    expect(flattenSeasonEditions(data)[0].name).toBe('Premijer · 2024/25');
  });
  it('flattenSeasonEditions fallback', () => {
    const data = [{ id: 'c1', competitions: [{ id: 'e1', competition: {} }] }] as any;
    expect(flattenSeasonEditions(data)[0].name).toBe('Takmičenje · Sezona');
    expect(flattenSeasonEditions([{ id: 'c1', competitions: [{ competition: { name: 'X' } }] }] as any)).toEqual([]);
  });
  it('flattenSeasonEditions empty', () => {
    expect(flattenSeasonEditions(null)).toEqual([]);
    expect(flattenSeasonEditions([])).toEqual([]);
  });
  it('canShowTicketQr and canShowSeasonQr', () => {
    expect(canShowTicketQr('PAID_AT_BOX_OFFICE')).toBe(true);
    expect(canShowTicketQr('PAID')).toBe(false);
    expect(canShowSeasonQr('ACTIVE')).toBe(true);
    expect(canShowSeasonQr('PENDING')).toBe(false);
  });
  it('canPayOrderOnline pending reserved', () => {
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }] } as any)).toBe(true);
    expect(canPayOrderOnline({ status: 'pending', tickets: [] } as any)).toBe(false);
    expect(canPayOrderOnline({ status: 'paid', tickets: [{ status: 'RESERVED' }] } as any)).toBe(false);
  });
  it('canPayOrderOnline mixed statuses', () => {
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }, { status: 'PAID' }] } as any)).toBe(false);
    expect(canPayOrderOnline({ status: 'pending', tickets: [{ status: 'RESERVED' }, { status: 'RESERVED' }] } as any)).toBe(true);
  });
  it('canCancelOrder pending only', () => {
    expect(canCancelOrder({ status: 'pending' } as any)).toBe(true);
    expect(canCancelOrder({ status: 'paid' } as any)).toBe(false);
    expect(canCancelOrder({ status: '' } as any)).toBe(false);
  });
  it('matchEventLabelKey all', () => {
    expect(matchEventLabelKey('GOAL')).toBe('eventGoal');
    expect(matchEventLabelKey('YELLOW_CARD')).toBe('eventYellow');
    expect(matchEventLabelKey('RED_CARD')).toBe('eventRed');
    expect(matchEventLabelKey('SUBSTITUTION')).toBe('eventSub');
    expect(matchEventLabelKey('UNKNOWN')).toBe('eventOther');
  });
  it('content-helpers edge with 0 and false', () => {
    expect(asString(0 as any, 'fb')).toBe('fb');
    expect(asNumber(false as any, 99)).toBe(99);
    expect(asRecord(false as any)).toEqual({});
    expect(asArray(false as any)).toEqual([]);
  });
  it('flattenSeasonEditions filters empty id across multiple calendars', () => {
    const data = [
      { id: 'c1', name: 'Cal1', competitions: [{ id: 'e1', competition: { name: 'A' } }, { id: '', competition: { name: 'B' } }] },
      { id: 'c2', name: 'Cal2', competitions: [] },
    ] as any;
    expect(flattenSeasonEditions(data)).toHaveLength(1);
    expect(flattenSeasonEditions(data)[0].calendarId).toBe('c1');
  });
});
