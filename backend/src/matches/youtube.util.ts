export { parseYouTubeId } from '../common/utils/youtube.util';

export function parseYouTubeStart(url: string): number | undefined {
  try {
    const u = new URL(url);
    const start = u.searchParams.get('start') ?? u.searchParams.get('t');
    if (!start) return undefined;
    const n = Number.parseInt(start, 10);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  } catch {
    return undefined;
  }
}
