import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { PublicAuthButton } from './PublicAuthButton';

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ isAuthenticated: false, isLoading: false }),
}));

describe('PublicAuthButton accessibility', () => {
  it('renderuje jedan dovoljno visok link, bez ugniježđenog dugmeta', () => {
    render(<MemoryRouter><PublicAuthButton /></MemoryRouter>);
    const link = screen.getByRole('link', { name: 'Prijavi se' });
    expect(link).toHaveAttribute('href', '/prijava');
    expect(link).toHaveClass('h-8');
    expect(link.querySelector('button')).toBeNull();
  });
});
