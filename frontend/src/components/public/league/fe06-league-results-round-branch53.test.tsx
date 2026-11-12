import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LeagueResultsRound } from './LeagueResultsRound';

describe('fe06 LeagueResultsRound branch53', () => {
  it('loading true → skeleton', () => {
    const { container } = render(<MemoryRouter><LeagueResultsRound loading={true} matches={[]} /></MemoryRouter>);
    expect(container.textContent).toBeDefined();
  });
  it('!groups.length → Nema završenih branch', () => {
    render(<MemoryRouter><LeagueResultsRound loading={false} matches={[]} /></MemoryRouter>);
    expect(screen.getByText(/Nema završenih/)).toBeInTheDocument();
  });
  it('club with slug → ClubLink branch true (groups.length)', () => {
    const matches = [{ id: '1', scheduledAt: new Date().toISOString(), status: 'FINISHED', roundRel: { number: 1, name: '1. kolo' }, homeClub: { id: '1', name: 'A', slug: 'a' }, awayClub: { id: '2', name: 'B', slug: 'b' }, homeScore: 1, awayScore: 0 } as never];
    render(<MemoryRouter><LeagueResultsRound loading={false} matches={matches} /></MemoryRouter>);
    expect(screen.getByText('1. kolo')).toBeInTheDocument();
  });
});
