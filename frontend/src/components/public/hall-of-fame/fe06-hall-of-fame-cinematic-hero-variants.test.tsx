import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HallOfFameCinematicHero } from './HallOfFameCinematicHero';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return { ...actual, useReducedMotion: () => true };
});

describe('HallOfFameCinematicHero — varijante (2 grane: reduce + yearCount fallback)', () => {
  it('bez legendi ne prikazuje KPI grid', () => {
    render(<HallOfFameCinematicHero totalCount={0} yearCount={5} />);
    expect(screen.getByText('Kuća slavnih')).toBeInTheDocument();
    expect(screen.queryByText('Legendi')).toBeNull();
    expect(screen.queryByText('Godina')).toBeNull();
  });

  it('sa legendama i yearCount 0 daje crticu', () => {
    render(<HallOfFameCinematicHero totalCount={3} yearCount={0} />);
    expect(screen.getByText('Legendi')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('Godina')).toBeInTheDocument();
  });

  it('sa legendama i yearCount>0 prikazuje broj', () => {
    render(<HallOfFameCinematicHero totalCount={10} yearCount={7} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });
});
