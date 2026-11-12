import { describe, expect, it } from 'vitest';
import { matchShareTitle, matchShareDescription, matchShareImage } from './match-seo';

describe('match-seo — branch45 (2 grane live)', () => {
  it('matchShareTitle live tag i scored', () => {
    const base = { homeClub: { name: 'FK A' } as never, awayClub: { name: 'FK B' } as never, status: 'SCHEDULED' as const, homeScore: 0, awayScore: 0 };
    expect(matchShareTitle(base, false)).toBe('FK A vs FK B');
    expect(matchShareTitle({ ...base, status: 'LIVE', homeScore: 2, awayScore: 1 } as never, false)).toBe('FK A vs FK B 2:1 — LIVE');
    expect(matchShareTitle(base, true)).toBe('FK A vs FK B — LIVE');
    expect(matchShareTitle({ homeClub: null as never, awayClub: null as never, status: 'FINISHED', homeScore: 1, awayScore: 0 } as never)).toBe('Domaći vs Gosti 1:0');
  });

  it('matchShareDescription grane live/finished/scheduled', () => {
    const mBase = {
      homeClub: { name: 'A' } as never,
      awayClub: { name: 'B' } as never,
      status: 'LIVE' as const,
      homeScore: 1,
      awayScore: 1,
      scheduledAt: '2026-11-09T10:00:00.000Z',
      venue: 'Stadion',
      season: { competition: { name: 'Liga' } } as never,
    };
    const m = mBase as never;
    const mFinished = { ...mBase, status: 'FINISHED' as const } as never;
    const mScheduled = { ...mBase, status: 'SCHEDULED' as const } as never;
    expect(matchShareDescription(m, true)).toContain('Uživo');
    expect(matchShareDescription(mFinished, false)).toContain('Konačan rezultat');
    expect(matchShareDescription(mScheduled, false)).toContain('Utakmica uskoro');
    // pokriva fallback ?? 'Domaći'/'Gosti' na linijama 19/20
    const mNull = {
      homeClub: null as never,
      awayClub: null as never,
      status: 'SCHEDULED' as const,
      homeScore: 0,
      awayScore: 0,
      scheduledAt: '2026-11-09T10:00:00.000Z',
      venue: undefined,
      season: undefined,
    } as never;
    expect(matchShareDescription(mNull, false)).toContain('Domaći vs Gosti');
    expect(matchShareImage({ homeClub: null as never, awayClub: null as never } as never, null)).toBeFalsy();
    expect(matchShareImage({ homeClub: { crestPath: 'a' } as never, awayClub: null as never } as never, 'fallback')).toBeTruthy();
  });
});
