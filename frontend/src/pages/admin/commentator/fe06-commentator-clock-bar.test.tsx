import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Match } from '../../../types';
import { CommentatorClockBar } from './CommentatorClockBar';

const state = vi.hoisted(() => ({
  clock: null as null | {
    displayMinute: number;
    displaySecond: number;
    stoppage: number;
    showStoppage: boolean;
    periodLabel: string;
    needsStoppageInput: boolean;
  },
  setStoppage: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  streamCalls: 0,
  actionCalls: 0,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks/use-live-admin', () => ({
  useSetStoppage: () => state.setStoppage,
}));
vi.mock('../../../hooks/use-live-clock', () => ({
  useLiveClock: () => state.clock,
}));
vi.mock('./CommentatorClockActions', () => ({
  CommentatorClockActions: () => {
    state.actionCalls += 1;
    return <div data-testid="clock-actions" />;
  },
}));
vi.mock('./CommentatorStreamDialog', () => ({
  CommentatorStreamDialog: () => {
    state.streamCalls += 1;
    return <div data-testid="stream-dialog" />;
  },
}));

const match = (over: Partial<Match> = {}): Match =>
  ({
    id: 'm1',
    status: 'LIVE',
    minute: 24,
    matchPeriod: 'FIRST_HALF',
    homeScore: 2,
    awayScore: 1,
    ...over,
  }) as Match;

const renderBar = (over: Partial<Match> = {}) => render(<CommentatorClockBar match={match(over)} />);

describe('CommentatorClockBar', () => {
  beforeEach(() => {
    state.clock = {
      displayMinute: 24,
      displaySecond: 15,
      stoppage: 0,
      showStoppage: false,
      periodLabel: '1. poluvrijeme',
      needsStoppageInput: false,
    };
    state.setStoppage = { mutateAsync: vi.fn(async () => ({})), isPending: false };
    state.streamCalls = 0;
    state.actionCalls = 0;
  });

  it('prikazuje sat iz stanja, oznaku perioda i rezultat', () => {
    renderBar();
    expect(screen.getByText('admin.commentatorClock.matchMinute')).toBeTruthy();
    expect(screen.getByText('24:15')).toBeTruthy();
    expect(screen.getByText('1. poluvrijeme')).toBeTruthy();
    expect(screen.getByText('2:1')).toBeTruthy();
    expect(screen.getByText('Uživo')).toBeTruthy();
    expect(screen.getByTestId('clock-actions')).toBeTruthy();
    expect(screen.getByTestId('stream-dialog')).toBeTruthy();
  });

  it('bez sata koristi minut iz utakmice i ne prikazuje period', () => {
    state.clock = null;
    renderBar();
    expect(screen.getByText('24:00')).toBeTruthy();
    expect(screen.queryByText('1. poluvrijeme')).toBeNull();
  });

  it('sudijska nadoknada se prikazuje u satu', () => {
    state.clock = { ...state.clock!, showStoppage: true, stoppage: 3 };
    renderBar();
    expect(screen.getByText('24:15 (+3)')).toBeTruthy();
  });

  it('faza penala prikazuje oznaku PENALI i rezultat penala', () => {
    renderBar({ matchPeriod: 'PENALTIES', penaltyHomeScore: 5, penaltyAwayScore: 4 });
    expect(screen.getByText('PENALI')).toBeTruthy();
    expect(screen.getByText(/\(5:4\)/)).toBeTruthy();
  });

  it('penali bez upisanog rezultata prikazuju nule', () => {
    renderBar({ matchPeriod: 'PENALTIES' });
    expect(screen.getByText(/\(0:0\)/)).toBeTruthy();
  });

  it('status nije LIVE daje sivu oznaku', () => {
    renderBar({ status: 'HALFTIME' });
    expect(screen.getByText('Pauza')).toBeTruthy();
  });

  it('polje nadoknade se prikazuje samo kad sat to traži i utakmica je LIVE', () => {
    state.clock = { ...state.clock!, needsStoppageInput: true };
    const { unmount } = renderBar();
    expect(screen.getByText('admin.commentatorClock.stoppage')).toBeTruthy();
    unmount();

    state.clock = { ...state.clock!, needsStoppageInput: true };
    renderBar({ status: 'HALFTIME' });
    expect(screen.queryByText('admin.commentatorClock.stoppage')).toBeNull();
  });

  it('bez poznatog poluvremena nema polja nadoknade', () => {
    state.clock = { ...state.clock!, needsStoppageInput: true };
    renderBar({ matchPeriod: 'PENALTIES' });
    expect(screen.queryByText('admin.commentatorClock.stoppage')).toBeNull();
  });

  it('slanje nadoknade koristi poluvrijeme, minute i zadatu vrijednost', async () => {
    state.clock = { ...state.clock!, needsStoppageInput: true };
    renderBar({ matchPeriod: 'SECOND_HALF' });
    await userEvent.click(screen.getByRole('button', { name: '+3 min' }));
    expect(state.setStoppage.mutateAsync).toHaveBeenCalledWith({ matchId: 'm1', half: 2, minutes: 3 });
  });

  it('izmjena broja minuta mijenja oznaku dugmeta i poslanu vrijednost', async () => {
    state.clock = { ...state.clock!, needsStoppageInput: true };
    renderBar();
    const input = document.querySelector('input[type="number"]') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, '7');
    await userEvent.click(screen.getByRole('button', { name: '+7 min' }));
    expect(state.setStoppage.mutateAsync).toHaveBeenCalledWith({ matchId: 'm1', half: 1, minutes: 7 });
  });

  it('tokom slanja dugme je onemogućeno', () => {
    state.clock = { ...state.clock!, needsStoppageInput: true };
    state.setStoppage = { mutateAsync: vi.fn(async () => ({})), isPending: true };
    renderBar();
    expect(screen.getByRole('button', { name: '+3 min' })).toHaveProperty('disabled', true);
  });
});
