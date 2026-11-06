import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Match } from '../../../types';
import { CommentatorEventLog } from './CommentatorEventLog';

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

describe('CommentatorEventLog', () => {
  const events = [
    { id: 'e1', minute: 10, type: 'GOAL', player: { firstName: 'Amar', lastName: 'Hodžić' } },
    { id: 'e2', minute: 22, type: 'YELLOW_CARD' },
    { id: 'e3', minute: 30, type: 'SUBSTITUTION' },
  ];

  it('bez događaja prikazuje prazno stanje', () => {
    render(<CommentatorEventLog match={match({ events: [] })} />);
    expect(screen.getByText('admin.eventLog.title')).toBeTruthy();
    expect(screen.getByText('admin.eventLog.empty')).toBeTruthy();
  });

  it('događaji su obrnuti (najnoviji prvi) uz minutu, naziv i igrača', () => {
    render(<CommentatorEventLog match={match({ events: events as never })} />);
    const items = screen.getAllByRole('listitem');
    expect(items[0].textContent).toContain('30');
    expect(items[2].textContent).toContain('10');
    expect(items[2].textContent).toContain('Gol');
    expect(items[2].textContent).toContain('Amar Hodžić');
  });

  it('opis događaja se dopisuje na kraj', () => {
    render(
      <CommentatorEventLog
        match={match({ events: [{ ...events[0], description: 'Iz jedanaesterca' }] as never })}
      />,
    );
    expect(screen.getByRole('listitem').textContent).toContain('— Iz jedanaesterca');
  });

  it('bez onDelete nema dugmadi za brisanje', () => {
    render(<CommentatorEventLog match={match({ events: events as never })} />);
    expect(screen.queryByRole('button', { name: 'Obriši' })).toBeNull();
  });

  it('onDelete prosljeđuje ID događaja', async () => {
    const onDelete = vi.fn();
    render(<CommentatorEventLog match={match({ events: events as never })} onDelete={onDelete} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Obriši' })[1]);
    expect(onDelete).toHaveBeenCalledWith('e2');
  });

  it('tokom brisanja dugmad su onemogućena', () => {
    render(
      <CommentatorEventLog match={match({ events: events as never })} onDelete={() => {}} deletePending />,
    );
    screen.getAllByRole('button', { name: 'Obriši' }).forEach((b) => expect(b).toHaveProperty('disabled', true));
  });
});
