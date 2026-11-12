import { describe, expect, it } from 'vitest';
import { matchShareDescription, matchShareImage, matchShareTitle } from './match-seo';
import type { Match } from '../types';

const base: Match = {
  id: 'm1',
  scheduledAt: '2026-03-15T15:00:00.000Z',
  homeScore: 2,
  awayScore: 1,
  status: 'SCHEDULED',
  homeClub: { id: 'c1', name: 'Domaći', crestPath: '/uploads/domaci.png', logoPath: null },
  awayClub: { id: 'c2', name: 'Gosti', crestPath: null, logoPath: '/uploads/gosti.png' },
  venue: 'Gradski stadion',
  season: { competition: { name: 'Liga' } },
} as unknown as Match;

const match = (patch: Partial<Match>) => ({ ...base, ...patch }) as Match;

describe('matchShareTitle', () => {
  it('zakazana utakmica nema rezultat ni LIVE oznaku', () => {
    expect(matchShareTitle(base)).toBe('Domaći vs Gosti');
  });

  it('završena prikazuje konačan rezultat, a LIVE se označava', () => {
    expect(matchShareTitle(match({ status: 'FINISHED' }))).toBe('Domaći vs Gosti 2:1');
    expect(matchShareTitle(match({ status: 'LIVE' }))).toBe('Domaći vs Gosti 2:1 — LIVE');
    expect(matchShareTitle(match({ status: 'HALFTIME' }))).toBe('Domaći vs Gosti 2:1 — LIVE');
  });

  it('live zastavica važi i za zakazanu utakmicu, a nedostajući klubovi imaju zamjenske nazive', () => {
    expect(matchShareTitle(base, true)).toBe('Domaći vs Gosti — LIVE');
    expect(matchShareTitle(match({ homeClub: undefined, awayClub: undefined }))).toBe('Domaći vs Gosti');
  });

  it('otkazana utakmica ne prikazuje rezultat', () => {
    expect(matchShareTitle(match({ status: 'CANCELLED' }))).toBe('Domaći vs Gosti');
  });
});

describe('matchShareDescription', () => {
  it('spaja domaćina, vrijeme, stadion i takmičenje', () => {
    const text = matchShareDescription(base);
    expect(text).toContain('Domaći vs Gosti');
    expect(text).toContain('Gradski stadion');
    expect(text).toContain('Liga');
    expect(text).toContain('Utakmica uskoro');
    expect(text).not.toContain('Konačan rezultat');
  });

  it('uživo i završeno dodaju rezultat, a bez podataka nema praznih segmenata', () => {
    expect(matchShareDescription(match({ status: 'LIVE' }))).toContain('Uživo 2:1');
    expect(matchShareDescription(base, true)).toContain('Uživo 2:1');
    expect(matchShareDescription(match({ status: 'FINISHED' }))).toContain('Konačan rezultat 2:1');
    const text = matchShareDescription(match({ venue: undefined, season: undefined, status: 'POSTPONED' }));
    expect(text.startsWith('Domaći vs Gosti · ')).toBe(true);
    expect(text).not.toContain('·  ·');
  });

  it('dugi opis se skraćuje na najviše 160 znakova', () => {
    const text = matchShareDescription(match({ venue: 'V'.repeat(200) }));
    expect(text.length).toBeLessThanOrEqual(160);
    expect(text.endsWith('…')).toBe(true);
  });
});

describe('matchShareImage', () => {
  it('prvo koristi grb domaćina, pa gostiju, pa rezervnu putanju', () => {
    expect(matchShareImage(base)).toContain('domaci');
    const awayOnly = match({ homeClub: { ...base.homeClub!, crestPath: null, logoPath: null } });
    expect(matchShareImage(awayOnly)).toContain('gosti');
    const none = match({ homeClub: undefined, awayClub: undefined });
    expect(matchShareImage(none, '/uploads/rezerva.png')).toContain('rezerva');
    expect(matchShareImage(none)).toBeUndefined();
  });
});
