import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '../types';

const mocks = vi.hoisted(() => ({
  get: vi.fn(), post: vi.fn(), clearTokens: vi.fn(), ensureAccessToken: vi.fn(), getRefreshToken: vi.fn(), setTokens: vi.fn(),
}));
vi.mock('./api', () => ({
  api: { get: mocks.get, post: mocks.post }, clearTokens: mocks.clearTokens,
  ensureAccessToken: mocks.ensureAccessToken, getRefreshToken: mocks.getRefreshToken, setTokens: mocks.setTokens,
}));
import { AuthProvider, useAuth } from './auth';

const user: User = { id: 'fixture', email: 'example@example.test', firstName: 'Test', lastName: 'Korisnik', permissions: ['dashboard.read'] };
const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  mocks.ensureAccessToken.mockResolvedValue(null);
  mocks.getRefreshToken.mockReturnValue(null);
});

describe('AuthProvider', () => {
  it('bez tokena uklanja zastarjeli korisnički profil i ostaje odjavljen', async () => {
    localStorage.setItem('fk_user', 'stale');
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('fk_user')).toBeNull();
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it('postojeći token provjerava na /auth/me i učitava serverov profil', async () => {
    mocks.ensureAccessToken.mockResolvedValue('test-access');
    mocks.get.mockResolvedValue({ data: user });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mocks.get).toHaveBeenCalledWith('/auth/me');
    expect(result.current.user).toEqual(user);
    expect(result.current.isAuthenticated).toBe(true);
    expect(JSON.parse(localStorage.getItem('fk_user') ?? 'null')).toEqual(user);
  });

  it('neuspjela provjera profila briše sesiju i ne vjeruje starom korisniku', async () => {
    localStorage.setItem('fk_user', JSON.stringify(user));
    mocks.ensureAccessToken.mockResolvedValue('test-expired');
    mocks.get.mockRejectedValue(new Error('invalid session'));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mocks.clearTokens).toHaveBeenCalled();
    expect(localStorage.getItem('fk_user')).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('prijava, primjena sesije i odjava sinhronizuju stanje; odjava čisti i nakon greške', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    mocks.post.mockResolvedValueOnce({ data: { user, accessToken: 'test-access', refreshToken: 'test-refresh' } });
    await act(async () => { expect(await result.current.login(user.email, 'fixture-password')).toEqual(user); });
    expect(mocks.post).toHaveBeenCalledWith('/auth/login', { email: user.email, password: 'fixture-password' });
    expect(mocks.setTokens).toHaveBeenCalledWith('test-access', 'test-refresh');
    expect(result.current.isAuthenticated).toBe(true);
    act(() => result.current.applySession(user, 'test-next', 'test-next-refresh'));
    expect(mocks.setTokens).toHaveBeenCalledWith('test-next', 'test-next-refresh');
    mocks.getRefreshToken.mockReturnValue('test-next-refresh');
    mocks.post.mockRejectedValueOnce(new Error('logout failed'));
    let failure: unknown;
    await act(async () => { try { await result.current.logout(); } catch (error) { failure = error; } });
    expect(failure).toEqual(new Error('logout failed'));
    expect(mocks.post).toHaveBeenLastCalledWith('/auth/logout', { refreshToken: 'test-next-refresh' });
    expect(mocks.clearTokens).toHaveBeenCalled();
    expect(localStorage.getItem('fk_user')).toBeNull();
    await waitFor(() => expect(result.current.isAuthenticated).toBe(false));
  });

  it('odjava bez refresh tokena ne poziva endpoint', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => result.current.logout());
    expect(mocks.post).not.toHaveBeenCalled();
    expect(mocks.clearTokens).toHaveBeenCalled();
  });
});
