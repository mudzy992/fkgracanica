import { describe, expect, it, vi } from 'vitest';
vi.mock('expo-file-system', () => ({
  File: class { static async downloadFileAsync(url:any,dest:any){ return { uri: 'file://test.jpg' } as any; } constructor(public uri:string){} },
  Paths: { cache: { uri: 'cache' } },
}));
vi.mock('expo-media-library', () => ({
  requestPermissionsAsync: vi.fn(()=> Promise.resolve({ granted: true })),
  saveToLibraryAsync: vi.fn(()=> Promise.resolve()),
}));
vi.mock('expo-sharing', () => ({
  isAvailableAsync: vi.fn(()=> Promise.resolve(true)),
  shareAsync: vi.fn(()=> Promise.resolve()),
}));
vi.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: vi.fn(()=> Promise.resolve({ granted: true })),
  launchImageLibraryAsync: vi.fn(()=> Promise.resolve({ canceled: false, assets: [{ uri: 'file://a.jpg', fileName: 'a.jpg', mimeType: 'image/jpeg' }] })),
}));
vi.mock('expo-linking', () => ({
  createURL: vi.fn(()=> 'exp://test/payment-return'),
  parse: vi.fn((url:string)=> ({ queryParams: url.includes('cancelled=1') ? { cancelled: '1' } : url.includes('session_id') ? { session_id: 'sess123' } : {} })),
}));
vi.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: vi.fn(),
  openAuthSessionAsync: vi.fn(()=> Promise.resolve({ type: 'success', url: 'exp://test/payment-return?session_id=sess123' })),
}));
vi.mock('./api', () => ({ API_URL: 'https://api.fkgracanica.ba101.top/api/v1', api: { post: vi.fn(()=> Promise.resolve({ data: { url: 'https://checkout.stripe.com' } })), get: vi.fn() } }));
vi.mock('./media', () => ({ mediaUrl: vi.fn((p:string)=> p ? `https://cdn.example.com/${p}` : null) }));

import { shareImageFile, saveImageToLibrary } from './share-media';
import { uploadMedia } from './upload-media';
import { parseCheckoutKind, finishCheckoutReturn } from './start-mobile-checkout';

describe('mob-batch53 — P-MOB53 share/upload/checkout', () => {
  it('shareImageFile success', async () => { await expect(shareImageFile('path.jpg')).resolves.toBeUndefined(); });
  it('saveImageToLibrary success', async () => { await expect(saveImageToLibrary('path.jpg')).resolves.toBeUndefined(); });
  it('uploadMedia success', async () => { await expect(uploadMedia()).resolves.toBeUndefined(); });
  it('parseCheckoutKind tickets default', () => { expect(parseCheckoutKind()).toBe('tickets'); expect(parseCheckoutKind('membership')).toBe('membership'); expect(parseCheckoutKind('season')).toBe('season'); expect(parseCheckoutKind('invalid')).toBe('tickets'); });
  it('finishCheckoutReturn cancelled', async () => { expect(await finishCheckoutReturn('tickets','https://example.com?cancelled=1')).toBe('cancelled'); });
  it('finishCheckoutReturn dismissed no session', async () => { expect(await finishCheckoutReturn('tickets','https://example.com')).toBe('dismissed'); });
  it('finishCheckoutReturn paid', async () => { expect(await finishCheckoutReturn('tickets','https://example.com?session_id=sess123')).toBe('paid'); });
  it('shareImageFile missing url throws', async () => {
    const { mediaUrl } = await import('./media');
    vi.mocked(mediaUrl as any).mockReturnValueOnce(null);
    await expect(shareImageFile('')).rejects.toThrow('missing-url');
  });
  it('saveImageToLibrary permission denied', async () => {
    const { requestPermissionsAsync } = await import('expo-media-library');
    (requestPermissionsAsync as any).mockResolvedValueOnce({ granted: false });
    await expect(saveImageToLibrary('path.jpg')).rejects.toThrow('permission-denied');
  });
  it('uploadMedia permission denied', async () => {
    const { requestMediaLibraryPermissionsAsync } = await import('expo-image-picker');
    (requestMediaLibraryPermissionsAsync as any).mockResolvedValueOnce({ granted: false });
    await expect(uploadMedia()).rejects.toThrow('Media library permission denied');
  });
  it('uploadMedia cancelled', async () => {
    const { launchImageLibraryAsync } = await import('expo-image-picker');
    (launchImageLibraryAsync as any).mockResolvedValueOnce({ canceled: true });
    await expect(uploadMedia()).rejects.toThrow('cancelled');
  });
});
