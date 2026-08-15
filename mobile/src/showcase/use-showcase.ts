import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { ShowcasePayload } from './types';

export function useShowcase() {
  const [data, setData] = useState<ShowcasePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data: payload } = await api.get<ShowcasePayload>('/public/showcase');
      setData(payload);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
