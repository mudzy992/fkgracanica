import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(async () => null), setItemAsync: vi.fn(async () => {}), deleteItemAsync: vi.fn(async () => {}) }));
vi.mock('react-native', () => ({ Platform: { OS: 'ios' as const }, Linking: { openURL: vi.fn(async () => {}) }, Appearance: { setColorScheme: vi.fn() } }));
vi.mock('expo-device', () => ({ isDevice: true }));
vi.mock('./api', () => ({
  api: { get: vi.fn(async () => ({ data: { siteName: 'FK' } })), post: vi.fn(async () => ({ data: {} })), delete: vi.fn(async () => ({})) },
  getAccessToken: vi.fn(async () => null),
  getStoredUser: vi.fn(async () => null),
  fetchCurrentUser: vi.fn(async () => ({ id: 'u1' })),
  loginRequest: vi.fn(async () => ({ user: { id: 'u1' } })),
  logoutRequest: vi.fn(async () => {}),
  clearTokens: vi.fn(async () => {}),
}));
vi.mock('./push', () => ({ ensurePushRegistration: vi.fn(async () => {}), clearPushRegistration: vi.fn(async () => {}) }));

import { AuthProvider, useAuth } from './auth';
import { ThemeProvider, useTheme } from './theme-context';
import { usePublicSettings } from './use-public-settings';
import { brand, darkColors } from './theme';

describe('mob-batch99 — P-MOB12 auth/theme/settings (test-only)', () => {
  it('AuthProvider is function', () => { expect(typeof AuthProvider).toBe('function'); });
  it('useAuth is function', () => { expect(typeof useAuth).toBe('function'); });
  it('useAuth throws outside provider (invalid hook)', () => {
    expect(() => (useAuth as any)()).toThrow();
  });
  it('ThemeProvider is function', () => { expect(typeof ThemeProvider).toBe('function'); });
  it('useTheme is function', () => { expect(typeof useTheme).toBe('function'); });
  it('useTheme throws outside provider', () => {
    expect(() => (useTheme as any)()).toThrow();
  });
  it('usePublicSettings is function', () => { expect(typeof usePublicSettings).toBe('function'); });
  it('usePublicSettings throws outside component (invalid hook)', () => {
    expect(() => (usePublicSettings as any)()).toThrow();
  });
  it('brand primary matches darkColors', () => {
    expect(brand.primary).toBe('#1E3A8A');
    expect(darkColors.primary).toBe(brand.primary);
  });
  it('darkColors background and text', () => {
    expect(darkColors.background).toBe('#050A14');
    expect(darkColors.text).toBe('#F8FAFC');
  });
  it('theme spacing and typography exist', async () => {
    const { spacing, typography } = await import('./theme');
    expect(spacing.md).toBe(16);
    expect(typography.title.fontSize).toBe(24);
  });
  it('AuthProvider and ThemeProvider can be imported together', () => {
    expect(AuthProvider).not.toBe(ThemeProvider);
  });
  it('usePublicSettings and useAuth are distinct hooks', () => {
    expect(usePublicSettings).not.toBe(useAuth);
  });
  it('brand accent and success', () => {
    expect(brand.accent).toBe('#2563EB');
    expect(brand.success).toBe('#16A34A');
  });
  it('darkColors headerBg', () => {
    expect(darkColors.headerBg).toBe('#050A14');
  });
});
