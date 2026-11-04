import { optionalYouTubeUrl } from '../common/utils/youtube-write.util';

const KEY = 'live.prematchAudioUrl';

/** Never rewrite an unchanged legacy value in a batch of other settings. */
export function preparePrematchAudioUpdates(
  updates: Record<string, string>,
  current: Record<string, string>,
): Record<string, string> {
  if (!(KEY in updates)) return updates;
  const result = { ...updates };
  if (updates[KEY] === current[KEY]) delete result[KEY];
  else result[KEY] = optionalYouTubeUrl(updates[KEY]) ?? '';
  return result;
}
