import { describe, expect, it } from 'vitest';
import { parseScheduledAt, toLocalDatetime } from './match-form-datetime';

describe('match-form-datetime', () => {
  it('prazan i neispravan ISO daju prazan unos', () => {
    expect(toLocalDatetime()).toBe('');
    expect(toLocalDatetime('nije-datum')).toBe('');
  });

  it('ispravan ISO se formatira bez sekundi', () => {
    const iso = new Date(2026, 4, 1, 17, 5).toISOString();
    expect(toLocalDatetime(iso)).toBe('2026-05-01T17:05');
  });

  it('neispravan unos ne daje ISO, ispravan daje', () => {
    expect(parseScheduledAt('')).toBeNull();
    expect(parseScheduledAt('nije-datum')).toBeNull();
    expect(parseScheduledAt('2026-05-01T17:05')).toBe(new Date('2026-05-01T17:05').toISOString());
  });
});
