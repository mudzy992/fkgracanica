import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: vi.fn(async () => ({ granted: true })),
  launchImageLibraryAsync: vi.fn(async () => ({ canceled: false, assets: [{ uri: 'file://a.jpg', fileName: 'a.jpg', mimeType: 'image/jpeg' }] })),
}));
vi.mock('expo-linking', () => ({
  createURL: vi.fn(() => 'exp://app/payment-return'),
  parse: vi.fn((url: string) => {
    const u = new URL(url, 'https://example.com');
    const qp: Record<string, string | string[]> = {};
    u.searchParams.forEach((v, k) => {
      if (qp[k]) qp[k] = [qp[k] as string, v].flat();
      else qp[k] = v;
    });
    // also handle array param style session_id=1&session_id=2 -> last wins? but asParam takes first
    return { queryParams: qp };
  }),
}));
vi.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: vi.fn(),
  openAuthSessionAsync: vi.fn(async () => ({ type: 'success', url: 'exp://app/payment-return?session_id=cs_example_123' })),
}));
vi.mock('./api', () => ({ API_URL: 'https://api.example.com/api/v1', api: { post: vi.fn(async () => ({ data: { path: 'uploads/example.jpg', url: 'https://pay.example.com' } })) } }));

import * as ImagePicker from 'expo-image-picker';
import { api } from './api';
import { uploadMedia } from './upload-media';
import { finishCheckoutReturn, parseCheckoutKind } from './start-mobile-checkout';

describe('mob-batch131 — P-MOB44 upload/checkout (test-only)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('uploadMedia throws when permission denied', async () => {
    vi.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValueOnce({ granted: false } as any);
    await expect(uploadMedia()).rejects.toThrow('Media library permission denied');
  });
  it('uploadMedia throws cancelled when picker cancelled', async () => {
    vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled: true, assets: [] } as any);
    await expect(uploadMedia()).rejects.toThrow('cancelled');
  });
  it('uploadMedia throws cancelled when no asset', async () => {
    vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled: false, assets: [] } as any);
    await expect(uploadMedia()).rejects.toThrow('cancelled');
    vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled: false, assets: [null as any] } as any);
    await expect(uploadMedia()).rejects.toThrow('cancelled');
  });
  it('uploadMedia fallback fileName and mime', async () => {
    vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file://x', fileName: null, mimeType: null }] } as any);
    vi.mocked(api.post).mockResolvedValueOnce({ data: { path: 'uploads/example.jpg' } } as any);
    const p = await uploadMedia();
    expect(p).toBe('uploads/example.jpg');
    expect(api.post).toHaveBeenCalledWith('/upload', expect.any(FormData), expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } }));
  });
  it('uploadMedia uses provided fileName and mime', async () => {
    vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file://y', fileName: 'custom.png', mimeType: 'image/png' }] } as any);
    vi.mocked(api.post).mockResolvedValueOnce({ data: { path: 'uploads/custom.png' } } as any);
    await expect(uploadMedia()).resolves.toBe('uploads/custom.png');
  });
  it('uploadMedia posts to /upload with FormData', async () => {
    vi.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file://z', fileName: 'z.jpg', mimeType: 'image/jpeg' }] } as any);
    vi.mocked(api.post).mockResolvedValueOnce({ data: { path: 'uploads/z.jpg' } } as any);
    await uploadMedia();
    expect(api.post).toHaveBeenCalledWith('/upload', expect.any(FormData), expect.any(Object));
  });
  it('parseCheckoutKind membership', () => {
    expect(parseCheckoutKind('membership')).toBe('membership');
  });
  it('parseCheckoutKind season', () => {
    expect(parseCheckoutKind('season')).toBe('season');
  });
  it('parseCheckoutKind tickets and default', () => {
    expect(parseCheckoutKind('tickets')).toBe('tickets');
    expect(parseCheckoutKind('tickets-unknown')).toBe('tickets');
    expect(parseCheckoutKind('')).toBe('tickets');
    expect(parseCheckoutKind(undefined)).toBe('tickets');
  });
  it('finishCheckoutReturn cancelled when cancelled=1', async () => {
    expect(await finishCheckoutReturn('tickets', 'https://example.com?cancelled=1')).toBe('cancelled');
    expect(await finishCheckoutReturn('membership', 'https://example.com?cancelled=1&session_id=cs_example')).toBe('cancelled');
    expect(api.post).not.toHaveBeenCalled();
  });
  it('finishCheckoutReturn dismissed when no session_id', async () => {
    expect(await finishCheckoutReturn('tickets', 'https://example.com')).toBe('dismissed');
    expect(await finishCheckoutReturn('tickets', 'https://example.com?session_id=')).toBe('dismissed');
    expect(api.post).not.toHaveBeenCalled();
  });
  it('finishCheckoutReturn paid tickets confirm', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} } as any);
    expect(await finishCheckoutReturn('tickets', 'https://example.com?session_id=cs_tickets_example')).toBe('paid');
    expect(api.post).toHaveBeenCalledWith('/payments/tickets/confirm-session', expect.objectContaining({ sessionId: 'cs_tickets_example', provider: 'stripe' }));
  });
  it('finishCheckoutReturn paid membership confirm', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} } as any);
    expect(await finishCheckoutReturn('membership', 'https://example.com?session_id=cs_membership_example')).toBe('paid');
    expect(api.post).toHaveBeenCalledWith('/payments/membership/confirm-session', expect.objectContaining({ sessionId: 'cs_membership_example' }));
  });
  it('finishCheckoutReturn paid season-pass confirm', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} } as any);
    expect(await finishCheckoutReturn('season', 'https://example.com?session_id=cs_season_example')).toBe('paid');
    expect(api.post).toHaveBeenCalledWith('/payments/season-pass/confirm-session', expect.objectContaining({ sessionId: 'cs_season_example' }));
  });
  it('finishCheckoutReturn handles array session_id (first wins)', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} } as any);
    // encode array as duplicate param -> our mock parse stores array, asParam picks first
    expect(await finishCheckoutReturn('tickets', 'https://example.com?session_id=cs_first_example&session_id=cs_second')).toBe('paid');
    expect(api.post).toHaveBeenCalledWith(expect.stringContaining('tickets'), expect.objectContaining({ sessionId: 'cs_first_example' }));
  });
});
