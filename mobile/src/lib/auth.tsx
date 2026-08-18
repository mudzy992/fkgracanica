import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  clearTokens,
  fetchCurrentUser,
  getAccessToken,
  getStoredUser,
  loginRequest,
  logoutRequest,
} from './api';
import { clearPushRegistration, ensurePushRegistration } from './push';
import type { User } from '../types/api';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const fresh = await fetchCurrentUser();
    setUser(fresh);
    return fresh;
  }, []);

  const restoreSession = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const storedUser = await getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }

    try {
      const freshUser = await fetchCurrentUser();
      setUser(freshUser);
    } catch {
      await clearTokens();
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (user) {
      void ensurePushRegistration();
    }
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await clearPushRegistration();
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
