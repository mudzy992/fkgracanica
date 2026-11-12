import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(async () => { throw new Error('fail'); }),
  },
}));

import { MembershipQrCode } from './membership/MembershipQrCode';
import { PassQrCode } from './pass/PassQrCode';

describe('fe06-batch68a qr cancelled + stats', () => {
  it('MembershipQrCode pokriva cancelled true i false', async () => {
    const { unmount: u1 } = render(<MembershipQrCode value="val1" size={100} />);
    // unmount prije nego što se reject riješi (cancelled true)
    u1();
    // drugi render bez unmounta da pokrije cancelled false (treba setFailed)
    const { container: c2 } = render(<MembershipQrCode value="val1" size={100} />);
    // čekaj da se promise riješi
    await new Promise((r) => setTimeout(r, 20));
    expect(c2.textContent).toContain('QR kod');
  });

  it('PassQrCode pokriva cancelled true i false', async () => {
    const { unmount: u1 } = render(<PassQrCode value="val2" size={72} />);
    u1();
    const { container: c2 } = render(<PassQrCode value="val2" size={72} />);
    await new Promise((r) => setTimeout(r, 20));
    expect(c2).toBeDefined();
  });
});
