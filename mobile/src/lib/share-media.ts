import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { mediaUrl } from './media';

function fileMeta(url: string): { mime: string; ext: string; uti: string } {
  const lower = url.split('?')[0]?.toLowerCase() ?? '';
  if (lower.endsWith('.png')) return { mime: 'image/png', ext: 'png', uti: 'public.png' };
  if (lower.endsWith('.webp')) return { mime: 'image/webp', ext: 'webp', uti: 'public.webp' };
  return { mime: 'image/jpeg', ext: 'jpg', uti: 'public.jpeg' };
}

async function downloadOriginal(path: string): Promise<{ file: File; mime: string; uti: string }> {
  const url = mediaUrl(path, 'original');
  if (!url) throw new Error('missing-url');
  const { mime, ext, uti } = fileMeta(url);
  const dest = new File(Paths.cache, `share-${Date.now()}.${ext}`);
  const file = await File.downloadFileAsync(url, dest, { idempotent: true });
  return { file, mime, uti };
}

export async function shareImageFile(path: string): Promise<void> {
  const { file, mime, uti } = await downloadOriginal(path);
  const available = await Sharing.isAvailableAsync();
  if (!available) throw new Error('sharing-unavailable');
  await Sharing.shareAsync(file.uri, { mimeType: mime, UTI: uti, dialogTitle: 'FK Gračanica' });
}

export async function saveImageToLibrary(path: string): Promise<void> {
  const permission = await MediaLibrary.requestPermissionsAsync();
  if (!permission.granted) throw new Error('permission-denied');
  const { file } = await downloadOriginal(path);
  await MediaLibrary.saveToLibraryAsync(file.uri);
}
