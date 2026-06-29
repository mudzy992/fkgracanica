/** Settings that use media upload picker (not plain URL text). */
const MEDIA_SETTING_KEYS = new Set(['club.crestUrl']);

/** Managed in /admin/ticketing — hide from global Settings page. */
const TICKETING_MANAGED_KEYS = new Set([
  'membership.onlineEnabled',
  'membership.annualPrice',
]);

export function isTicketingManagedSetting(key: string): boolean {
  return (
    key.startsWith('ticketing.') ||
    key.startsWith('payments.') ||
    TICKETING_MANAGED_KEYS.has(key)
  );
}

export function isMediaSettingKey(key: string): boolean {
  return MEDIA_SETTING_KEYS.has(key);
}

export function settingInputPlaceholder(key: string): string | undefined {
  if (key === 'live.prematchAudioUrl') {
    return 'https://www.youtube.com/watch?v=... ili youtu.be/...';
  }
  return undefined;
}
