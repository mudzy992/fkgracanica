import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LeagueStandingsTable } from './LeagueStandingsTable';
import { LeagueStandingsMobile } from './LeagueStandingsMobile';
import { LeagueStandingsSection } from './LeagueStandingsSection';
import { LeagueTopScorers } from './LeagueTopScorers';
import type { StandingRow } from '../../../types';

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

const row = (over: Partial<StandingRow> = {}): StandingRow => ({
  clubId: 'k1',
  clubName: 'FK Gračanica',
  clubSlug: 'fk-gracanica',
  crestPath: null,
  played: 10,
  won: 6,
  drawn: 2,
  lost: 2,
  goalsFor: 20,
  goalsAgainst: 10,
  goalDifference: 10,
  points: 20,
  form: 'WWDLW',
  ...over,
});

describe('LeagueStandingsTable', () => {
  it('prikazuje sve kolone i redove', () => {
    wrap(<LeagueStandingsTable rows={[row(), row({ clubId: 'k2', clubName: 'FK Slavija', clubSlug: undefined })]} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Bod')).toBeInTheDocument();
    expect(screen.getByText('GR')).toBeInTheDocument();
    expect(screen.getAllByText('+10').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'FK Gračanica' }).getAttribute('href')).toBe(
      '/klub/fk-gracanica',
    );
    expect(screen.queryByRole('link', { name: 'FK Slavija' })).toBeNull();
  });

  it('compact skriva kolone P/N/I i formu', () => {
    wrap(<LeagueStandingsTable rows={[row()]} compact />);
    expect(screen.queryByText('P')).toBeNull();
    expect(screen.queryByText('Forma')).toBeNull();
  });

  it('prikazuje promjene pozicije kad postoje', () => {
    wrap(
      <LeagueStandingsTable
        rows={[row()]}
        positionChanges={new Map([['k1', 2]])}
      />,
    );
    expect(screen.getByText('±')).toBeInTheDocument();
    expect(screen.getByTitle('Popeo se za 2 pozicije')).toBeInTheDocument();
  });

  it('prazna mapa promjena ne prikazuje kolonu', () => {
    wrap(<LeagueStandingsTable rows={[row()]} positionChanges={new Map()} />);
    expect(screen.queryByText('±')).toBeNull();
  });

  it('negativna gol razlika i istaknut klub', () => {
    const { container } = wrap(
      <LeagueStandingsTable
        rows={[row({ goalDifference: -3, points: 0 })]}
        highlightClubId="k1"
      />,
    );
    expect(screen.getByText('-3')).toBeInTheDocument();
    expect(container.querySelector('.bg-primary\\/15')).not.toBeNull();
  });
});

describe('LeagueStandingsMobile', () => {
  it('prikazuje karticu sa zbirom i formom', () => {
    wrap(<LeagueStandingsMobile rows={[row()]} />);
    expect(screen.getByText('10 utakm. · P6 N2 I2')).toBeInTheDocument();
    expect(screen.getByText(/GR \+10 · 20:10/)).toBeInTheDocument();
    expect(screen.getAllByText('W').length).toBeGreaterThan(0);
  });

  it('bez slug-a klub nije link, istaknut klub ima klasu', () => {
    const { container } = wrap(
      <LeagueStandingsMobile
        rows={[row({ clubSlug: undefined, form: '' })]}
        highlightClubId="k1"
        positionChanges={new Map([['k1', -1]])}
      />,
    );
    expect(screen.queryByRole('link')).toBeNull();
    expect(container.querySelector('[title="Pao je za 1 poziciju"]')).not.toBeNull();
  });

  it('prikazuje više redova', () => {
    wrap(
      <LeagueStandingsMobile
        rows={[row(), row({ clubId: 'k2', clubName: 'FK Slavija', points: 9 })]}
      />,
    );
    expect(screen.getByText('FK Slavija')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });
});

describe('LeagueStandingsSection', () => {
  it('dok se učitava prikazuje skeleton', () => {
    const { container } = wrap(<LeagueStandingsSection title="Tabela" rows={[]} loading />);
    expect(container.querySelector('.animate-pulse')).not.toBeNull();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('sa podacima prikazuje tabelu i mobilnu verziju', () => {
    const { container } = wrap(
      <LeagueStandingsSection title="Tabela" rows={[row()]} loading={false} />,
    );
    expect(screen.getByText('Tabela')).toBeInTheDocument();
    expect(container.querySelectorAll('table')).toHaveLength(1);
  });

  it('prazna tabela prikazuje poruku', () => {
    wrap(<LeagueStandingsSection title="Tabela" rows={[]} loading={false} />);
    expect(screen.getByText('Tabela još nije dostupna.')).toBeInTheDocument();
  });
});

describe('LeagueTopScorers', () => {
  it('bez podataka prikazuje poruke za obje tabele', () => {
    wrap(<LeagueTopScorers />);
    expect(screen.getByText('Najbolji strijelci')).toBeInTheDocument();
    expect(screen.getByText('Nema podataka za golovi sezone.')).toBeInTheDocument();
    expect(screen.queryByText('Asistenti')).toBeNull();
  });

  it('prikazuje strijelce sa linkovima', () => {
    wrap(
      <LeagueTopScorers
        scorers={[{ playerId: 'p1', firstName: 'Amar', lastName: 'Hodžić', value: 9 }]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Amar Hodžić' })).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('Golovi')).toBeInTheDocument();
  });

  it('prikazuje asistente kad ih ima', () => {
    wrap(
      <LeagueTopScorers
        scorers={[{ playerId: 'p1', firstName: 'A', lastName: 'B', value: 1 }]}
        assists={[{ playerId: 'p2', firstName: 'C', lastName: 'D', value: 5 }]}
      />,
    );
    expect(screen.getByText('Asistenti')).toBeInTheDocument();
    expect(screen.getByText('Asist.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'C D' })).toBeInTheDocument();
  });
});
