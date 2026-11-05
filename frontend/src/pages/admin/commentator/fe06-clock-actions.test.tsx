import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommentatorClockActions } from './CommentatorClockActions';
import { buildClockActions, clockBreakHint } from './clock-actions';
import type { Match } from '../../../types';

type ClockMatch = Parameters<typeof buildClockActions>[0];

const state = vi.hoisted(() => ({
  confirm: vi.fn(async () => true),
  calls: [] as string[],
  pending: new Set<string>(),
  fail: null as string | null,
}));

const mutation = (name: string) => ({
  mutateAsync: vi.fn(async () => {
    if (state.fail === name) throw new Error('Sat nije sinhronizovan');
    state.calls.push(name);
  }),
  isPending: state.pending.has(name),
});

vi.mock('../../../hooks/use-live-admin', () => ({
  useStartMatch: () => mutation('start'),
  useHalftimeMatch: () => mutation('ht'),
  useResumeMatch: () => mutation('resume2'),
  useEndMatch: () => mutation('end'),
  useFinishRegularTime: () => mutation('ft'),
  useStartExtraTime: () => mutation('et'),
  useExtraTimeHalftime: () => mutation('eth'),
  useResumeExtraSecond: () => mutation('et2'),
  useFinishExtraTime: () => mutation('etend'),
  useStartPenalties: () => mutation('pen'),
  useEndAfterPenalties: () => mutation('penend'),
}));
vi.mock('../../../hooks/use-confirm', () => ({ useConfirm: () => ({ confirm: state.confirm, dialog: null }) }));

const match = (over: Partial<ClockMatch> = {}): Match =>
  ({ id: 'm1', status: 'SCHEDULED', liveBreak: 'NONE', matchPeriod: null, homeScore: 0, awayScore: 0, ...over }) as unknown as Match;

const labels = (m: ClockMatch) => buildClockActions(m).map((a) => `${a.label}:${a.style}${a.confirm ? ':confirm' : ''}`);

beforeEach(() => {
  state.confirm = vi.fn(async () => true);
  state.calls = [];
  state.pending = new Set();
  state.fail = null;
});

describe('buildClockActions', () => {
  it('zakazana utakmica nudi samo početak', () => {
    expect(labels(match())).toEqual(['Započni:primary']);
  });

  it('prvo poluvrijeme nudi poluvrijeme i završetak uz potvrdu', () => {
    expect(labels(match({ status: 'LIVE', matchPeriod: 'FIRST_HALF' }))).toEqual([
      'Poluvrijeme:outline', 'Završi:end:confirm',
    ]);
  });

  it('pauza regularnog dijela nastavlja drugo poluvrijeme', () => {
    expect(labels(match({ status: 'HALFTIME', liveBreak: 'REGULAR_HT' }))).toEqual(['2. poluvrijeme:primary']);
    expect(labels(match({ status: 'HALFTIME', liveBreak: 'REGULAR_HT', homeScore: 1, awayScore: 1 }))).toEqual([
      '2. poluvrijeme:primary',
    ]);
  });

  it('drugo poluvrijeme razlikuje neriješeno od pobjede', () => {
    const live = { status: 'LIVE' as const, matchPeriod: 'SECOND_HALF' as const };
    expect(labels(match({ ...live, homeScore: 1, awayScore: 1 }))).toEqual(['Kraj regularnog:outline']);
    expect(labels(match({ ...live, homeScore: 2, awayScore: 1 }))).toEqual(['Završi:end:confirm']);
  });

  it('produžeci slijede isti obrazac i nude penale samo kad je neriješeno', () => {
    expect(labels(match({ status: 'HALFTIME', liveBreak: 'POST_REGULATION', homeScore: 1, awayScore: 1 }))).toEqual([
      'Produžeci:primary',
    ]);
    expect(labels(match({ status: 'HALFTIME', liveBreak: 'POST_REGULATION', homeScore: 2, awayScore: 1 }))).toEqual([]);
    expect(labels(match({ status: 'LIVE', matchPeriod: 'EXTRA_FIRST' }))).toEqual(['Pauza ET:outline']);
    expect(labels(match({ status: 'HALFTIME', liveBreak: 'ET_HT' }))).toEqual(['2. produžetak:primary']);
    expect(labels(match({ status: 'LIVE', matchPeriod: 'EXTRA_SECOND', homeScore: 1, awayScore: 1 }))).toEqual([
      'Kraj produžetaka:outline',
    ]);
    expect(labels(match({ status: 'LIVE', matchPeriod: 'EXTRA_SECOND', homeScore: 1, awayScore: 0 }))).toEqual([
      'Završi:end:confirm',
    ]);
    expect(labels(match({ status: 'HALFTIME', liveBreak: 'POST_EXTRA', homeScore: 0, awayScore: 0 }))).toEqual([
      'Penali:primary',
    ]);
    expect(labels(match({ status: 'LIVE', matchPeriod: 'PENALTIES' }))).toEqual(['Završi penale:end:confirm']);
  });

  it('savjet pri pauzi zavisi od faze', () => {
    expect(clockBreakHint(match())).toBeNull();
    expect(clockBreakHint(match({ status: 'HALFTIME', liveBreak: 'NONE' }))).toBeNull();
    expect(clockBreakHint(match({ status: 'HALFTIME', liveBreak: 'REGULAR_HT' }))).toBeNull();
    expect(clockBreakHint(match({ status: 'HALFTIME', liveBreak: 'POST_REGULATION' }))).toBe('Neriješeno');
    expect(clockBreakHint(match({ status: 'HALFTIME', liveBreak: 'POST_EXTRA' }))).toBe('Neriješeno');
    expect(clockBreakHint(match({ status: 'HALFTIME', liveBreak: 'ET_HT' }))).toBe('Pauza');
  });
});

