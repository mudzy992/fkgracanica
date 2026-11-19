import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const state = vi.hoisted(() => ({ permissions: [] as string[] }));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('../../lib/auth', () => ({ useAuth: () => ({ user: { permissions: state.permissions } }) }));
vi.mock('../../components/seo/Seo', () => ({ Seo: () => null }));
vi.mock('./homes/AdminHome', () => ({ AdminHome: () => <div data-testid="admin-home" /> }));
vi.mock('./homes/ModeratorHome', () => ({ ModeratorHome: () => <div data-testid="moderator-home" /> }));
vi.mock('./homes/CommentatorHome', () => ({ CommentatorHome: () => <div data-testid="commentator-home" /> }));
vi.mock('./homes/WriterHome', () => ({ WriterHome: () => <div data-testid="writer-home" /> }));

import { DashboardPage } from './DashboardPage';

describe('A-01 DashboardPage dispatcher sa stvarnim resolveStaffHome', () => {
  beforeEach(() => {
    state.permissions = [];
  });

  it('bez dozvola → writer (fallback)', () => {
    state.permissions = [];
    render(<DashboardPage />);
    expect(screen.getByTestId('writer-home')).toBeTruthy();
  });

  it('undefined dozvole → writer', () => {
    state.permissions = undefined as unknown as string[];
    render(<DashboardPage />);
    expect(screen.getByTestId('writer-home')).toBeTruthy();
  });

  it('settings.read → admin', () => {
    state.permissions = ['settings.read'];
    render(<DashboardPage />);
    expect(screen.getByTestId('admin-home')).toBeTruthy();
  });

  it('users.read → admin (eksplicitni admin branch)', () => {
    state.permissions = ['users.read'];
    render(<DashboardPage />);
    expect(screen.getByTestId('admin-home')).toBeTruthy();
  });

  it('news.approve → moderator', () => {
    state.permissions = ['news.approve'];
    render(<DashboardPage />);
    expect(screen.getByTestId('moderator-home')).toBeTruthy();
  });

  it('gallery.approve → moderator', () => {
    state.permissions = ['gallery.approve'];
    render(<DashboardPage />);
    expect(screen.getByTestId('moderator-home')).toBeTruthy();
  });

  it('live.approve → moderator', () => {
    state.permissions = ['live.approve'];
    render(<DashboardPage />);
    expect(screen.getByTestId('moderator-home')).toBeTruthy();
  });

  it('live.manage bez odobravanja → commentator', () => {
    state.permissions = ['live.manage'];
    render(<DashboardPage />);
    expect(screen.getByTestId('commentator-home')).toBeTruthy();
  });

  it('admin ima prednost nad moderatorom (eksplicitni priority test)', () => {
    state.permissions = ['news.approve', 'settings.read'];
    render(<DashboardPage />);
    expect(screen.getByTestId('admin-home')).toBeTruthy();
  });
});
