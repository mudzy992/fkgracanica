import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NewsCommentsSection } from './NewsCommentsSection';

vi.mock('../../lib/utils', async () => {
  const actual = await vi.importActual('../../lib/utils') as any;
  return { ...actual, formatDate: (s: string) => s };
});
vi.mock('../../lib/permissions', () => ({ hasPermission: () => false }));

const addMutate = vi.fn().mockResolvedValue({});
const delMutate = vi.fn().mockResolvedValue({});
const mockState = vi.hoisted(() => ({ comments: [{ id: 'c1', content: 'hi', createdAt: '2024', userId: 'u1', user: { firstName: 'A', lastName: 'B', email: 'a@b.c' } }] as any }));
vi.mock('../../hooks/use-news-comments', () => ({
  useNewsComments: () => ({ data: mockState.comments, isLoading: false }),
  useAddNewsComment: () => ({ mutateAsync: addMutate, isPending: false }),
  useDeleteNewsComment: () => ({ mutateAsync: delMutate, isPending: false }),
}));
vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ isAuthenticated: true, user: { id: 'u1', email: 'me@test.com', permissions: [] } }),
}));

describe('NewsCommentsSection — branch51', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.comments = [{ id: 'c1', content: 'hi', createdAt: '2024', userId: 'u1', user: { firstName: 'A', lastName: 'B', email: 'a@b.c' } }];
  });

  it('displayName sa firstName i lastName', async () => {
    render(<NewsCommentsSection newsId="n1" />);
    expect(screen.getByText('A B')).toBeInTheDocument();
  });

  it('displayName fallback na email kada nema imena', async () => {
    mockState.comments = [{ id: 'c2', content: 'x', createdAt: '2024', userId: 'u2', user: { firstName: null, lastName: null, email: 'fallback@test.com' } }];
    render(<NewsCommentsSection newsId="n1" />);
    expect(screen.getByText('fallback@test.com')).toBeInTheDocument();
  });

  it('Korisnik kada nema user objekta', async () => {
    mockState.comments = [{ id: 'c3', content: 'x', createdAt: '2024', userId: 'u3', user: null }];
    render(<NewsCommentsSection newsId="n1" />);
    expect(screen.getByText('Korisnik')).toBeInTheDocument();
  });

  it('onSubmit early return kada text prazan (bypass disabled)', async () => {
    render(<NewsCommentsSection newsId="n1" />);
    const btn = screen.getByText('Objavi') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    btn.removeAttribute('disabled');
    fireEvent.click(btn);
    await new Promise((r) => setTimeout(r, 10));
    expect(addMutate).not.toHaveBeenCalled();
  });

  it('onSubmit uspješno sa trim', async () => {
    render(<NewsCommentsSection newsId="n1" />);
    const ta = screen.getByPlaceholderText('Napišite komentar…') as HTMLTextAreaElement;
    fireEvent.change(ta, { target: { value: '  hello  ' } });
    const btn = screen.getByText('Objavi') as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
    fireEvent.click(btn);
    await new Promise((r) => setTimeout(r, 10));
    expect(addMutate).toHaveBeenCalledWith('hello');
  });
});