describe('CommentatorClockActions', () => {
  it('bez dostupnih akcija ne renderuje ništa', () => {
    const { container } = render(<CommentatorClockActions match={match({ status: 'FINISHED' })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('akcija bez potvrde šalje samo id utakmice', async () => {
    const user = userEvent.setup();
    render(<CommentatorClockActions match={match()} />);
    await user.click(screen.getByRole('button', { name: 'Započni' }));
    await waitFor(() => expect(state.calls).toEqual(['start']));
  });

  it('potvrđena akcija prolazi kroz dijalog sa opisom zaključavanja', async () => {
    const user = userEvent.setup();
    render(<CommentatorClockActions match={match({ status: 'LIVE', matchPeriod: 'SECOND_HALF', homeScore: 2, awayScore: 1 })} />);
    await user.click(screen.getByRole('button', { name: 'Završi' }));
    await waitFor(() => expect(state.calls).toEqual(['end']));
    expect(state.confirm).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Završi?', confirmLabel: 'Završi', variant: 'danger',
    }));
  });

  it('odbijena potvrda ne pokreće akciju', async () => {
    const user = userEvent.setup();
    state.confirm = vi.fn(async () => false);
    render(<CommentatorClockActions match={match({ status: 'LIVE', matchPeriod: 'SECOND_HALF', homeScore: 2, awayScore: 1 })} />);
    await user.click(screen.getByRole('button', { name: 'Završi' }));
    await waitFor(() => expect(state.confirm).toHaveBeenCalledTimes(1));
    expect(state.calls).toEqual([]);
  });

  it('greška akcije se prikazuje u crvenoj poruci', async () => {
    const user = userEvent.setup();
    state.fail = 'start';
    render(<CommentatorClockActions match={match()} />);
    await user.click(screen.getByRole('button', { name: 'Započni' }));
    await waitFor(() => expect(screen.getByText('Sat nije sinhronizovan')).toBeInTheDocument());
    expect(state.calls).toEqual([]);
  });

  it('dok je akcija u toku sva dugmad su onemogućena i prikazuje se savjet', () => {
    state.pending = new Set(['ht']);
    render(<CommentatorClockActions match={match({ status: 'HALFTIME', liveBreak: 'POST_EXTRA' })} />);
    const penali = screen.getByRole('button', { name: 'Penali' });
    expect(penali).toBeDisabled();
    expect(screen.getByText('Neriješeno')).toBeInTheDocument();
  });
});
