import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommentatorClockActions } from './CommentatorClockActions';

const state = vi.hoisted(() => {
  const mutation = () => ({ mutateAsync: vi.fn(), isPending: false });
  return {
    mutations: {} as Record<string, ReturnType<typeof mutation>>,
    confirmResult: true,
    confirm: vi.fn(),
  };
});

const keys = ['start', 'halftime', 'resume', 'end', 'finishRegular', 'startExtra', 'etHalftime',
  'resumeExtra', 'finishExtra', 'startPenalties', 'endPenalties'];

vi.mock('../../../hooks/use-live-admin', () => {
  const map: Record<string, string> = {
    useStartMatch: 'start',
    useHalftimeMatch: 'halftime',
    useResumeMatch: 'resume',
    useEndMatch: 'end',
    useFinishRegularTime: 'finishRegular',
    useStartExtraTime: 'startExtra',
    useExtraTimeHalftime: 'etHalftime',
    useResumeExtraSecond: 'resumeExtra',
    useFinishExtraTime: 'finishExtra',
    useStartPenalties: 'startPenalties',
    useEndAfterPenalties: 'endPenalties',
  };
  const mod: Record<string, () => unknown> = {};
  for (const [name, key] of Object.entries(map)) {
    mod[name] = () => state.mutations[key];
  }
  return mod;
});
vi.mock('../../../hooks/use-confirm', () => ({
  useConfirm: () => ({ confirm: state.confirm, dialog: <p>potvrda</p> }),
}));

const match = (over: Record<string, unknown> = {}) =>
  ({ id: 'm1', status: 'SCHEDULED', liveBreak: 'NONE', matchPeriod: null, homeScore: 0,
    awayScore: 0, ...over }) as never;

beforeEach(() => {
  for (const key of keys) state.mutations[key] = { mutateAsync: vi.fn().mockResolvedValue({}), isPending: false };
  state.confirmResult = true;
  state.confirm = vi.fn().mockImplementation(() => Promise.resolve(state.confirmResult));
});

describe('CommentatorClockActions — akcije', () => {
  it('zakazana utakmica nudi samo početak', async () => {
    render(<CommentatorClockActions match={match()} />);
    expect(screen.getByRole('button', { name: 'Započni' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Započni' }));
    expect(state.mutations.start.mutateAsync).toHaveBeenCalledWith('m1');
  });

  it('prvo poluvrijeme nudi pauzu i završetak', async () => {
    render(<CommentatorClockActions match={match({ status: 'LIVE', matchPeriod: 'FIRST_HALF' })} />);
    await userEvent.click(screen.getByRole('button', { name: 'Poluvrijeme' }));
    expect(state.mutations.halftime.mutateAsync).toHaveBeenCalledWith('m1');
    expect(screen.getByRole('button', { name: 'Završi' })).toBeInTheDocument();
  });

  it('prekid daje badge i dugme za nastavak', async () => {
    const prekid = match({ status: 'HALFTIME', liveBreak: 'ET_HT', matchPeriod: 'EXTRA_FIRST' });
    render(<CommentatorClockActions match={prekid} />);
    expect(screen.getByText('Pauza')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '2. produžetak' }));
    expect(state.mutations.resumeExtra.mutateAsync).toHaveBeenCalledWith('m1');
  });

  it('neriješeno poslije regularnog nudi produžetke', async () => {
    render(
      <CommentatorClockActions
        match={match({
          status: 'HALFTIME',
          liveBreak: 'POST_REGULATION',
          matchPeriod: 'SECOND_HALF',
          homeScore: 1,
          awayScore: 1,
        })}
      />,
    );
    expect(screen.getByText('Neriješeno')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Produžeci' }));
    expect(state.mutations.startExtra.mutateAsync).toHaveBeenCalledWith('m1');
  });

  it('vođstvo poslije drugog poluvremena traži potvrdu prije kraja', async () => {
    render(
      <CommentatorClockActions
        match={match({
          status: 'LIVE',
          matchPeriod: 'SECOND_HALF',
          homeScore: 2,
          awayScore: 1,
        })}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Završi' }));
    expect(state.confirm).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Završi?', variant: 'danger', confirmLabel: 'Završi' }),
    );
    expect(state.mutations.end.mutateAsync).toHaveBeenCalledWith('m1');
  });

  it('otkazana potvrda ne izvršava akciju', async () => {
    state.confirmResult = false;
    render(
      <CommentatorClockActions
        match={match({
          status: 'LIVE',
          matchPeriod: 'SECOND_HALF',
          homeScore: 2,
          awayScore: 1,
        })}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Završi' }));
    expect(state.mutations.end.mutateAsync).not.toHaveBeenCalled();
  });

  it('poravnanje u drugom poluvremenu nudi kraj regularnog bez potvrde', async () => {
    render(
      <CommentatorClockActions
        match={match({
          status: 'LIVE',
          matchPeriod: 'SECOND_HALF',
          homeScore: 1,
          awayScore: 1,
        })}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Kraj regularnog' }));
    expect(state.mutations.finishRegular.mutateAsync).toHaveBeenCalledWith('m1');
    expect(state.confirm).not.toHaveBeenCalled();
  });

  it('penali poslije produžetaka vode u izvođenje penala', async () => {
    render(
      <CommentatorClockActions
        match={match({
          status: 'HALFTIME',
          liveBreak: 'POST_EXTRA',
          matchPeriod: 'EXTRA_SECOND',
          homeScore: 2,
          awayScore: 2,
        })}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Penali' }));
    expect(state.mutations.startPenalties.mutateAsync).toHaveBeenCalledWith('m1');
  });

  it('završetak penala traži potvrdu', async () => {
    render(<CommentatorClockActions match={match({ status: 'LIVE', matchPeriod: 'PENALTIES' })} />);
    await userEvent.click(screen.getByRole('button', { name: 'Završi penale' }));
    expect(state.mutations.endPenalties.mutateAsync).toHaveBeenCalledWith('m1');
  });

  it('greška akcije se prikazuje i dugmad ostaju', async () => {
    state.mutations.start.mutateAsync.mockRejectedValue(new Error('Server pao'));
    render(<CommentatorClockActions match={match()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Započni' }));
    expect(await screen.findByText('Server pao')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Započni' })).toBeInTheDocument();
  });
});

describe('CommentatorClockActions — stanja', () => {
  it('bez akcija i greške prikazuje samo dijalog', () => {
    const { container } = render(<CommentatorClockActions match={match({ status: 'FINISHED' })} />);
    expect(screen.getByText('potvrda')).toBeInTheDocument();
    expect(container.querySelector('.mt-3.border-t')).toBeNull();
  });

  it('dok je mutacija u toku dugmad su onemogućena', () => {
    state.mutations.start.isPending = true;
    render(<CommentatorClockActions match={match()} />);
    expect(screen.getByRole('button', { name: 'Započni' })).toBeDisabled();
  });

  it('greška bez akcija i dalje prikazuje traku', async () => {
    state.mutations.start.mutateAsync.mockRejectedValue('pad');
    const { rerender } = render(<CommentatorClockActions match={match()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Započni' }));
    rerender(<CommentatorClockActions match={match({ status: 'FINISHED' })} />);
    expect(screen.getByText('Akcija nije uspjela.')).toBeInTheDocument();
  });
});
