import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { PublicUserMenu } from './PublicUserMenu';

const state = vi.hoisted(() => ({
  user: { id: 'fixture', email: 'test@example.test', firstName: 'Test', lastName: 'User', permissions: [] as string[] },
  logout: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../lib/auth', () => ({ useAuth: () => state }));

describe('PublicUserMenu accessible label', () => {
  it('uključuje vidljive inicijale uz naziv, bez promjene otvaranja i Escapea', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><PublicUserMenu /></MemoryRouter>);
    const button = screen.getByRole('button', { name: 'Moj račun: TU' });
    expect(button).toHaveTextContent('TU');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: 'Moj račun' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
