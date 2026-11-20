import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.stubGlobal('__DEV__', true);
vi.mock('react-native', () => ({ Platform: { OS: 'ios' as const }, Linking: { openURL: vi.fn(async () => {}) } }));
vi.mock('expo-secure-store', () => ({ getItemAsync: vi.fn(async () => null), setItemAsync: vi.fn(async () => {}), deleteItemAsync: vi.fn(async () => {}) }));
vi.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: vi.fn(async () => ({ granted: true })),
  launchImageLibraryAsync: vi.fn(async () => ({ canceled: false, assets: [{ uri: 'file://photo.jpg', fileName: 'photo.jpg', mimeType: 'image/jpeg' }] })),
}));
vi.mock('expo-linking', () => ({ createURL: (p:string)=>`exp://app/${p}`, parse: vi.fn(()=>({ queryParams: {} })) }));
vi.mock('expo-web-browser', () => ({ maybeCompleteAuthSession: vi.fn(), openAuthSessionAsync: vi.fn(async () => ({ type: 'cancel' as const })) }));
vi.mock('./api', () => ({ api: { post: vi.fn(async () => ({ data: { path: 'uploads/test.jpg' } })) }, API_URL: 'https://api.example.com/api/v1' }));

import * as ImagePicker from 'expo-image-picker';
import { api } from './api';
import { uploadMedia } from './upload-media';
import { parseCheckoutKind, finishCheckoutReturn } from './start-mobile-checkout';
import * as Linking from 'expo-linking';

describe('mob-batch98 — P-MOB11 upload/checkout (test-only)', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); });

  it('uploadMedia permission denied', async () => {
    vi.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValueOnce({ granted:false } as any);
    await expect(uploadMedia()).rejects.toThrow('Media library permission denied');
  });
  it('uploadMedia cancelled', async () => {
    vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled:true, assets: [] } as any);
    await expect(uploadMedia()).rejects.toThrow('cancelled');
  });
  it('uploadMedia no asset', async () => {
    vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled:false, assets: [] } as any);
    await expect(uploadMedia()).rejects.toThrow('cancelled');
  });
  it('uploadMedia success with fileName and mimeType', async () => {
    await expect(uploadMedia()).resolves.toBe('uploads/test.jpg');
    expect(api.post).toHaveBeenCalledWith('/upload', expect.any(FormData), expect.objectContaining({ headers: { 'Content-Type':'multipart/form-data' } }));
  });
  it('uploadMedia fallback fileName and mimeType', async () => {
    vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled:false, assets: [{ uri:'file://tmp', fileName: undefined, mimeType: undefined }] } as any);
    await expect(uploadMedia()).resolves.toBe('uploads/test.jpg');
  });
  it('parseCheckoutKind handles known and default', () => {
    expect(parseCheckoutKind('membership')).toBe('membership');
    expect(parseCheckoutKind('season')).toBe('season');
    expect(parseCheckoutKind('tickets')).toBe('tickets');
    expect(parseCheckoutKind('unknown')).toBe('tickets');
    expect(parseCheckoutKind(undefined)).toBe('tickets');
  });
  it('finishCheckoutReturn cancelled', async () => {
    vi.mocked(Linking.parse).mockReturnValueOnce({ queryParams:{ cancelled:'1' } } as any);
    await expect(finishCheckoutReturn('tickets','exp://app/payment-return?cancelled=1')).resolves.toBe('cancelled');
    expect(api.post).not.toHaveBeenCalled();
  });
  it('finishCheckoutReturn dismissed when no session', async () => {
    vi.mocked(Linking.parse).mockReturnValueOnce({ queryParams:{} } as any);
    await expect(finishCheckoutReturn('tickets','exp://app/payment-return')).resolves.toBe('dismissed');
  });
  it('finishCheckoutReturn paid posts confirm tickets', async () => {
    vi.mocked(Linking.parse).mockReturnValueOnce({ queryParams:{ session_id:'sess123' } } as any);
    await expect(finishCheckoutReturn('tickets','exp://app/payment-return?session_id=sess123')).resolves.toBe('paid');
    expect(api.post).toHaveBeenCalledWith('/payments/tickets/confirm-session', { sessionId:'sess123', provider:'stripe' });
  });
  it('finishCheckoutReturn paid membership', async () => {
    vi.mocked(Linking.parse).mockReturnValueOnce({ queryParams:{ session_id:'sess999' } } as any);
    await expect(finishCheckoutReturn('membership','exp://app/payment-return?session_id=sess999')).resolves.toBe('paid');
    expect(api.post).toHaveBeenCalledWith('/payments/membership/confirm-session', expect.any(Object));
  });
  it('finishCheckoutReturn handles array session_id', async () => {
    vi.mocked(Linking.parse).mockReturnValueOnce({ queryParams:{ session_id:['sessArray'] } } as any);
    await expect(finishCheckoutReturn('season','exp://app/payment-return?session_id=sessArray')).resolves.toBe('paid');
    expect(api.post).toHaveBeenCalledWith('/payments/season-pass/confirm-session', expect.objectContaining({ sessionId:'sessArray' }));
  });
  it('finishCheckoutReturn handles season kind', async () => {
    vi.mocked(Linking.parse).mockReturnValueOnce({ queryParams:{ session_id:'s1' } } as any);
    await expect(finishCheckoutReturn('season','exp://app/payment-return?session_id=s1')).resolves.toBe('paid');
  });
  it('uploadMedia uses FormData with file', async () => {
    vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled:false, assets:[{ uri:'file://a.jpg', fileName:'a.jpg', mimeType:'image/png' }] } as any);
    await uploadMedia();
    const form = vi.mocked(api.post).mock.calls.at(-1)?.[1] as FormData;
    expect(form).toBeInstanceOf(FormData);
  });
  it('parseCheckoutKind does not throw for null', () => {
    expect(parseCheckoutKind(null as any)).toBe('tickets');
  });
  it('finishCheckoutReturn cancelled takes precedence over session', async () => {
    vi.mocked(Linking.parse).mockReturnValueOnce({ queryParams:{ cancelled:'1', session_id:'sess' } } as any);
    await expect(finishCheckoutReturn('tickets','exp://app/payment-return?cancelled=1&session_id=sess')).resolves.toBe('cancelled');
  });
});
