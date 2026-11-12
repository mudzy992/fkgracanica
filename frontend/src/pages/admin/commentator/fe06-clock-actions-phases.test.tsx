import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommentatorClockActions } from './CommentatorClockActions';

const { state, names } = vi.hoisted(() => {
  const names: Record<string, string> = {
    useStartMatch: 'start', useHalftimeMatch: 'halftime', useResumeMatch: 'resume', useEndMatch: 'end',
    useFinishRegularTime: 'finishRegular', useStartExtraTime: 'startExtra', useExtraTimeHalftime: 'etHalftime',
    useResumeExtraSecond: 'resumeExtra', useFinishExtraTime: 'finishExtra', useStartPenalties: 'startPenalties',
    useEndAfterPenalties: 'endPenalties',
  };
  return {
    names,
    state: {
      mutations: {} as Record<string, { mutateAsync: ReturnType<typeof vi.fn>; isPending: boolean }>,
      confirm: vi.fn(),
    },
  };
});

vi.mock('../../../hooks/use-live-admin', () => {
  const mod: Record<string, () => unknown> = {};
  for (const [hook, key] of Object.entries(names)) mod[hook] = () => state.mutations[key];
  return mod;
});
vi.mock('../../../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: state.confirm, dialog: null }),
}));

const match = (over: Record<string, unknown> = {}) =>
  ({ id: 'm1', status: 'SCHEDULED', liveBreak: 'NONE', matchPeriod: null, homeScore: 0,
    awayScore: 0, ...over }) as never;

beforeEach(() => {
  for (const key of Object.values(names)) state.mutations[key] = { mutateAsync: vi.fn().mockResolvedValue({}), isPending: false };
  state.confirm = vi.fn().mockResolvedValue(true);
});

describe('CommentatorClockActions — sve faze sata', () => {
  it('nastavak drugog poluvremena pokreće resume', async () => {
    render(<CommentatorClockActions match={match({ status: 'HALFTIME', liveBreak: 'REGULAR_HT' })} />);
    await userEvent.click(screen.getByRole('button', { name: '2. poluvrijeme' }));
    expect(state.mutations.resume.mutateAsync).toHaveBeenCalledWith('m1');
  });

  it('pauza u prvom produžetku pokreće etHalftime bez potvrde', async () => {
    render(<CommentatorClockActions match={match({
      status: 'LIVE', matchPeriod: 'EXTRA_FIRST', homeScore: 1, awayScore: 1,
    })} />);
    await userEvent.click(screen.getByRole('button', { name: 'Pauza ET' }));
    expect(state.mutations.etHalftime.mutateAsync).toHaveBeenCalledWith('m1');
    expect(state.confirm).not.toHaveBeenCalled();
  });

  it('nastavak drugog produžetka pokreće resumeExtra', async () => {
    render(<CommentatorClockActions match={match({ status: 'HALFTIME', liveBreak: 'ET_HT' })} />);
    await userEvent.click(screen.getByRole('button', { name: '2. produžetak' }));
    expect(state.mutations.resumeExtra.mutateAsync).toHaveBeenCalledWith('m1');
  });

  it('kraj produžetaka pokreće finishExtra', async () => {
    render(<CommentatorClockActions match={match({
      status: 'LIVE', matchPeriod: 'EXTRA_SECOND', homeScore: 2, awayScore: 2,
    })} />);
    await userEvent.click(screen.getByRole('button', { name: 'Kraj produžetaka' }));
    expect(state.mutations.finishExtra.mutateAsync).toHaveBeenCalledWith('m1');
  });

  it('završetak penala traži potvrdu pa poziva endPenalties', async () => {
    render(<CommentatorClockActions match={match({
      status: 'LIVE', matchPeriod: 'PENALTIES', homeScore: 3, awayScore: 3,
    })} />);
    await userEvent.click(screen.getByRole('button', { name: 'Završi penale' }));
    expect(state.confirm).toHaveBeenCalledWith(expect.objectContaining({ title: 'Završi penale?' }));
    expect(state.mutations.endPenalties.mutateAsync).toHaveBeenCalledWith('m1');
  });

  it('odbijena potvrda penala ne završava penale', async () => {
    state.confirm = vi.fn().mockResolvedValue(false);
    render(<CommentatorClockActions match={match({
      status: 'LIVE', matchPeriod: 'PENALTIES', homeScore: 3, awayScore: 3,
    })} />);
    await userEvent.click(screen.getByRole('button', { name: 'Završi penale' }));
    expect(state.mutations.endPenalties.mutateAsync).not.toHaveBeenCalled();
  });
});
