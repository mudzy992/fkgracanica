import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LeagueResultsByRound } from './LeagueResultsByRound';
import type { Match } from '../../../types';

const match = (over: Record<string, unknown> = {}) =>
  ({
    id: 'm1',
    status: 'FINISHED',
    homeScore: 2,
    awayScore: 1,
    scheduledAt: '2026-05-01T17:00:00.000Z',
    homeClub: { id: 'c1', name: 'FK Gračanica', slug: 'fk-gracanica', crestPath: 'originals/crests/g.png' },
    awayClub: { id: 'c2', name: 'FK Slavija', slug: 'fk-slavija', crestPath: null },
    roundRel: { number: 12, name: null },
    ...over,
  }) as unknown as Match;

const renderList = (matches: Match[], loading = false) =>
  render(
    <MemoryRouter>
      <LeagueResultsByRound matches={matches} loading={loading} />
    </MemoryRouter>,
  );

describe('LeagueResultsByRound', () => {
  it('dok se učitava prikazuje pet skeletona bez teksta', () => {
    const { container } = renderList([], true);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(5);
    expect(screen.queryByText('Nema završenih utakmica.')).toBeNull();
  });

  it('bez završenih utakmica prikazuje prazno stanje', () => {
    renderList([match({ status: 'SCHEDULED' })]);
    expect(screen.getByText('Nema završenih utakmica.')).toBeTruthy();
  });

  it('prikazuje rezultat, klubove i oznaku Kraj', () => {
    renderList([match()]);
    expect(screen.getByText('2:1')).toBeTruthy();
    expect(screen.getByText('Kraj')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'FK Gračanica' }).getAttribute('href')).toBe(
      '/klub/fk-gracanica',
    );
  });

  it('kartica vodi na javnu stranicu utakmice', () => {
    renderList([match()]);
    expect(document.querySelector('a[href="/utakmice/m1"]')).toBeTruthy();
  });

  it('klub bez slug-a prikazuje običan naziv, bez kluba crticu', () => {
    renderList([match({ homeClub: { id: 'c1', name: 'Bez sluga' }, awayClub: undefined })]);
    expect(screen.getByText('Bez sluga')).toBeTruthy();
    expect(screen.getByText('—')).toBeTruthy();
  });

  it('grupira po kolima od najnovijeg ka starijem', () => {
    renderList([
      match({ id: 'm1', roundRel: { number: 10, name: null } }),
      match({ id: 'm2', roundRel: { number: 12, name: null } }),
    ]);
    const headings = screen.getAllByRole('heading').map((h) => h.textContent ?? '');
    expect(headings).toHaveLength(2);
    expect(headings[0]).toContain('12');
    expect(headings[1]).toContain('10');
  });

  it('utakmice bez kola se preskaču', () => {
    renderList([match({ id: 'm9', roundRel: null })]);
    expect(screen.getByText('Nema završenih utakmica.')).toBeTruthy();
  });
});
