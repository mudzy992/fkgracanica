import { describe, expect, it } from 'vitest';
import { matchStatusLabel, matchStatusTone } from './match-status-label';

describe('matchStatusLabel (FE-02)', () => {
  it('prevodi poznate statuse', () => {
    expect(matchStatusLabel('SCHEDULED')).toBe('Zakazana');
    expect(matchStatusLabel('LIVE')).toBe('Uživo');
    expect(matchStatusLabel('FINISHED')).toBe('Završena');
  });

  it('vraća ulaz za nepoznat status', () => {
    expect(matchStatusLabel('NEŠTO')).toBe('NEŠTO');
  });
});

describe('matchStatusTone', () => {
  it('mapira status na ton bedža', () => {
    expect(matchStatusTone('LIVE')).toBe('danger');
    expect(matchStatusTone('HALFTIME')).toBe('warning');
    expect(matchStatusTone('FINISHED')).toBe('success');
    expect(matchStatusTone('SCHEDULED')).toBe('muted');
  });
});
