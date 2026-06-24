export const colors = {
  primary: '#1E3A8A',
  primaryLight: '#3B5CB8',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  text: '#0F172A',
  textMuted: '#64748B',
  accent: '#2563EB',
  success: '#16A34A',
  danger: '#DC2626',
  border: '#E2E8F0',
  white: '#FFFFFF',
} as const;

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
