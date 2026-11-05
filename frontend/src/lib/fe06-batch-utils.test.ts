import { describe, expect, it } from 'vitest';
import { groupPlayersByPosition, pickFormationStarters, playerPositionLabel } from './player-utils';
import { groupMatchesByRound, matchRoundLabel, matchRoundNumber, roundLabel } from './round-utils';
import { computePositionChanges, maxFinishedRound } from './league-position.util';
import {
  canActivateMembership,
  canCancelMembership,
  canRenewMembership,
  canSuspendMembership,
  membershipStatusLabel,
  membershipStatusVariant,
  membershipUserName,
} from './membership-status';
import type { Player, StandingRow } from '../types';
import type { MembershipStatus } from '../types/membership';

const player = (id: string, position?: string) => ({ id, firstName: id, lastName: 'X', position }) as unknown as Player;

describe('player-utils', () => {
  it('prevodi poznate pozicije, nepoznate vraća kakve jesu, praznu u crticu', () => {
    expect(playerPositionLabel('GK')).toBe('Golman');
    expect(playerPositionLabel('CB')).toBe('CB');
    expect(playerPositionLabel(null)).toBe('—');
  });

  it('grupiše samo neprazne pozicije u fiksnom redoslijedu', () => {
    const groups = groupPlayersByPosition([player('a', 'FWD'), player('b', 'GK'), player('c', 'FWD'), player('d')]);
    expect(groups.map((group) => group.position)).toEqual(['GK', 'FWD']);
    expect(groups[1].label).toBe('Napad');
    expect(groups[1].players.map((row) => row.id)).toEqual(['a', 'c']);
  });

  it('bira startere po šemi 1-4-3-3 i dopunjava do 11 iz ostatka', () => {
    const squad = [
      ...['gk1'].map((id) => player(id, 'GK')),
      ...['d1', 'd2', 'd3', 'd4', 'd5'].map((id) => player(id, 'DEF')),
      ...['m1', 'm2', 'm3'].map((id) => player(id, 'MID')),
      ...['f1', 'f2', 'f3'].map((id) => player(id, 'FWD')),
      ...['x1', 'x2'].map((id) => player(id)),
    ];
    const starters = pickFormationStarters(squad);
    expect(starters).toHaveLength(11);
    expect(starters.slice(0, 4).map((row) => row.id)).toEqual(['gk1', 'd1', 'd2', 'd3']);
    expect(starters.filter((row) => row.id === 'd5')).toHaveLength(0);
    expect(starters.slice(-3).map((row) => row.id)).toEqual(['f1', 'f2', 'f3']);
    expect(starters.map((row) => row.id)).not.toContain('x1');
    const toppedUp = pickFormationStarters([player('gk1', 'GK'), player('m1', 'MID'), player('x1'), player('x2')]);
    expect(toppedUp.map((row) => row.id)).toEqual(['gk1', 'm1', 'x1', 'x2']);
    expect(pickFormationStarters([player('only', 'GK')]).map((row) => row.id)).toEqual(['only']);
  });
});

describe('round-utils', () => {
  it('koristi naziv kola ako postoji, inače broj', () => {
    expect(roundLabel({ number: 3, name: 'Derbi kolo' })).toBe('Derbi kolo');
    expect(roundLabel({ number: 3, name: '  ' })).toBe('3. kolo');
  });

  it('čita broj i labelu iz utakmice te toleriše nedostajuće kolo', () => {
    expect(matchRoundNumber({ roundRel: { number: 5 } })).toBe(5);
    expect(matchRoundNumber({})).toBeNull();
    expect(matchRoundLabel({})).toBeNull();
    expect(matchRoundLabel({ roundRel: { number: 4, name: '' } })).toBe('4. kolo');
  });

  it('grupiše po kolu silazno, unutar kola po vremenu silazno i preskače bez kola', () => {
    const grouped = groupMatchesByRound([
      { id: 'a', roundRel: { number: 2 }, scheduledAt: '2026-03-01T10:00:00.000Z' },
      { id: 'b', roundRel: { number: 2, name: 'Kolo 2' }, scheduledAt: '2026-03-02T10:00:00.000Z' },
      { id: 'c', roundRel: { number: 1 }, scheduledAt: '2026-02-01T10:00:00.000Z' },
      { id: 'd', scheduledAt: '2026-03-03T10:00:00.000Z' },
    ]);
    expect(grouped.map((group) => group.key)).toEqual([2, 1]);
    expect(grouped[0].label).toBe('2. kolo');
    expect(grouped[0].matches.map((row) => row.id)).toEqual(['b', 'a']);
  });
});

describe('league-position util', () => {
  const row = (clubId: string) => ({ clubId }) as StandingRow;

  it('računa pozitivne i negativne promjene pozicije, preskače nove klubove', () => {
    const changes = computePositionChanges(
      [row('b'), row('a'), row('c'), row('novi')],
      [row('a'), row('b')],
    );
    expect(changes.get('b')).toBe(1);
    expect(changes.get('a')).toBe(-1);
    expect(changes.has('c')).toBe(false);
    expect(changes.has('novi')).toBe(false);
  });

  it('pronalazi najviše završeno kolo ignorišući nezavršene utakmice', () => {
    expect(maxFinishedRound([
      { status: 'FINISHED', roundRel: { number: 4 } },
      { status: 'LIVE', roundRel: { number: 9 } },
      { status: 'FINISHED', roundRel: null },
      { status: 'FINISHED' },
    ])).toBe(4);
    expect(maxFinishedRound([])).toBe(0);
  });
});

describe('membership-status', () => {
  it('prikazuje ime iz imena i prezimena, pada na email pa crticu', () => {
    expect(membershipUserName({ firstName: 'Amina', lastName: 'Hodžić' })).toBe('Amina Hodžić');
    expect(membershipUserName({ firstName: 'Amina', lastName: null })).toBe('Amina');
    expect(membershipUserName({ email: 'a@example.test' })).toBe('a@example.test');
    expect(membershipUserName()).toBe('—');
  });

  it('mapira sve statuse na labelu i varijantu', () => {
    const statuses: MembershipStatus[] = ['PENDING', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED'];
    expect(statuses.map(membershipStatusLabel)).toEqual([
      'Na čekanju', 'Aktivno', 'Suspendovano', 'Isteklo', 'Otkazano',
    ]);
    expect(statuses.map(membershipStatusVariant)).toEqual([
      'default', 'success', 'danger', 'danger', 'muted',
    ]);
    expect(membershipStatusLabel('UNKNOWN' as MembershipStatus)).toBe('UNKNOWN');
  });

  it('dozvoljava akcije prema statusu članstva', () => {
    expect(canActivateMembership('PENDING')).toBe(true);
    expect(canActivateMembership('ACTIVE')).toBe(false);
    expect(canRenewMembership('ACTIVE')).toBe(true);
    expect(canRenewMembership('PENDING')).toBe(false);
    expect(canSuspendMembership('ACTIVE')).toBe(true);
    expect(canSuspendMembership('EXPIRED')).toBe(false);
    expect(canCancelMembership('ACTIVE')).toBe(true);
    expect(canCancelMembership('CANCELLED')).toBe(false);
  });
});
