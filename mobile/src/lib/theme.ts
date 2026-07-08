/** Brand usklađen s web `--color-primary` (#1e3a8a). */
export const brand = {
  primary: '#1E3A8A',
  primaryLight: '#60A5FA',
  accent: '#2563EB',
  success: '#16A34A',
  danger: '#DC2626',
  white: '#FFFFFF',
} as const;

export type ColorPalette = {
  primary: string;
  primaryLight: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  success: string;
  danger: string;
  border: string;
  white: string;
  headerBg: string;
};

export const lightColors: ColorPalette = {
  ...brand,
  background: '#FFFFFF',
  surface: '#F8FAFC',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  headerBg: brand.primary,
};

export const darkColors: ColorPalette = {
  ...brand,
  primaryLight: '#93C5FD',
  background: '#0F172A',
  surface: '#1E293B',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#334155',
  headerBg: '#0F172A',
};

/** Default light — prefer `useTheme().colors` u ekranima. */
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const typography = {
  title: { fontSize: 24, fontWeight: '700' as const },
  heading: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
};
