import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LeagueNextMatch } from './LeagueNextMatch';
import { LeagueLiveMatches } from './LeagueLiveMatches';
import { LeagueCinematicHero } from './LeagueCinematicHero';
import type { SeasonOption } from '../../../lib/season-utils';
import type { Match } from '../../../types';

const season = (id: string, over: Partial<SeasonOption> = {}): SeasonOption => ({
  id,
  name: `Sezona ${id}`,
  isActive: false,
  ...over,
});

const match = (over: Partial<Match> = {}): Match =>
  ({
    id: 'm1',
    seasonId: 's1',
    homeClubId: 'k1',
    awayClubId: 'k2',
    status: 'SCHEDULED',
    scheduledAt: '2030-05-01T17:00:00.000Z',
    homeScore: 1,
    awayScore: 0,
    minute: 0,
    venue: 'Gradski stadion',
    homeClub: { name: 'FK Gračanica', crestPath: null },
    awayClub: { name: 'FK Slavija', crestPath: null },
    ...over,
  }) as Match;

describe('LeagueNextMatch', () => {
  const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

  it('bez zakazane buduće utakmice ne renderira ništa', () => {
    const { container } = wrap(<LeagueNextMatch matches={[match({ status: 'FINISHED' })]} />);
    expect(container.textContent).toBe('');
  });

  it('prošla zakazana utakmica se preskače', () => {
    const { container } = wrap(
      <LeagueNextMatch matches={[match({ scheduledAt: '2020-01-01T10:00:00.000Z' })]} />,
    );
    expect(container.textContent).toBe('');
  });

  it('prikazuje najbližu zakazanu utakmicu', () => {
    wrap(
      <LeagueNextMatch
        matches={[
          match({ id: 'm2', scheduledAt: '2031-01-01T10:00:00.000Z' }),
          match({ id: 'm1' }),
        ]}
      />,
    );
    expect(screen.getByText('Sljedeća utakmica')).toBeTruthy();
    expect(screen.getByText('FK Gračanica')).toBeTruthy();
    expect(screen.getByText('Zakazano')).toBeTruthy();
    expect(screen.getByText(/Gradski stadion/)).toBeTruthy();
    expect(
      screen.getByRole('link', { name: /Pre-match \/ Live/ }).getAttribute('href'),
    ).toBe('/live/m1');
    expect(screen.getByRole('link', { name: /Detalji/ }).getAttribute('href')).toBe('/utakmice/m1');
  });

  it('bez mjesta nema separatora', () => {
    wrap(<LeagueNextMatch matches={[match({ venue: null })]} />);
    expect(screen.queryByText(/· Gradski/)).toBeNull();
  });
});

describe('LeagueLiveMatches', () => {
  const wrap = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

  it('bez utakmica uživo ne renderira ništa', () => {
    const { container } = wrap(<LeagueLiveMatches matches={[match()]} />);
    expect(container.textContent).toBe('');
  });

  it('prikazuje utakmice uživo i pauzu', () => {
    wrap(
      <LeagueLiveMatches
        matches={[
          match({ id: 'm1', status: 'LIVE', homeScore: 2, awayScore: 1 }),
          match({ id: 'm2', status: 'HALFTIME' }),
        ]}
      />,
    );
    expect(screen.getByText('Uživo')).toBeTruthy();
    expect(screen.getByText('UŽIVO')).toBeTruthy();
    expect(screen.getByText('Pauza')).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /Prati uživo/ })).toHaveLength(2);
  });
});

describe('LeagueCinematicHero', () => {
  it('bez sezone prikazuje rezervni opis i crtice', () => {
    render(<LeagueCinematicHero teamCount={0} roundsPlayed={0} />);
    expect(screen.getByText('Tabela, rezultati i statistike sezone.')).toBeTruthy();
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
  });

  it('sa sezonom i liderom prikazuje KPI vrijednosti', () => {
    render(
      <LeagueCinematicHero
        season={season('s1') as never}
        teamCount={16}
        roundsPlayed={12}
        leaderName="FK Gračanica"
        leaderPoints={30}
      />,
    );
    expect(screen.getByText('Sezona s1')).toBeTruthy();
    expect(screen.getByText('16')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('FK Gračanica')).toBeTruthy();
    expect(screen.getByText('30')).toBeTruthy();
  });
});
