import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { PublicAuthButton } from './PublicAuthButton';

const state = vi.hoisted(() => ({ isAuthenticated: false, isLoading: false }));

vi.mock('../../lib/auth', () => ({ useAuth: () => state }));
vi.mock('./PublicUserMenu', () => ({
  PublicUserMenu: ({ mobile }: { mobile?: boolean }) => (
    <div>korisnicki-meni:{mobile ? 'mobile' : 'desktop'}</div>
  ),
}));

beforeEach(() => {
  state.isAuthenticated = false;
  state.isLoading = false;
});

describe('PublicAuthButton accessibility', () => {
  it('renderuje jedan dovoljno visok link, bez ugniježđenog dugmeta', () => {
    render(<MemoryRouter><PublicAuthButton /></MemoryRouter>);
    const link = screen.getByRole('link', { name: 'Prijavi se' });
    expect(link).toHaveAttribute('href', '/prijava');
    // AAA responsive sm: h-8 na bazi + lg:h-9 — jsdom vidi h-8, lg:h-9 kao klasu
    expect(link).toHaveClass('h-8');
    expect(link).toHaveClass('lg:h-9');
    expect(link.querySelector('button')).toBeNull();
  });

  it('dok se sesija učitava ne renderuje ništa', () => {
    state.isLoading = true;
    const { container } = render(<MemoryRouter><PublicAuthButton /></MemoryRouter>);
    expect(container).toBeEmptyDOMElement();
  });

  it('prijavljeni korisnik dobija meni, mobilni dobija mobilnu varijantu', () => {
    state.isAuthenticated = true;
    const { rerender } = render(<MemoryRouter><PublicAuthButton /></MemoryRouter>);
    expect(screen.getByText('korisnicki-meni:desktop')).toBeInTheDocument();
    rerender(<MemoryRouter><PublicAuthButton mobile /></MemoryRouter>);
    expect(screen.getByText('korisnicki-meni:mobile')).toBeInTheDocument();
  });
});
