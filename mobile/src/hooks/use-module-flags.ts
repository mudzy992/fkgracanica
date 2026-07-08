import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

type Flags = Record<string, string>;

export function isModuleEnabled(flags: Flags, key: string): boolean {
  return flags[key] !== 'false';
}

export function useModuleFlags() {
  const [flags, setFlags] = useState<Flags>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<Flags>('/settings/module-flags');
      setFlags(data);
    } catch {
      setFlags({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const isEnabled = useCallback((key: string) => isModuleEnabled(flags, key), [flags]);

  return { flags, loading, isEnabled, refresh: load };
}
