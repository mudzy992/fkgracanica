import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileAvatarEditor } from './ProfileAvatarEditor';

/** Batch 35 — pokriva `?? ''` grane za tokene (linije 35,48) */
const state = vi.hoisted(() => ({
  user: { id: 'u1', firstName: 'Amar', lastName: 'Hodžić', avatarPath: 'avatari/amar.jpg' },
  applySession: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  del: vi.fn(),
  access: null as string | null,
  refresh: undefined as string | undefined,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: state.user, applySession: state.applySession }) }));
vi.mock('../../lib/api', () => ({
  api: { post: state.post, patch: state.patch, delete: state.del },
  getAccessToken: () => state.access,
  getRefreshToken: () => state.refresh,
}));
vi.mock('../../lib/media', () => ({
  mediaUrl: (p: string | undefined, variant: string) => (p ? `${variant}:${p}` : undefined),
}));
vi.mock('../../lib/user-initials', () => ({ userInitials: () => 'AH' }));

const fileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;

beforeEach(() => {
  state.access = null;
  state.refresh = undefined;
  state.applySession.mockReset();
  state.post.mockReset();
  state.post.mockResolvedValue({ data: { path: 'avatari/novo.jpg' } });
  state.patch.mockReset();
  state.patch.mockResolvedValue({ data: { avatarPath: 'avatari/novo.jpg' } });
  state.del.mockReset();
  state.del.mockResolvedValue({ data: { avatarPath: null } });
});

describe('ProfileAvatarEditor — token fallback (batch 35)', () => {
  it('upload sa null/undefined tokenima koristi prazan string', async () => {
    const user = userEvent.setup();
    state.access = null;
    state.refresh = undefined as unknown as string;
    render(<ProfileAvatarEditor />);
    await user.upload(fileInput(), new File(['x'], 'a.jpg', { type: 'image/jpeg' }));
    await waitFor(() => expect(state.patch).toHaveBeenCalled());
    expect(state.applySession).toHaveBeenCalledWith(expect.any(Object), '', '');
  });

  it('brisanje sa undefined tokenima koristi prazan string', async () => {
    const user = userEvent.setup();
    state.access = undefined as unknown as string;
    state.refresh = null as unknown as string;
    render(<ProfileAvatarEditor />);
    const buttons = Array.from(document.querySelectorAll('button'));
    const del = buttons.find((b) => b.textContent?.includes('actions.delete')) ?? buttons[1];
    await user.click(del as Element);
    await waitFor(() => expect(state.del).toHaveBeenCalled());
    expect(state.applySession).toHaveBeenCalledWith(expect.any(Object), '', '');
  });
});
