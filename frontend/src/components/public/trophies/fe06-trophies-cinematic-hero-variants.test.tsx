import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TrophiesCinematicHero } from './TrophiesCinematicHero';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return { ...actual, useReducedMotion: () => true };
});

describe('TrophiesCinematicHero — varijante (2 grane: reduce + featuredYear fallback)', () => {
  it('bez trofeja ne prikazuje KPI', () => {
    render(<TrophiesCinematicHero totalCount={0} featuredYear={2024} competitionCount={3} />);
    expect(screen.getByText('Trofeji i titule')).toBeInTheDocument();
    expect(screen.queryByText('Trofeja')).toBeNull();
  });

  it('sa trofejima i featuredYear null daje crticu', () => {
    render(<TrophiesCinematicHero totalCount={5} featuredYear={null} competitionCount={2} />);
    expect(screen.getByText('Trofeja')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('Vrhunac')).toBeInTheDocument();
  });

  it('sa featuredYear brojem prikazuje broj', () => {
    render(<TrophiesCinematicHero totalCount={5} featuredYear={1999} competitionCount={2} />);
    expect(screen.getByText('1999')).toBeInTheDocument();
  });

  it('featuredYear undefined također daje crticu', () => {
    render(<TrophiesCinematicHero totalCount={2} featuredYear={undefined} competitionCount={1} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
