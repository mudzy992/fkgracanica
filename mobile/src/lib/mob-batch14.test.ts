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

import { Vibration } from 'react-native';
import { mapTeamSeasonStats } from '../components/team/load-team-stats';
import { playAdmissionFeedback, postAdmissionScan } from '../components/staff/admission-scan';
import { api } from './api';

describe('mob-batch14 — P-MOB14 team/admission', () => {
  it('mapTeamSeasonStats prazno', () => {
    const res = mapTeamSeasonStats({});
    expect(res.seasonName).toBeUndefined();
    expect(res.standing).toBeUndefined();
    expect(res.totals).toBeUndefined();
    expect(res.players).toEqual([]);
  });

  it('mapTeamSeasonStats sa standing', () => {
    const res = mapTeamSeasonStats({
      standing: { played: 10, won: 6, drawn: 2, lost: 2, points: 20, goalsFor: 15, goalsAgainst: 8, form: 'WWDLW', clubId: 'c1' },
    });
    expect(res.standing?.played).toBe(10);
    expect(res.standing?.points).toBe(20);
    expect(res.standing?.form).toBe('WWDLW');
  });

  it('mapTeamSeasonStats bez standing kad nema clubId/points/played', () => {
    const res = mapTeamSeasonStats({ standing: {} });
    expect(res.standing).toBeUndefined();
  });

  it('mapTeamSeasonStats totals', () => {
    const res = mapTeamSeasonStats({ totals: { goals: 5, assists: 3, appearances: 10, yellowCards: 2, redCards: 1 } });
    expect(res.totals).toEqual({ goals: 5, assists: 3, appearances: 10, yellowCards: 2, redCards: 1 });
    const empty = mapTeamSeasonStats({ totals: {} });
    expect(empty.totals).toBeUndefined();
  });

  it('mapTeamSeasonStats players mapira i filtrira', () => {
    const res = mapTeamSeasonStats({
      players: [
        { id: 'p1', firstName: 'A', lastName: 'B', position: 'GK', number: '1', stats: { goals: 0 } },
        { id: '', firstName: 'bad' },
        { id: 'p2', lastName: 'C', position: 'FWD', number: '9', stats: { goals: 5 } },
      ],
    });
    expect(res.players.length).toBe(2);
    expect(res.players[0].id).toBe('p1');
    expect(res.players[0].firstName).toBe('A');
    expect(res.players[0].number).toBe(1);
    expect(res.players[1].firstName).toBe('Igrač');
    expect(res.players[1].lastName).toBe('C');
    expect(res.players[1].goals).toBe(5);
  });

  it('mapTeamSeasonStats seasonName', () => {
    const res = mapTeamSeasonStats({ season: { name: '2023/24' } });
    expect(res.seasonName).toBe('2023/24');
    const empty = mapTeamSeasonStats({ season: {} });
    expect(empty.seasonName).toBeUndefined();
  });

  it('postAdmissionScan inspect bez matchId', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} } as never);
    await postAdmissionScan('inspect', 'qr123');
    expect(api.post).toHaveBeenCalledWith('/ticketing/inspect', { qrCode: 'qr123', matchId: undefined });
  });

  it('postAdmissionScan validate sa matchId', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} } as never);
    await postAdmissionScan('validate', 'qr456', 'm1');
    expect(api.post).toHaveBeenCalledWith('/ticketing/validate', { qrCode: 'qr456', matchId: 'm1' });
  });

  it('playAdmissionFeedback valid vibrira 240', () => {
    const vib = vi.mocked(Vibration.vibrate);
    vib.mockClear();
    playAdmissionFeedback('valid');
    expect(vib).toHaveBeenCalledWith(240);
  });

  it('playAdmissionFeedback invalid vibrira pattern', () => {
    const vib = vi.mocked(Vibration.vibrate);
    vib.mockClear();
    playAdmissionFeedback('invalid');
    expect(vib).toHaveBeenCalledWith([0, 100, 70, 100]);
    vib.mockClear();
    playAdmissionFeedback('used');
    expect(vib).toHaveBeenCalledWith([0, 100, 70, 100]);
  });
});
