import { describe, expect, it, vi } from 'vitest';

(globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;

vi.mock('react-native', () => ({
  Vibration: { vibrate: vi.fn() },
  Platform: { OS: 'ios' },
  Linking: { openURL: vi.fn(async () => {}) },
}));

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => {}),
  deleteItemAsync: vi.fn(async () => {}),
}));

vi.mock('expo-linking', () => ({
  createURL: vi.fn(() => 'fkgracanica://payment-return'),
  parse: vi.fn(() => ({ queryParams: {} })),
}));

vi.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: vi.fn(),
  openAuthSessionAsync: vi.fn(async () => ({ type: 'dismiss' as const })),
}));

vi.mock('./api', () => ({
  API_URL: 'https://api.fkgracanica.ba101.top/api/v1',
  api: { get: vi.fn(async () => ({ data: {} })), post: vi.fn(async () => ({ data: {} })), delete: vi.fn(async () => ({})) },
}));

vi.mock('./start-mobile-checkout', () => ({
  startMobileCheckout: vi.fn(async () => 'paid'),
}));

import { ticketStatusKey } from '../components/ticket-status';
import { mapTicketValidate, ticketOutcome } from '../components/staff/map-ticket-validate';
import { groupTeamPlayers, POSITION_LABELS } from '../components/team/load-team-screen';
import { mapParticipations } from '../components/team/load-team-stats';
import { payMembershipOnline } from '../components/membership/pay-membership-online';
import { api } from './api';
import { startMobileCheckout } from './start-mobile-checkout';

describe('mob-batch13 — P-MOB13 ticket/team/membership', () => {
  it('ticketStatusKey mapira statuse', () => {
    expect(ticketStatusKey('PAID')).toBe('ticketStatusPaid');
    expect(ticketStatusKey('paid')).toBe('ticketStatusPaid');
    expect(ticketStatusKey('PAID_AT_BOX_OFFICE')).toBe('ticketStatusPaid');
    expect(ticketStatusKey('RESERVED')).toBe('ticketStatusReserved');
    expect(ticketStatusKey('USED')).toBe('ticketStatusUsed');
    expect(ticketStatusKey('PENDING')).toBe('ticketStatusPending');
    expect(ticketStatusKey('unknown')).toBe('status');
    expect(ticketStatusKey('')).toBe('status');
  });

  it('mapTicketValidate mapira ticket/pass/membership', () => {
    const ticket = mapTicketValidate({ id: 't1', kind: 'ticket', status: 'PAID', category: 'VIP', name: 'Ime', match: { homeClub: { name: 'A' }, awayClub: { name: 'B' } } });
    expect(ticket?.kind).toBe('ticket');
    expect(ticket?.matchLabel).toBe('A vs B');
    expect(ticket?.category).toBe('VIP');
    const pass = mapTicketValidate({ id: 'p1', kind: 'pass', status: 'USED' });
    expect(pass?.kind).toBe('pass');
    const mem = mapTicketValidate({ id: 'm1', kind: 'membership', status: 'ACTIVE' });
    expect(mem?.kind).toBe('membership');
    expect(mapTicketValidate({ status: '' })).toBeNull();
    expect(mapTicketValidate({})).toBeNull();
  });

  it('mapTicketValidate fallback kind ticket', () => {
    const res = mapTicketValidate({ id: 'x', status: 'PENDING' });
    expect(res?.kind).toBe('ticket');
    expect(res?.status).toBe('PENDING');
  });

  it('ticketOutcome error used/invalid', () => {
    expect(ticketOutcome(null, 'Već iskorišten')).toBe('used');
    expect(ticketOutcome(null, 'skeniran')).toBe('used');
    expect(ticketOutcome(null, 'already used')).toBe('used');
    expect(ticketOutcome(null, 'neka druga greška')).toBe('invalid');
    expect(ticketOutcome(null, null)).toBe('invalid');
  });

  it('ticketOutcome membership ACTIVE valid', () => {
    expect(ticketOutcome({ kind: 'membership', status: 'ACTIVE', category: '', matchLabel: '', name: '' }, null)).toBe('valid');
    expect(ticketOutcome({ kind: 'membership', status: 'EXPIRED', category: '', matchLabel: '', name: '' }, null)).toBe('invalid');
  });

  it('ticketOutcome ticket valid', () => {
    expect(ticketOutcome({ kind: 'ticket', status: 'USED', category: '', matchLabel: '', name: '' }, null)).toBe('valid');
    expect(ticketOutcome({ kind: 'ticket', status: 'PAID', category: '', matchLabel: '', name: '' }, null)).toBe('valid');
    expect(ticketOutcome({ kind: 'pass', status: 'VALID', category: '', matchLabel: '', name: '' }, null)).toBe('valid');
  });

  it('groupTeamPlayers grupira po poziciji i ignoriše bench', () => {
    const players = [
      { id: '1', firstName: 'A', lastName: 'A', position: 'GK', isBench: false } as never,
      { id: '2', firstName: 'B', lastName: 'B', position: 'DEF', isBench: false } as never,
      { id: '3', firstName: 'C', lastName: 'C', position: 'DEF', isBench: true } as never,
      { id: '4', firstName: 'D', lastName: 'D', position: 'MID', isBench: false } as never,
    ];
    const grouped = groupTeamPlayers(players);
    expect(grouped.map((g) => g.position)).toEqual(['GK', 'DEF', 'MID']);
    expect(grouped.find((g) => g.position === 'DEF')?.players.length).toBe(1);
    expect(POSITION_LABELS.GK).toBe('Golman');
  });

  it('groupTeamPlayers prazno', () => {
    expect(groupTeamPlayers([])).toEqual([]);
  });

  it('mapParticipations mapira i filtrira', () => {
    const data = [
      { seasonId: 's1', seasonName: '2023/24', yearStart: 2023, isActive: true, competitionId: 'c1', competitionName: 'Liga', isLeague: true },
      { seasonId: '', seasonName: 'bad' },
      { seasonId: 's2', seasonName: '', yearStart: '2022', isActive: false, competitionId: '', isLeague: false },
    ];
    const res = mapParticipations(data as never);
    expect(res.length).toBe(2);
    expect(res[0].seasonId).toBe('s1');
    expect(res[0].isActive).toBe(true);
    expect(res[1].yearStart).toBe(2022);
  });

  it('payMembershipOnline skipped kad nije online', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { membershipAnnualPrice: 0, membershipOnlineEnabled: false, onlineReady: false } } as never);
    await expect(payMembershipOnline('mem1')).resolves.toBe('skipped');
  });

  it('payMembershipOnline poziva startMobileCheckout kad online', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { membershipAnnualPrice: 100, membershipOnlineEnabled: true, onlineReady: true } } as never);
    vi.mocked(startMobileCheckout).mockResolvedValueOnce('paid' as never);
    await expect(payMembershipOnline('mem2')).resolves.toBe('paid');
    expect(startMobileCheckout).toHaveBeenCalledWith({ kind: 'membership', body: { membershipId: 'mem2', amount: 100 } });
  });
});
