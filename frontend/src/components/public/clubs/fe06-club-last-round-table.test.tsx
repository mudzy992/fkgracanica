import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ClubLastRoundMatchesTable } from './ClubLastRoundMatchesTable';
import type { Match } from '../../../types';

const match = (over: Record<string, unknown> = {}) =>
  ({
    id: 'm1',
    homeClubId: 'c1',
    awayClubId: 'c2',
    homeScore: 3,
    awayScore: 0,
    scheduledAt: '2026-05-01T17:00:00.000Z',
    homeClub: { id: 'c1', name: 'FK Gračanica', slug: 'fk-gracanica', crestPath: 'originals/c/g.png' },
    awayClub: { id: 'c2', name: 'FK Slavija', slug: 'fk-slavija', crestPath: null },
    ...over,
  }) as unknown as Match;

const renderTable = (matches: Match[], highlightClubId = 'c1', loading = false) =>
  render(
    <MemoryRouter>
      <ClubLastRoundMatchesTable
        matches={matches}
        highlightClubId={highlightClubId}
        loading={loading}
      />
    </MemoryRouter>,
  );

describe('ClubLastRoundMatchesTable', () => {
  it('dok se učitava prikazuje četiri skeletona', () => {
    const { container } = renderTable([], 'c1', true);
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(4);
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('bez utakmica prikazuje prazno stanje', () => {
    renderTable([]);
    expect(screen.getByText('Nema utakmica u posljednjem kolu.')).toBeTruthy();
  });

  it('prikazuje tabelu sa rezultatom i linkom na utakmicu', () => {
    renderTable([match()]);
    expect(screen.getByRole('table')).toBeTruthy();
    const link = screen.getByRole('link', { name: '3:0' });
    expect(link.getAttribute('href')).toBe('/utakmice/m1');
    expect(screen.getByRole('link', { name: 'FK Gračanica' }).getAttribute('href')).toBe(
      '/klub/fk-gracanica',
    );
  });

  it('utakmica sa označenim klubom ima istaknut red', () => {
    const { container } = renderTable([match()]);
    const row = container.querySelector('tbody tr') as HTMLElement;
    expect(row.className).toContain('bg-primary/10');
  });

  it('utakmica bez označenog kluba nije istaknuta', () => {
    const { container } = renderTable([match()], 'c9');
    const row = container.querySelector('tbody tr') as HTMLElement;
    expect(row.className).not.toContain('bg-primary/10');
  });

  it('redoslijed je po datumu uzlazno', () => {
    renderTable([
      match({ id: 'm2', scheduledAt: '2026-05-10T17:00:00.000Z', homeScore: 9 }),
      match({ id: 'm1', scheduledAt: '2026-05-01T17:00:00.000Z', homeScore: 1 }),
    ]);
    const rows = screen.getAllByRole('row').slice(1);
    expect(within(rows[0]).getByRole('link', { name: '1:0' })).toBeTruthy();
    expect(within(rows[1]).getByRole('link', { name: '9:0' })).toBeTruthy();
  });

  it('nedostupni klubovi prikazuju crtice', () => {
    renderTable([match({ homeClub: undefined, awayClub: undefined })]);
    expect(screen.getAllByText('—')).toHaveLength(2);
  });

  it('klub bez slug-a prikazuje tekst umjesto linka', () => {
    renderTable([match({ homeClub: { id: 'c1', name: 'Bez sluga' }, awayClub: { id: 'c2', name: 'Gostujući klub' } })]);
    expect(screen.getByText('Bez sluga')).toBeTruthy();
    expect(screen.getByText('Gostujući klub')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Bez sluga' })).toBeNull();
  });

  it('zaglavlje sadrži Domaćin, Rez. i Gost', () => {
    renderTable([match()]);
    ['Domaćin', 'Rez.', 'Gost', 'Datum'].forEach((label) =>
      expect(screen.getByRole('columnheader', { name: label })).toBeTruthy(),
    );
  });
});
