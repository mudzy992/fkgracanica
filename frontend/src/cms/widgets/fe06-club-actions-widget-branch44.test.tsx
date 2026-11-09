import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ClubActionsWidget } from './ClubActionsWidget';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  useSubscribeNewsletter: () => ({ mutateAsync: vi.fn(), isPending: false, isError: false, error: null }),
}));

describe('ClubActionsWidget — branch44 (2 grane: membershipFields fallback)', () => {
  it('config sa text bez buttonUrl/buttonLabel koristi fallbackove', () => {
    render(
      <MemoryRouter>
        <ClubActionsWidget config={{ text: 'Postani član' } as never} />
      </MemoryRouter>,
    );
    // membership.text = 'Postani član', buttonUrl fallback /clanstvo, buttonLabel fallback home.membership
    expect(screen.getByText('Postani član')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /home.membership/ });
    expect(link).toHaveAttribute('href', '/clanstvo');
  });

  it('config sa buttonUrl bez buttonLabel koristi label fallback', () => {
    render(
      <MemoryRouter>
        <ClubActionsWidget config={{ buttonUrl: '/custom', text: 'A' } as never} />
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: /home.membership/ });
    expect(link).toHaveAttribute('href', '/custom');
    expect(link).toHaveTextContent('home.membership');
  });
});
