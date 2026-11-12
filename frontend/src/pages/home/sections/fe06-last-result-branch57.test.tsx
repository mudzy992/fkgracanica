import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../hooks', async () => {
  const actual = await vi.importActual<typeof import('../../../hooks')>('../../../hooks');
  return { ...actual, useMatches: vi.fn() };
});
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

import { useMatches } from '../../../hooks';
import { LastResult } from './LastResult';

describe('fe06 LastResult branch57', () => {
  it('isLoading true → skeleton', () => {
    (useMatches as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<MemoryRouter><LastResult /></MemoryRouter>);
    expect(container.querySelector('.animate-pulse') || document.body.textContent).toBeDefined();
    // Skeleton is present when isLoading true
    expect(document.body.innerHTML).toContain('animate-pulse');
  });
  it('homeClub shortName undefined → ?? name fallback', () => {
    const lastMatch = {
      id: 'm1',
      status: 'FINISHED',
      scheduledAt: new Date().toISOString(),
      homeScore: 2, awayScore: 1,
      homeClub: { name: 'FK Goražde', shortName: undefined },
      awayClub: { name: 'NK Travnik', shortName: ' travnik ' },
    };
    (useMatches as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: [lastMatch] as any, isLoading: false });
    render(<MemoryRouter><LastResult /></MemoryRouter>);
    expect(screen.getByText(/FK Goražde/)).toBeInTheDocument();
    expect(screen.getByText(/2 :/)).toBeInTheDocument();
  });
  it('oba bez shortName → ?? name oba', () => {
    const lastMatch = {
      id: 'm2',
      status: 'FINISHED',
      scheduledAt: new Date().toISOString(),
      homeScore: 0, awayScore: 0,
      homeClub: { name: 'FK A' },
      awayClub: { name: 'FK B' },
    };
    (useMatches as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ data: [lastMatch] as any, isLoading: false });
    render(<MemoryRouter><LastResult /></MemoryRouter>);
    expect(screen.getByText(/FK A/)).toBeInTheDocument();
    expect(screen.getByText(/FK B/)).toBeInTheDocument();
  });
});
