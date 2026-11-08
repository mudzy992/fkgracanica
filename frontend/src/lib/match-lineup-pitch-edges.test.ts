import { describe, expect, it } from 'vitest';
import { matchLineupToPitchSlots } from './match-lineup-pitch';
import type { MatchLineup, Player } from '../types';

const player = (id: string, position: Player['position'] = 'FWD', clubId = 'home') =>
  ({ id, firstName: 'Test', lastName: id, position, clubId } as Player);
const row = (id: string, x: number | null, y: number | null, extra: Partial<MatchLineup> = {}): MatchLineup => ({
  id: `saved-${id}`, playerId: id, clubId: 'home', positionX: x, positionY: y, isStarter: true,
  player: player(id), ...extra,
});

/** Batch 34 — nedostajuće koordinate i pozicija (odvojeno zbog limita dužine). */
describe('matchLineupToPitchSlots — nedostajuće koordinate i pozicija (batch 34)', () => {
  it('red bez koordinata koristi koordinate slota, a nevaljana pozicija pada na MID', () => {
    const pitch = matchLineupToPitchSlots(
      [row('bez-kordinata', null, null, { player: player('bez-kordinata', 'NEPOZNATO' as never) })],
      'home',
      [],
    );
    expect(pitch).toHaveLength(1);
    expect(pitch[0]).toMatchObject({ playerId: 'bez-kordinata', lineRole: 'MID' });
    expect(pitch[0].positionX).toBeGreaterThanOrEqual(0);
    expect(pitch[0].positionY).toBeGreaterThanOrEqual(0);
  });

  it('koordinate van terena se odbacuju u korist slota', () => {
    const pitch = matchLineupToPitchSlots([row('van-terena', 140, -5)], 'home', []);
    expect(pitch).toHaveLength(1);
    expect(pitch[0].positionX).toBeLessThanOrEqual(100);
    expect(pitch[0].positionY).toBeGreaterThanOrEqual(0);
  });

  it('nedostajući redovi igrača bez profila se preskaču', () => {
    const noPlayer = { ...row('bez-profila', 50, 50), player: undefined } as MatchLineup;
    expect(matchLineupToPitchSlots([noPlayer], 'home', [])).toEqual([]);
  });
});
