import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MembershipJoinForm } from './MembershipJoinForm';

const state = vi.hoisted(() => ({
  pending: false,
  isError: false,
  error: null as unknown,
  joined: [] as Record<string, unknown>[],
  session: [] as unknown[][],
  onJoined: [] as string[],
}));

vi.mock('../../hooks/use-membership-join', () => ({
  useJoinMembershipOnline: () => ({
    isPending: state.pending,
    isError: state.isError,
    error: state.error,
    mutateAsync: async (values: Record<string, unknown>) => {
      state.joined.push(values);
      return { user: { id: 'u1' }, accessToken: 'a', refreshToken: 'r', membership: { id: 'm1' } };
    },
  }),
}));
vi.mock('../../lib/auth', () => ({
  useAuth: () => ({
    applySession: (...args: unknown[]) => state.session.push(args),
  }),
}));
vi.mock('../../lib/api-error', () => ({
  getApiErrorMessage: (error: unknown, fallback: string) =>
    error instanceof Error ? `msg:${error.message}` : fallback,
}));

const renderForm = () =>
  render(
    <MemoryRouter>
      <MembershipJoinForm annualPrice={50} onJoined={(id) => { state.onJoined.push(id); }} />
    </MemoryRouter>,
  );

describe('MembershipJoinForm', () => {
  beforeEach(() => {
    state.pending = false;
    state.isError = false;
    state.error = null;
    state.joined = [];
    state.session = [];
    state.onJoined = [];
  });

  it('prikazuje cijenu članarine i link na prijavu', () => {
    renderForm();
    expect(screen.getByText(/Godišnja članarina/)).toBeTruthy();
    expect(screen.getByText('50 KM')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Nastavi na plaćanje · 50 KM' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Prijavite se' }).getAttribute('href')).toBe('/prijava');
  });

  it('validira email i lozinku prije slanja', async () => {
    const { container } = renderForm();
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'nije-email' } });
    fireEvent.change(screen.getByPlaceholderText('Lozinka (min. 6 znakova)'), { target: { value: '123' } });
    fireEvent.submit(container.querySelector('form')!);
    expect(await screen.findByText('Unesite ispravan email')).toBeTruthy();
    expect(screen.getByText('Lozinka mora imati najmanje 6 znakova')).toBeTruthy();
    expect(state.joined).toHaveLength(0);
  });

  it('uspješna registracija postavlja sesiju i javlja ID članstva', async () => {
    renderForm();
    await userEvent.type(screen.getByPlaceholderText('Ime'), 'Ana');
    await userEvent.type(screen.getByPlaceholderText('Prezime'), 'Anić');
    await userEvent.type(screen.getByPlaceholderText('Email'), 'ana@mail.ba');
    await userEvent.type(screen.getByPlaceholderText('Lozinka (min. 6 znakova)'), 'tajna123');
    await userEvent.click(screen.getByRole('button', { name: /Nastavi na plaćanje/ }));
    await waitFor(() => expect(state.onJoined).toEqual(['m1']));
    expect(state.joined[0]).toMatchObject({ email: 'ana@mail.ba', firstName: 'Ana', lastName: 'Anić' });
    expect(state.session[0]).toEqual([{ id: 'u1' }, 'a', 'r']);
  });

  it('greška servera prikazuje poruku iz hooka', () => {
    state.isError = true;
    state.error = new Error('Email je zauzet');
    renderForm();
    expect(screen.getByText('msg:Email je zauzet')).toBeTruthy();
  });

  it('bez specifične greške prikazuje zamjensku poruku', () => {
    state.isError = true;
    state.error = 'nešto';
    renderForm();
    expect(screen.getByText('Registracija nije uspjela.')).toBeTruthy();
  });

  it('dok traje zahtjev dugme je onemogućeno i mijenja tekst', () => {
    state.pending = true;
    renderForm();
    const button = screen.getByRole('button', { name: 'Obrada...' });
    expect(button).toHaveProperty('disabled', true);
  });
});
