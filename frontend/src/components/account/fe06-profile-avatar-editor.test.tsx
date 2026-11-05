import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileAvatarEditor } from './ProfileAvatarEditor';

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
vi.mock('../../lib/user-initials', () => ({
  userInitials: (user: { firstName?: string; lastName?: string }) =>
    `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase(),
}));

const user = (over: Record<string, unknown> = {}) => ({
  id: 'u1',
  firstName: 'Amar',
  lastName: 'Hodžić',
  avatarPath: 'avatari/amar.jpg',
  ...over,
});

const fileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;

beforeEach(() => {
  state.user = user();
  state.applySession.mockReset();
  state.post.mockReset();
  state.post.mockResolvedValue({ data: { path: 'avatari/novo.jpg' } });
  state.patch.mockReset();
  state.patch.mockResolvedValue({ data: { avatarPath: 'avatari/novo.jpg' } });
  state.del.mockReset();
  state.del.mockResolvedValue({ data: { avatarPath: null } });
});

describe('ProfileAvatarEditor — prikaz', () => {
  it('bez korisnika ne prikazuje ništa', () => {
    state.user = undefined;
    const { container } = render(<ProfileAvatarEditor />);
    expect(container).toBeEmptyDOMElement();
  });

  it('sa avatarom prikazuje sliku i dugme za promjenu i brisanje', () => {
    render(<ProfileAvatarEditor />);
    expect(document.querySelector('img')).toHaveAttribute('src', 'medium:avatari/amar.jpg');
    expect(screen.getByRole('button', { name: /Promijeni/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /actions.delete/ })).toBeInTheDocument();
  });

  it('bez avatara prikazuje inicijale i dugme Dodaj bez brisanja', () => {
    state.user = user({ avatarPath: null });
    render(<ProfileAvatarEditor />);
    expect(screen.getByText('AH')).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
    expect(screen.getByRole('button', { name: /Dodaj/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /actions.delete/ })).toBeNull();
  });

  it('input za fajl prima samo slike i skriven je', () => {
    render(<ProfileAvatarEditor />);
    expect(fileInput()).toHaveAttribute('accept', 'image/*');
    expect(fileInput()).toHaveClass('hidden');
  });
});

describe('ProfileAvatarEditor — upload i brisanje', () => {
  it('odabir fajla šalje upload pa patch i primjenjuje sesiju', async () => {
    const user1 = userEvent.setup();
    render(<ProfileAvatarEditor />);
    const file = new File(['x'], 'slika.jpg', { type: 'image/jpeg' });
    await user1.upload(fileInput(), file);
    await waitFor(() => expect(state.post).toHaveBeenCalledTimes(1));
    const [url, form, cfg] = state.post.mock.calls[0];
    expect(url).toBe('/upload');
    expect((form as FormData).get('file')).toBe(file);
    expect(cfg).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } });
    await waitFor(() =>
      expect(state.patch).toHaveBeenCalledWith('/auth/profile', { avatarPath: 'avatari/novo.jpg' }),
    );
    expect(state.applySession).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'u1', avatarPath: 'avatari/novo.jpg' }),
      'acc',
      'ref',
    );
  });

  it('input se čisti nakon odabira da bi isti fajl ponovo radio', async () => {
    const user1 = userEvent.setup();
    render(<ProfileAvatarEditor />);
    await user1.upload(fileInput(), new File(['x'], 'a.png', { type: 'image/png' }));
    await waitFor(() => expect(state.post).toHaveBeenCalled());
    expect(fileInput().value).toBe('');
  });

  it('brisanje avatarа zove DELETE i primjenjuje novu sesiju', async () => {
    const user1 = userEvent.setup();
    render(<ProfileAvatarEditor />);
    await user1.click(screen.getByRole('button', { name: /actions.delete/ }));
    await waitFor(() => expect(state.del).toHaveBeenCalledWith('/auth/profile/avatar'));
    expect(state.applySession).toHaveBeenCalledWith(
      expect.objectContaining({ avatarPath: null }),
      'acc',
      'ref',
    );
  });

  it('klik na Dodaj otvara biranje fajla', async () => {
    const user1 = userEvent.setup();
    state.user = user({ avatarPath: null });
    render(<ProfileAvatarEditor />);
    const click = vi.spyOn(fileInput(), 'click').mockImplementation(() => {});
    await user1.click(screen.getByRole('button', { name: /Dodaj/ }));
    expect(click).toHaveBeenCalledTimes(1);
    click.mockRestore();
  });

  it('tokom uploada oba dugmeta su onemogućena', async () => {
    const user1 = userEvent.setup();
    let resolve: (value: unknown) => void = () => {};
    state.post.mockImplementation(() => new Promise((r) => { resolve = r; }));
    render(<ProfileAvatarEditor />);
    await user1.upload(fileInput(), new File(['x'], 'a.png', { type: 'image/png' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Promijeni/ })).toBeDisabled(),
    );
    expect(screen.getByRole('button', { name: /actions.delete/ })).toBeDisabled();
    resolve({ data: { path: 'p.jpg' } });
    await waitFor(() => expect(state.patch).toHaveBeenCalled());
  });
});
