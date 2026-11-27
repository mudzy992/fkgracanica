import { getApiUrl } from './media';

export function getAuthHeader(): Record<string, string> {
  if (typeof document === 'undefined') return {};
  const m = document.cookie.match(/(?:^|; )fk_access_token=([^;]*)/);
  if (!m) return {};
  try {
    return { Authorization: `Bearer ${decodeURIComponent(m[1])}` };
  } catch {
    return {};
  }
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = { ...(init.headers as Record<string, string>), ...getAuthHeader() };
  if (init.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${getApiUrl()}${path}`, { ...init, headers, cache: 'no-store' });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Greška ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}
