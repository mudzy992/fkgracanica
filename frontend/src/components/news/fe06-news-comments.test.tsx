import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NewsCommentsSection } from './NewsCommentsSection';

const state = vi.hoisted(() => ({
  user: null as { id: string; email: string; firstName?: string | null; lastName?: string | null; permissions?: string[] } | null,
  authenticated: true,
  loading: false,
  moderate: false,
  comments: [] as Record<string, unknown>[],
  added: [] as string[],
  removed: [] as string[],
  pending: false,
}));

vi.mock('../../hooks/use-news-comments', () => ({
  useNewsComments: () => ({ data: state.comments, isLoading: state.loading }),
  useAddNewsComment: () => ({
    isPending: state.pending,
    mutateAsync: async (text: string) => {
      state.added.push(text);
    },
  }),
  useDeleteNewsComment: () => ({
    mutateAsync: async (id: string) => {
      state.removed.push(id);
    },
  }),
}));
vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ user: state.user, isAuthenticated: state.authenticated }),
}));
vi.mock('../../lib/permissions', () => ({ hasPermission: () => state.moderate }));

const renderSection = () =>
  render(
    <MemoryRouter>
      <NewsCommentsSection newsId="n1" />
    </MemoryRouter>,
  );

const comment = (over: Record<string, unknown> = {}) => ({
  id: 'c1',
  userId: 'u1',
  content: 'Sjajan derbi!',
  createdAt: '2026-05-10T17:00:00.000Z',
  user: { id: 'u1', email: 'ana@mail.ba', firstName: 'Ana', lastName: 'Anić' },
  ...over,
});

describe('NewsCommentsSection', () => {
  beforeEach(() => {
    state.user = { id: 'u1', email: 'ana@mail.ba', permissions: [] };
    state.authenticated = true;
    state.loading = false;
    state.moderate = false;
    state.comments = [];
    state.added = [];
    state.removed = [];
    state.pending = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('dok se komentari učitavaju prikazuje poruku', () => {
    state.loading = true;
    renderSection();
    expect(screen.getByText('Učitavanje…')).toBeTruthy();
    expect(screen.getByText('Komentari (0)')).toBeTruthy();
  });

  it('bez komentara prikazuje poziv da bude prvi', () => {
    renderSection();
    expect(screen.getByText('Još nema komentara. Budite prvi!')).toBeTruthy();
    expect(screen.getByText('Komentari (0)')).toBeTruthy();
  });

  it('prikazuje autora, datum i sadržaj komentara', () => {
    state.comments = [comment(), comment({ id: 'c2', user: null, content: 'Bez korisnika' })];
    renderSection();
    expect(screen.getByText('Komentari (2)')).toBeTruthy();
    expect(screen.getByText('Ana Anić')).toBeTruthy();
    expect(screen.getByText('Korisnik')).toBeTruthy();
    expect(screen.getByText('Bez korisnika')).toBeTruthy();
  });

  it('autor može obrisati svoj komentar kada potvrdi', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    state.comments = [comment()];
    renderSection();
    await userEvent.click(screen.getByRole('button', { name: 'Obriši' }));
    await waitFor(() => expect(state.removed).toEqual(['c1']));
  });

  it('bez potvrde dijaloga komentar se ne briše', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    state.comments = [comment()];
    renderSection();
    await userEvent.click(screen.getByRole('button', { name: 'Obriši' }));
    expect(state.removed).toEqual([]);
  });

  it('tuđi komentar bez moderacije nema dugme za brisanje', () => {
    state.comments = [comment({ userId: 'u9' })];
    renderSection();
    expect(screen.queryByRole('button', { name: 'Obriši' })).toBeNull();
  });

  it('moderator vidi dugme za brisanje tuđeg komentara', () => {
    state.moderate = true;
    state.comments = [comment({ userId: 'u9' })];
    renderSection();
    expect(screen.getByRole('button', { name: 'Obriši' })).toBeTruthy();
  });

  it('objava komentara šalje očišćen tekst i prazni polje', async () => {
    renderSection();
    const textarea = screen.getByPlaceholderText('Napišite komentar…');
    await userEvent.type(textarea, '  Novi komentar  ');
    await userEvent.click(screen.getByRole('button', { name: 'Objavi' }));
    await waitFor(() => expect(state.added).toEqual(['Novi komentar']));
    expect((textarea as HTMLTextAreaElement).value).toBe('');
  });

  it('prazan komentar ne može se objaviti', () => {
    renderSection();
    expect(screen.getByRole('button', { name: 'Objavi' })).toHaveProperty('disabled', true);
    expect(screen.queryByRole('button', { name: 'Objavi' })).toBeTruthy();
  });

  it('dok traje objava dugme je onemogućeno', async () => {
    state.pending = true;
    renderSection();
    await userEvent.type(screen.getByPlaceholderText('Napišite komentar…'), 'Test');
    expect(screen.getByRole('button', { name: 'Objavi' })).toHaveProperty('disabled', true);
  });

  it('neprijavljeni korisnik dobija link na prijavu umjesto forme', () => {
    state.authenticated = false;
    state.user = null;
    renderSection();
    expect(screen.queryByPlaceholderText('Napišite komentar…')).toBeNull();
    expect(screen.getByRole('link', { name: 'Prijavite se' }).getAttribute('href')).toBe('/prijava');
  });
});
