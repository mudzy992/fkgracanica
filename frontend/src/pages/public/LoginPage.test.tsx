import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { LoginPage } from './LoginPage';

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ login: vi.fn(), isAuthenticated: false, isLoading: false, user: null }),
}));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));

describe('LoginPage accessibility', () => {
  it('povezuje prevedene labele i autocomplete sa poljima', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText('Lozinka')).toHaveAttribute('autocomplete', 'current-password');
  });
});
