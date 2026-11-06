import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Match } from '../../../types';
import { CommentatorCommentPanel } from './CommentatorCommentPanel';

const state = vi.hoisted(() => ({
  addEvent: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  addLive: { mutateAsync: vi.fn(async () => ({})), isPending: false },
  addReport: { mutateAsync: vi.fn(async () => ({})), isPending: false },
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../../hooks/use-live-admin', () => ({
  useAddMatchEvent: () => state.addEvent,
  useAddMatchComment: () => state.addLive,
}));
vi.mock('../../../hooks/use-live-report', () => ({
  useAddReportComment: () => state.addReport,
}));

const lineup = (clubId: string, id: string, first: string, last: string) => ({
  id: `l-${id}`,
  clubId,
  playerId: id,
  isStarter: true,
  player: { id, firstName: first, lastName: last },
});

const match = (over: Partial<Match> = {}): Match =>
  ({
    id: 'm1',
    status: 'LIVE',
    homeScore: 1,
    awayScore: 1,
    homeClubId: 'c1',
    awayClubId: 'c2',
    homeClub: { id: 'c1', name: 'FK Gračanica' },
    awayClub: { id: 'c2', name: 'FK Slavija' },
    lineup: [
      lineup('c1', 'p1', 'Amar', 'Hodžić'),
      lineup('c2', 'p2', 'Emir', 'Karić'),
      { id: 'l-x', clubId: 'c1', playerId: 'p9', isStarter: false, player: null },
    ],
    liveComments: [],
    ...over,
  }) as Match;

describe('CommentatorCommentPanel', () => {
  const comments = [
    { id: 'k1', minute: 23, message: 'Sjajan gol!' },
    { id: 'k2', minute: null, message: 'Bez minute' },
  ];

  beforeEach(() => {
    state.addLive = { mutateAsync: vi.fn(async () => ({})), isPending: false };
    state.addReport = { mutateAsync: vi.fn(async () => ({})), isPending: false };
  });

  it('prikazuje komentare sa minutom i prazno stanje', () => {
    const { rerender } = render(<CommentatorCommentPanel match={match({ liveComments: comments as never })} />);
    expect(screen.getByText('admin.commentPanel.liveComments')).toBeTruthy();
    expect(screen.getByText('Sjajan gol!')).toBeTruthy();
    expect(screen.getByText("23'")).toBeTruthy();
    expect(screen.getByText('Bez minute')).toBeTruthy();
    rerender(<CommentatorCommentPanel match={match({ liveComments: [] })} />);
    expect(screen.getByText('admin.commentPanel.empty')).toBeTruthy();
  });

  it('unos je dostupan za LIVE i HALFTIME', () => {
    render(<CommentatorCommentPanel match={match({ status: 'HALFTIME' })} />);
    expect(screen.getByPlaceholderText('admin.commentPanel.placeholder')).toBeTruthy();
  });

  it('vani utakmice unos je skriven, lista ostaje', () => {
    render(<CommentatorCommentPanel match={match({ status: 'FINISHED', liveComments: comments as never })} />);
    expect(screen.queryByPlaceholderText('admin.commentPanel.placeholder')).toBeNull();
    expect(screen.getByText('Sjajan gol!')).toBeTruthy();
  });

  it('reportMode omogućava unos i van live utakmice', () => {
    render(<CommentatorCommentPanel match={match({ status: 'FINISHED' })} reportMode />);
    expect(screen.getByPlaceholderText('admin.commentPanel.placeholder')).toBeTruthy();
  });

  it('slanje live komentara koristi trim i prazni polje', async () => {
    render(<CommentatorCommentPanel match={match()} />);
    const input = screen.getByPlaceholderText('admin.commentPanel.placeholder');
    await userEvent.type(input, '  Novi komentar  ');
    await userEvent.click(screen.getByRole('button', { name: 'Pošalji' }));
    expect(state.addLive.mutateAsync).toHaveBeenCalledWith({ matchId: 'm1', message: 'Novi komentar' });
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('reportMode šalje komentar u izvještaj sa minutom', async () => {
    render(<CommentatorCommentPanel match={match()} reportMode eventMinute={57} />);
    await userEvent.type(screen.getByPlaceholderText('admin.commentPanel.placeholder'), 'Upis');
    await userEvent.click(screen.getByRole('button', { name: 'Pošalji' }));
    expect(state.addReport.mutateAsync).toHaveBeenCalledWith({ matchId: 'm1', message: 'Upis', minute: 57 });
    expect(state.addLive.mutateAsync).not.toHaveBeenCalled();
  });

  it('Enter takođe šalje komentar', async () => {
    render(<CommentatorCommentPanel match={match()} />);
    await userEvent.type(screen.getByPlaceholderText('admin.commentPanel.placeholder'), 'Enter{Enter}');
    expect(state.addLive.mutateAsync).toHaveBeenCalledWith({ matchId: 'm1', message: 'Enter' });
  });

  it('prazna poruka ne šalje ništa i dugme je onemogućeno', async () => {
    render(<CommentatorCommentPanel match={match()} />);
    const button = screen.getByRole('button', { name: 'Pošalji' });
    expect(button).toHaveProperty('disabled', true);
    await userEvent.type(screen.getByPlaceholderText('admin.commentPanel.placeholder'), '   ');
    expect(button).toHaveProperty('disabled', true);
    await userEvent.click(button);
    expect(state.addLive.mutateAsync).not.toHaveBeenCalled();
  });

  it('dok traje zahtjev dugme je onemogućeno', async () => {
    state.addLive = { mutateAsync: vi.fn(async () => ({})), isPending: true };
    render(<CommentatorCommentPanel match={match()} />);
    await userEvent.type(screen.getByPlaceholderText('admin.commentPanel.placeholder'), 'X');
    expect(screen.getByRole('button', { name: 'Pošalji' })).toHaveProperty('disabled', true);
  });
});
