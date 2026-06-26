export function isMediaSettingKey(key: string): boolean {
  return key === 'club.crestUrl' || key.endsWith('Url');
}
