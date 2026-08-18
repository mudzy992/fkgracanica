import { useEffect, useState } from 'react';
import { api } from './api';

export function usePublicSettings(): Record<string, string> {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    void api
      .get<Record<string, string>>('/settings/public')
      .then(({ data }) => setSettings(data ?? {}))
      .catch(() => setSettings({}));
  }, []);

  return settings;
}
