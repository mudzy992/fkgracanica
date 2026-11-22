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
import { brand, colors, darkColors, spacing, typography } from './theme';

describe('mob-batch132 — P-MOB45 auth/theme/settings (test-only)', () => {
  it('AuthProvider is function and useAuth throws outside', () => {
    expect(typeof AuthProvider).toBe('function');
    expect(() => (useAuth as any)()).toThrow();
  });
  it('ThemeProvider is function and useTheme throws outside', () => {
    expect(typeof ThemeProvider).toBe('function');
    expect(() => (useTheme as any)()).toThrow();
  });
  it('usePublicSettings is function and throws outside component', () => {
    expect(typeof usePublicSettings).toBe('function');
    expect(() => (usePublicSettings as any)()).toThrow();
  });
  it('brand primary white accent', () => {
    expect(brand.primary).toBe('#1E3A8A');
    expect(brand.white).toBe('#FFFFFF');
    expect(brand.accent).toBe('#2563EB');
    expect(brand.primaryLight).toBe('#93C5FD');
  });
  it('brand success danger', () => {
    expect(brand.success).toBe('#16A34A');
    expect(brand.danger).toBe('#DC2626');
  });
  it('darkColors background surface text', () => {
    expect(darkColors.background).toBe('#050A14');
    expect(darkColors.surface).toBe('#0A1525');
    expect(darkColors.text).toBe('#F8FAFC');
    expect(darkColors.textMuted).toBe('#94A3B8');
  });
  it('darkColors border headerBg link', () => {
    expect(darkColors.border).toBe('#334155');
    expect(darkColors.headerBg).toBe('#050A14');
    expect(darkColors.link).toBe('#93C5FD');
  });
  it('colors alias darkColors', () => {
    expect(colors).toBe(darkColors);
    expect(colors.primary).toBe(brand.primary);
    expect(colors.link).toBe('#93C5FD');
  });
  it('spacing 5 steps', () => {
    expect(spacing.xs).toBe(4);
    expect(spacing.sm).toBe(8);
    expect(spacing.md).toBe(16);
    expect(spacing.lg).toBe(24);
    expect(spacing.xl).toBe(32);
  });
  it('typography display title heading', () => {
    expect(typography.display.fontSize).toBe(34);
    expect(typography.display.fontWeight).toBe('800');
    expect(typography.title.fontSize).toBe(24);
    expect(typography.heading.fontSize).toBe(18);
  });
  it('typography body caption', () => {
    expect(typography.body.fontSize).toBe(16);
    expect(typography.caption.fontSize).toBe(13);
    expect(typography.body.fontWeight).toBe('400');
  });
  it('providers distinct', () => {
    expect(AuthProvider).not.toBe(ThemeProvider);
    expect(useAuth).not.toBe(useTheme);
  });
  it('darkColors primary spread from brand', () => {
    expect(darkColors.primary).toBe(brand.primary);
    expect(darkColors.accent).toBe(brand.accent);
    expect(darkColors.success).toBe(brand.success);
  });
  it('darkColors link equals primaryLight', () => {
    expect(darkColors.link).toBe(brand.primaryLight);
    expect(darkColors.headerBg).toBe(darkColors.background);
  });
  it('typography letterSpacing', () => {
    expect(typography.display.letterSpacing).toBe(-1);
    expect(typography.caption.fontWeight).toBe('400');
  });
});
