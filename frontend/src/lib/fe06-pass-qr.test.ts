import { describe, expect, it, vi } from 'vitest';
import { qrDataUrl } from './pass-qr';

const toDataURL = vi.hoisted(() =>
  vi.fn((_value: string, _options: unknown) => Promise.resolve('data:image/png;base64,abc')));

vi.mock('qrcode', () => ({
  default: { toDataURL: (value: string, options: unknown) => toDataURL(value, options) },
}));

describe('qrDataUrl', () => {
  it('prosljeđuje vrijednost i stil QR kodu', async () => {
    await expect(qrDataUrl('FKG-123', 320)).resolves.toBe('data:image/png;base64,abc');
    const [value, options] = toDataURL.mock.calls[0] as [
      string, { width: number; margin: number; color: Record<string, string> },
    ];
    expect(value).toBe('FKG-123');
    expect(options.width).toBe(320);
    expect(options.margin).toBe(1);
    expect(Object.keys(options.color)).toEqual(['dark', 'light']);
    expect(options.color.dark).not.toBe(options.color.light);
  });
});
