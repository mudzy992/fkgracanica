import { createContext, useContext, useEffect, type ReactNode } from 'react';

const ThemeContext = createContext<{ resolved: 'dark' } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const el = document.documentElement;
    el.classList.add('dark');
    el.classList.remove('light');
    localStorage.setItem('fk-theme', 'dark');
  }, []);

  return <ThemeContext.Provider value={{ resolved: 'dark' }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
