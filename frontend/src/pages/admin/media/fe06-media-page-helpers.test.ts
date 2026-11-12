import { describe, expect, it, vi } from 'vitest';
import { copyMediaOriginalUrl, emptyMediaMessage } from './media-page-helpers';

describe('emptyMediaMessage', () => {
  it('razlikuje globalnu pretragu od prazne mape', () => {
    expect(emptyMediaMessage(true, 'logo')).toBe('Nema rezultata za „logo".');
    expect(emptyMediaMessage(false, '')).toBe('Nema medija u ovoj mapi.');
  });
});

describe('copyMediaOriginalUrl', () => {
  it('kopira originalni URL i nakon dvije sekunde čisti potvrdu', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn(async () => undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    const setCopied = vi.fn();
    copyMediaOriginalUrl('photos/a.jpg', setCopied);
    await vi.waitFor(() => expect(setCopied).toHaveBeenCalledWith('photos/a.jpg'));
    await vi.advanceTimersByTimeAsync(2000);
    expect(setCopied).toHaveBeenLastCalledWith(null);
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });
});
