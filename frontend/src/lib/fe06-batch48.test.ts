import { describe, expect, it, vi } from 'vitest';
import { isPastDatetime, isRetrospectiveMatch } from './match-retrospective';
import { resolveClubVenue } from './club-venue';
import { canSendManualStatus, clampScore, editableStatuses, matchStatusOptions } from '../pages/admin/competition-hub/match-form-status';

describe('fe06-batch48 — 99.14%→99.5% (+25 grana)', () => {
  it('resolveClubVenue: prazan club vraća prazan string (fallback)', () => {
    expect(resolveClubVenue(undefined)).toBe('');
    expect(resolveClubVenue(null)).toBe('');
    expect(resolveClubVenue({} as never)).toBe('');
  });
  it('resolveClubVenue: vraća stadiumRel.name kad postoji', () => {
    expect(resolveClubVenue({ stadiumRel: { name: '  Arena A  ' } } as never)).toBe('Arena A');
  });
  it('resolveClubVenue: stadiumRel prazan pa fallback na stadium', () => {
    expect(resolveClubVenue({ stadiumRel: { name: '   ' }, stadium: '  Stadion  ' } as never)).toBe('Stadion');
    expect(resolveClubVenue({ stadium: '  Stadion B  ' } as never)).toBe('Stadion B');
  });
  it('resolveClubVenue: oba prazna vraća prazan string', () => {
    expect(resolveClubVenue({ stadiumRel: { name: ' ' }, stadium: '   ' } as never)).toBe('');
  });
  it('isPastDatetime: neispravan datum vraća false (NaN grana)', () => {
    expect(isPastDatetime('not-a-date')).toBe(false);
    expect(isPastDatetime('')).toBe(false);
  });
  it('isPastDatetime: prošli datum vraća true', () => {
    const past = new Date(Date.now() - 120_000).toISOString();
    expect(isPastDatetime(past)).toBe(true);
  });
  it('isPastDatetime: budući datum vraća false', () => {
    const future = new Date(Date.now() + 120_000).toISOString();
    expect(isPastDatetime(future)).toBe(false);
  });
  it('isPastDatetime: datum unutar 60s vraća false (granica)', () => {
    const recent = new Date(Date.now() - 30_000).toISOString();
    expect(isPastDatetime(recent)).toBe(false);
  });
  it('isRetrospectiveMatch: FINISHED bez clock i ne APPROVED => true', () => {
    expect(isRetrospectiveMatch({ status: 'FINISHED', clockStartedAt: null, reportStatus: 'PENDING' } as never)).toBe(true);
  });
  it('isRetrospectiveMatch: status nije FINISHED => false', () => {
    expect(isRetrospectiveMatch({ status: 'LIVE', clockStartedAt: null, reportStatus: 'PENDING' } as never)).toBe(false);
    expect(isRetrospectiveMatch({ status: 'SCHEDULED', clockStartedAt: null, reportStatus: 'PENDING' } as never)).toBe(false);
  });
  it('isRetrospectiveMatch: clockStartedAt postoji => false', () => {
    expect(isRetrospectiveMatch({ status: 'FINISHED', clockStartedAt: new Date().toISOString(), reportStatus: 'PENDING' } as never)).toBe(false);
  });
  it('isRetrospectiveMatch: reportStatus APPROVED => false', () => {
    expect(isRetrospectiveMatch({ status: 'FINISHED', clockStartedAt: null, reportStatus: 'APPROVED' } as never)).toBe(false);
  });
  it('clampScore: string broj sa decimalom', () => {
    expect(clampScore('5.9')).toBe(5);
    expect(clampScore('0')).toBe(0);
  });
  it('clampScore: negativan vraća 0 (Math.max)', () => {
    expect(clampScore(-3)).toBe(0);
    expect(clampScore('-10')).toBe(0);
  });
  it('clampScore: ne-broj vraća 0 (|| 0)', () => {
    expect(clampScore('abc')).toBe(0);
    expect(clampScore('')).toBe(0);
  });
  it('clampScore: pozitivan cijeli broj', () => {
    expect(clampScore(7)).toBe(7);
    expect(clampScore('12')).toBe(12);
  });
  it('canSendManualStatus: editable i nije locked => true', () => {
    for (const s of editableStatuses) {
      expect(canSendManualStatus(s, false)).toBe(true);
    }
  });
  it('canSendManualStatus: locked => false bez obzira na status', () => {
    expect(canSendManualStatus('FINISHED', true)).toBe(false);
    expect(canSendManualStatus('SCHEDULED', true)).toBe(false);
  });
  it('canSendManualStatus: status nije editable => false', () => {
    expect(canSendManualStatus('LIVE' as never, false)).toBe(false);
    expect(canSendManualStatus('HALFTIME' as never, false)).toBe(false);
  });
  it('matchStatusOptions: vraća sve editable statuse sa labelama', () => {
    const opts = matchStatusOptions();
    expect(opts).toHaveLength(editableStatuses.length);
    expect(opts[0]).toEqual({ id: 'SCHEDULED', label: 'Zakazana' });
    expect(opts.find((o) => o.id === 'FINISHED')?.label).toBe('Završena');
  });
  it('editableStatuses sadrži očekivane vrijednosti', () => {
    expect(editableStatuses).toEqual(['SCHEDULED', 'POSTPONED', 'CANCELLED', 'FINISHED']);
    expect(editableStatuses.includes('LIVE' as never)).toBe(false);
  });
  it('isPastDatetime: tačno 61s u prošlosti => true, 59s => false', () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-11-13T12:00:00.000Z').getTime());
    try {
      expect(isPastDatetime('2026-11-13T11:58:59.000Z')).toBe(true);
      expect(isPastDatetime('2026-11-13T11:59:01.000Z')).toBe(false);
    } finally {
      nowSpy.mockRestore();
    }
  });
});
