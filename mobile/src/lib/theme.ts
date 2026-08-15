/** Brand usklađen s web `--color-primary` (#1e3a8a). Dark-only app palette. */
export const brand = {
  primary: '#1E3A8A',
  primaryLight: '#93C5FD',
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
  /** Interaktivni tekst/ikone na tonal površinama. */
  link: string;
};

export const darkColors: ColorPalette = {
  ...brand,
  background: '#050A14',
  surface: '#0A1525',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#334155',
  headerBg: '#050A14',
  link: '#93C5FD',
};

/** App je dark-only — prefer `useTheme().colors` u ekranima. */
export const colors = darkColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const typography = {
  display: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -1 },
  title: { fontSize: 24, fontWeight: '700' as const },
  heading: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
};
