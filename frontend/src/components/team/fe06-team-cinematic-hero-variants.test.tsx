import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { TeamCinematicHero } from './TeamCinematicHero';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return { ...actual, useReducedMotion: vi.fn(() => false) };
});
import { useReducedMotion } from 'framer-motion';

describe('TeamCinematicHero — varijante (2 grane)', () => {
  it('reduce false animira', () => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
    const { container } = render(
      <MemoryRouter>
        <TeamCinematicHero club={{ name: 'FK Gračanica', crestPath: 'a.png', slug: 'fk-gracanica' } as never} squad={null} stats={null} city="Gračanica" stadiumName="Stadion" />
      </MemoryRouter>,
    );
    expect(container.textContent).toContain('FK Gračanica');
  });

  it('reduce true bez animacije, bez kluba', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = render(
      <MemoryRouter>
        <TeamCinematicHero club={null} squad={null} stats={null} />
      </MemoryRouter>,
    );
    expect(container.textContent).toContain('Prvi tim');
  });
});
