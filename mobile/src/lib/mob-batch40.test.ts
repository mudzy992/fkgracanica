import { beforeEach, describe, expect, it, vi } from 'vitest';
(globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;
vi.mock('react-native', () => ({ Vibration: { vibrate: vi.fn() } }));
vi.mock('./api', () => ({ API_URL: 'https://api.fkgracanica.ba101.top/api/v1', api: { get: vi.fn(async () => ({ data: null })), post: vi.fn(async () => ({ data: {} })), delete: vi.fn(async () => ({})) } }));
import { Vibration } from 'react-native';
import { api } from './api';
import { isSameLockedQr, playAdmissionFeedback, postAdmissionScan } from '../components/staff/admission-scan';
import { mapTicketValidate, ticketOutcome } from '../components/staff/map-ticket-validate';
const post = vi.mocked(api.post);
describe('mob-batch40 — P-MOB40 admission/ticket', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('isSameLockedQr', () => { expect(isSameLockedQr(null, 'a')).toBe(false); expect(isSameLockedQr('a', 'a')).toBe(true); expect(isSameLockedQr('a', 'b')).toBe(false); });
  it('postAdmissionScan poziva api', async () => {
    post.mockResolvedValue({ data: {} } as never);
    await postAdmissionScan('inspect', 'qr123', 'm1');
    expect(post).toHaveBeenCalledWith('/ticketing/inspect', { qrCode: 'qr123', matchId: 'm1' });
    await postAdmissionScan('validate', 'qr123');
    expect(post).toHaveBeenCalledWith('/ticketing/validate', { qrCode: 'qr123', matchId: undefined });
  });
  it('playAdmissionFeedback valid/invalid', () => {
    playAdmissionFeedback('valid'); expect(Vibration.vibrate).toHaveBeenCalledWith(240);
    vi.clearAllMocks(); playAdmissionFeedback('used'); expect(Vibration.vibrate).toHaveBeenCalledWith([0, 100, 70, 100]);
    vi.clearAllMocks(); playAdmissionFeedback('invalid'); expect(Vibration.vibrate).toHaveBeenCalledWith([0, 100, 70, 100]);
  });
  it('mapTicketValidate kind/status', () => {
    expect(mapTicketValidate({ kind: 'pass', status: 'USED', category: 'A', match: { homeClub: { name: 'A' }, awayClub: { name: 'B' } }, name: 'N' })?.kind).toBe('pass');
    expect(mapTicketValidate({ kind: 'membership', status: 'ACTIVE' })?.kind).toBe('membership');
    expect(mapTicketValidate({ status: '', id: '' })).toBeNull();
    expect(mapTicketValidate({ id: '1', status: '', category: 'C' })?.category).toBe('C');
  });
  it('mapTicketValidate matchLabel', () => {
    expect(mapTicketValidate({ status: 'PAID', match: { homeClub: { name: 'H' }, awayClub: { name: 'A' } } } as any)?.matchLabel).toBe('H vs A');
    expect(mapTicketValidate({ status: 'PAID', match: { homeClub: { name: 'H' } } } as any)?.matchLabel).toBe('');
  });
  it('ticketOutcome error used/invalid', () => {
    expect(ticketOutcome(null, 'Već iskorišten')).toBe('used'); expect(ticketOutcome(null, 'already scanned')).toBe('used');
    expect(ticketOutcome(null, 'nepoznata greška')).toBe('invalid');
  });
  it('ticketOutcome bez card invalid', () => { expect(ticketOutcome(null, null)).toBe('invalid'); });
  it('ticketOutcome membership ACTIVE/else', () => {
    expect(ticketOutcome({ kind: 'membership', status: 'ACTIVE' } as any, null)).toBe('valid');
    expect(ticketOutcome({ kind: 'membership', status: 'EXPIRED' } as any, null)).toBe('invalid');
  });
  it('ticketOutcome ticket valid', () => {
    expect(ticketOutcome({ kind: 'ticket', status: 'USED' } as any, null)).toBe('valid');
    expect(ticketOutcome({ kind: 'ticket', status: 'PAID' } as any, null)).toBe('valid');
  });
  it('mapTicketValidate default ticket kind', () => {
    expect(mapTicketValidate({ status: 'PAID' } as any)?.kind).toBe('ticket');
  });
  it('ticketOutcome pass valid', () => {
    expect(ticketOutcome({ kind: 'pass', status: 'PAID' } as any, null)).toBe('valid');
  });
});
