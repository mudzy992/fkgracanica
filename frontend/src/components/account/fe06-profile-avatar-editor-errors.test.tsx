import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileAvatarEditor } from './ProfileAvatarEditor';

/**
 * Q-FE06-32: `api.post`/`api.patch`/`api.delete` odbijaju na grešci, a komponenta
 * je ranije imala samo `finally` — korisnik nije dobijao nikakvu poruku.
 */
const state = vi.hoisted(() => ({
  user: undefined as unknown,
  applySession: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  del: vi.fn(),
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ user: state.user, applySession: state.applySession }),
}));
vi.mock('../../lib/api', () => ({
  api: { post: state.post, patch: state.patch, delete: state.del },
  getAccessToken: () => 'acc',
  getRefreshToken: () => 'ref',
}));
vi.mock('../../lib/media', () => ({
  mediaUrl: (path: string | undefined, variant: string) => (path ? `${variant}:${path}` : undefined),
}));
vi.mock('../../lib/user-initials', () => ({ userInitials: () => 'AH' }));

const fileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;

beforeEach(() => {
  state.user = { id: 'u1', firstName: 'Amar', lastName: 'Hodžić', avatarPath: 'avatari/amar.jpg' };
  state.applySession.mockReset();
  state.post.mockReset();
  state.post.mockResolvedValue({ data: { path: 'avatari/novo.jpg' } });
  state.patch.mockReset();
  state.patch.mockResolvedValue({ data: { avatarPath: 'avatari/novo.jpg' } });
  state.del.mockReset();
  state.del.mockResolvedValue({ data: { avatarPath: null } });
});
describe('ProfileAvatarEditor — greške (Q-FE06-32)', () => {
  it('neuspješan upload prikazuje poruku i ne mijenja sesiju', async () => {
    const user1 = userEvent.setup();
    state.post.mockRejectedValue(new Error('Fajl je prevelik'));
    render(<ProfileAvatarEditor />);
    await user1.upload(fileInput(), new File(['x'], 'velika.jpg', { type: 'image/jpeg' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Fajl je prevelik');
    expect(state.applySession).not.toHaveBeenCalled();
    expect(state.patch).not.toHaveBeenCalled();
  });

  it('neuspješan patch poslije uploada takođe prikazuje poruku', async () => {
    const user1 = userEvent.setup();
    state.patch.mockRejectedValue(new Error('Sesija je istekla'));
    render(<ProfileAvatarEditor />);
    await user1.upload(fileInput(), new File(['x'], 'a.jpg', { type: 'image/jpeg' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Sesija je istekla');
    expect(state.applySession).not.toHaveBeenCalled();
  });

  it('neuspješno brisanje prikazuje poruku i zadržava avatar', async () => {
    const user1 = userEvent.setup();
    state.del.mockRejectedValue(new Error('Nije moguće obrisati'));
    render(<ProfileAvatarEditor />);
    await user1.click(screen.getByRole('button', { name: /actions.delete/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Nije moguće obrisati');
    expect(state.applySession).not.toHaveBeenCalled();
    expect(document.querySelector('img')).not.toBeNull();
  });

  it('bez poruke iz API-ja koristi prijevod kao rezervu', async () => {
    const user1 = userEvent.setup();
    state.del.mockRejectedValue({});
    render(<ProfileAvatarEditor />);
    await user1.click(screen.getByRole('button', { name: /actions.delete/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('profile.avatarDeleteError');
  });

  it('uspješna radnja uklanja prethodnu poruku', async () => {
    const user1 = userEvent.setup();
    state.del.mockRejectedValueOnce(new Error('Prva greška'));
    render(<ProfileAvatarEditor />);
    await user1.click(screen.getByRole('button', { name: /actions.delete/ }));
    await screen.findByRole('alert');
    await user1.click(screen.getByRole('button', { name: /actions.delete/ }));
    await waitFor(() => expect(state.applySession).toHaveBeenCalled());
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

