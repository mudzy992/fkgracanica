import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { LoginPage } from './LoginPage';

const state = vi.hoisted(() => ({
  login: vi.fn(),
  isAuthenticated: false,
  isLoading: false,
  user: null as Record<string, unknown> | null,
}));

vi.mock('../../lib/auth', () => ({ useAuth: () => state }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));

function LocationProbe() {
  const { pathname, search } = useLocation();
  return <p>lokacija:{`${pathname}${search}`}</p>;
}

const renderAt = (from?: { pathname: string; search?: string }) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/prijava', state: from ? { from } : undefined }]}>
      <Routes>
        <Route path="/prijava" element={<LoginPage />} />
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );

const submit = async (email: string, password: string) => {
  await userEvent.type(screen.getByLabelText('Email'), email);
  await userEvent.type(screen.getByLabelText('Lozinka'), password);
  await userEvent.click(screen.getByRole('button', { name: 'Prijavi se' }));
};

beforeEach(() => {
  state.login = vi.fn();
  state.isAuthenticated = false;
  state.isLoading = false;
  state.user = null;
});

describe('LoginPage — prijavljena sesija', () => {
  it('dok se sesija učitava prikazuje skeleton bez forme', () => {
    state.isLoading = true;
    renderAt();
    expect(screen.queryByLabelText('Email')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Prijavi se' })).toBeNull();
  });

  it('osoblje sa povratnom adresom ide na tu adresu', () => {
    state.isAuthenticated = true;
    state.user = { permissions: ['news.manage'] };
    renderAt({ pathname: '/admin/vijesti' });
    expect(screen.getByText('lokacija:/admin/vijesti')).toBeInTheDocument();
  });

  it('član sa /admin povratnom adresom ide na /clanstvo', () => {
    state.isAuthenticated = true;
    state.user = { permissions: [] };
    renderAt({ pathname: '/admin/analitika' });
    expect(screen.getByText('lokacija:/clanstvo')).toBeInTheDocument();
  });

  it('povratna adresa na prijavu se preskače', () => {
    state.isAuthenticated = true;
    state.user = { permissions: [] };
    renderAt({ pathname: '/prijava' });
    expect(screen.getByText('lokacija:/clanstvo')).toBeInTheDocument();
  });

  it('admin prijava se ne koristi kao povratna adresa', async () => {
    state.isAuthenticated = true;
    state.user = { permissions: ['dashboard.read'] };
    renderAt({ pathname: '/admin/login' });
    expect(await screen.findByText('lokacija:/admin')).toBeInTheDocument();
  });
});

describe('LoginPage — uspješna prijava', () => {
  it('člana vodi na članstvo i ne čuva parametre potvrde', async () => {
    state.login.mockResolvedValue({ permissions: [] });
    renderAt({ pathname: '/clanstvo', search: '?paid=1&token=abc' });
    await submit('clan@example.test', 'tajna123');
    expect(state.login).toHaveBeenCalledWith('clan@example.test', 'tajna123');
    expect(await screen.findByText('lokacija:/clanstvo?paid=1&token=abc')).toBeInTheDocument();
  });

  it('zadržava session_id za povratak sa plaćanja ulaznica', async () => {
    state.login.mockResolvedValue({ permissions: [] });
    renderAt({ pathname: '/ulaznice', search: '?paid=1&session_id=cs_test_1' });
    await submit('kupac@example.test', 'tajna123');
    expect(await screen.findByText('lokacija:/ulaznice?paid=1&session_id=cs_test_1')).toBeInTheDocument();
  });

  it('bez parametara plaćanja odbacuje query string', async () => {
    state.login.mockResolvedValue({ permissions: [] });
    renderAt({ pathname: '/ulaznice', search: '?tab=arhiva' });
    await submit('kupac@example.test', 'tajna123');
    expect(await screen.findByText('lokacija:/ulaznice')).toBeInTheDocument();
  });

  it('osoblje bez povratne adrese ide na admin panel', async () => {
    state.login.mockResolvedValue({ permissions: ['live.manage'] });
    renderAt();
    await submit('urednik@example.test', 'tajna123');
    expect(await screen.findByText('lokacija:/admin')).toBeInTheDocument();
  });

  it('neispravna prijava prikazuje poruku i ostaje na formi', async () => {
    state.login.mockRejectedValue(new Error('401'));
    renderAt();
    await submit('clan@example.test', 'tajna123');
    expect(await screen.findByRole('alert')).toHaveTextContent('Neispravni podaci za prijavu');
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('prazna forma ne poziva prijavu', async () => {
    renderAt();
    await userEvent.click(screen.getByRole('button', { name: 'Prijavi se' }));
    expect(state.login).not.toHaveBeenCalled();
  });

  it('prekratka lozinka ne prolazi validaciju', async () => {
    renderAt();
    await submit('clan@example.test', '123');
    expect(state.login).not.toHaveBeenCalled();
  });

  it('dugme je onemogućeno dok prijava traje', async () => {
    state.login.mockReturnValue(new Promise(() => undefined));
    renderAt();
    await submit('clan@example.test', 'tajna123');
    expect(screen.getByRole('button', { name: 'Prijavi se' })).toBeDisabled();
  });
});

describe('LoginPage — sadržaj', () => {
  it('prikazuje naslov, podnaslov i link za povratak', () => {
    renderAt();
    expect(screen.getByRole('heading', { name: 'Prijava' })).toBeInTheDocument();
    expect(screen.getByText(/jedna prijava za sve/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nazad' })).toHaveAttribute('href', '/');
  });
});
