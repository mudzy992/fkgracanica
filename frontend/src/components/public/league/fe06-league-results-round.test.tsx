import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { LeagueResultsRound } from './LeagueResultsRound';
import type { Match } from '../../../types';

vi.mock('../../../lib/utils', () => ({
  formatDate: (value: string) => `datum:${value.slice(0, 10)}`,
  formatDateTime: (value: string) => `dt:${value}`,
}));
vi.mock('../../ui/skeleton', () => ({ Skeleton: () => <div>skeleton</div> }));
vi.mock('../clubs/ClubLink', () => ({
  ClubLink: ({ slug, name }: { slug: string; name: string }) => <a href={`/klubovi/${slug}`}>{name}</a>,
}));
vi.mock('../clubs/ClubCrest', () => ({
  ClubCrest: ({ club }: { club?: { name: string } }) => <span>grb:{club?.name ?? '-'}</span>,
}));

const club = (name: string, slug: string | null = 'fk-test') => ({
  id: `club-${name}`,
  name,
  ...(slug ? { slug, crestPath: `mediji/${slug}.png` } : {}),
});

const match = (over: Partial<Match> = {}): Match =>
  ({
    id: 'm1',
    status: 'FINISHED',
    scheduledAt: '2026-05-10T17:00:00.000Z',
    homeScore: 2,
    awayScore: 1,
    homeClub: club('Domaći'),
    awayClub: club('Gostujući'),
    roundRel: { id: 'r10', number: 10, name: 'Deseto kolo' },
    ...over,
  }) as Match;

const renderRound = (matches: Match[], loading = false) =>
  render(
    <MemoryRouter>
      <LeagueResultsRound matches={matches} loading={loading} />
    </MemoryRouter>,
  );

describe('LeagueResultsRound — stanja', () => {
  it('učitavanje prikazuje skeleton umjesto tabele', () => {
    renderRound([match()], true);
    expect(screen.getByText('skeleton')).toBeInTheDocument();
    expect(screen.getByText('Rezultati')).toBeInTheDocument();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('bez završenih utakmica prikazuje poruku', () => {
    renderRound([match({ status: 'SCHEDULED' })]);
    expect(screen.getByText('Nema završenih utakmica u ovoj sezoni.')).toBeInTheDocument();
  });

  it('utakmice bez kola se ignorišu', () => {
    renderRound([match({ roundRel: null })]);
    expect(screen.getByText('Nema završenih utakmica u ovoj sezoni.')).toBeInTheDocument();
  });
});

describe('LeagueResultsRound — tabela kola', () => {
  it('prikazuje naziv kola, datum i rezultat sa linkom na utakmicu', () => {
    renderRound([match()]);
    expect(screen.getByText('Rezultati po kolima')).toBeInTheDocument();
    expect(screen.getByText('Deseto kolo')).toBeInTheDocument();
    expect(screen.getByText('datum:2026-05-10')).toBeInTheDocument();
    const score = screen.getByRole('link', { name: '2:1' });
    expect(score).toHaveAttribute('href', '/utakmice/m1');
    expect(screen.getByRole('link', { name: 'Utakmica →' })).toHaveAttribute('href', '/utakmice/m1');
  });

  it('klubovi sa slugom su linkovi, a bez sluga običan tekst', () => {
    renderRound([
      match({ homeClub: club('Bez sluga', null), awayClub: club('Gost', 'gost') }),
    ]);
    expect(screen.getByText('Bez sluga').tagName).toBe('SPAN');
    expect(screen.getByRole('link', { name: 'Gost' })).toHaveAttribute('href', '/klubovi/gost');
  });

  it('nedostajući klubovi prikazuju crticu umjesto grba', () => {
    renderRound([match({ homeClub: undefined, awayClub: undefined })]);
    const row = screen.getAllByRole('row')[1];
    expect(within(row).getAllByText('—')).toHaveLength(2);
    expect(within(row).queryByText(/^grb:/)).toBeNull();
  });

  it('kolo bez naziva koristi broj', () => {
    renderRound([match({ roundRel: { id: 'r7', number: 7, name: null } })]);
    expect(screen.getByText('7. kolo')).toBeInTheDocument();
  });
});

describe('LeagueResultsRound — listanje kola', () => {
  const multi = [
    match({ id: 'm10', roundRel: { id: 'r10', number: 10, name: 'Deseto kolo' } }),
    match({ id: 'm11', roundRel: { id: 'r11', number: 11, name: 'Jedanaesto kolo' } }),
    match({ id: 'm12', roundRel: { id: 'r12', number: 12, name: 'Dvanaesto kolo' } }),
  ];

  it('početno je prikazano najnovije kolo, a nazad vodi starija', async () => {
    const user = userEvent.setup();
    renderRound(multi);
    expect(screen.getByText('Dvanaesto kolo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prethodno kolo' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Sljedeće kolo' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Prethodno kolo' }));
    expect(screen.getByText('Jedanaesto kolo')).toBeInTheDocument();
  });

  it('naprijed se vraća na novije kolo do najnovijeg', async () => {
    const user = userEvent.setup();
    renderRound(multi);
    await user.click(screen.getByRole('button', { name: 'Prethodno kolo' }));
    await user.click(screen.getByRole('button', { name: 'Prethodno kolo' }));
    expect(screen.getByText('Deseto kolo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prethodno kolo' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Sljedeće kolo' }));
    expect(screen.getByText('Jedanaesto kolo')).toBeInTheDocument();
  });

  it('sa jednim kolom su oba dugmeta onemogućena', () => {
    renderRound([match()]);
    expect(screen.getByRole('button', { name: 'Prethodno kolo' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Sljedeće kolo' })).toBeDisabled();
  });

  it('zadržava izabrano kolo kad se lista dopuni novijim', () => {
    const { rerender } = render(
      <MemoryRouter>
        <LeagueResultsRound matches={multi.slice(0, 2)} loading={false} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Jedanaesto kolo')).toBeInTheDocument();
    rerender(
      <MemoryRouter>
        <LeagueResultsRound matches={multi} loading={false} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Jedanaesto kolo')).toBeInTheDocument();
  });

  it('ista utakmica iz dva kola prikazuje se u svom kolu', async () => {
    const user = userEvent.setup();
    renderRound([
      match({ id: 'a', roundRel: { id: 'r5', number: 5, name: 'Peto kolo' } }),
      match({ id: 'b', roundRel: { id: 'r6', number: 6, name: 'Šesto kolo' } }),
    ]);
    expect(screen.getByRole('link', { name: '2:1' })).toHaveAttribute('href', '/utakmice/b');
    await user.click(screen.getByRole('button', { name: 'Prethodno kolo' }));
    expect(screen.getByRole('link', { name: '2:1' })).toHaveAttribute('href', '/utakmice/a');
  });
});
