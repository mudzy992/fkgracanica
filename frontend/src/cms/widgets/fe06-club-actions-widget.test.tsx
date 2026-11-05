import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClubActionsWidget } from './ClubActionsWidget';

const state = vi.hoisted(() => ({
  subscribe: vi.fn(),
  pending: false,
  isError: false,
  error: null as unknown,
  emails: [] as string[],
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../hooks', () => ({
  useSubscribeNewsletter: () => ({
    mutateAsync: (email: string) => {
      state.emails.push(email);
      return state.subscribe(email);
    },
    isPending: state.pending,
    isError: state.isError,
    error: state.error,
  }),
}));
vi.mock('../../lib/api-error', () => ({
  getApiErrorMessage: (error: unknown, fallback: string) =>
    error instanceof Error ? `msg:${error.message}` : fallback,
}));

const renderWidget = (config: Record<string, unknown>) =>
  render(
    <MemoryRouter>
      <ClubActionsWidget config={config as never} />
    </MemoryRouter>,
  );

beforeEach(() => {
  state.subscribe.mockReset().mockResolvedValue(undefined);
  state.pending = false;
  state.isError = false;
  state.error = null;
  state.emails = [];
});

describe('ClubActionsWidget — kartice', () => {
  it('prikazuje tri kartice sa podrazumijevanim naslovima', () => {
    renderWidget({});
    expect(screen.getByRole('heading', { name: 'Budi dio kluba' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'home.membership' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'home.tickets' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'home.newsletter' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home.membership/ })).toHaveAttribute('href', '/clanstvo');
    expect(screen.getByText('home.newsletterDesc')).toBeInTheDocument();
  });

  it('koristi tekst, dugme i opis iz membership configa', () => {
    renderWidget({
      title: 'Članstvo i ulaznice',
      text: 'Postani član',
      buttonLabel: 'Učlani se',
      buttonUrl: '/clanstvo/prijava',
      description: 'Prati novosti',
    });
    expect(screen.getByRole('heading', { name: 'Članstvo i ulaznice' })).toBeInTheDocument();
    expect(screen.getByText('Postani član')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Učlani se/ })).toHaveAttribute('href', '/clanstvo/prijava');
    expect(screen.getByText('Prati novosti')).toBeInTheDocument();
  });

  it('bez opisa koristi prijevod za newsletter', () => {
    renderWidget({});
    expect(screen.getByText('home.newsletterDesc')).toBeInTheDocument();
  });
});

describe('ClubActionsWidget — newsletter', () => {
  it('uspješna pretplata prikazuje poruku i čisti polje', async () => {
    const user = userEvent.setup();
    renderWidget({});
    const input = screen.getByPlaceholderText('common.email');
    await user.type(input, 'navijac@mail.ba');
    await user.click(screen.getByRole('button', { name: 'actions.subscribe' }));
    await waitFor(() => expect(screen.getByText('Hvala na pretplati!')).toBeInTheDocument());
    expect(state.emails).toEqual(['navijac@mail.ba']);
    expect(screen.queryByPlaceholderText('common.email')).toBeNull();
  });

  it('greška pretplate prikazuje poruku i zadržava formu', async () => {
    const user = userEvent.setup();
    state.subscribe.mockRejectedValueOnce(new Error('server'));
    renderWidget({});
    await user.type(screen.getByPlaceholderText('common.email'), 'x@mail.ba');
    await user.click(screen.getByRole('button', { name: 'actions.subscribe' }));
    await waitFor(() => expect(screen.queryByText('Hvala na pretplati!')).toBeNull());
    expect(screen.getByPlaceholderText('common.email')).toBeInTheDocument();
  });

  it('greška iz hooka prikazuje API poruku', () => {
    state.isError = true;
    state.error = new Error('duplikat');
    renderWidget({});
    expect(screen.getByText('msg:duplikat')).toBeInTheDocument();
  });

  it('bez poznate greške prikazuje zamjensku poruku', () => {
    state.isError = true;
    state.error = 'nešto';
    renderWidget({});
    expect(screen.getByText('Pretplata nije uspjela.')).toBeInTheDocument();
  });

  it('dok je pretplata u toku dugme je onemogućeno', () => {
    state.pending = true;
    renderWidget({});
    expect(screen.getByRole('button', { name: 'actions.subscribe' })).toBeDisabled();
  });
});
