import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PublicAuthButton } from './PublicAuthButton';

const state = vi.hoisted(() => ({ isAuthenticated: false, isLoading: false }));

vi.mock('../../lib/auth', () => ({ useAuth: () => state }));
vi.mock('./PublicUserMenu', () => ({ PublicUserMenu: () => <div>menu</div> }));

beforeEach(() => { state.isAuthenticated = false; state.isLoading = false; });

describe('PublicAuthButton — varijante (2 grane mobile)', () => {
  it('mobile true koristi default size i w-full', () => {
    render(<MemoryRouter><PublicAuthButton mobile /></MemoryRouter>);
    const link = screen.getByRole('link');
    expect(link.className).toContain('w-full');
    // size default gives h-11 vs sm h-9 — check h-10 present
    expect(link.className).toContain('h-11');
  });

  it('mobile false koristi sm size bez w-full', () => {
    render(<MemoryRouter><PublicAuthButton /></MemoryRouter>);
    const link = screen.getByRole('link');
    expect(link.className).not.toContain('w-full');
    expect(link.className).toContain('h-9');
  });

  it('mobile undefined također sm bez w-full', () => {
    render(<MemoryRouter><PublicAuthButton mobile={undefined} /></MemoryRouter>);
    const link = screen.getByRole('link');
    expect(link.className).not.toContain('w-full');
  });
});
