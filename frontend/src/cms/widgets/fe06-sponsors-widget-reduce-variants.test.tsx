import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { SponsorsWidget } from './SponsorsWidget';

vi.mock('../../hooks', () => ({
  useSponsors: () => ({
    data: [
      { id: 'g1', name: 'General', tier: 'GENERAL', logoPath: 'a.png' },
      { id: 's1', name: 'S1', tier: 'GOLD', logoPath: 'b.png' },
      { id: 's2', name: 'S2', tier: 'SILVER', logoPath: 'c.png' },
    ],
    isLoading: false,
  }),
}));
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return { ...actual, useReducedMotion: () => true };
});

describe('SponsorsWidget — reduce true (2 grane)', () => {
  it('renderuje hero i grid bez animacije', () => {
    render(<MemoryRouter><SponsorsWidget config={{ limit: 10 } as never} /></MemoryRouter>);
    expect(screen.getByText('Partneri koji čine naš uspjeh mogućim')).toBeInTheDocument();
    // viewAll link
    expect(screen.getByRole('link', { name: /viewAll/ })).toBeInTheDocument();
  });
});
