import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { darkColors, lightColors, type ColorPalette } from './theme';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  resolved: 'light' | 'dark';
  colors: ColorPalette;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
  }, []);

  useEffect(() => {
    const sub = Appearance.addChangeListener(() => {
      /* useColorScheme updates on its own */
    });
    return () => sub.remove();
  }, []);

  const resolved: 'light' | 'dark' =
    preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo(
    () => ({
      preference,
      setPreference,
      resolved,
      colors: resolved === 'dark' ? darkColors : lightColors,
      isDark: resolved === 'dark',
    }),
    [preference, setPreference, resolved],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
