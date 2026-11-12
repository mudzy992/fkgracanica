import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { PublicUserMenu } from './PublicUserMenu';

const state = vi.hoisted(() => ({
  user: null as null | { id: string; email: string; firstName?: string | null; lastName?: string | null; permissions: string[] },
  logout: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => state }));

describe('PublicUserMenu — extra varijante (2 grane)', () => {
  it('mobile sa firstName/lastName prikazuje puno ime, ne email', () => {
    state.user = { id: 'u1', email: 'a@b.test', firstName: 'Test', lastName: 'User', permissions: [] };
    render(
      <MemoryRouter>
        <PublicUserMenu mobile />
      </MemoryRouter>,
    );
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('a@b.test')).toBeInTheDocument();
    expect(screen.getByText('TU')).toBeInTheDocument();
  });

  it('mobile sa samo firstName koristi firstName ?? fallback', () => {
    state.user = { id: 'u2', email: 'b@c.test', firstName: 'Solo', lastName: null, permissions: [] };
    render(
      <MemoryRouter>
        <PublicUserMenu mobile />
      </MemoryRouter>,
    );
    expect(screen.getByText('Solo')).toBeInTheDocument();
  });

  it('mobile sa samo lastName koristi lastName ?? fallback', () => {
    state.user = { id: 'u3', email: 'c@d.test', firstName: null, lastName: 'Prezime', permissions: [] };
    render(
      <MemoryRouter>
        <PublicUserMenu mobile />
      </MemoryRouter>,
    );
    expect(screen.getByText('Prezime')).toBeInTheDocument();
  });
});
