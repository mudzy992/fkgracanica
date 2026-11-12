import { afterEach, describe, expect, it, vi } from 'vitest';
import { openPrintHtml } from './pass-print';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('openPrintHtml — rubovi', () => {
  it('bez prozora iscrtava skriveni iframe', () => {
    vi.useFakeTimers();
    vi.spyOn(window, 'open').mockReturnValue(null);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:x');
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    openPrintHtml('<p>propustnica</p>');
    expect(document.querySelector('iframe[aria-hidden="true"]')).not.toBeNull();
    expect((document.querySelector('iframe') as HTMLIFrameElement).style.width).toBe('0px');
    expect((document.querySelector('iframe') as HTMLIFrameElement).style.position).toBe('fixed');
    expect(revoke).toHaveBeenCalledWith('blob:x');
  });

  it('bez dokumenta u iframeu uklanja iframe i ne ispisuje', () => {
    vi.useFakeTimers();
    vi.spyOn(window, 'open').mockReturnValue(null);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:y');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    vi.spyOn(HTMLIFrameElement.prototype, 'contentDocument', 'get').mockReturnValue(null);
    vi.spyOn(HTMLIFrameElement.prototype, 'contentWindow', 'get').mockReturnValue(null);

    openPrintHtml('<p>x</p>');
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('greška pri printu prozora prelazi na iframe fallback', () => {
    vi.useFakeTimers();
    const win = {
      focus: vi.fn(),
      print: vi.fn(() => { throw new Error('blocked'); }),
      addEventListener: vi.fn(),
    };
    vi.spyOn(window, 'open').mockReturnValue(win as never);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:z');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    openPrintHtml('<p>y</p>');
    vi.advanceTimersByTime(2500);
    expect(win.print).toHaveBeenCalledTimes(1);
    expect(document.querySelector('iframe[aria-hidden="true"]')).not.toBeNull();
  });
});
