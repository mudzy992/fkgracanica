import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { PublicUserMenu } from './PublicUserMenu';

const state = vi.hoisted(() => ({
  user: null as Record<string, unknown> | null,
  logout: vi.fn(),
}));

vi.mock('../../lib/auth', () => ({ useAuth: () => state }));

const user = (over: Record<string, unknown> = {}) => ({
  id: 'u1',
  email: 'amar@example.test',
  firstName: 'Amar',
  lastName: 'Hodžić',
  permissions: [] as string[],
  ...over,
});

const wrap = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

const setup = (over: Record<string, unknown> = {}) => {
  state.user = user(over);
  state.logout = vi.fn().mockResolvedValue(undefined);
};

describe('PublicUserMenu — desktop', () => {
  it('bez korisnika ne renderira ništa', () => {
    state.user = null;
    const { container } = wrap(<PublicUserMenu />);
    expect(container).toBeEmptyDOMElement();
  });

  it('otvara meni i nudi račun, bez admin linka za običnog korisnika', async () => {
    setup();
    wrap(<PublicUserMenu />);
    await userEvent.click(screen.getByRole('button', { name: 'Moj račun: AH' }));
    expect(screen.getByRole('menuitem', { name: 'Moj račun' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Dashboard' })).toBeNull();
    expect(screen.getByRole('menuitem', { name: 'Odjava' })).toBeInTheDocument();
  });

  it('osoblje vidi i administrativni link', async () => {
    setup({ permissions: ['news.manage'] });
    wrap(<PublicUserMenu />);
    await userEvent.click(screen.getByRole('button', { name: 'Moj račun: AH' }));
    const admin = screen.getByRole('menuitem', { name: 'Dashboard' });
    expect(admin.getAttribute('href')).toBe('/admin');
  });

  it('klik van menija zatvara meni', async () => {
    setup();
    wrap(
      <div>
        <PublicUserMenu />
        <span data-testid="van">van</span>
      </div>,
    );
    const trigger = screen.getByRole('button', { name: 'Moj račun: AH' });
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(screen.getByTestId('van'));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('odjava poziva logout i zatvara meni', async () => {
    setup();
    wrap(<PublicUserMenu />);
    const trigger = screen.getByRole('button', { name: 'Moj račun: AH' });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Odjava' }));
    expect(state.logout).toHaveBeenCalled();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('PublicUserMenu — mobilni', () => {
  it('prikazuje ime, email i inicijale bez padajućeg menija', () => {
    setup();
    wrap(<PublicUserMenu mobile />);
    expect(screen.getByText('Amar Hodžić')).toBeInTheDocument();
    expect(screen.getByText('amar@example.test')).toBeInTheDocument();
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Moj račun:/ })).toBeNull();
  });

  it('bez imena prikazuje email kao naslov', () => {
    setup({ firstName: '', lastName: '' });
    wrap(<PublicUserMenu mobile />);
    expect(screen.getAllByText('amar@example.test')).toHaveLength(2);
  });

  it('navigacija zatvara meni preko onNavigate', async () => {
    const onNavigate = vi.fn();
    setup();
    wrap(<PublicUserMenu mobile onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Moj račun' }));
    expect(onNavigate).toHaveBeenCalled();
  });
});
