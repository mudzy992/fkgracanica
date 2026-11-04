import { optionalYouTubeUrl } from '../common/utils/youtube-write.util';
import type { NewsWriteInput } from './news.service';

export function prepareNewsVideoCreate(data: NewsWriteInput): NewsWriteInput {
  if (data.videoUrl === undefined) return data;
  return { ...data, videoUrl: optionalYouTubeUrl(data.videoUrl) };
}

/** Avoid rewriting an unchanged legacy value, including under concurrent edits. */
export function prepareNewsVideoUpdate(
  data: Record<string, unknown>,
  previous: string | null,
): Record<string, unknown> {
  if (data.videoUrl === undefined) return data;
  const result = { ...data };
  if (data.videoUrl === previous) delete result.videoUrl;
  else result.videoUrl = optionalYouTubeUrl(data.videoUrl);
  return result;
}
