import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Match } from '../../../types';
import { CommentatorRetrospectiveBar } from './CommentatorRetrospectiveBar';

const state = vi.hoisted(() => ({
  submit: { mutateAsync: vi.fn(async () => ({})), isPending: false },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks/use-live-report', () => ({
  useSubmitMatchReport: () => state.submit,
}));

const match = (over: Partial<Match> = {}): Match =>
  ({
    id: 'm1',
    status: 'FINISHED',
    homeScore: 3,
    awayScore: 1,
    homeClub: { id: 'c1', name: 'FK Gračanica' },
    awayClub: { id: 'c2', name: 'FK Slavija' },
    reportStatus: 'DRAFT',
    events: [],
    ...over,
  }) as Match;

describe('CommentatorRetrospectiveBar', () => {
  beforeEach(() => {
    state.submit = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  });

  it('prikazuje rezultat, klubove i status izvještaja', () => {
    const onMinuteChange = vi.fn();
    render(<CommentatorRetrospectiveBar match={match()} minute={12} onMinuteChange={onMinuteChange} />);
    expect(screen.getByText('admin.retrospective.title')).toBeTruthy();
    expect(screen.getByText('3:1')).toBeTruthy();
    expect(screen.getByText('FK Gračanica vs FK Slavija')).toBeTruthy();
    expect(screen.getByText('Nacrt')).toBeTruthy();
    expect(screen.getByText('admin.retrospective.minute')).toBeTruthy();
  });

  it('status bez reportStatus prikazuje Nacrt', () => {
    render(
      <CommentatorRetrospectiveBar
        match={match({ reportStatus: undefined })}
        minute={0}
        onMinuteChange={() => {}}
      />,
    );
    expect(screen.getByText('Nacrt')).toBeTruthy();
  });

  it('status odobrenog izvještaja skriva cijelu sekciju unosa', () => {
    render(
      <CommentatorRetrospectiveBar
        match={match({ reportStatus: 'APPROVED' })}
        minute={0}
        onMinuteChange={() => {}}
      />,
    );
    expect(screen.getByText('Odobren')).toBeTruthy();
    expect(screen.queryByText('admin.retrospective.minute')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Pošalji na odobrenje' })).toBeNull();
  });

  it('utakmica koja nije završena ne dopušta unos', () => {
    render(
      <CommentatorRetrospectiveBar match={match({ status: 'LIVE' })} minute={0} onMinuteChange={() => {}} />,
    );
    expect(screen.queryByText('admin.retrospective.minute')).toBeNull();
  });

  it('status Čeka odobrenje skriva dugme za slanje, polje minute ostaje', () => {
    render(
      <CommentatorRetrospectiveBar
        match={match({ reportStatus: 'PENDING_APPROVAL' })}
        minute={0}
        onMinuteChange={() => {}}
      />,
    );
    expect(screen.getByText('Čeka odobrenje')).toBeTruthy();
    expect(screen.getByText('admin.retrospective.minute')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Pošalji na odobrenje' })).toBeNull();
  });

  it('izmjena minute zove onMinuteChange sa brojem', async () => {
    const calls: number[] = [];
    const Harness = () => {
      const [minute, setMinute] = useState(0);
      return (
        <CommentatorRetrospectiveBar
          match={match()}
          minute={minute}
          onMinuteChange={(m) => {
            calls.push(m);
            setMinute(m);
          }}
        />
      );
    };
    render(<Harness />);
    const input = document.querySelector('input[type="number"]') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, '45');
    expect(calls).toContain(4);
    expect(calls.at(-1)).toBe(45);
    expect(input.value).toBe('45');
  });

  it('slanje na odobrenje koristi ID utakmice', async () => {
    render(<CommentatorRetrospectiveBar match={match()} minute={0} onMinuteChange={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Pošalji na odobrenje' }));
    expect(state.submit.mutateAsync).toHaveBeenCalledWith('m1');
    expect(screen.queryByText('Slanje nije uspjelo.')).toBeNull();
  });

  it('greška pri slanju se prikazuje (poruka greške ako postoji)', async () => {
    state.submit = {
      mutateAsync: vi.fn(async () => {
        throw new Error('boom');
      }),
      isPending: false,
    };
    render(<CommentatorRetrospectiveBar match={match()} minute={0} onMinuteChange={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Pošalji na odobrenje' }));
    expect(await screen.findByText('boom')).toBeTruthy();
  });

  it('bez poruke greške prikazuje se fallback tekst', async () => {
    state.submit = {
      mutateAsync: vi.fn(async () => {
        throw {};
      }),
      isPending: false,
    };
    render(<CommentatorRetrospectiveBar match={match()} minute={0} onMinuteChange={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Pošalji na odobrenje' }));
    expect(await screen.findByText('Slanje nije uspjelo.')).toBeTruthy();
  });

  it('tokom slanja dugme je onemogućeno', () => {
    state.submit = { mutateAsync: vi.fn(async () => ({})), isPending: true };
    render(<CommentatorRetrospectiveBar match={match()} minute={0} onMinuteChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Pošalji na odobrenje' })).toHaveProperty('disabled', true);
  });
});
