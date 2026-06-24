const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';
const MEDIA_BASE = API_URL.replace(/\/api\/v1\/?$/, '');

export function mediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.replace(/^\.\//, '').replace(/^uploads\//, '');
  return `${MEDIA_BASE}/uploads/${normalized}`;
}
