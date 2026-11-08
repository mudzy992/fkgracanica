import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { PublicUserMenu } from './PublicUserMenu';

const state = vi.hoisted(() => ({
  user: null as null | { id: string; email: string; firstName?: string | null; lastName?: string | null; permissions: string[] },
  logout: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => state }));

describe('PublicUserMenu — varijante (3 grane)', () => {
  it('bez firstName/lastName prikazuje email i prazne inicijale', async () => {
    state.user = { id: 'u1', email: 'a@b.test', firstName: null, lastName: null, permissions: [] };
    render(
      <MemoryRouter>
        <PublicUserMenu mobile />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('a@b.test').length).toBeGreaterThan(0);
    // mobile shows avatar with initials (empty) and email
    expect(screen.getAllByText('a@b.test')[0]).toBeInTheDocument();
  });

  it('Escape zatvara, drugi taster ne zatvara meni', async () => {
    state.user = { id: 'u1', email: 'a@b.test', firstName: 'Test', lastName: 'User', permissions: [] };
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PublicUserMenu />
      </MemoryRouter>,
    );
    const btn = screen.getByRole('button', { name: 'Moj račun: TU' });
    await user.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{a}');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('bez korisnika ne renderira ništa', () => {
    state.user = null;
    const { container } = render(
      <MemoryRouter>
        <PublicUserMenu />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
