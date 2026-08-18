import { Linking, Platform } from 'react-native';

export async function openMaps(address: string): Promise<void> {
  const query = encodeURIComponent(address.replace(/\s+/g, ' ').trim());
  if (!query) return;
  const urls =
    Platform.OS === 'ios'
      ? [`maps:0,0?q=${query}`, `https://maps.apple.com/?q=${query}`]
      : [`geo:0,0?q=${query}`, `https://maps.google.com/?q=${query}`];
  for (const url of urls) {
    try {
      await Linking.openURL(url);
      return;
    } catch {
      /* try next scheme */
    }
  }
}
