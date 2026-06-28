/** Settings that use media upload picker (not plain URL text). */
const MEDIA_SETTING_KEYS = new Set(['club.crestUrl']);

export function isMediaSettingKey(key: string): boolean {
  return MEDIA_SETTING_KEYS.has(key);
}

export function settingInputPlaceholder(key: string): string | undefined {
  if (key === 'live.prematchAudioUrl') {
    return 'https://www.youtube.com/watch?v=... ili youtu.be/...';
  }
  return undefined;
}
