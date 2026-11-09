import { describe, expect, it } from 'vitest';
import { buildClockActions, clockBreakHint } from './clock-actions';

describe('clock-actions — branch48 (2 grane liveBreak ??)', () => {
  it('buildClockActions sa liveBreak undefined pokriva bid0 [46,0] fallback NONE', () => {
    const m = {
      status: 'SCHEDULED',
      liveBreak: undefined,
      matchPeriod: 'FIRST_HALF',
      homeScore: 0,
      awayScore: 0,
    } as never;
    const actions = buildClockActions(m);
    expect(actions.some((a) => a.key === 'start')).toBe(true);
    // i sa liveBreak = NONE eksplicitno
    const m2 = {
      status: 'SCHEDULED',
      liveBreak: 'NONE',
      matchPeriod: 'FIRST_HALF',
      homeScore: 0,
      awayScore: 0,
    } as never;
    expect(buildClockActions(m2).some((a) => a.key === 'start')).toBe(true);
  });

  it('clockBreakHint sa liveBreak undefined pokriva bid21 [38,0] fallback', () => {
    expect(clockBreakHint({ status: 'HALFTIME', liveBreak: undefined } as never)).toBeNull();
    expect(clockBreakHint({ status: 'HALFTIME', liveBreak: 'NONE' } as never)).toBeNull();
    expect(clockBreakHint({ status: 'HALFTIME', liveBreak: 'REGULAR_HT' } as never)).toBeNull();
    expect(clockBreakHint({ status: 'LIVE', liveBreak: 'POST_REGULATION' } as never)).toBeNull();
  });

  it('clockBreakHint različiti breakovi', () => {
    expect(clockBreakHint({ status: 'HALFTIME', liveBreak: 'POST_REGULATION', homeScore: 1, awayScore: 1 } as never)).toBe(
      'Neriješeno',
    );
    expect(clockBreakHint({ status: 'HALFTIME', liveBreak: 'POST_EXTRA', homeScore: 1, awayScore: 1 } as never)).toBe(
      'Neriješeno',
    );
    expect(clockBreakHint({ status: 'HALFTIME', liveBreak: 'ET_HT' } as never)).toBe('Pauza');
    expect(clockBreakHint({ status: 'HALFTIME', liveBreak: 'POST_EXTRA', homeScore: 0, awayScore: 0 } as never)).toBe(
      'Neriješeno',
    );
  });

  it('buildClockActions pokriva ostale grane (pen, et, eth)', () => {
    // HALFTIME POST_REGULATION tied → et
    const et = buildClockActions({
      status: 'HALFTIME',
      liveBreak: 'POST_REGULATION',
      matchPeriod: 'SECOND_HALF',
      homeScore: 1,
      awayScore: 1,
    } as never);
    expect(et.some((a) => a.key === 'et')).toBe(true);

    // LIVE EXTRA_FIRST canExtraHalftime true — treba mock? isTied etc.
    // HALFTIME ET_HT → et2
    const et2 = buildClockActions({
      status: 'HALFTIME',
      liveBreak: 'ET_HT',
      matchPeriod: 'EXTRA_FIRST',
      homeScore: 1,
      awayScore: 1,
    } as never);
    expect(et2.some((a) => a.key === 'et2')).toBe(true);

    // LIVE PENALTIES → penend
    const penend = buildClockActions({
      status: 'LIVE',
      liveBreak: 'NONE',
      matchPeriod: 'PENALTIES',
      homeScore: 1,
      awayScore: 1,
    } as never);
    expect(penend.some((a) => a.key === 'penend')).toBe(true);

    // HALFTIME POST_EXTRA tied → pen
    const pen = buildClockActions({
      status: 'HALFTIME',
      liveBreak: 'POST_EXTRA',
      matchPeriod: 'EXTRA_SECOND',
      homeScore: 2,
      awayScore: 2,
    } as never);
    expect(pen.some((a) => a.key === 'pen')).toBe(true);
  });

  it('LIVE SECOND_HALF isTied true/false', () => {
    const tied = buildClockActions({
      status: 'LIVE',
      liveBreak: 'NONE',
      matchPeriod: 'SECOND_HALF',
      homeScore: 1,
      awayScore: 1,
    } as never);
    expect(tied.some((a) => a.key === 'ft')).toBe(true);

    const notTied = buildClockActions({
      status: 'LIVE',
      liveBreak: 'NONE',
      matchPeriod: 'SECOND_HALF',
      homeScore: 2,
      awayScore: 1,
    } as never);
    expect(notTied.some((a) => a.key === 'end')).toBe(true);
  });
});
