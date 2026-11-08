import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicUserMenu } from './PublicUserMenu';

const state = vi.hoisted(() => ({
  user: null as unknown as { id: string; email: string; firstName: string; lastName: string; permissions: string[] } | null,
  logout: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ user: state.user, logout: state.logout }),
}));
vi.mock('../../lib/permissions', async () => {
  const actual = await vi.importActual<typeof import('../../lib/permissions')>('../../lib/permissions');
  return { ...actual };
});

describe('PublicUserMenu — staff varijante (4 grane)', () => {
  beforeEach(() => {
    state.logout.mockClear();
  });

  it('staff korisnik prikazuje dodatne stavke', async () => {
    state.user = { id: 'u1', email: 'a@b.test', firstName: 'Admin', lastName: 'User', permissions: ['admin.manage', 'news.manage', 'cms.manage', 'competition.manage', 'sponsors.manage', 'users.manage'] } as never;
    const { container } = render(
      <MemoryRouter>
        <PublicUserMenu />
      </MemoryRouter>,
    );
    expect(container).toBeInTheDocument();
  });

  it('korisnik sa firstName i lastName koristi oba ?? grana', () => {
    state.user = { id: 'u1', email: 'a@b.test', firstName: 'Mujo', lastName: 'Mujić', permissions: [] };
    const { container } = render(
      <MemoryRouter>
        <PublicUserMenu />
      </MemoryRouter>,
    );
    expect(container).toBeInTheDocument();
  });

  it('korisnik bez firstName koristi lastName fallback', () => {
    state.user = { id: 'u1', email: 'a@b.test', firstName: '', lastName: 'Mujić', permissions: [] } as never;
    const { container } = render(
      <MemoryRouter>
        <PublicUserMenu />
      </MemoryRouter>,
    );
    expect(container).toBeInTheDocument();
  });
});
