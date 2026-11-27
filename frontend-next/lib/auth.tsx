'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getApiUrl } from './media';

export type User = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  permissions: string[];
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getAuthHeader(): Record<string, string> {
  if (typeof document === 'undefined') return {};
  const m = document.cookie.match(/(?:^|; )fk_access_token=([^;]*)/);
  if (!m) return {};
  try {
    return { Authorization: `Bearer ${decodeURIComponent(m[1])}` };
  } catch {
    return {};
  }
}

async function fetchMe(): Promise<User | null> {
  try {
    const res = await fetch(`${getApiUrl()}/auth/me`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) return null;
    return (await res.json()) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    const u = await fetchMe();
    if (u) {
      localStorage.setItem('fk_user', JSON.stringify(u));
      setUser(u);
    } else {
      localStorage.removeItem('fk_user');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const e = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(e.message || 'Prijava nije uspjela');
    }
    const data = (await res.json()) as { user: User };
    localStorage.setItem('fk_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('fk_user');
      setUser(null);
      window.location.href = '/prijava';
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, isAuthenticated: !!user, login, logout }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children as React.ReactElement}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
