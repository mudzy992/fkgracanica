import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ClubActionsWidget } from './ClubActionsWidget';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({ useSubscribeNewsletter: () => ({ mutateAsync: vi.fn(), isPending: false, isError: false, error: null }) }));
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return { ...actual, useReducedMotion: () => true };
});

describe('ClubActionsWidget — reduce true i membership fallback (3 grane)', () => {
  it('prazan config koristi fallbackove i reduce false animaciju', () => {
    render(<MemoryRouter><ClubActionsWidget config={{} as never} /></MemoryRouter>);
    expect(screen.getAllByText('home.membership').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('link', { name: /home.membership/ })).toHaveAttribute('href', '/clanstvo');
  });

  it('config sa title ali bez buttonUrl/text koristi fallback url', () => {
    render(<MemoryRouter><ClubActionsWidget config={{ title: 'X' } as never} /></MemoryRouter>);
    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home.membership/ })).toHaveAttribute('href', '/clanstvo');
  });
});
