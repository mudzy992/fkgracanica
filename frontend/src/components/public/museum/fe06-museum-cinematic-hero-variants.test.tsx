import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MuseumCinematicHero } from './MuseumCinematicHero';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return { ...actual, useReducedMotion: () => true };
});

describe('MuseumCinematicHero — varijante (3 grane)', () => {
  it('bez predmeta ne prikazuje KPI grid', () => {
    render(<MuseumCinematicHero totalCount={0} yearCount={5} categoryCount={3} />);
    expect(screen.getByText('Muzej')).toBeInTheDocument();
    expect(screen.queryByText('Predmeta')).toBeNull();
    expect(screen.queryByText('Godina')).toBeNull();
  });

  it('sa predmetima prikazuje sve KPI, prazna godina/kategorija daje crticu', () => {
    render(<MuseumCinematicHero totalCount={12} yearCount={0} categoryCount={0} />);
    expect(screen.getByText('Predmeta')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    // yearCount 0 => '—'
    expect(screen.getAllByText('—')).toHaveLength(2);
    expect(screen.getByText('Godina')).toBeInTheDocument();
    expect(screen.getByText('Kategorije')).toBeInTheDocument();
  });

  it('sa svim brojevima prikazuje brojeve', () => {
    render(<MuseumCinematicHero totalCount={5} yearCount={7} categoryCount={9} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });
});
