import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ClubLastRoundMatchesTable } from './ClubLastRoundMatchesTable';
import type { Match } from '../../../types';

const m = (over: Record<string, unknown> = {}) =>
  ({
    id: 'm1',
    homeClubId: 'c1',
    awayClubId: 'c2',
    homeScore: 2,
    awayScore: 1,
    scheduledAt: '2026-05-01T17:00:00.000Z',
    homeClub: { id: 'c1', name: 'FK Gračanica', slug: 'fk-gracanica' },
    awayClub: { id: 'c2', name: 'FK Slavija', slug: 'fk-slavija' },
    ...over,
  }) as unknown as Match;

describe('ClubLastRoundMatchesTable — branch47 (2 grane ?? fallback)', () => {
  it('club.name ?? fallback kada je name null/undefined prikazuje crticu unutar linka', () => {
    render(
      <MemoryRouter>
        <ClubLastRoundMatchesTable
          matches={[
            m({
              homeClub: { id: 'c1', slug: 'fk-gracanica', name: null } as unknown as Match['homeClub'],
              awayClub: { id: 'c2', slug: 'fk-slavija', name: undefined } as unknown as Match['awayClub'],
            }),
          ]}
          highlightClubId="c1"
        />
      </MemoryRouter>,
    );
    // oba kluba imaju slug, ali name je null/undefined => ClubLink name fallback '—'
    // ClubLink renderuje link sa text '—'
    const dashes = screen.getAllByText('—');
    // barem 2 dash-a za imena (plus mogu biti od drugih mjesta, ali provjeri da postoje linkovi sa dash)
    expect(dashes.length).toBeGreaterThanOrEqual(2);
    // linkovi sa href /klub/fk-gracanica itd. treba da postoje i imaju text —
    expect(screen.getAllByRole('link', { name: '—' }).length).toBeGreaterThanOrEqual(2);
  });

  it('jedan klub sa imenom, drugi bez imena pokriva oba kraka odvojeno', () => {
    const { unmount } = render(
      <MemoryRouter>
        <ClubLastRoundMatchesTable
          matches={[
            m({
              homeClub: { id: 'c1', slug: 'fk-gracanica', name: 'FK Gračanica' } as unknown as Match['homeClub'],
              awayClub: { id: 'c2', slug: 'fk-slavija', name: null } as unknown as Match['awayClub'],
            }),
          ]}
          highlightClubId="c1"
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('FK Gračanica')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    unmount();
    render(
      <MemoryRouter>
        <ClubLastRoundMatchesTable
          matches={[
            m({
              homeClub: { id: 'c1', slug: 'fk-gracanica', name: undefined } as unknown as Match['homeClub'],
              awayClub: { id: 'c2', slug: 'fk-slavija', name: 'FK Slavija' } as unknown as Match['awayClub'],
            }),
          ]}
          highlightClubId="c1"
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('FK Slavija')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
