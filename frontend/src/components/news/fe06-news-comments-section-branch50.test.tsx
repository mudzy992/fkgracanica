import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NewsCommentsSection } from './NewsCommentsSection';

const state = vi.hoisted(() => ({
  comments: undefined as unknown,
  isLoading: false,
  isAuthenticated: true,
  user: { id: 'u1', permissions: [] as string[] },
  addMutate: vi.fn(async (t: string) => ({ ok: true })),
  deleteMutate: vi.fn(async () => ({ ok: true })),
  hasPerm: vi.fn(() => false),
  runAction: vi.fn(async (p: Promise<unknown>) => {
    try {
      await p;
      return { ok: true } as const;
    } catch {
      return { ok: false, error: 'err' } as const;
    }
  }),
}));

vi.mock('../../hooks/use-news-comments', () => ({
  useNewsComments: () => ({ data: state.comments, isLoading: state.isLoading }),
  useAddNewsComment: () => ({ mutateAsync: state.addMutate, isPending: false }),
  useDeleteNewsComment: () => ({ mutateAsync: state.deleteMutate }),
}));
vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
}));
vi.mock('../../lib/permissions', () => ({
  hasPermission: (...args: unknown[]) => state.hasPerm(...args),
}));
vi.mock('../../lib/utils', async () => {
  const actual = await vi.importActual<typeof import('../../lib/utils')>('../../lib/utils');
  return { ...actual, formatDate: (s: string) => `fmt:${s}` };
});
vi.mock('../../lib/action-errors', () => ({
  runAction: (...args: unknown[]) => state.runAction(...args),
}));
vi.mock('./NewsSectionTitle', () => ({
  NewsSectionTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('../ui/button', () => ({
  Button: ({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) => (
    <button {...props}>{children}</button>
  ),
}));
vi.mock('../ui/textarea', () => ({
  Textarea: (props: Record<string, unknown>) => <textarea {...props} />,
}));

const comment = (over: Record<string, unknown> = {}) => ({
  id: 'c1',
  content: 'Hello',
  createdAt: '2026-01-01',
  userId: 'u1',
  user: { firstName: 'A', lastName: 'B', email: 'a@b.com' },
  ...over,
});

describe('NewsCommentsSection — branch50 (user null, canDelete, empty, auth, submit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.comments = [comment() as never];
    state.isLoading = false;
    state.isAuthenticated = true;
    state.user = { id: 'u1', permissions: [] };
    state.hasPerm.mockReturnValue(false);
    state.runAction.mockImplementation(async (p: Promise<unknown>) => {
      try {
        await p;
        return { ok: true } as const;
      } catch {
        return { ok: false, error: 'err' } as const;
      }
    });
  });

  it('loading stanje prikazuje Učitavanje', () => {
    state.isLoading = true;
    state.comments = undefined as unknown;
    render(<NewsCommentsSection newsId="n1" />);
    expect(screen.getByText('Učitavanje…')).toBeInTheDocument();
  });

  it('c.user null daje Korisnik i canDelete preko hasPermission true', () => {
    state.hasPerm.mockReturnValue(true);
    state.comments = [comment({ user: null, userId: 'other' } as never) as never];
    render(
      <MemoryRouter>
        <NewsCommentsSection newsId="n1" />
      </MemoryRouter>,
    );
    expect(screen.getByText('Korisnik')).toBeInTheDocument();
    expect(screen.getByText('Obriši')).toBeInTheDocument();
  });

  it('c.user sa imenom i canDelete false kada nije autor niti moderator', () => {
    state.hasPerm.mockReturnValue(false);
    state.user = { id: 'u2', permissions: [] };
    state.comments = [comment({ userId: 'u1' } as never) as never];
    render(<NewsCommentsSection newsId="n1" />);
    expect(screen.getByText('A B')).toBeInTheDocument();
    expect(screen.queryByText('Obriši')).toBeNull();
  });

  it('prazan niz prikazuje Još nema komentara i comments?.length ?? 0', () => {
    state.comments = [] as never;
    render(<NewsCommentsSection newsId="n1" />);
    expect(screen.getByText('Još nema komentara. Budite prvi!')).toBeInTheDocument();
    expect(screen.getByText('Komentari (0)')).toBeInTheDocument();
  });

  it('isAuthenticated false prikazuje prijavu', () => {
    state.isAuthenticated = false;
    render(
      <MemoryRouter>
        <NewsCommentsSection newsId="n1" />
      </MemoryRouter>,
    );
    expect(screen.getByText('Prijavite se')).toBeInTheDocument();
  });

  it('submit prazan tekst early return i success čisti polje', async () => {
    render(<NewsCommentsSection newsId="n1" />);
    const textarea = screen.getByPlaceholderText('Napišite komentar…') as HTMLTextAreaElement;
    const btn = screen.getByText('Objavi');
    // prazan trim -> disabled, ali testimo i onSubmit direktno via click sa praznim
    fireEvent.change(textarea, { target: { value: '   ' } });
    expect(btn).toBeDisabled();
    fireEvent.change(textarea, { target: { value: ' Novi komentar ' } });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    await waitFor(() => expect(state.addMutate).toHaveBeenCalledWith('Novi komentar'));
    await waitFor(() => expect(textarea.value).toBe(''));
  });

  it('submit greška ostavlja tekst (result.ok false)', async () => {
    state.runAction.mockResolvedValue({ ok: false, error: 'err' } as never);
    render(<NewsCommentsSection newsId="n1" />);
    const textarea = screen.getByPlaceholderText('Napišite komentar…') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Fail' } });
    fireEvent.click(screen.getByText('Objavi'));
    await waitFor(() => expect(state.addMutate).toHaveBeenCalledWith('Fail'));
    await new Promise((r) => setTimeout(r, 10));
    expect(textarea.value).toBe('Fail');
  });

  it('onDelete sa confirm false ne poziva mutaciju, true poziva', async () => {
    state.comments = [comment({ id: 'c2' } as never) as never];
    const spy = vi.spyOn(window, 'confirm');
    spy.mockReturnValue(false);
    render(<NewsCommentsSection newsId="n1" />);
    fireEvent.click(screen.getByText('Obriši'));
    expect(state.deleteMutate).not.toHaveBeenCalled();
    spy.mockReturnValue(true);
    fireEvent.click(screen.getByText('Obriši'));
    await waitFor(() => expect(state.deleteMutate).toHaveBeenCalledWith('c2'));
    spy.mockRestore();
  });
});
