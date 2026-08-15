import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { Appearance } from 'react-native';
import { darkColors, type ColorPalette } from './theme';

type ThemeContextValue = {
  colors: ColorPalette;
  isDark: true;
  resolved: 'dark';
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_VALUE: ThemeContextValue = {
  colors: darkColors,
  isDark: true,
  resolved: 'dark',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    Appearance.setColorScheme('dark');
  }, []);

  const value = useMemo(() => THEME_VALUE, []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
